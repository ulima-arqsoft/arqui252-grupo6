// apps/backend/users-service/src/app.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SupabaseService } from './supabase.service';

@Controller()
export class AppController {
  constructor(private readonly supabaseService: SupabaseService) { }

  @MessagePattern({ cmd: 'create_user' })
  async createUser(@Payload() data: any) {
    console.log('📝 Create user request:', data);
    return await this.supabaseService.createUser(data);
  }

  @MessagePattern({ cmd: 'find_all_users' })
  async findAllUsers() {
    console.log('📋 Find all users request');
    return await this.supabaseService.findAllUsers();
  }

  @MessagePattern({ cmd: 'find_user' })
  async findUser(@Payload() id: string) {
    console.log('🔍 Find user request:', id);
    return await this.supabaseService.findUserById(id);
  }

  @MessagePattern({ cmd: 'update_user' })
  async updateUser(@Payload() data: { id: string; updates: any }) {
    console.log('✏️ Update user request:', data.id);
    return await this.supabaseService.updateUser(data.id, data.updates);
  }

  @MessagePattern({ cmd: 'get_user_stats' })
  async getUserStats(@Payload() id: string) {
    console.log('📊 Get user stats request:', id);
    const user = await this.supabaseService.findUserById(id);
    if (!user) return null;

    return {
      projectsCreated: user.projectsCreated || 0,
      projectsCollaborated: user.projectsCollaborated || 0,
      rating: user.rating || 0,
      totalEarnings: user.totalEarnings || 0
    };
  }

  @MessagePattern({ cmd: 'register_user' })
  async registerUser(@Payload() data: { fullName: string; email: string; password: string; specialty: string }) {
    console.log('📝 Register user request received:', { email: data.email, fullName: data.fullName });
    try {
      // 1. Create auth user via Supabase Auth
      console.log('🔐 Creating auth user...');
      const authResult = await this.supabaseService.signUp(
        data.email,
        data.password,
        { fullName: data.fullName, specialty: data.specialty }
      );

      if (!authResult.user) {
        console.error('❌ Auth user creation failed');
        return { success: false, message: 'Failed to create auth user' };
      }

      console.log('✅ Auth user created:', authResult.user.id);

      // 2. Create user profile in database
      console.log('✨ Creating user profile...');
      const userProfile = await this.supabaseService.createUser({
        id: authResult.user.id, // Use auth user ID
        fullName: data.fullName,
        email: data.email,
        specialty: data.specialty,
        avatar: data.fullName.split(' ').map(n => n[0]).join('').toUpperCase(),
        projectsCreated: 0,
        projectsCollaborated: 0,
        rating: 0,
        totalEarnings: 0
      });

      console.log('✅ User profile created successfully');
      return {
        success: true,
        user: userProfile,
        session: authResult.session
      };
    } catch (error) {
      console.error('❌ Register error:', error);
      return { success: false, message: error.message };
    }
  }

  @MessagePattern({ cmd: 'login_user' })
  async loginUser(@Payload() data: { email: string; password: string }) {
    console.log('🔐 Login request received:', { email: data.email });
    try {
      // 1. Authenticate with Supabase Auth
      console.log('🔐 Authenticating with Supabase Auth...');
      const authResult = await this.supabaseService.signIn(data.email, data.password);

      if (!authResult.user) {
        console.log('⚠️ Authentication failed');
        return { success: false, message: 'Invalid credentials' };
      }

      console.log('✅ Auth successful, fetching user profile...');

      // 2. Fetch user profile from database
      const userProfile = await this.supabaseService.findUserById(authResult.user.id);

      if (!userProfile) {
        console.log('⚠️ User profile not found');
        return { success: false, message: 'User profile not found' };
      }

      console.log('✅ Login successful');
      return {
        success: true,
        user: userProfile,
        session: authResult.session
      };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { success: false, message: error.message || 'Invalid credentials' };
    }
  }
}