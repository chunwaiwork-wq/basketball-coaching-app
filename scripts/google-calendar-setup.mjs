/**
 * Google Calendar OAuth Setup
 * Run ONCE: node scripts/google-calendar-setup.mjs
 */
import { google } from "googleapis";
import { createInterface } from "readline";
import { writeFileSync } from "fs";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log("\n=== Google Calendar OAuth Setup ===\n");

  const clientId = await ask(rl, "Paste your OAuth Client ID: ");
  const clientSecret = await ask(rl, "Paste your OAuth Client Secret: ");

  const oauth = new google.auth.OAuth2(clientId, clientSecret, "urn:ietf:wg:oauth:2.0:oob");

  const authUrl = oauth.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("\nOpen this URL in your browser:\n");
  console.log(authUrl);
  console.log("\nLog in with waitoshow92@gmail.com");
  console.log("Click Continue then copy the code.\n");

  const code = await ask(rl, "Paste the authorization code: ");

  const { tokens } = await oauth.getToken(code);
  const rt = tokens.refresh_token;

  var output = [
    "=== ADD THESE TO VERCEL ENVIRONMENT VARIABLES ===",
    "",
    "GOOGLE_OAUTH_CLIENT_ID=" + clientId,
    "GOOGLE_OAUTH_CLIENT_SECRET=" + clientSecret,
    "GOOGLE_REFRESH_TOKEN=" + rt,
    "GOOGLE_CALENDAR_ID=primary",
    "",
  ].join("\n");

  console.log("\n" + output);
  writeFileSync("google-calendar-credentials.txt", output);
  console.log("\nSaved to google-calendar-credentials.txt");
  console.log("Go to Vercel > Settings > Environment Variables, add those 4 values, and redeploy.\n");

  rl.close();
}

function ask(rl, question) {
  return new Promise(function (resolve) {
    rl.question(question, resolve);
  });
}

main().catch(console.error);
