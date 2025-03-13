import OllamaService from '../ai/ollama';
import { getDefaultEmbeddingModel } from '../ai/models';

/**
 * Class to handle vector embedding generation
 */
class EmbeddingService {
  private ollamaService: OllamaService;
  private modelName: string;

  /**
   * Constructor for EmbeddingService
   * @param ollamaService - The Ollama service to use
   */
  constructor(ollamaService: OllamaService) {
    this.ollamaService = ollamaService;
    this.modelName = getDefaultEmbeddingModel().name;
  }

  /**
   * Generate embeddings for a text
   * @param text - The text to generate embeddings for
   * @returns Promise<number[]> - The generated embeddings
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      return await this.ollamaService.generateEmbedding(text);
    } catch (error) {
      console.error('Error generating embeddings:', error);
      throw new Error('Failed to generate embeddings');
    }
  }

  /**
   * Generate embeddings for multiple texts
   * @param texts - The texts to generate embeddings for
   * @returns Promise<number[][]> - The generated embeddings
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const embeddings: number[][] = [];
      
      // Process in batches to avoid overwhelming the API
      const batchSize = 10;
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const batchPromises = batch.map(text => this.generateEmbedding(text));
        const batchEmbeddings = await Promise.all(batchPromises);
        embeddings.push(...batchEmbeddings);
      }
      
      return embeddings;
    } catch (error) {
      console.error('Error generating multiple embeddings:', error);
      throw new Error('Failed to generate multiple embeddings');
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   * @param vecA - First vector
   * @param vecB - Second vector
   * @returns number - Cosine similarity score
   */
  calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same dimensions');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Set the embedding model to use
   * @param modelName - The name of the model to use
   */
  setModel(modelName: string): void {
    this.modelName = modelName;
  }

  /**
   * Get the current embedding model
   * @returns string - The name of the current embedding model
   */
  getModel(): string {
    return this.modelName;
  }
}

export default EmbeddingService; 