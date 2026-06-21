import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Parser = require("rss-parser").default || require("rss-parser");

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; 413OpenCourt/1.0)",
  },
});

const RSS_FEEDS = [
  "https://bleacherreport.com/articles/feed?tag=nba",
  "https://www.espn.com/espn/rss/nba/news",
];

interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  snippet: string;
}

export async function GET() {
  try {
    const allItems: NewsItem[] = [];

    for (const feedUrl of RSS_FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl);
        const source = feedUrl.includes("bleacherreport") ? "Bleacher Report" : "ESPN";

        for (const item of feed.items.slice(0, 7)) {
          allItems.push({
            title: item.title || "NBA Update",
            link: item.link || "#",
            source,
            pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
            snippet: (item.contentSnippet || item.content || "").slice(0, 120),
          });
        }
      } catch {
        // Skip failed feed, try next one
        continue;
      }
    }

    // Sort by date, newest first
    allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    return NextResponse.json({ news: allItems.slice(0, 10) });
  } catch (error) {
    console.error("NBA News fetch error:", error);
    return NextResponse.json({ news: [] });
  }
}
