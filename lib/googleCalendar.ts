import { OAuth2Client } from "google-auth-library";
import { prisma } from "./prisma";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

const getRedirectUri = () =>
  process.env.GOOGLE_REDIRECT_URI ||
  `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/calendar/callback`;

function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set");
  }

  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri: getRedirectUri(),
  });
}

// Get an authenticated Google API client using stored refresh token
export async function getCalendarAuth() {
  const oauth2Client = getOAuth2Client();

  const record = await prisma.coachCalendar.findFirst();
  if (!record?.refreshToken) {
    throw new Error("No Google Calendar connected. Go to /dashboard/calendar to set up.");
  }

  oauth2Client.setCredentials({ refresh_token: record.refreshToken });
  return oauth2Client;
}

// Create a calendar event for a coaching session
export async function createCalendarEvent(slot: {
  date: Date;
  duration: number;
  studentName: string;
}) {
  const auth = await getCalendarAuth();

  // Refresh token if needed and get access token
  const { token } = await auth.getAccessToken();
  if (!token) throw new Error("Failed to get access token");

  const startTime = new Date(slot.date);
  const endTime = new Date(startTime.getTime() + slot.duration * 60000);

  const event = {
    summary: `🏀 Coaching Session — ${slot.studentName}`,
    description: `Private basketball coaching session with ${slot.studentName} at 413OPENCOURT.`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: "Asia/Singapore",
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: "Asia/Singapore",
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 30 },
        { method: "popup", minutes: 1440 },
      ],
    },
  };

  const res = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google Calendar API error: ${res.status} ${text}`);
  }

  const data = await res.json();
  return {
    googleEventId: data.id as string,
    googleEventLink: data.htmlLink as string,
  };
}

// Get OAuth URL for initial setup
export function getAuthUrl() {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
}

// Handle OAuth callback and store refresh token
export async function handleCallback(code: string) {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    throw new Error(
      "No refresh token received. The account might already have granted access — revoke it and try again by going to /dashboard/calendar"
    );
  }

  // Get user email
  oauth2Client.setCredentials(tokens);
  const { token } = await oauth2Client.getAccessToken();

  const userRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const userInfo = await userRes.json();

  // Store or update the refresh token
  const existing = await prisma.coachCalendar.findFirst();
  if (existing) {
    await prisma.coachCalendar.update({
      where: { id: existing.id },
      data: {
        refreshToken: tokens.refresh_token,
        email: userInfo.email || "",
      },
    });
  } else {
    await prisma.coachCalendar.create({
      data: {
        refreshToken: tokens.refresh_token,
        email: userInfo.email || "",
      },
    });
  }

  return { email: userInfo.email };
}

// Delete a calendar event
export async function deleteCalendarEvent(eventId: string) {
  const auth = await getCalendarAuth();
  const { token } = await auth.getAccessToken();
  if (!token) throw new Error("Failed to get access token");

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok && res.status !== 410) {
    const text = await res.text();
    throw new Error(`Failed to delete calendar event: ${res.status} ${text}`);
  }
}
