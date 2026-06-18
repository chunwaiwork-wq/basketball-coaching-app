import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const student = await prisma.student.create({
    data: {
      name: "Gordon",
      pin: "5780",
    },
  });

  console.log("Created student:", student);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());