import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const video = await prisma.video.update({
    where: { id: 1 },
    data: { url: "nWP3TQlCIf8" },
  });
  console.log("Fixed:", video);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());