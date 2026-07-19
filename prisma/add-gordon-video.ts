import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const video = await prisma.video.create({
    data: {
      title: "Session on 170726",
      url: "rLtb8tSyQ_Y",
      category: "PAST",
      studentId: 1, // Gordon's ID
    },
  });

  console.log("Video added for Gordon:", JSON.stringify(video, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
