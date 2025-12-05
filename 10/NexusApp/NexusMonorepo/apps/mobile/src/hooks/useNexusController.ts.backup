import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ModuleId, Idea, Chat, Transaction, User } from '../types/nexus';
import { supabase } from '../config/supabase';

// URL del API Gateway desplegado en Railway
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api-gateway-production-7a43.up.railway.app';
const USER_STORAGE_KEY = '@nexus_user';

export const useNexusController = () => {
  // --- 1. ESTADOS DE UI (Navegación y Modales) ---
  const [activeModule, setActiveModule] = useState<ModuleId>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // ID Híbrido: Acepta number (mock) o string (Mongo)
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | number | null>(null);

  const [showCheckout, setShowCheckout] = useState(false);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [activeChatIndex, setActiveChatIndex] = useState(0);

  // --- 2. ESTADOS DE DATOS (Desde Backend) ---
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // --- SEARCH STATES ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Idea[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- 3. FETCHING DE DATOS (Lectura) ---
  const fetchIdeas = async () => {
    try {
      const response = await fetch(`${API_URL}/ideas`);
      if (!response.ok) throw new Error('Error en red al obtener ideas');
      const data = await response.json();
      setIdeas(data);
    } catch (error) {
      console.log("Modo Offline o Error API Ideas:", error);
    }
  };

  const searchIdeas = async (keyword: string) => {
    if (!keyword || keyword.trim() === '') {
      setSearchResults([]);
      setSearchQuery('');
      return;
    }

    try {
      setIsSearching(true);
      setSearchQuery(keyword);
      const response = await fetch(`${API_URL}/ideas/search?keyword=${encodeURIComponent(keyword)}`);
      if (!response.ok) throw new Error('Error en búsqueda');
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.log("Error en búsqueda:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const fetchChats = async () => {
    if (!currentUser) return;

    try {
      const response = await fetch(`${API_URL}/messages/${currentUser.id}`);
      if (!response.ok) throw new Error('Error en red al obtener chats');
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.log("Modo Offline o Error API Chats:", error);
    }
  };

  // Cargar sesión guardada al iniciar
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (savedUser) {
          setCurrentUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Error loading session:", error);
      }
    };
    loadSession();
  }, []);

  // Cargar datos al iniciar el hook
  useEffect(() => {
    setLoading(true);
    const promises = [fetchIdeas()];
    if (currentUser) promises.push(fetchChats());

    Promise.all(promises)
      .finally(() => setLoading(false));
  }, [currentUser]);

  // --- 4. ACCIONES (Lógica de Negocio) ---

  const navigateToModule = (module: ModuleId) => {
    setActiveModule(module);
    setSelectedIdeaId(null);
    setShowCheckout(false);
    setShowPublishForm(false);
  };

  const selectIdea = (id: string | number | null) => {
    setSelectedIdeaId(id);
    if (id === null) setShowCheckout(false);
  };

  const toggleCheckout = (show: boolean) => {
    setShowCheckout(show);
  };

  const togglePublishForm = (show: boolean) => {
    setShowPublishForm(show);
  };

  const getSelectedIdea = () => {
    return ideas.find(i => (i._id || i.id) === selectedIdeaId);
  };

  // --- PUBLICAR IDEA ---
  const publishIdea = async (formData: any) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/ideas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          author: currentUser?.fullName || 'Juan Dev',
          authorId: currentUser?.id || 'user123',
          status: 'Nueva',
          collaborators: 0,
          avatar: currentUser?.avatar || 'JD'
        }),
      });

      // Verificar si la respuesta HTTP fue exitosa (200-299)
      if (response.ok) {
        console.log("✅ Idea publicada con éxito");
        await fetchIdeas();
        setShowPublishForm(false);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Error del servidor:", response.status, errorData);
        alert("Hubo un problema al publicar. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("❌ Error de red:", error);
      alert("Error de conexión. Revisa tu internet.");
    } finally {
      setLoading(false);
    }
  };

  // --- 6. AUTENTICACIÓN ---
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (!data.user) {
        return { success: false, error: 'Login failed' };
      }

      const response = await fetch(`${API_URL}/users/${data.user.id}`);
      if (!response.ok) throw new Error('Failed to fetch user profile');

      const userProfile = await response.json();
      setCurrentUser(userProfile);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userProfile));

      return { success: true };
    } catch (error: any) {
      console.error("Login Error:", error);
      return { success: false, error: error.message || 'Email o contraseña incorrectos' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string, specialty: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName,
            specialty
          }
        }
      });

      if (error) throw error;

      if (!data.user) {
        return { success: false, error: 'Registration failed' };
      }

      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: data.user.id,
          fullName,
          email,
          specialty,
          avatar: fullName.split(' ').map(n => n[0]).join('').toUpperCase(),
          projectsCreated: 0,
          projectsCollaborated: 0,
          rating: 0,
          totalEarnings: 0
        }),
      });

      if (!response.ok) throw new Error('Failed to create user profile');

      const userProfile = await response.json();
      setCurrentUser(userProfile);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userProfile));

      return { success: true };
    } catch (error: any) {
      console.error("Register Error:", error);
      return { success: false, error: error.message || 'No se pudo crear la cuenta' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setCurrentUser(null);
      setActiveModule('dashboard');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // --- 7. CHAT FUNCTIONS ---
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/users`);
      if (!response.ok) throw new Error('Error fetching users');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch Users Error:", error);
      return [];
    }
  };

  const createChat = async (participantId: string, participantName: string, avatar: string, project?: string) => {
    if (!currentUser) return { success: false, error: 'No user logged in' };
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/messages/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participants: [currentUser.id, participantId],
          participantName,
          avatar,
          project: project || 'Chat directo',
          chatType: 'direct'
        }),
      });
      if (!response.ok) throw new Error('Error creating chat');
      const data = await response.json();
      await fetchChats();
      return { success: true, chat: data };
    } catch (error) {
      console.error("Create Chat Error:", error);
      return { success: false, error: 'No se pudo crear el chat' };
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (chatId: string, content: string) => {
    if (!currentUser) return { success: false, error: 'No user logged in' };
    try {
      const response = await fetch(`${API_URL}/messages/${chatId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: currentUser.id,
          content
        }),
      });
      if (!response.ok) throw new Error('Error sending message');
      const data = await response.json();
      await fetchChats();
      return { success: true, data };
    } catch (error) {
      console.error("Send Message Error:", error);
      return { success: false, error: 'No se pudo enviar el mensaje' };
    }
  };

  const markChatAsRead = async (chatId: string) => {
    try {
      await fetch(`${API_URL}/messages/${chatId}/read`, {
        method: 'POST',
      });
      await fetchChats();
    } catch (error) {
      console.error("Mark as Read Error:", error);
    }
  };

  // --- 5. RETORNO DEL HOOK ---
  return {
    state: {
      activeModule,
      selectedIdeaId,
      selectedIdea: getSelectedIdea(),
      showCheckout,
      showPublishForm,
      activeChatIndex,
      loading,
      currentUser,
      ideas,
      chats,
      transactions,
      searchQuery,
      searchResults,
      isSearching
    },
    actions: {
      navigateToModule,
      setActiveModule,
      selectIdea,
      toggleCheckout,
      togglePublishForm,
      publishIdea,
      setActiveChatIndex,
      login,
      register,
      logout,
      createChat,
      sendMessage,
      markChatAsRead,
      fetchAllUsers,
      searchIdeas,
      clearSearch
    }
  };
};