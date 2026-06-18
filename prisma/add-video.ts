import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const video = await prisma.video.create({
    data: {
      title: "Form Shooting Drill",
      url: "nWP3TQlCIf8?feature=shared",
      category: "SHOOTING",
      studentId: 1, // Gordon's ID
    },
  });

  console.log("Video added:", video);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());