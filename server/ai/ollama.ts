import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'all-minilm:latest';
const CHAT_MODEL = process.env.CHAT_MODEL || 'llama3.2:latest';

/**
 * Interface for embedding request parameters
 */
interface EmbeddingRequest {
  model: string;
  prompt: string;
  options?: Record<string, any>;
}

/**
 * Interface for chat request parameters
 */
interface ChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  options?: Record<string, any>;
  stream?: boolean;
}

/**
 * Interface for embedding response
 */
interface EmbeddingResponse {
  embedding: number[];
}

/**
 * Interface for chat response
 */
interface ChatResponse {
  message: {
    role: string;
    content: string;
  };
}

/**
 * Class to handle interactions with Ollama API
 */
class OllamaService {
  private baseUrl: string;
  private embeddingModel: string;
  private chatModel: string;

  /**
   * Constructor for OllamaService
   * @param baseUrl - The base URL for the Ollama API
   * @param embeddingModel - The model to use for embeddings
   * @param chatModel - The model to use for chat
   */
  constructor(
    baseUrl: string = OLLAMA_HOST,
    embeddingModel: string = EMBEDDING_MODEL,
    chatModel: string = CHAT_MODEL
  ) {
    this.baseUrl = baseUrl;
    this.embeddingModel = embeddingModel;
    this.chatModel = chatModel;
  }

  /**
   * Check if Ollama is available
   * @returns Promise<boolean> - True if Ollama is available, false otherwise
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.status === 200;
    } catch (error) {
      console.error('Error checking Ollama availability:', error);
      return false;
    }
  }

  /**
   * Generate embeddings for a text
   * @param text - The text to generate embeddings for
   * @returns Promise<number[]> - The generated embeddings
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const requestData: EmbeddingRequest = {
        model: this.embeddingModel,
        prompt: text
      };

      const response = await axios.post<EmbeddingResponse>(
        `${this.baseUrl}/api/embeddings`,
        requestData
      );

      return response.data.embedding;
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  /**
   * Generate a chat response
   * @param messages - The messages to generate a response for
   * @returns Promise<string> - The generated response
   */
  async generateChatResponse(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    try {
      const requestData: ChatRequest = {
        model: this.chatModel,
        messages: messages,
        stream: false
      };

      const response = await axios.post<ChatResponse>(
        `${this.baseUrl}/api/chat`,
        requestData
      );

      return response.data.message.content;
    } catch (error) {
      console.error('Error generating chat response:', error);
      throw new Error('Failed to generate chat response');
    }
  }

  /**
   * Get the list of available models
   * @returns Promise<string[]> - The list of available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tags`);
      return response.data.models.map((model: any) => model.name);
    } catch (error) {
      console.error('Error getting available models:', error);
      throw new Error('Failed to get available models');
    }
  }
}

export default OllamaService; 