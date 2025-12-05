// Load .env only in development (Railway injects env vars directly)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
        queue: 'ideas_queue',
        queueOptions: {
          durable: false
        },
      },
    },
  );
  await app.listen();
  console.log('Ideas Service is running via RabbitMQ (ideas_queue)');
}
bootstrap();