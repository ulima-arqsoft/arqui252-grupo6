import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log('🚀 API Gateway starting...');

  app.enableCors();

  // Escuchar en 0.0.0.0 para aceptar conexiones desde cualquier interfaz
  // Esto permite conexiones desde: localhost, emulador Android, dispositivos físicos, etc.
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  console.log('Gateway running on port 3000 (all interfaces)');
}
bootstrap();