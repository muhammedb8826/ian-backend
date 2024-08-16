import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@ian.com';
  const password = 'password';
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Create user if not exists
  const existingUser = await prisma.users.findUnique({ where: { email } });
  if (!existingUser) {
    await prisma.users.create({
      data: {
        first_name: "IAN",
        middle_name: "PLC",
        last_name: "ADMIN",
        gender: "male",
        phone: "+1234567890",
        email,
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

  // Create unit category if not exists
  const existingCategory = await prisma.unitCategory.findUnique({ where: { name: 'Area' } });
  if (!existingCategory) {
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

    console.log('Created UnitCategory:', areaCategory);
    
    // Create machine if not exists
    const existingMachine = await prisma.machines.findUnique({ where: { name: 'All' } });
    let machineId: string;
    if (!existingMachine) {
      const createdMachine = await prisma.machines.create({
        data: {
          name: 'All',
          description: 'All in one machine',
          status: true,
        },
      });
      machineId = createdMachine.id;
    } else {
      machineId = existingMachine.id;
      console.log('Machine already exists, skipping creation');
    }

    // Create item
    const newItem = await prisma.items.create({
      data: {
        name: 'Sample Item',
        description: 'A sample item for demonstration',
        reorder_level: 10,
        initial_stock: 100,
        updated_initial_stock: 100,
        machineId, // Use the valid machineId
        purchaseUnitOfMeasureId: squareMeter.id,
        purchase_price: 20.0,
        selling_price: 30.0,
        unitOfMeasureId: squareMeter.id,
        quantity: 100,
      },
    });

    // Create attributes associated with the item
    await prisma.attribute.createMany({
      data: [
        {
          name: 'Width',
          value: '1',
          itemId: newItem.id,
        },
        {
          name: 'Height',
          value: '1',
          itemId: newItem.id,
        },
      ],
    });

    console.log('Created Item and Attributes:', newItem);
  } else {
    console.log('UnitCategory already exists, skipping creation');
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
