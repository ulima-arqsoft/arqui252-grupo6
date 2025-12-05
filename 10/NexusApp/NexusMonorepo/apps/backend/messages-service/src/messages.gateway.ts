import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*', // En producción, especifica el dominio de tu app
    },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    // Cliente se une a una sala de chat específica
    @SubscribeMessage('join_chat')
    handleJoinChat(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { chatId: string; userId: string },
    ) {
        client.join(data.chatId);
        console.log(`User ${data.userId} joined chat ${data.chatId}`);
        return { success: true };
    }

    // Cliente sale de una sala de chat
    @SubscribeMessage('leave_chat')
    handleLeaveChat(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { chatId: string },
    ) {
        client.leave(data.chatId);
        console.log(`Client left chat ${data.chatId}`);
        return { success: true };
    }

    // Emitir un nuevo mensaje a todos en la sala
    emitNewMessage(chatId: string, message: any) {
        this.server.to(chatId).emit('new_message', message);
    }

    // Emitir que alguien está escribiendo
    @SubscribeMessage('typing')
    handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { chatId: string; userId: string; userName: string },
    ) {
        client.to(data.chatId).emit('user_typing', {
            userId: data.userId,
            userName: data.userName,
        });
    }
}
