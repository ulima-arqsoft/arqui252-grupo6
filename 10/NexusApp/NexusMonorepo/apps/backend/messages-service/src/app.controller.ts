import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat } from './message.schema';
import { MessagesGateway } from './messages.gateway';

@Controller()
export class AppController {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    private readonly messagesGateway: MessagesGateway,
  ) { }

  // Obtener lista de chats para un usuario específico
  @MessagePattern({ cmd: 'get_chats' })
  async getChats(@Payload() userId: string) {
    return this.chatModel
      .find({ participants: userId })
      .sort({ lastMessageTime: -1 })
      .exec();
  }

  // Crear un nuevo chat
  @MessagePattern({ cmd: 'create_chat' })
  async createChat(@Payload() data: {
    participants: string[];
    participantName: string;
    project: string;
    avatar: string;
    chatType?: string;
  }) {
    const newChat = new this.chatModel({
      ...data,
      messages: [],
      lastMessageTime: new Date(),
      chatType: data.chatType || 'direct'
    });
    return newChat.save();
  }

  // Enviar un mensaje
  @MessagePattern({ cmd: 'send_message' })
  async sendMessage(@Payload() data: { chatId: string; sender: string; content: string }) {
    const chat = await this.chatModel.findById(data.chatId);
    if (!chat) return { success: false, message: 'Chat not found' };

    chat.messages.push({
      sender: data.sender,
      content: data.content,
      timestamp: new Date()
    });
    chat.lastMessageTime = new Date();

    await chat.save();
    this.messagesGateway.emitNewMessage(data.chatId, {
      chatId: data.chatId,
      message: chat.messages[chat.messages.length - 1],
    });
    return { success: true, chat };
  }

  // Marcar mensajes como leídos
  @MessagePattern({ cmd: 'mark_as_read' })
  async markAsRead(@Payload() chatId: string) {
    return this.chatModel.findByIdAndUpdate(
      chatId,
      { unreadCount: 0 },
      { new: true }
    ).exec();
  }

  // Inicializar datos dummy (para que no salga vacío al probar)
  @MessagePattern({ cmd: 'seed_chats' })
  async seed() {
    const exists = await this.chatModel.countDocuments();
    if (exists === 0) {
      await this.chatModel.create({
        participantName: "María González",
        project: "App Reciclaje",
        avatar: "MG",
        participants: ["user123", "user456"],
        chatType: "project",
        messages: [{ sender: 'Client', content: 'Hola, ¿cómo vas?', timestamp: new Date() }]
      });
    }
    return { status: 'ok' };
  }
}