import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const video = await prisma.video.update({
    where: { id: 1 },
    data: {
      title: "Session on 130226",
      category: "PAST",
    },
  });

  console.log("Updated:", video);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());