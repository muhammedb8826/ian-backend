import { DataSource } from 'typeorm';
import * as entities from './src/entities';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'mame',
  database: 'ian_backend',
  entities: Object.values(entities),
  migrations: ['src/migrations/*.ts'],
  synchronize: true,
  logging: true,
}); 