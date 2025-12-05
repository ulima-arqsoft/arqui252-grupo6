// apps/backend/users-service/src/main.ts
import 'dotenv/config'; // Cargar variables de entorno
import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Debug: Verificar variables de entorno
  console.log('=== Database Configuration ===');
  console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
  console.log('DB_PORT:', process.env.DB_PORT || '5435');
  console.log('DB_USERNAME:', process.env.DB_USERNAME || 'arqnexsoft');
  console.log('DB_NAME:', process.env.DB_NAME || 'NexusUsersDB');
  console.log('DB_SSL:', process.env.DB_SSL || 'false');
  console.log('==============================');

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
        queue: 'users_queue',
        queueOptions: {
          durable: false
        },
      },
    },
  );
  await app.listen();
  console.log('Users Service is running via RabbitMQ (users_queue)');
}
bootstrap();