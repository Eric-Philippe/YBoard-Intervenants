import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEVDATA_ID = "00000000-0000-0000-0000-000000000001";

async function seedDefaultUser() {
  const email = "admin@yboard.fr";
  const existing = await prisma.users.findFirst({ where: { email } });
  if (existing) {
    console.log("Default user already exists, skipping.");
    return existing;
  }
  const password = await bcrypt.hash("admin123", 10);
  const user = await prisma.users.create({
    data: {
      firstname: "Admin",
      lastname: "YBoard",
      email,
      password,
    },
  });
  console.log(`Default user created: ${email} / admin123`);
  return user;
}

async function seedDefaultPerimeter(userId: string) {
  const perimeter = await prisma.perimeter.upsert({
    where: { id: DEVDATA_ID },
    create: {
      id: DEVDATA_ID,
      title: "Dev Data",
      slug: "devdata",
      origin: "SYSTEME",
      color: "#2563EB",
    },
    update: {},
  });

  await prisma.perimeterMember.upsert({
    where: { perimeterId_userId: { perimeterId: perimeter.id, userId } },
    create: { perimeterId: perimeter.id, userId },
    update: {},
  });

  await prisma.users.update({
    where: { id: userId },
    data: { activePerimeterId: perimeter.id },
  });

  console.log(`Default perimeter "${perimeter.title}" ready and assigned to the default user.`);
}

async function main() {
  const user = await seedDefaultUser();
  await seedDefaultPerimeter(user.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
