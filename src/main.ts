import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1')
  app.enableCors({
    origin: 'http://localhost:5173', // Specify the frontend URL
    credentials: true, // Allow credentials (cookies, etc.)
  });
  await app.listen(8080);
}
bootstrap();
