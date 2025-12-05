// apps/backend/api-gateway/src/app.controller.ts
import { Controller, Get, Post, Body, Param, Inject, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    @Inject('USERS_SERVICE') private usersClient: ClientProxy,
    @Inject('IDEAS_SERVICE') private ideasClient: ClientProxy,
    @Inject('MESSAGES_SERVICE') private messagesClient: ClientProxy,
  ) { }

  // --- USUARIOS ---
  @Get('users')
  getAllUsers() {
    return this.usersClient.send({ cmd: 'find_all_users' }, {});
  }

  @Post('users')
  createUser(@Body() data: any) {
    return this.usersClient.send({ cmd: 'create_user' }, data);
  }

  @Get('users/:id')
  getUser(@Param('id') id: string) {
    return this.usersClient.send({ cmd: 'find_user' }, id);
  }

  // --- AUTH ---
  @Post('auth/register')
  async register(@Body() data: any) {
    return this.usersClient.send({ cmd: 'register_user' }, data);
  }

  @Post('auth/login')
  async login(@Body() data: any) {
    return this.usersClient.send({ cmd: 'login_user' }, data);
  }

  // --- IDEAS ---
  @Get('ideas')
  getIdeas() {
    return this.ideasClient.send({ cmd: 'get_ideas' }, {});
  }

  @Post('ideas')
  createIdea(@Body() data: any) {
    console.log('Nueva idea recibida:', data);
    // Agregar campos requeridos por defecto si no vienen del frontend
    const ideaData = {
      ...data,
      author: data.author || 'Usuario Demo',
      authorId: data.authorId || 'user-demo-123',
      avatar: data.avatar || 'UD',
      status: data.status || 'Nueva',
      collaborators: data.collaborators || 0,
    };
    return this.ideasClient.send({ cmd: 'create_idea' }, ideaData);
  }

  @Get('ideas/search')
  searchIdeas(@Query('keyword') keyword: string) {
    console.log('🔍 Searching ideas with keyword:', keyword);
    if (!keyword || keyword.trim() === '') {
      return this.ideasClient.send({ cmd: 'get_ideas' }, {});
    }
    return this.ideasClient.send({ cmd: 'search_ideas' }, { keyword });
  }

  // --- MENSAJES ---
  @Get('messages/:userId')
  getChats(@Param('userId') userId: string) {
    return this.messagesClient.send({ cmd: 'get_chats' }, userId);
  }

  @Post('messages/chat')
  createChat(@Body() data: {
    participants: string[];
    participantName: string;
    project?: string;
    avatar: string;
    chatType?: string;
  }) {
    console.log('📨 Creating new chat:', data);
    return this.messagesClient.send({ cmd: 'create_chat' }, data);
  }

  @Post('messages/:chatId/send')
  sendMessage(@Param('chatId') chatId: string, @Body() data: { sender: string; content: string }) {
    console.log('💬 Sending message to chat:', chatId);
    return this.messagesClient.send({ cmd: 'send_message' }, { chatId, ...data });
  }

  @Post('messages/:chatId/read')
  markAsRead(@Param('chatId') chatId: string) {
    return this.messagesClient.send({ cmd: 'mark_as_read' }, chatId);
  }
}