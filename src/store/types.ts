export interface Message {
  id: string;
  content: string;
  thinking?: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
  isLoading: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
  conversations: Conversation[];
  currentConversationId: string;
  darkMode: boolean;
  selectedModel: string;
  selectedAgentId?: string;
  selectedAgentVersion?: number;
  temperature: number;
  topP: number;
  systemPrompt: string;
}

export interface AppContextType extends AppState {
  // Actions
  createConversation: () => Promise<Conversation>;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => Promise<void>;
  toggleDarkMode: () => void;
  setModelSettings: (settings: Partial<Pick<AppState, 'selectedModel' | 'selectedAgentId' | 'selectedAgentVersion' | 'temperature' | 'topP' | 'systemPrompt'>>) => void;
  addMessage: (conversationId: string, content: string, role: 'user' | 'assistant') => Message;
  updateMessage: (conversationId: string, messageId: string, content: string, thinking?: string) => void;
  setMessageLoading: (conversationId: string, messageId: string, loading: boolean) => void;
  setConversationTitle: (conversationId: string, title: string) => Promise<void>;
  // Computed values
  currentConversation: Conversation | undefined;
  allConversations: Conversation[];
  // Additional actions
  initializeStore: () => Promise<void>;
  syncAllConversations: () => Promise<void>;
}