import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { DatabaseConfig } from './config.interface';
import * as entities from 'src/entities';

export const createDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const dbConfig = configService.get<DatabaseConfig>('database');

  return {
    type: 'mysql',
    host: dbConfig?.host || 'localhost',
    port: dbConfig?.port || 3306,
    username: dbConfig?.username || 'root',
    password: dbConfig?.password || 'mame',
    database: dbConfig?.database || 'ian_backend',
    entities: Object.values(entities),
    synchronize: false, // Temporarily disabled to prevent schema conflicts
    logging: dbConfig?.logging ?? ['error'], // Log only errors by default
    migrations: dbConfig?.migrations ? ['dist/migrations/*.js'] : undefined,
    migrationsRun: dbConfig?.migrationsRun || false,
    extra: {
      connectionLimit: dbConfig?.poolSize || 10, // Connection pool size
    },
    // Enable SSL in production if needed
    ssl: dbConfig?.ssl ? { rejectUnauthorized: false } : undefined,
  };
};