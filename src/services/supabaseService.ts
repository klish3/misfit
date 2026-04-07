import { supabase } from '../lib/supabase';
import { Conversation, Message } from '../store/types';

export const supabaseService = {
  async fetchConversations() {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    return data.map(conv => ({
      ...conv,
      messages: [],
      createdAt: new Date(conv.created_at).getTime(),
      updatedAt: new Date(conv.updated_at).getTime(),
    })) as Conversation[];
  },

  async fetchMessages(conversationId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data.map(msg => ({
      ...msg,
      timestamp: new Date(msg.created_at).getTime(),
      isLoading: false,
    })) as Message[];
  },

  async upsertConversation(conversation: Partial<Conversation>) {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('conversations')
      .upsert({
        id: conversation.id,
        title: conversation.title,
        created_at: conversation.createdAt ? new Date(conversation.createdAt).toISOString() : now,
        updated_at: now,
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting conversation:', error);
      return null;
    }

    return data;
  },

  async createMessage(conversationId: string, message: Partial<Message>) {
    const { data, error } = await supabase
      .from('messages')
      .upsert({
        id: message.id,
        conversation_id: conversationId,
        content: message.content,
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
  },

  async updateMessage(messageId: string, content: string) {
    const { data, error } = await supabase
      .from('messages')
      .update({ content })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return null;
    }

    return data;
  },

  async deleteConversation(id: string) {
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }

    return true;
  },

  async fetchUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 is 'no rows returned'
        console.error('Error fetching user preferences:', error);
      }
      return null;
    }

    return {
      selectedModel: data.selected_model,
      temperature: data.temperature,
      topP: data.top_p,
      systemPrompt: data.system_prompt
    };
  },

  async upsertUserPreferences(userId: string, settings: any) {
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
  }
};
