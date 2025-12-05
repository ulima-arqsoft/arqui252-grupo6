import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, FlatList } from 'react-native';
import { Card, Avatar, Input, Button, COLORS } from '../../components/NativeComponents';
import { ArrowLeft, Send, Plus, Search, X } from 'lucide-react-native';
import { useWebSocket } from '../../hooks/useWebSocket';

interface MessagesModuleProps {
  chats: any[];
  user: any;
  actions: {
    createChat: (participantId: string, name: string, avatar: string) => Promise<any>;
    sendMessage: (chatId: string, content: string) => Promise<any>;
    markChatAsRead: (chatId: string) => Promise<void>;
    fetchAllUsers: () => Promise<any[]>;
  };
}

export const MessagesModule = ({ chats, user, actions }: MessagesModuleProps) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [localMessages, setLocalMessages] = useState<any[]>([]);
  const { connected, joinChat, leaveChat, onNewMessage, offNewMessage } = useWebSocket(user?.id);
  
  // Estados para nuevo chat
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // WebSocket: Join/leave chat room
  useEffect(() => {
    if (activeChatId) {
      joinChat(activeChatId);
      setLocalMessages([]);
      
      return () => {
        leaveChat(activeChatId);
      };
    }
  }, [activeChatId]);

  // WebSocket: Listen for new messages
  useEffect(() => {
    onNewMessage((data: any) => {
      console.log('📨 New message received:', data);
      if (data.chatId === activeChatId) {
        setLocalMessages(prev => [...prev, data.message]);
      }
    });
    
    return () => {
      offNewMessage();
    };
  }, [activeChatId]);

  // Cargar usuarios al abrir el modal
  useEffect(() => {
    if (showNewChatModal) {
      loadUsers();
    }
  }, [showNewChatModal]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const users = await actions.fetchAllUsers();
      // Filtrar al usuario actual para no chatear consigo mismo
      const otherUsers = users.filter((u: any) => u.id !== user.id);
      setAllUsers(otherUsers);
    } catch (error) {
      console.error("Error loading users", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateChat = async (selectedUser: any) => {
    setShowNewChatModal(false);
    const result = await actions.createChat(
      selectedUser.id,
      selectedUser.fullName,
      selectedUser.avatar || 'U'
    );
    
    if (result.success) {
      setActiveChatId(result.chat._id);
    } else {
      alert('Error al crear el chat');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !activeChatId) return;
    
    const content = messageText;
    setMessageText(''); // Limpiar input inmediatamente para mejor UX
    
    const result = await actions.sendMessage(activeChatId, content);
    if (!result.success) {
      alert('No se pudo enviar el mensaje');
      setMessageText(content); // Restaurar si falló
    }
  };

  // Filtrar usuarios en el modal
  const filteredUsers = allUsers.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- ESTADO DE CARGA ---
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // VISTA CHAT INDIVIDUAL
  if (activeChatId) {
    // Buscamos por _id (Mongo) o id (Mock)
    const chat = chats.find(c => (c._id || c.id) === activeChatId);
    
    if (!chat) return <Text style={{ padding: 20 }}>Chat no encontrado</Text>;

    // Normalizamos el nombre para usar cualquiera de los dos campos
    const displayName = chat.participantName || chat.name || 'Usuario';

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.chatHeader}>
          <Button 
            title="" 
            variant="ghost" 
            icon={<ArrowLeft size={20} color={COLORS.text} />} 
            onPress={() => setActiveChatId(null)} 
          />
          <Avatar initials={chat.avatar || 'U'} />
          <View style={{ marginLeft: 10 }}>
             <Text style={{ fontWeight: 'bold' }}>{displayName}</Text>
             <Text style={{ fontSize: 12, color: COLORS.success }}>{chat.online ? 'En línea' : 'Offline'}</Text>
          </View>
        </View>

        <ScrollView 
          style={{ flex: 1, padding: 16 }}
          ref={ref => ref?.scrollToEnd({ animated: true })}
          onContentSizeChange={(w, h) => {}}
        >
           {/* Renderizado de mensajes: Combinamos mensajes del backend con mensajes en tiempo real */}
           {(() => {
             const allMessages = [...(chat.messages || []), ...localMessages];
             return allMessages.length > 0 ? (
               allMessages.map((msg: any, index: number) => (
                 <View key={index} style={[styles.bubble, msg.sender === user.id || msg.sender === 'Me' ? styles.bubbleRight : styles.bubbleLeft]}>
                   <Text style={msg.sender === user.id || msg.sender === 'Me' ? { color: 'white' } : { color: COLORS.text }}>
                     {msg.content}
                   </Text>
                 </View>
               ))
             ) : (
               /* Fallback para datos mock antiguos */
               <View style={[styles.bubble, styles.bubbleLeft]}>
                 <Text>{chat.lastMessage || 'Inicio de la conversación'}</Text>
               </View>
             );
           })()}
           <View style={{ height: 20 }} />
        </ScrollView>

        <View style={styles.chatInputContainer}>
           <View style={{ flex: 1 }}>
             <Input 
               placeholder="Escribe un mensaje..." 
               value={messageText}
               onChangeText={setMessageText}
             />
           </View>
           <Button 
             title="" 
             icon={<Send size={18} color="#fff" />} 
             onPress={handleSendMessage} 
             style={{ width: 48, height: 48, marginLeft: 8 }} 
           />
        </View>
      </KeyboardAvoidingView>
    );
  }

  // VISTA LISTA DE CHATS
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={styles.headerTitle}>Mensajes</Text>
          <TouchableOpacity 
            style={styles.newChatButton}
            onPress={() => setShowNewChatModal(true)}
          >
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#f1f5f9', borderRadius: 12, marginBottom: 16 }}>
           <Search size={20} color={COLORS.textMuted} style={{ marginRight: 8 }} />
           <Input 
             placeholder="Buscar en mis chats..." 
             value={chatSearchQuery}
             onChangeText={setChatSearchQuery}
             style={{ flex: 1, borderWidth: 0, marginBottom: 0, height: 24, padding: 0 }}
           />
           {chatSearchQuery.length > 0 && (
             <TouchableOpacity onPress={() => setChatSearchQuery('')}>
               <X size={16} color={COLORS.textMuted} />
             </TouchableOpacity>
           )}
        </View>
        
        {chats.filter(c => {
            const name = c.participantName || c.name || 'Usuario';
            return name.toLowerCase().includes(chatSearchQuery.toLowerCase());
        }).length === 0 ? (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ textAlign: 'center', color: COLORS.textMuted, marginBottom: 20 }}>
              {chatSearchQuery ? 'No se encontraron chats' : 'No tienes mensajes aún.'}
            </Text>
            {!chatSearchQuery && <Button title="Iniciar nuevo chat" onPress={() => setShowNewChatModal(true)} />}
          </View>
        ) : (
          chats.filter(c => {
            const name = c.participantName || c.name || 'Usuario';
            return name.toLowerCase().includes(chatSearchQuery.toLowerCase());
          }).map((chat) => {
            // Normalización de datos para la tarjeta
            const uniqueId = chat._id || chat.id || 'temp-id';
            const displayName = chat.participantName || chat.name || 'Usuario';
            
            // Obtener el último mensaje real o el mock
            let previewMessage = 'Nueva conversación';
            if (chat.messages && chat.messages.length > 0) {
              previewMessage = chat.messages[chat.messages.length - 1].content;
            } else if (chat.lastMessage) {
              previewMessage = chat.lastMessage;
            }

            return (
              <TouchableOpacity key={uniqueId} onPress={() => setActiveChatId(uniqueId)}>
                <Card style={{ flexDirection: 'row', alignItems: 'center' }}>
                   <Avatar initials={chat.avatar || 'U'} size={48} />
                   <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                         <Text style={{ fontWeight: 'bold' }}>{displayName}</Text>
                         <Text style={{ fontSize: 12, color: COLORS.textMuted }}>{chat.time || 'Hoy'}</Text>
                      </View>
                      <Text numberOfLines={1} style={{ color: COLORS.textMuted, marginTop: 2 }}>
                        {previewMessage}
                      </Text>
                      <Text style={{ fontSize: 10, color: COLORS.primary, marginTop: 4 }}>{chat.project || 'Chat directo'}</Text>
                   </View>
                   
                   {/* Manejo de unreadCount (backend) o unread (mock) */}
                   {(chat.unreadCount || chat.unread || 0) > 0 && (
                     <View style={styles.unreadBadge}>
                       <Text style={{ color: 'white', fontSize: 10 }}>
                         {chat.unreadCount || chat.unread}
                       </Text>
                     </View>
                   )}
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* MODAL DE NUEVO CHAT */}
      <Modal
        visible={showNewChatModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewChatModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nuevo Chat</Text>
            <TouchableOpacity onPress={() => setShowNewChatModal(false)}>
              <X size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={COLORS.textMuted} style={{ marginRight: 8 }} />
            <Input 
              placeholder="Buscar usuario..." 
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ flex: 1, borderWidth: 0, marginBottom: 0 }}
            />
          </View>

          {loadingUsers ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleCreateChat(item)}>
                  <Card style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                    <Avatar initials={item.avatar || 'U'} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={{ fontWeight: 'bold' }}>{item.fullName}</Text>
                      <Text style={{ fontSize: 12, color: COLORS.textMuted }}>{item.specialty || 'Usuario'}</Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ textAlign: 'center', color: COLORS.textMuted, marginTop: 20 }}>
                  No se encontraron usuarios
                </Text>
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: '#fff' },
  bubble: { padding: 12, borderRadius: 16, maxWidth: '80%', marginBottom: 8 },
  bubbleLeft: { backgroundColor: '#f1f5f9', alignSelf: 'flex-start' },
  bubbleRight: { backgroundColor: COLORS.primary, alignSelf: 'flex-end' },
  chatInputContainer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: '#fff', alignItems: 'center' },
  unreadBadge: { backgroundColor: COLORS.primary, borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  newChatButton: { backgroundColor: COLORS.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  modalContainer: { flex: 1, backgroundColor: '#f8fafc' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#fff', margin: 16, borderRadius: 8, borderWidth: 1, borderColor: COLORS.border }
});