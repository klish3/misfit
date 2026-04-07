/// <reference types="vite/client" />
import { Mistral } from "@mistralai/mistralai";
import { ChatCompletionResponse } from "@mistralai/mistralai/models/components/chatcompletionresponse";
import { Agent } from "http";

export interface ChatMessage {
  content: string;
  role: "user" | "assistant" | "system";
}

export interface ChatOptions {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  randomSeed?: number;
}

export interface ChatResponse {
  id: string;
  created: number;
  model: string;
  usage: Usage;
  object: string;
  choices: Choice[];
}

export interface Usage {
  prompt_tokens: number;
  total_tokens: number;
  completion_tokens: number;
}

export interface Choice {
  index: number;
  finish_reason: string;
  message: Message;
}

export interface Message {
  role: string;
  tool_calls: any;
  content: string;
}

class MistralAgentService {
  private client: Mistral;

  constructor() {
    const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error("Mistral API key is not set in environment variables");
    }
    this.client = new Mistral({
      apiKey,
    });
  }

  async createChatAgent() {
    const imageAgent = await this.client.beta.agents.create({
      model: "mistral-medium-2505",
      name: "Image Generation Agent",
      description: "Agent used to generate images.",
      instructions:
        "Use the image generation tool when you have to create images.",
      tools: [
        {
          type: "image_generation",
        },
      ],
      completionArgs: {
        temperature: 0.3,
        topP: 0.95,
      },
    });
    return imageAgent;
  }

  async imageGenerate(prompt: string) {
    const imgAgent = await this.createChatAgent().then((res) => res);
    let conversation = await this.client.beta.conversations.start({
      agentId: imgAgent.id,
      inputs: "Generate " + prompt,
      //store:false
    });
  }
}
export const mistralService = new MistralAgentService();
