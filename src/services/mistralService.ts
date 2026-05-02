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
    },
    agentId?: string,
    agentVersion?: number
  ) {
    try {
      if (agentId) {
        // Agents do not support 'system' role in inputs
        const agentInputs = messages.filter(msg => msg.role !== 'system');

        // Use beta.conversations.start to support agentVersion
        const response = await (this.client.beta.conversations.start as any)({
          agentId,
          agentVersion: agentVersion || 1,
          inputs: agentInputs,
        });

        // The response structure for beta.conversations.start uses 'outputs'
        const outputs = response.outputs || [];
        
        // Combine all message outputs
        let contentString = '';
        let thinkingString = '';
        let role = 'assistant';

        const extractThinking = (think: any): string => {
          if (!think) return '';
          if (typeof think === 'string') {
            try {
              const parsed = JSON.parse(think);
              if (parsed && typeof parsed === 'object') {
                return parsed.text || parsed.content || think;
              }
            } catch {
              // Not JSON, just return string
            }
            return think;
          }
          return think.text || think.content || JSON.stringify(think);
        };

        outputs.forEach((output: any) => {
          if (output.type === 'message.output') {
            const content = output.content;
            if (typeof content === 'string') {
              contentString += content;
            } else if (Array.isArray(content)) {
              content.forEach((chunk: any) => {
                if (typeof chunk === 'string') {
                  contentString += chunk;
                } else if (chunk.text) {
                  contentString += chunk.text;
                } else if (chunk.thinking) {
                  thinkingString += extractThinking(chunk.thinking);
                }
              });
            }
          }
        });

        return {
          content: contentString.trim(),
          thinking: thinkingString.trim() || undefined,
          role: role,
          usage: response.usage,
          finishReason: 'stop'
        };
      }

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
      let thinkingString = '';

      const extractThinking = (think: any): string => {
        if (!think) return '';
        if (typeof think === 'string') {
          try {
            const parsed = JSON.parse(think);
            if (parsed && typeof parsed === 'object') {
              return parsed.text || parsed.content || think;
            }
          } catch {
            // Not JSON
          }
          return think;
        }
        return think.text || think.content || JSON.stringify(think);
      };

      if (typeof messageContent === 'string') {
        contentString = messageContent;
      } else if (Array.isArray(messageContent)) {
        messageContent.forEach((chunk: any) => {
          if (chunk.type === 'text') {
            contentString += chunk.text;
          } else if (chunk.type === 'thinking') {
            thinkingString += extractThinking(chunk.thinking);
          }
        });
      }

      return {
        content: contentString,
        thinking: thinkingString || undefined,
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