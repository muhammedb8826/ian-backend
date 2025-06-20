import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../typeorm.config'; // adjusted path

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    const userRepository = AppDataSource.getRepository(User);

    const adminData = {
      first_name: "IAN",
      middle_name: "PLC",
      last_name: "ADMIN",
      gender: "male",
      phone: "+251905078826",
      email: 'admin@ian.com',
      password: await bcrypt.hash('password', 10),
      confirm_password: await bcrypt.hash('password', 10),
      address: "123 Main Street",
      profile: "",
      roles: Role.ADMIN,
      is_active: true,
    };

    const existingUser = await userRepository.findOne({ 
      where: { email: adminData.email } 
    });

    if (!existingUser) {
      await userRepository.save(adminData);
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();