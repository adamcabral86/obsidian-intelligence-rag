import { ChromaClient, Collection, CollectionMetadata, GetCollectionParams } from 'chromadb';
import OllamaService from '../ai/ollama';
import EmbeddingService from './embeddings';
import * as path from 'path';
import * as fs from 'fs';
import { config } from '../config';

// Define types for our document chunks
export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  metadata: DocumentMetadata;
  embedding?: number[];
}

export interface DocumentMetadata {
  title: string;
  source: string;
  createdAt: string;
  chunkIndex: number;
  totalChunks: number;
  summary?: string;
  entities?: Entity[];
  category?: string;
  confidenceScore?: number;
  tags?: string[];
}

export interface Entity {
  name: string;
  type: string; // 'person', 'organization', 'equipment', 'location', etc.
  mentions: number;
  confidenceScore: number;
}

export interface SearchResult {
  chunks: DocumentChunk[];
  documentIds: string[];
  scores: number[];
}

/**
 * Class for managing Chroma DB operations
 */
class ChromaService {
  private client: any; // Using 'any' to handle both client types
  private collection: Collection | null = null;
  private embeddingService: EmbeddingService;
  private ollamaService: OllamaService;
  private collectionName: string = 'intelligence_documents';
  private dbPath: string = '';  // Initialize with empty string
  private isInMemory: boolean = false;

  /**
   * Constructor for ChromaService
   * @param ollamaService - The Ollama service to use
   * @param embeddingService - The embedding service to use
   * @param dbPath - Optional custom path for Chroma DB
   */
  constructor(ollamaService: OllamaService, embeddingService: EmbeddingService, dbPath?: string) {
    this.ollamaService = ollamaService;
    this.embeddingService = embeddingService;
    
    try {
      // Try to use in-memory ChromaDB for development simplicity
      console.log('Initializing in-memory ChromaDB for development');
      const chromadb = require('chromadb');
      
      // Check if InMemoryEmbeddingFunction exists
      if (chromadb.EmbeddingFunction) {
        this.isInMemory = true;
        
        // Create embedding function for ChromaDB
        const embeddingFunction = {
          generate: async (texts: string[]) => {
            return await this.embeddingService.generateEmbeddings(texts);
          }
        };
        
        // Create in-memory client
        this.client = new chromadb.ChromaClient();
        
        // Save path for reference
        this.dbPath = 'in-memory';
      } else {
        console.log('InMemoryEmbeddingFunction not found, falling back to standard ChromaDB client');
        this.setupStandardClient(dbPath);
      }
    } catch (error) {
      console.error('Error initializing in-memory ChromaDB:', error);
      console.log('Falling back to standard ChromaDB client');
      this.setupStandardClient(dbPath);
    }
  }
  
  /**
   * Setup standard ChromaDB client (fallback)
   */
  private setupStandardClient(dbPath?: string) {
    // Use provided path or config path
    if (dbPath) {
      this.dbPath = dbPath;
    } else if (config.chromaDbPath.startsWith('http')) {
      this.dbPath = config.chromaDbPath;
    } else {
      // For local storage, use absolute path
      this.dbPath = path.resolve(process.cwd(), config.chromaDbPath);
    }
    
    // Check if HTTP URL
    const isHttpUrl = this.dbPath.startsWith('http://') || this.dbPath.startsWith('https://');
    
    if (isHttpUrl) {
      console.log(`Initializing ChromaDB client with HTTP URL: ${this.dbPath}`);
      this.client = new ChromaClient({
        path: this.dbPath
      });
    } else {
      console.log(`Using local path for ChromaDB: ${this.dbPath}`);
      
      if (!fs.existsSync(this.dbPath)) {
        fs.mkdirSync(this.dbPath, { recursive: true });
      }
      
      this.client = new ChromaClient();
    }
  }

  /**
   * Initialize the database and collection
   */
  async initialize(): Promise<void> {
    try {
      console.log(`Initializing ChromaDB (${this.isInMemory ? 'in-memory' : this.dbPath})`);
      
      // Simple initialization for in-memory mode
      if (this.isInMemory) {
        try {
          // Create a basic embedding function
          const embeddingFunction = {
            generate: async (texts: string[]) => {
              return await this.embeddingService.generateEmbeddings(texts);
            }
          };
          
          // Try to get collection or create if it doesn't exist
          try {
            this.collection = await this.client.getCollection({
              name: this.collectionName,
              embeddingFunction
            });
            console.log(`Collection ${this.collectionName} already exists`);
          } catch (error) {
            console.log(`Creating new collection ${this.collectionName}`);
            
            const metadata: CollectionMetadata = {
              description: 'Intelligence document chunks and embeddings',
              createdAt: new Date().toISOString()
            };
            
            this.collection = await this.client.createCollection({
              name: this.collectionName,
              metadata,
              embeddingFunction
            });
          }
          
          console.log('ChromaDB initialized successfully (in-memory mode)');
          return;
        } catch (error) {
          console.error('Error initializing in-memory ChromaDB:', error);
          throw new Error('Failed to initialize in-memory ChromaDB');
        }
      }
      
      // Standard initialization for non-in-memory mode
      const collections = await this.client.listCollections();
      const collectionExists = collections.some((c: any) => c.name === this.collectionName);
      
      if (collectionExists) {
        console.log(`Collection ${this.collectionName} already exists`);
        
        // Create a basic embedding function to satisfy the type requirement
        const embeddingFunction = {
          generate: async (texts: string[]) => {
            return await this.embeddingService.generateEmbeddings(texts);
          }
        };
        
        // Get the collection with the embedding function
        const params: GetCollectionParams = {
          name: this.collectionName,
          embeddingFunction
        };
        
        this.collection = await this.client.getCollection(params);
      } else {
        console.log(`Creating new collection ${this.collectionName}`);
        
        // Create metadata for the collection
        const metadata: CollectionMetadata = {
          description: 'Intelligence document chunks and embeddings',
          createdAt: new Date().toISOString()
        };
        
        // Create a basic embedding function to satisfy the type requirement
        const embeddingFunction = {
          generate: async (texts: string[]) => {
            return await this.embeddingService.generateEmbeddings(texts);
          }
        };
        
        // Create the collection
        this.collection = await this.client.createCollection({
          name: this.collectionName,
          metadata,
          embeddingFunction
        });
      }
      
      console.log('ChromaDB initialized successfully');
    } catch (error) {
      console.error('Error initializing ChromaDB:', error);
      throw new Error('Failed to initialize ChromaDB');
    }
  }
  
  /**
   * Add document chunks to the database
   * @param chunks - The document chunks to add
   */
  async addDocumentChunks(chunks: DocumentChunk[]): Promise<void> {
    if (!this.collection) {
      await this.initialize();
    }
    
    try {
      // Generate embeddings for all chunks
      const texts = chunks.map(chunk => chunk.content);
      const embeddings = await this.embeddingService.generateEmbeddings(texts);
      
      // Prepare data for Chroma
      const ids = chunks.map(chunk => chunk.id);
      const metadatas = chunks.map(chunk => {
        // Convert metadata to a format acceptable by ChromaDB (all values as strings)
        const metadataObj: Record<string, string> = {
          documentId: chunk.documentId,
          title: chunk.metadata.title,
          source: chunk.metadata.source,
          createdAt: chunk.metadata.createdAt,
          chunkIndex: chunk.metadata.chunkIndex.toString(),
          totalChunks: chunk.metadata.totalChunks.toString()
        };
        
        if (chunk.metadata.summary) metadataObj.summary = chunk.metadata.summary;
        if (chunk.metadata.category) metadataObj.category = chunk.metadata.category;
        if (chunk.metadata.confidenceScore) metadataObj.confidenceScore = chunk.metadata.confidenceScore.toString();
        if (chunk.metadata.tags) metadataObj.tags = JSON.stringify(chunk.metadata.tags);
        if (chunk.metadata.entities) metadataObj.entities = JSON.stringify(chunk.metadata.entities);
        
        return metadataObj;
      });
      
      // Add to ChromaDB in batches
      const batchSize = 50;
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batchIds = ids.slice(i, i + batchSize);
        const batchEmbeddings = embeddings.slice(i, i + batchSize);
        const batchMetadatas = metadatas.slice(i, i + batchSize);
        const batchDocuments = texts.slice(i, i + batchSize);
        
        await this.collection!.add({
          ids: batchIds,
          embeddings: batchEmbeddings,
          metadatas: batchMetadatas,
          documents: batchDocuments
        });
        
        console.log(`Added batch ${i/batchSize + 1} of ${Math.ceil(chunks.length/batchSize)}`);
      }
      
      console.log(`Successfully added ${chunks.length} document chunks to ChromaDB`);
    } catch (error) {
      console.error('Error adding document chunks to ChromaDB:', error);
      throw new Error('Failed to add document chunks to ChromaDB');
    }
  }
  
  /**
   * Search for document chunks similar to a query
   * @param query - The query text
   * @param maxResults - Maximum number of results to return
   * @param threshold - Similarity threshold (0-1)
   * @returns Promise<SearchResult> - The search results
   */
  async searchSimilarChunks(query: string, maxResults: number = 5, threshold: number = 0.7): Promise<SearchResult> {
    if (!this.collection) {
      await this.initialize();
    }
    
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.embeddingService.generateEmbedding(query);
      
      // Search by embedding
      const results = await this.collection!.query({
        queryEmbeddings: [queryEmbedding],
        nResults: maxResults,
      });
      
      // Extract results
      const chunks: DocumentChunk[] = [];
      const documentIds: string[] = [];
      const scores: number[] = [];
      
      // Process results
      if (results.ids[0] && results.documents && results.metadatas && results.distances) {
        for (let i = 0; i < results.ids[0].length; i++) {
          const id = results.ids[0][i];
          const content = results.documents[0][i];
          const metadata = results.metadatas[0][i];
          const distance = results.distances[0][i];
          
          // Skip if content or metadata is null
          if (!content || !metadata) continue;
          
          // Convert distance to similarity score (1 - distance)
          const score = 1 - distance;
          
          // Skip results below threshold
          if (score < threshold) continue;
          
          // Parse metadata back to our format
          const parsedMetadata: DocumentMetadata = {
            title: metadata.title as string,
            source: metadata.source as string,
            createdAt: metadata.createdAt as string,
            chunkIndex: parseInt(metadata.chunkIndex as string),
            totalChunks: parseInt(metadata.totalChunks as string)
          };
          
          if (metadata.summary) parsedMetadata.summary = metadata.summary as string;
          if (metadata.category) parsedMetadata.category = metadata.category as string;
          if (metadata.confidenceScore) parsedMetadata.confidenceScore = parseFloat(metadata.confidenceScore as string);
          if (metadata.tags) parsedMetadata.tags = JSON.parse(metadata.tags as string);
          if (metadata.entities) parsedMetadata.entities = JSON.parse(metadata.entities as string);
          
          // Create chunk object
          const chunk: DocumentChunk = {
            id,
            documentId: metadata.documentId as string,
            content,
            metadata: parsedMetadata
          };
          
          chunks.push(chunk);
          documentIds.push(metadata.documentId as string);
          scores.push(score);
        }
      }
      
      return { chunks, documentIds, scores };
    } catch (error) {
      console.error('Error searching similar chunks:', error);
      throw new Error('Failed to search similar chunks');
    }
  }
  
  /**
   * Get document chunks by document ID
   * @param documentId - The document ID
   * @returns Promise<DocumentChunk[]> - The document chunks
   */
  async getDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
    if (!this.collection) {
      await this.initialize();
    }
    
    try {
      // Query by document ID
      const results = await this.collection!.get({
        where: { documentId }
      });
      
      // Extract results
      const chunks: DocumentChunk[] = [];
      
      // Process results
      if (results.ids && results.documents && results.metadatas) {
        for (let i = 0; i < results.ids.length; i++) {
          const id = results.ids[i];
          const content = results.documents[i];
          const metadata = results.metadatas[i];
          
          // Skip if content or metadata is null
          if (!content || !metadata) continue;
          
          // Parse metadata back to our format
          const parsedMetadata: DocumentMetadata = {
            title: metadata.title as string,
            source: metadata.source as string,
            createdAt: metadata.createdAt as string,
            chunkIndex: parseInt(metadata.chunkIndex as string),
            totalChunks: parseInt(metadata.totalChunks as string)
          };
          
          if (metadata.summary) parsedMetadata.summary = metadata.summary as string;
          if (metadata.category) parsedMetadata.category = metadata.category as string;
          if (metadata.confidenceScore) parsedMetadata.confidenceScore = parseFloat(metadata.confidenceScore as string);
          if (metadata.tags) parsedMetadata.tags = JSON.parse(metadata.tags as string);
          if (metadata.entities) parsedMetadata.entities = JSON.parse(metadata.entities as string);
          
          // Create chunk object
          const chunk: DocumentChunk = {
            id,
            documentId: metadata.documentId as string,
            content,
            metadata: parsedMetadata
          };
          
          chunks.push(chunk);
        }
      }
      
      // Sort chunks by index
      chunks.sort((a, b) => a.metadata.chunkIndex - b.metadata.chunkIndex);
      
      return chunks;
    } catch (error) {
      console.error('Error getting document chunks:', error);
      throw new Error('Failed to get document chunks');
    }
  }
  
  /**
   * Delete document chunks by document ID
   * @param documentId - The document ID
   */
  async deleteDocumentChunks(documentId: string): Promise<void> {
    if (!this.collection) {
      await this.initialize();
    }
    
    try {
      // Get chunks to delete
      const chunks = await this.getDocumentChunks(documentId);
      const ids = chunks.map(chunk => chunk.id);
      
      // Delete chunks
      if (ids.length > 0) {
        await this.collection!.delete({
          ids
        });
        console.log(`Deleted ${ids.length} chunks for document ${documentId}`);
      } else {
        console.log(`No chunks found for document ${documentId}`);
      }
    } catch (error) {
      console.error('Error deleting document chunks:', error);
      throw new Error('Failed to delete document chunks');
    }
  }
  
  /**
   * Get all document IDs in the database
   * @returns Promise<string[]> - The document IDs
   */
  async getAllDocumentIds(): Promise<string[]> {
    if (!this.collection) {
      await this.initialize();
    }
    
    try {
      // Get all unique document IDs
      const results = await this.collection!.get();
      
      const documentIds = new Set<string>();
      
      if (results.metadatas) {
        for (const metadata of results.metadatas) {
          if (metadata && 'documentId' in metadata) {
            documentIds.add(metadata.documentId as string);
          }
        }
      }
      
      return Array.from(documentIds);
    } catch (error) {
      console.error('Error getting all document IDs:', error);
      throw new Error('Failed to get all document IDs');
    }
  }
  
  /**
   * Get document metadata by document ID
   * @param documentId - The document ID
   * @returns Promise<DocumentMetadata | null> - The document metadata
   */
  async getDocumentMetadata(documentId: string): Promise<DocumentMetadata | null> {
    if (!this.collection) {
      await this.initialize();
    }
    
    try {
      // Get first chunk of the document (which has metadata)
      const chunks = await this.getDocumentChunks(documentId);
      
      if (chunks.length > 0) {
        return chunks[0].metadata;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting document metadata:', error);
      throw new Error('Failed to get document metadata');
    }
  }
  
  /**
   * Reset the database (delete all data)
   */
  async reset(): Promise<void> {
    try {
      // Delete the collection if it exists
      const collections = await this.client.listCollections();
      const collectionExists = collections.some((c: any) => c.name === this.collectionName);
      
      if (collectionExists) {
        await this.client.deleteCollection({
          name: this.collectionName
        });
        console.log(`Deleted collection ${this.collectionName}`);
      }
      
      // Reinitialize
      this.collection = null;
      await this.initialize();
      
      console.log('ChromaDB reset successfully');
    } catch (error) {
      console.error('Error resetting ChromaDB:', error);
      throw new Error('Failed to reset ChromaDB');
    }
  }
}

export default ChromaService; 