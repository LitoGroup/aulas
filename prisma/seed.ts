import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/server/auth/password";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@school.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "changeme123";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash: await hashPassword(adminPassword),
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "professor@school.local" },
    update: {},
    create: {
      name: "Professor Demo",
      email: "professor@school.local",
      passwordHash: await hashPassword("professor123"),
      role: "TEACHER",
    },
  });

  console.info(`Seed concluido. Admin: ${adminEmail}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
