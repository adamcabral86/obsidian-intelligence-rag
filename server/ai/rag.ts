import OllamaService from './ollama';
import { getDefaultChatModel } from './models';

/**
 * Interface for a document chunk
 */
interface DocumentChunk {
  id: string;
  text: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

/**
 * Interface for a RAG query
 */
interface RAGQuery {
  query: string;
  maxResults?: number;
  threshold?: number;
}

/**
 * Interface for a RAG result
 */
interface RAGResult {
  answer: string;
  sources: Array<{
    chunkId: string;
    text: string;
    metadata: Record<string, any>;
    similarity: number;
  }>;
}

/**
 * Class to handle RAG functionality
 */
class RAGService {
  private ollamaService: OllamaService;
  private modelName: string;

  /**
   * Constructor for RAGService
   * @param ollamaService - The Ollama service to use
   */
  constructor(ollamaService: OllamaService) {
    this.ollamaService = ollamaService;
    this.modelName = getDefaultChatModel().name;
  }

  /**
   * Generate a RAG response
   * @param query - The query to generate a response for
   * @param relevantChunks - The relevant document chunks
   * @returns Promise<string> - The generated response
   */
  async generateRAGResponse(query: string, relevantChunks: DocumentChunk[]): Promise<string> {
    try {
      // Create context from relevant chunks
      const context = relevantChunks
        .map(chunk => {
          const metadata = Object.entries(chunk.metadata)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          
          return `---\nCONTENT: ${chunk.text}\nMETADATA: ${metadata}\n---`;
        })
        .join('\n\n');

      // Create system prompt
      const systemPrompt = `You are an intelligence analysis assistant. Use ONLY the following information to answer the user's question. 
If you don't know the answer based on the provided information, say "I don't have enough information to answer that question."
Do not make up or hallucinate any information.

CONTEXT INFORMATION:
${context}`;

      // Generate response
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: query }
      ];

      return await this.ollamaService.generateChatResponse(messages);
    } catch (error) {
      console.error('Error generating RAG response:', error);
      throw new Error('Failed to generate RAG response');
    }
  }

  /**
   * Generate a comprehensive RAG result
   * @param query - The RAG query
   * @param relevantChunks - The relevant document chunks
   * @returns Promise<RAGResult> - The RAG result
   */
  async generateRAGResult(query: RAGQuery, relevantChunks: DocumentChunk[]): Promise<RAGResult> {
    try {
      const answer = await this.generateRAGResponse(query.query, relevantChunks);
      
      const sources = relevantChunks.map(chunk => ({
        chunkId: chunk.id,
        text: chunk.text,
        metadata: chunk.metadata,
        similarity: chunk.metadata.similarity || 0
      }));

      return {
        answer,
        sources
      };
    } catch (error) {
      console.error('Error generating RAG result:', error);
      throw new Error('Failed to generate RAG result');
    }
  }

  /**
   * Set the chat model to use
   * @param modelName - The name of the model to use
   */
  setModel(modelName: string): void {
    this.modelName = modelName;
  }

  /**
   * Get the current chat model
   * @returns string - The name of the current chat model
   */
  getModel(): string {
    return this.modelName;
  }
}

export default RAGService;
export { DocumentChunk, RAGQuery, RAGResult }; 