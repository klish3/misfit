import { supabase } from '../lib/supabase';
import { Conversation, Message } from '../store/types';

const LOCAL_STORAGE_KEY = 'gpt_mistral_rnd_data';

interface LocalStore {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  userPreferences: any;
}

const getLocalStore = (): LocalStore => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : { conversations: [], messages: {}, userPreferences: {} };
};

const saveLocalStore = (store: LocalStore) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
};

// Check if Supabase is likely broken (URL not resolving)
const isSupabaseBroken = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('evyyvgehnfyfkpzdppbd');

export const supabaseService = {
  async fetchConversations() {
    if (isSupabaseBroken) {
      console.warn('Supabase URL appears invalid. Using localStorage.');
      return getLocalStore().conversations;
    }

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return getLocalStore().conversations;
      }

      return data.map(conv => ({
        ...conv,
        messages: [],
        createdAt: new Date(conv.created_at).getTime(),
        updatedAt: new Date(conv.updated_at).getTime(),
      })) as Conversation[];
    } catch (e) {
      return getLocalStore().conversations;
    }
  },

  async fetchMessages(conversationId: string) {
    if (isSupabaseBroken) {
      return getLocalStore().messages[conversationId] || [];
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return getLocalStore().messages[conversationId] || [];
      }

      return data.map(msg => ({
        ...msg,
        thinking: msg.thinking,
        timestamp: new Date(msg.created_at).getTime(),
        isLoading: false,
      })) as Message[];
    } catch (e) {
      return getLocalStore().messages[conversationId] || [];
    }
  },

  async upsertConversation(conversation: Partial<Conversation>) {
    // Always sync to local store first
    const store = getLocalStore();
    const existingIdx = store.conversations.findIndex(c => c.id === conversation.id);
    const now = Date.now();
    
    if (existingIdx >= 0) {
      store.conversations[existingIdx] = { 
        ...store.conversations[existingIdx], 
        ...conversation, 
        updatedAt: now 
      };
    } else if (conversation.id) {
      store.conversations.push({
        id: conversation.id,
        title: conversation.title || 'New Chat',
        messages: [],
        createdAt: conversation.createdAt || now,
        updatedAt: now
      });
    }
    saveLocalStore(store);

    if (isSupabaseBroken) return conversation;

    try {
      const isoNow = new Date().toISOString();
      const { data, error } = await supabase
        .from('conversations')
        .upsert({
          id: conversation.id,
          title: conversation.title,
          created_at: conversation.createdAt ? new Date(conversation.createdAt).toISOString() : isoNow,
          updated_at: isoNow,
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting conversation:', error);
        return null;
      }

      return data;
    } catch (e) {
      return null;
    }
  },

  async createMessage(conversationId: string, message: Partial<Message>) {
    // Always sync to local store first
    const store = getLocalStore();
    if (!store.messages[conversationId]) store.messages[conversationId] = [];
    
    const existingIdx = store.messages[conversationId].findIndex(m => m.id === message.id);
    const msgData = {
      id: message.id || crypto.randomUUID(),
      content: message.content || '',
      thinking: message.thinking,
      role: message.role || 'user',
      timestamp: message.timestamp || Date.now(),
      isLoading: false
    } as Message;

    if (existingIdx >= 0) {
      store.messages[conversationId][existingIdx] = msgData;
    } else {
      store.messages[conversationId].push(msgData);
    }
    saveLocalStore(store);

    if (isSupabaseBroken) return msgData;

    try {
      const { data, error } = await supabase
        .from('messages')
        .upsert({
          id: message.id,
          conversation_id: conversationId,
          content: message.content,
          thinking: message.thinking,
          role: message.role,
          created_at: new Date(message.timestamp || Date.now()).toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating message:', error);
        return null;
      }

      return data;
    } catch (e) {
      return null;
    }
  },

  async updateMessage(messageId: string, content: string, thinking?: string) {
    // Local store update
    const store = getLocalStore();
    for (const convId in store.messages) {
      const msg = store.messages[convId].find(m => m.id === messageId);
      if (msg) {
        msg.content = content;
        if (thinking !== undefined) msg.thinking = thinking;
        break;
      }
    }
    saveLocalStore(store);

    if (isSupabaseBroken) return { id: messageId, content };

    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ content, thinking })
        .eq('id', messageId)
        .select()
        .single();

      if (error) {
        console.error('Error updating message:', error);
        return null;
      }

      return data;
    } catch (e) {
      return null;
    }
  },

  async deleteConversation(id: string) {
    // Local store update
    const store = getLocalStore();
    store.conversations = store.conversations.filter(c => c.id !== id);
    delete store.messages[id];
    saveLocalStore(store);

    if (isSupabaseBroken) return true;

    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting conversation:', error);
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  },

  async fetchUserPreferences(userId: string) {
    if (isSupabaseBroken) {
      return getLocalStore().userPreferences[userId] || null;
    }

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
          console.error('Error fetching user preferences:', error);
        }
        return getLocalStore().userPreferences[userId] || null;
      }

      return {
        selectedModel: data.selected_model,
        temperature: data.temperature,
        topP: data.top_p,
        systemPrompt: data.system_prompt
      };
    } catch (e) {
      return getLocalStore().userPreferences[userId] || null;
    }
  },

  async upsertUserPreferences(userId: string, settings: any) {
    // Local store update
    const store = getLocalStore();
    store.userPreferences[userId] = settings;
    saveLocalStore(store);

    if (isSupabaseBroken) return settings;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          selected_model: settings.selectedModel,
          temperature: settings.temperature,
          top_p: settings.topP,
          system_prompt: settings.systemPrompt,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting user preferences:', error);
        return null;
      }

      return data;
    } catch (e) {
      return null;
    }
  }
};
