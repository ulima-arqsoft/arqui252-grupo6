import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
            transport: Transport.RMQ,
            options: {
                urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
                queue: 'payments_queue',
                queueOptions: {
                    durable: false
                },
            },
        },
    );
    await app.listen();
    console.log('Payments Service is listening on port 3004');
}
bootstrap();
