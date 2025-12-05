export type ModuleId = 'dashboard' | 'users' | 'ideas' | 'messages' | 'payments';

// Estructura de un mensaje individual dentro del chat
export interface MessageDetail {
  sender: string;
  content: string;
  timestamp: string | Date;
}

export interface Idea {
  id?: number | string; // Puede ser number (mock) o string (Mongo)
  _id?: string;         // MongoDB ID
  title: string;
  description: string;
  fullDescription?: string;
  author: string;
  authorId?: string;
  avatar?: string;
  authorRating?: number;
  skills?: string[];
  tags?: string[];
  budget: string;
  collaborators?: number;
  collaborationRequests?: string[];
  acceptedCollaborators?: string[];
  status: string;
  category?: string;
  deliveryTime?: string;
  revisions?: string;
  portfolio?: string[];
  visibility?: 'public' | 'private' | 'shared';
  isDraft?: boolean;
  files?: { name: string; type: string; size: number; uri?: string }[];
}

export interface Chat {
  // Identificadores (soportamos ambos por compatibilidad)
  id?: string;
  _id?: string;     // MongoDB siempre devuelve esto

  // Nombres (soportamos ambos)
  name?: string;
  participantName?: string; // Backend usa esto

  avatar: string;

  // Contenido
  lastMessage?: string;
  messages?: MessageDetail[]; // Backend devuelve lista de mensajes

  // Metadatos
  time?: string;
  unread?: number;
  unreadCount?: number;     // Backend usa esto
  project: string;
  online: boolean;
  participants?: string[];
  chatType?: 'direct' | 'group' | 'project';
}

export interface Transaction {
  _id?: string;
  type: string;
  project?: string;
  projectName?: string;
  amount: number | string;
  date?: string;
  createdAt?: string;
  status: string;
  fromUser?: string;
  toUser?: string;
  commission?: number;
  description?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  specialty: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  avatar?: string;
  rating?: number;
  projectsCreated?: number;
  projectsCollaborated?: number;
  totalEarnings?: number;
  portfolioLinks?: string[];
}

export interface SearchFilters {
  keyword?: string;
  category?: string;
  tags?: string[];
  skills?: string[];
  status?: string;
  sortBy?: 'relevance' | 'date' | 'popularity';
}

export interface CollaborationRequest {
  ideaId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  status: 'pending' | 'accepted' | 'rejected';
}