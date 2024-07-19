import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {

    const email = 'admin@ian.com';
  const password = 'password';
  const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await prisma.users.findUnique({
        where: { email },
      });

      if (!existingUser) {
    const user = await prisma.users.create({
      data: {
    first_name: "IAN",
    middle_name: "PLC",
    last_name: "ADMIN",
    gender: "male",
    phone: "+1234567890",
    email: "admin@ian.com",
    password: hashedPassword,
    address: "123 Main Street",
    profile: "profile.png",
    roles: "ADMIN",
    isActive: true,
      },
    });
  
    console.log({ user });
  } else {
    console.log('User already exists, skipping creation');
  }
}
  
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });