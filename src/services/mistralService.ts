/// <reference types="vite/client" />
import { Mistral } from '@mistralai/mistralai';
import { ChatCompletionResponse } from '@mistralai/mistralai/models/components/chatcompletionresponse';

export interface ChatMessage {
  content: string;
  role: 'user' | 'assistant' | 'system';
}

export interface ChatOptions {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  randomSeed?: number;
}

export interface ChatResponse {
  id: string
  created: number
  model: string
  usage: Usage
  object: string
  choices: Choice[]
}

export interface Usage {
  prompt_tokens: number
  total_tokens: number
  completion_tokens: number
}

export interface Choice {
  index: number
  finish_reason: string
  message: Message
}

export interface Message {
  role: string
  tool_calls: any
  content: string
}


class MistralService {
  private client: Mistral;
  
  constructor() {
    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error('Mistral API key is not set in environment variables');
    }
    this.client = new Mistral({
      apiKey
    });
  }

  async chat(
    messages: ChatMessage[],
    model: string = 'mistral-small-latest',
    options: ChatOptions = {
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 10000,
      randomSeed: Math.floor(Math.random() * 1000000)
    }
  ) {
    try {
      const response = await this.client.chat.complete({
        model,
        messages,
        temperature: options.temperature,
        topP: options.topP,
        maxTokens: options.maxTokens,
        randomSeed: options.randomSeed
      });

      const messageContent = response.choices[0].message.content;
      let contentString = '';

      if (typeof messageContent === 'string') {
        contentString = messageContent;
      } else if (Array.isArray(messageContent)) {
        contentString = messageContent
          .map(chunk => {
            if (chunk.type === 'text') return chunk.text;
            if (chunk.type === 'thinking') return chunk.thinking;
            return '';
          })
          .join('');
      }

      return {
        content: contentString,
        role: response.choices[0].message.role,
        usage: response.usage,
        finishReason: response.choices[0].finishReason
      };
    } catch (error) {
      console.error('Error in Mistral chat:', error);
      throw error;
    }
  }

  async streamChat(
    messages: ChatMessage[],
    model: string = 'mistral-small-latest',
    options: ChatOptions = {},
    onChunk: (chunk: string) => void
  ) {
    console.warn('streamChat called with messages:', messages);
    try {
      const stream = await this.client.chat.stream({
        model,
        messages,
        temperature: options.temperature,
        topP: options.topP,
        maxTokens: options.maxTokens,
        randomSeed: options.randomSeed
      });

      for await (const chunk of stream) {
        if ('content' in chunk && typeof chunk.content === 'string') {
          onChunk(chunk.content);
        }
      }
    } catch (error) {
      console.error('Error in Mistral stream chat:', error);
      throw error;
    }
  }

  async chatM(message: string) {
    const result = await this.client.chat.complete({
      model: "mistral-small-latest",
      messages: [
        {
          content: message,
          role: "user",
        },
      ],
    });
    return result as ChatCompletionResponse;
  }
}

export const mistralService = new MistralService();