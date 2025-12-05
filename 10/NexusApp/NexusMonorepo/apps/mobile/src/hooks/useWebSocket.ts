import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const MESSAGES_SERVICE_URL = process.env.EXPO_PUBLIC_MESSAGES_WS_URL;
const WEBSOCKET_ENABLED = !!MESSAGES_SERVICE_URL; // Only enable if URL is explicitly set

export const useWebSocket = (userId: string | undefined | null) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const currentChatRef = useRef<string | null>(null);

    useEffect(() => {
        // Don't attempt connection if WebSocket is disabled or userId is not available
        if (!WEBSOCKET_ENABLED || !userId) {
            console.log('ℹ️ WebSocket disabled or no userId - skipping connection');
            return;
        }

        console.log(`🔌 Attempting WebSocket connection to: ${MESSAGES_SERVICE_URL}`);

        // Create socket connection
        const newSocket = io(MESSAGES_SERVICE_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        newSocket.on('connect', () => {
            console.log('✅ WebSocket connected');
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
            setConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('⚠️ WebSocket connection error:', error.message);
        });

        setSocket(newSocket);

        return () => {
            console.log('🔌 Closing WebSocket connection');
            newSocket.close();
        };
    }, [userId]);

    const joinChat = (chatId: string) => {
        if (socket && userId) {
            socket.emit('join_chat', { chatId, userId });
            currentChatRef.current = chatId;
            console.log(`Joined chat: ${chatId}`);
        }
    };

    const leaveChat = (chatId: string) => {
        if (socket) {
            socket.emit('leave_chat', { chatId });
            if (currentChatRef.current === chatId) {
                currentChatRef.current = null;
            }
            console.log(`Left chat: ${chatId}`);
        }
    };

    const onNewMessage = (callback: (data: any) => void) => {
        if (socket) {
            socket.on('new_message', callback);
        }
    };

    const offNewMessage = () => {
        if (socket) {
            socket.off('new_message');
        }
    };

    const sendTyping = (chatId: string, userName: string) => {
        if (socket && userId) {
            socket.emit('typing', { chatId, userId, userName });
        }
    };

    return {
        socket,
        connected,
        joinChat,
        leaveChat,
        onNewMessage,
        offNewMessage,
        sendTyping,
    };
};
