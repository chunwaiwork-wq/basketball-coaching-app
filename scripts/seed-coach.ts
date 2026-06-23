// Run this once after deploy to create the coach account
// Usage: npx tsx scripts/seed-coach.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "coach@413opencourt.com";
  const password = "coach2507"; // Change this after first login!
  const name = "Coach";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("✅ Coach account already exists (id:", existing.id, ")");
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, password: hashed, name, role: "coach" },
  });

  console.log("✅ Coach account created (id:", user.id, ")");
  console.log("   Email:", email);
  console.log("   Password:", password);
  console.log("   ⚠️ CHANGE PASSWORD AFTER FIRST LOGIN!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
