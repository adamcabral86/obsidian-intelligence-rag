import { v4 as uuidv4 } from 'uuid';
import OllamaService from '../ai/ollama';
import EmbeddingService from './embeddings';
import ChunkingService, { Document as RawDocument } from './chunker';
import ChromaService from './database';
import DocumentAnalyzer from '../ai/analyzer';

// Type for documents with optional analysis results
export interface DocumentIndexResult {
  documentId: string;
  title: string;
  chunks: number;
  entities?: { name: string; type: string; count: number }[];
  summary?: string;
  success: boolean;
  error?: string;
}

// Queue status
export interface IndexingQueue {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  documents: QueueItem[];
}

// Queue item
interface QueueItem {
  documentId: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
  startTime?: number;
  endTime?: number;
}

/**
 * Document Indexer Service
 * Coordinates the process of preparing and indexing documents
 */
class IndexerService {
  private chromaService: ChromaService;
  private chunkingService: ChunkingService;
  private embeddingService: EmbeddingService;
  private documentAnalyzer: DocumentAnalyzer;
  private ollamaService: OllamaService;
  
  // Queue management
  private queue: QueueItem[] = [];
  private processing: boolean = false;
  private concurrentProcessing: number = 1;
  private maxQueueSize: number = 100;
  
  /**
   * Constructor for IndexerService
   */
  constructor(
    ollamaService: OllamaService,
    embeddingService: EmbeddingService,
    chromaService: ChromaService,
    documentAnalyzer: DocumentAnalyzer
  ) {
    this.ollamaService = ollamaService;
    this.embeddingService = embeddingService;
    this.chromaService = chromaService;
    this.documentAnalyzer = documentAnalyzer;
    this.chunkingService = new ChunkingService();
    
    // Initialize ChromaDB
    this.chromaService.initialize().catch(error => {
      console.error('Failed to initialize ChromaDB:', error);
    });
  }
  
  /**
   * Add a document to the indexing queue
   * @param document - Document to add
   * @returns string - ID of the queued document
   */
  async queueDocument(document: Omit<RawDocument, 'id'>): Promise<string> {
    // Generate a unique ID for the document
    const documentId = uuidv4();
    
    // Check if queue is full
    if (this.queue.length >= this.maxQueueSize) {
      throw new Error('Indexing queue is full. Please try again later.');
    }
    
    // Add to queue
    const queueItem: QueueItem = {
      documentId,
      title: document.title,
      status: 'pending',
      progress: 0
    };
    
    this.queue.push(queueItem);
    
    // Store the document with ID
    const fullDocument: RawDocument = {
      ...document,
      id: documentId
    };
    
    // Start processing queue if not already processing
    if (!this.processing) {
      this.processQueue();
    }
    
    return documentId;
  }
  
  /**
   * Process the document indexing queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing) return;
    
    this.processing = true;
    
    try {
      // Process until queue is empty
      while (this.queue.length > 0) {
        // Find pending documents up to concurrent limit
        const pendingDocuments = this.queue
          .filter(item => item.status === 'pending')
          .slice(0, this.concurrentProcessing);
        
        if (pendingDocuments.length === 0) break;
        
        // Process documents concurrently
        const processingPromises = pendingDocuments.map(item => this.processDocument(item));
        
        // Wait for all current batch to complete
        await Promise.all(processingPromises);
      }
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      this.processing = false;
    }
  }
  
  /**
   * Process a single document
   * @param queueItem - Queue item to process
   */
  private async processDocument(queueItem: QueueItem): Promise<void> {
    // Update status to processing
    queueItem.status = 'processing';
    queueItem.startTime = Date.now();
    queueItem.progress = 10;
    
    try {
      // Fetch document from storage (in a real system)
      // For now, we'll simulate with a placeholder
      const document: RawDocument = {
        id: queueItem.documentId,
        title: queueItem.title,
        content: "This is a placeholder for the document content. In a real system, we would fetch the actual document content from storage.",
        source: "upload",
        createdAt: new Date().toISOString()
      };
      
      // Chunk the document
      queueItem.progress = 30;
      const chunks = await this.chunkingService.chunkDocument(document);
      
      // Analyze document (if enabled)
      queueItem.progress = 50;
      if (chunks.length > 0) {
        const analysisResults = await this.documentAnalyzer.analyzeDocument(chunks[0].content);
        
        // Add analysis results to chunk metadata
        for (const chunk of chunks) {
          if (analysisResults.summary) {
            chunk.metadata.summary = analysisResults.summary;
          }
          
          if (analysisResults.entities) {
            chunk.metadata.entities = analysisResults.entities.map(entity => ({
              name: entity.name,
              type: entity.type,
              mentions: entity.mentions || 1,
              confidenceScore: entity.confidence || 0.8
            }));
          }
          
          // Add category if available in analysis results
          if ('category' in analysisResults) {
            chunk.metadata.category = (analysisResults as any).category;
          }
          
          // Add confidence score if available in analysis results
          if ('confidence' in analysisResults) {
            chunk.metadata.confidenceScore = analysisResults.confidence;
          }
        }
      }
      
      // Store chunks in ChromaDB
      queueItem.progress = 80;
      await this.chromaService.addDocumentChunks(chunks);
      
      // Update status to completed
      queueItem.status = 'completed';
      queueItem.progress = 100;
      queueItem.endTime = Date.now();
      
      console.log(`Indexed document "${queueItem.title}" (${queueItem.documentId}) successfully`);
    } catch (error) {
      // Update status to failed
      queueItem.status = 'failed';
      queueItem.error = error instanceof Error ? error.message : String(error);
      queueItem.endTime = Date.now();
      
      console.error(`Failed to index document "${queueItem.title}" (${queueItem.documentId}):`, error);
    }
  }
  
  /**
   * Get the current indexing queue status
   * @returns IndexingQueue - Current queue status
   */
  getQueueStatus(): IndexingQueue {
    const pending = this.queue.filter(item => item.status === 'pending').length;
    const processing = this.queue.filter(item => item.status === 'processing').length;
    const completed = this.queue.filter(item => item.status === 'completed').length;
    const failed = this.queue.filter(item => item.status === 'failed').length;
    
    return {
      pending,
      processing,
      completed,
      failed,
      documents: [...this.queue] // Return copy of queue
    };
  }
  
  /**
   * Clear completed and failed items from the queue
   */
  clearCompletedAndFailed(): void {
    this.queue = this.queue.filter(item => 
      item.status !== 'completed' && item.status !== 'failed'
    );
  }
  
  /**
   * Remove a specific document from the queue
   * @param documentId - ID of document to remove
   * @returns boolean - True if removed, false if not found
   */
  removeFromQueue(documentId: string): boolean {
    const initialLength = this.queue.length;
    
    // Only remove if not processing
    this.queue = this.queue.filter(item => 
      !(item.documentId === documentId && item.status !== 'processing')
    );
    
    return this.queue.length < initialLength;
  }
  
  /**
   * Set the concurrent processing limit
   * @param limit - New concurrent processing limit
   */
  setConcurrentProcessing(limit: number): void {
    if (limit < 1) limit = 1;
    if (limit > 10) limit = 10; // Set reasonable upper bound
    
    this.concurrentProcessing = limit;
  }
  
  /**
   * Set the maximum queue size
   * @param size - New maximum queue size
   */
  setMaxQueueSize(size: number): void {
    if (size < 10) size = 10;
    
    this.maxQueueSize = size;
  }
  
  /**
   * Delete a document from the index
   * @param documentId - ID of document to delete
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      await this.chromaService.deleteDocumentChunks(documentId);
      console.log(`Deleted document ${documentId} from index`);
    } catch (error) {
      console.error(`Failed to delete document ${documentId}:`, error);
      throw new Error(`Failed to delete document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Get all indexed documents
   * @returns Promise<string[]> - Array of document IDs
   */
  async getAllDocuments(): Promise<string[]> {
    try {
      return await this.chromaService.getAllDocumentIds();
    } catch (error) {
      console.error('Failed to get all documents:', error);
      throw new Error(`Failed to get all documents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default IndexerService; 