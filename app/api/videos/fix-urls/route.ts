import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Find videos with full URLs instead of just video IDs
  const brokenVideos = await prisma.video.findMany({
    where: {
      url: { contains: "youtube.com" },
    },
  });

  const fixes: { id: number; oldUrl: string; newUrl: string }[] = [];

  for (const video of brokenVideos) {
    // Extract video ID from various YouTube URL formats
    let videoId = video.url;

    // Handle youtube.com/shorts/XXXXX
    const shortsMatch = video.url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch) {
      videoId = shortsMatch[1];
    }

    // Handle youtube.com/watch?v=XXXXX
    const watchMatch = video.url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/);
    if (watchMatch) {
      videoId = watchMatch[1];
    }

    // Handle youtu.be/XXXXX
    const shortMatch = video.url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch) {
      videoId = shortMatch[1];
    }

    // Strip any query params from extracted ID
    videoId = videoId.split("?")[0].split("&")[0];

    if (videoId !== video.url && videoId) {
      await prisma.video.update({
        where: { id: video.id },
        data: { url: videoId },
      });
      fixes.push({ id: video.id, oldUrl: video.url, newUrl: videoId });
    }
  }

  return NextResponse.json({ fixed: fixes.length > 0, fixes });
}
