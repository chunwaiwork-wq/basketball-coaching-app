import { google } from "googleapis";
import { prisma } from "./prisma";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

// Get the OAuth2 client using stored refresh token
export async function getCalendarAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set");
  }

  const record = await prisma.coachCalendar.findFirst();
  if (!record?.refreshToken) {
    throw new Error("No Google Calendar connected. Go to /dashboard/calendar to set up.");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/calendar/callback`
  );

  oauth2Client.setCredentials({ refresh_token: record.refreshToken });

  // If token expires, auto-refresh
  oauth2Client.on("tokens", async (tokens) => {
    if (tokens.refresh_token) {
      await prisma.coachCalendar.update({
        where: { id: record.id },
        data: { refreshToken: tokens.refresh_token },
      });
    }
  });

  return oauth2Client;
}

// Create a calendar event for a coaching session
export async function createCalendarEvent(slot: {
  date: Date;
  duration: number;
  studentName: string;
}) {
  const auth = await getCalendarAuth();
  const calendar = google.calendar({ version: "v3", auth });

  const startTime = new Date(slot.date);
  const endTime = new Date(startTime.getTime() + slot.duration * 60000);

  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
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
          { method: "popup", minutes: 1440 }, // 1 day before
        ],
      },
    },
  });

  return {
    googleEventId: event.data.id,
    googleEventLink: event.data.htmlLink,
  };
}

// Update an existing calendar event
export async function updateCalendarEvent(
  eventId: string,
  updates: { status?: string }
) {
  const auth = await getCalendarAuth();
  const calendar = google.calendar({ version: "v3", auth });

  if (updates.status === "cancelled") {
    await calendar.events.delete({
      calendarId: "primary",
      eventId,
    });
  }
}

// Get OAuth URL for initial setup
export function getAuthUrl() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/calendar/callback`
  );

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // Force to get refresh token every time
  });
}

// Handle OAuth callback and store refresh token
export async function handleCallback(code: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set");
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/calendar/callback`
  );

  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.refresh_token) {
    throw new Error("No refresh token received. The account might already have granted access — revoke it and try again.");
  }

  // Get user email from the token
  oauth2Client.setCredentials(tokens);
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const { data: userInfo } = await oauth2.userinfo.get();

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

  return {
    email: userInfo.email,
  };
}
