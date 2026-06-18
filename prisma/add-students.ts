import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const students = await prisma.student.createMany({
    data: [
      { name: "Coach", pin: "2507" },
      { name: "Justice", pin: "0703" },
    ],
  });

  console.log("Students added:", students);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());