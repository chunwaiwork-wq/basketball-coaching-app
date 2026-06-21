import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

let cachedAuth: ReturnType<typeof getAuthClient> | null = null;

function getAuthClient() {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentialsJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_KEY not set");
  }

  const credentials = JSON.parse(credentialsJson);
  return new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
  });
}

function getCalendar() {
  if (!cachedAuth) {
    cachedAuth = getAuthClient();
  }
  return google.calendar({ version: "v3", auth: cachedAuth });
}

export interface CalendarEventParams {
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
}

export async function createCalendarEvent(params: CalendarEventParams) {
  const calendar = getCalendar();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || "primary";

  const event = {
    summary: params.summary,
    description: params.description,
    location: params.location,
    start: {
      dateTime: params.startTime.toISOString(),
      timeZone: "Asia/Singapore",
    },
    end: {
      dateTime: params.endTime.toISOString(),
      timeZone: "Asia/Singapore",
    },
    colorId: "11", // Red/Orange for coaching sessions
  };

  const response = await calendar.events.insert({
    calendarId,
    requestBody: event,
  });

  return {
    eventId: response.data.id,
    htmlLink: response.data.htmlLink,
  };
}
