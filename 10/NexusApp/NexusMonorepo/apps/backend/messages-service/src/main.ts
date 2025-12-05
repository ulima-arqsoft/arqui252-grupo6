// Load .env only in development (Railway injects env vars directly)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Crear aplicación HTTP para WebSocket
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: '*', // En producción, especifica los orígenes permitidos
    credentials: true,
  });

  // Conectar microservicio RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'messages_queue',
      queueOptions: {
        durable: false
      },
    },
  });

  // Iniciar ambos: HTTP/WebSocket y RabbitMQ
  await app.startAllMicroservices();

  const port = process.env.PORT || 3003;
  await app.listen(port);

  console.log(`🚀 Messages Service running on port ${port}`);
  console.log(`📡 WebSocket Gateway enabled`);
  console.log(`🐰 RabbitMQ microservice listening on messages_queue`);
}
bootstrap();