import React, { createContext, useContext, useReducer, useCallback, useMemo, useRef } from 'react';
import { AppState, AppContextType, Conversation, Message } from './types';
import { supabaseService } from '@/services/supabaseService';

const STATIC_USER_ID = 'dev-user-123';

const initialState: AppState = {
  conversations: [],
  currentConversationId: '',
  darkMode: false,
  selectedModel: 'mistral-small-latest',
  temperature: 0.7,
  topP: 0.9,
  systemPrompt: '',
};

export const AppContext = createContext<AppContextType>(null as any);

export type Action =
  | { type: 'CREATE_CONVERSATION'; payload: Conversation }
  | { type: 'SELECT_CONVERSATION'; payload: string }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_MODEL_SETTINGS'; payload: Partial<Pick<AppState, 'selectedModel' | 'temperature' | 'topP' | 'systemPrompt'>> }
  | { type: 'ADD_MESSAGE'; payload: { conversationId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { conversationId: string; messageId: string; content: string } }
  | { type: 'SET_MESSAGE_LOADING'; payload: { conversationId: string; messageId: string; loading: boolean } }
  | { type: 'SET_CONVERSATION_TITLE'; payload: { conversationId: string; title: string } }
  | { type: 'SET_CONVERSATIONS'; payload: Conversation[] };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'CREATE_CONVERSATION':
      return {
        ...state,
        conversations: [...state.conversations, action.payload],
        currentConversationId: action.payload.id,
      };

    case 'SELECT_CONVERSATION':
      return {
        ...state,
        currentConversationId: action.payload,
      };

    case 'DELETE_CONVERSATION': {
      const newConversations = state.conversations.filter(c => c.id !== action.payload);
      return {
        ...state,
        conversations: newConversations,
        currentConversationId: state.currentConversationId === action.payload
          ? newConversations[0]?.id || ''
          : state.currentConversationId,
      };
    }

    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        darkMode: !state.darkMode,
      };

    case 'SET_MODEL_SETTINGS':
      return {
        ...state,
        ...action.payload,
      };

    case 'ADD_MESSAGE': {
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? {
                ...conv,
                messages: conv.messages.some(m => m.id === action.payload.message.id)
                  ? conv.messages
                  : [...conv.messages, action.payload.message],
                updatedAt: Date.now(),
              }
            : conv
        ),
      };
    }

    case 'UPDATE_MESSAGE': {
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? {
                ...conv,
                messages: conv.messages.map(msg =>
                  msg.id === action.payload.messageId
                    ? { ...msg, content: action.payload.content }
                    : msg
                ),
                updatedAt: Date.now(),
              }
            : conv
        ),
      };
    }

    case 'SET_MESSAGE_LOADING': {
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? {
                ...conv,
                messages: conv.messages.map(msg =>
                  msg.id === action.payload.messageId
                    ? { ...msg, isLoading: action.payload.loading }
                    : msg
                ),
              }
            : conv
        ),
      };
    }

    case 'SET_CONVERSATION_TITLE': {
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.conversationId
            ? {
                ...conv,
                title: action.payload.title,
                updatedAt: Date.now(),
              }
            : conv
        ),
      };
    }
    
    case 'SET_CONVERSATIONS': {
      // Filter out duplicates by ID just in case
      const seen = new Set();
      const uniqueConversations = action.payload.filter(c => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
      return {
        ...state,
        conversations: uniqueConversations,
        currentConversationId: uniqueConversations[0]?.id || state.currentConversationId,
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const createConversation = useCallback(async () => {
    const id = crypto.randomUUID(); // Use UUID for Supabase compatibility
    const conversation: Conversation = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: 'CREATE_CONVERSATION', payload: conversation });
    
    // Sync to Supabase
    await supabaseService.upsertConversation(conversation);
    
    return conversation;
  }, []);

  const syncAllConversations = useCallback(async () => {
    for (const conversation of state.conversations) {
      await supabaseService.upsertConversation(conversation);
      for (const message of conversation.messages) {
        await supabaseService.createMessage(conversation.id, message);
      }
    }
  }, [state.conversations]);

  const initializedRef = useRef(false);

  const initializeStore = useCallback(async () => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const remoteConversations = await supabaseService.fetchConversations();
    
    // Fetch and apply user preferences
    const prefs = await supabaseService.fetchUserPreferences(STATIC_USER_ID);
    if (prefs) {
      dispatch({ type: 'SET_MODEL_SETTINGS', payload: prefs });
    }
    
    if (remoteConversations.length > 0) {
      // Sync from Supabase to local state
      const fullConversations = await Promise.all(remoteConversations.map(async conv => {
        const messages = await supabaseService.fetchMessages(conv.id);
        return { ...conv, messages };
      }));
      dispatch({ type: 'SET_CONVERSATIONS', payload: fullConversations });
    } else {
      createConversation();
    }
  }, [createConversation]);

  const selectConversation = useCallback((id: string) => {
    dispatch({ type: 'SELECT_CONVERSATION', payload: id });
  }, []);

  const deleteConversation = useCallback(async (id: string) => {
    dispatch({ type: 'DELETE_CONVERSATION', payload: id });
    await supabaseService.deleteConversation(id);
  }, []);

  const toggleDarkMode = useCallback(() => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  }, []);

  const setModelSettings = useCallback((settings: Partial<Pick<AppState, 'selectedModel' | 'temperature' | 'topP' | 'systemPrompt'>>) => {
    dispatch({ type: 'SET_MODEL_SETTINGS', payload: settings });
    
    // Sync to Supabase - using current state + new settings to ensure full record is sent
    const newSettings = {
      selectedModel: settings.selectedModel ?? state.selectedModel,
      temperature: settings.temperature ?? state.temperature,
      topP: settings.topP ?? state.topP,
      systemPrompt: settings.systemPrompt ?? state.systemPrompt,
    };
    supabaseService.upsertUserPreferences(STATIC_USER_ID, newSettings);
  }, [state.selectedModel, state.temperature, state.topP, state.systemPrompt]);

  const addMessage = useCallback((conversationId: string, content: string, role: 'user' | 'assistant'): Message => {
    const message: Message = {
      id: crypto.randomUUID(),
      content,
      role,
      timestamp: Date.now(),
      isLoading: false,
    };
    dispatch({ type: 'ADD_MESSAGE', payload: { conversationId, message } });
    
    // Sync to Supabase
    supabaseService.createMessage(conversationId, message);
    
    return message;
  }, []);

  const updateMessage = useCallback((conversationId: string, messageId: string, content: string) => {
    dispatch({ type: 'UPDATE_MESSAGE', payload: { conversationId, messageId, content } });
    supabaseService.updateMessage(messageId, content);
  }, []);

  const setMessageLoading = useCallback((conversationId: string, messageId: string, loading: boolean) => {
    dispatch({ type: 'SET_MESSAGE_LOADING', payload: { conversationId, messageId, loading } });
  }, []);

  const setConversationTitle = useCallback(async (conversationId: string, title: string) => {
    dispatch({ type: 'SET_CONVERSATION_TITLE', payload: { conversationId, title } });
    await supabaseService.upsertConversation({ id: conversationId, title });
  }, []);

  const currentConversation = useMemo(() => 
    state.conversations.find(c => c.id === state.currentConversationId),
    [state.conversations, state.currentConversationId]
  );

  const allConversations = useMemo(() => {
    const seen = new Set();
    return [...state.conversations]
      .filter(c => {
        if (seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [state.conversations]);

  const value: AppContextType = {
    ...state,
    createConversation,
    selectConversation,
    deleteConversation,
    toggleDarkMode,
    setModelSettings,
    addMessage,
    updateMessage,
    setMessageLoading,
    setConversationTitle,
    syncAllConversations,
    currentConversation,
    allConversations,
    initializeStore
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}