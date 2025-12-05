import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema()
class MessageDetail {
  @Prop() sender: string; // 'Me' o 'Client'
  @Prop() content: string;
  @Prop({ default: Date.now }) timestamp: Date;
}

@Schema({ collection: 'chats', timestamps: true })
export class Chat {
  @Prop({ required: true }) participantName: string;
  @Prop() project: string;
  @Prop() avatar: string; // Iniciales ej: "MG"
  @Prop({ default: 0 }) unreadCount: number;
  @Prop({ default: true }) online: boolean;

  // Participants (user IDs)
  @Prop({ type: [String], required: true }) participants: string[];

  // Last message timestamp for sorting
  @Prop({ default: Date.now }) lastMessageTime: Date;

  // Chat type
  @Prop({
    default: 'direct',
    enum: ['direct', 'group', 'project']
  }) chatType: string;

  // Array de mensajes dentro del documento del chat
  @Prop([MessageDetail])
  messages: MessageDetail[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);