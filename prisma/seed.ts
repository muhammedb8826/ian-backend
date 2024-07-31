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
    await prisma.users.create({
      data: {
        first_name: "IAN",
        middle_name: "PLC",
        last_name: "ADMIN",
        gender: "male",
        phone: "+1234567890",
        email: "admin@ian.com",
        password: hashedPassword,
        confirm_password: hashedPassword,
        address: "123 Main Street",
        profile: "",
        roles: "ADMIN",
        machine_permissions: [],
        is_active: true,
      },
    });
  } else {
    console.log('User already exists, skipping creation');
  }

  const areaCategory = await prisma.unitCategory.create({
    data: {
      name: 'Area',
      description: 'Units of area measurement',
    },
  });

  const squareMeter = await prisma.uOM.create({
    data: {
      name: 'Square Meter',
      abbreviation: 'm²',
      conversionRate: 1.0,
      baseUnit: true,
      unitCategoryId: areaCategory.id,
    },
  });

  await prisma.uOMAttribute.createMany({
    data: [
      {
        width: 1,
        height: 1,
        uomId: squareMeter.id,
      },
    ],
  });

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });