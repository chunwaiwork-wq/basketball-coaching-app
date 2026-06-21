import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

let cachedAuth: ReturnType<typeof getAuthClient> | null = null;

function getAuthClient() {
  // Support both Service Account (JSON key) and OAuth2 (client ID + refresh token)
  const serviceKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (serviceKey) {
    // Service Account path
    const credentials = JSON.parse(serviceKey);
    return new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: SCOPES,
    });
  }

  if (clientId && clientSecret && refreshToken) {
    // OAuth2 path
    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({ refresh_token: refreshToken });
    return auth;
  }

  throw new Error(
    "No Google Calendar credentials configured. Set either:\n" +
    "  - GOOGLE_SERVICE_ACCOUNT_KEY (JSON key), or\n" +
    "  - GOOGLE_OAUTH_CLIENT_ID + GOOGLE_OAUTH_CLIENT_SECRET + GOOGLE_REFRESH_TOKEN"
  );
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
    colorId: "11",
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
