// apps/backend/ideas-service/src/app.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Idea, IdeaSchema } from './idea.schema';
import { AppController } from './app.controller';
import { SearchModule } from './search/search.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGO_URI || 'mongodb://localhost:27017/nexus_ideas'
    ),
    MongooseModule.forFeature([{ name: Idea.name, schema: IdeaSchema }]),
    SearchModule,
  ],
  controllers: [AppController],
})
export class AppModule { }