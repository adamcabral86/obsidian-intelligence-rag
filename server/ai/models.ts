/**
 * Interface for AI model configuration
 */
export interface AIModelConfig {
  name: string;
  type: 'embedding' | 'chat';
  description: string;
  contextLength: number;
  isDefault?: boolean;
}

/**
 * Interface for embedding model
 */
export interface EmbeddingModel extends AIModelConfig {
  type: 'embedding';
  dimensions: number;
}

/**
 * Interface for chat model
 */
export interface ChatModel extends AIModelConfig {
  type: 'chat';
  capabilities: string[];
}

/**
 * Default embedding models
 */
export const DEFAULT_EMBEDDING_MODELS: EmbeddingModel[] = [
  {
    name: 'all-minilm:latest',
    type: 'embedding',
    description: 'All-MiniLM embedding model',
    contextLength: 512,
    dimensions: 384,
    isDefault: true
  }
];

/**
 * Default chat models
 */
export const DEFAULT_CHAT_MODELS: ChatModel[] = [
  {
    name: 'llama3.2:latest',
    type: 'chat',
    description: 'Llama 3.2 chat model',
    contextLength: 8192,
    capabilities: ['text-generation', 'summarization', 'entity-extraction'],
    isDefault: true
  }
];

/**
 * Get all available models
 */
export const getAllModels = (): AIModelConfig[] => {
  return [...DEFAULT_EMBEDDING_MODELS, ...DEFAULT_CHAT_MODELS];
};

/**
 * Get default embedding model
 */
export const getDefaultEmbeddingModel = (): EmbeddingModel => {
  return DEFAULT_EMBEDDING_MODELS.find(model => model.isDefault) || DEFAULT_EMBEDDING_MODELS[0];
};

/**
 * Get default chat model
 */
export const getDefaultChatModel = (): ChatModel => {
  return DEFAULT_CHAT_MODELS.find(model => model.isDefault) || DEFAULT_CHAT_MODELS[0];
}; 