import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { Chat, ChatSchema } from './message.schema';
import { MessagesGateway } from './messages.gateway';

@Module({
  imports: [
    // Conexión a la misma DB de Mongo pero quizás diferente colección o DB lógica
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/nexus_messages'
    ),
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
  ],
  controllers: [AppController],
  providers: [MessagesGateway],
})
export class AppModule { }