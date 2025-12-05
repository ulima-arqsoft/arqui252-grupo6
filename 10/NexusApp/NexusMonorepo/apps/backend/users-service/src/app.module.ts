// apps/backend/users-service/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SupabaseService } from './supabase.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class AppModule { }