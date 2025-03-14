import { DocumentChunk, DocumentMetadata } from './database';
import * as crypto from 'crypto';

// Types for document processing
export interface Document {
  id: string;
  title: string;
  content: string;
  source: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface ChunkingOptions {
  chunkSize: number;
  chunkOverlap: number;
  preserveEntities: boolean;
  entityTypes: string[];
  respectHeaders: boolean;
  respectParagraphs: boolean;
}

const DEFAULT_CHUNKING_OPTIONS: ChunkingOptions = {
  chunkSize: 1000,         // Default chunk size in characters
  chunkOverlap: 200,       // Overlap between chunks to maintain context
  preserveEntities: true,  // Try to keep entities in the same chunk
  entityTypes: ['person', 'organization', 'equipment', 'location'],
  respectHeaders: true,    // Try to chunk at header boundaries
  respectParagraphs: true, // Try to chunk at paragraph boundaries
};

/**
 * ChunkingService handles breaking down documents into meaningful chunks
 */
class ChunkingService {
  private options: ChunkingOptions;

  /**
   * Constructor for ChunkingService
   * @param options - Optional chunking options
   */
  constructor(options?: Partial<ChunkingOptions>) {
    this.options = { ...DEFAULT_CHUNKING_OPTIONS, ...options };
  }

  /**
   * Split a document into chunks
   * @param document - The document to split
   * @returns Promise<DocumentChunk[]> - Array of document chunks
   */
  async chunkDocument(document: Document): Promise<DocumentChunk[]> {
    try {
      // Get initial chunks based on text structure
      const chunks = this.splitByStructure(document.content);
      
      // Further split large chunks
      const refinedChunks = this.refineLargeChunks(chunks);
      
      // Create document chunks with metadata
      const documentChunks: DocumentChunk[] = refinedChunks.map((content, index) => {
        // Generate a unique ID based on document ID and chunk index
        const id = this.generateChunkId(document.id, index);
        
        // Create metadata
        const metadata: DocumentMetadata = {
          title: document.title,
          source: document.source,
          createdAt: document.createdAt,
          chunkIndex: index,
          totalChunks: refinedChunks.length,
          // Additional metadata can be added here when we implement the analyzer
        };
        
        return {
          id,
          documentId: document.id,
          content,
          metadata,
        };
      });
      
      return documentChunks;
    } catch (error) {
      console.error('Error chunking document:', error);
      throw new Error('Failed to chunk document');
    }
  }

  /**
   * Split text by structure (sections, paragraphs, etc.)
   * @param text - The text to split
   * @returns string[] - Array of text chunks
   */
  private splitByStructure(text: string): string[] {
    const chunks: string[] = [];
    
    // Check if text is small enough to be a single chunk
    if (text.length <= this.options.chunkSize) {
      return [text];
    }
    
    // Try to split by headers
    if (this.options.respectHeaders) {
      // Pattern for common markdown headers and document headers
      const headerPattern = /(?:\n|^)(?:#{1,6} |SECTION \d+:|CHAPTER \d+:|\d+\.\s|\[\d+\]\s)/g;
      let lastIndex = 0;
      let match;
      
      while ((match = headerPattern.exec(text)) !== null) {
        // Skip first header at the beginning
        if (match.index !== 0 && lastIndex !== 0) {
          const chunk = text.substring(lastIndex, match.index);
          // Only add non-empty chunks
          if (chunk.trim().length > 0) {
            chunks.push(chunk);
          }
        }
        lastIndex = match.index;
      }
      
      // Add the last chunk
      if (lastIndex < text.length) {
        const chunk = text.substring(lastIndex);
        if (chunk.trim().length > 0) {
          chunks.push(chunk);
        }
      }
      
      // If we successfully split by headers, return
      if (chunks.length > 1) {
        return chunks;
      }
    }
    
    // If header split didn't work or wasn't enabled, try paragraphs
    if (this.options.respectParagraphs) {
      // Split by double newlines which typically indicate paragraphs
      const paragraphs = text.split(/\n\s*\n/);
      
      let currentChunk = '';
      
      for (const paragraph of paragraphs) {
        // Skip empty paragraphs
        if (paragraph.trim().length === 0) continue;
        
        // If adding this paragraph would exceed chunk size, add current chunk to results
        if (currentChunk.length + paragraph.length > this.options.chunkSize && currentChunk.length > 0) {
          chunks.push(currentChunk);
          currentChunk = paragraph;
        } else {
          // Otherwise add to current chunk
          currentChunk = currentChunk ? `${currentChunk}\n\n${paragraph}` : paragraph;
        }
      }
      
      // Add the last chunk if not empty
      if (currentChunk.trim().length > 0) {
        chunks.push(currentChunk);
      }
      
      // If we successfully split by paragraphs, return
      if (chunks.length > 1) {
        return chunks;
      }
    }
    
    // If structural splits didn't work, fall back to character-based chunking
    return this.splitByCharacters(text);
  }

  /**
   * Split text by character count
   * @param text - The text to split
   * @returns string[] - Array of text chunks
   */
  private splitByCharacters(text: string): string[] {
    const chunks: string[] = [];
    
    let currentPosition = 0;
    
    while (currentPosition < text.length) {
      // Calculate end position, respecting max chunk size
      let endPosition = Math.min(
        currentPosition + this.options.chunkSize,
        text.length
      );
      
      // If we're not at the end, try to find a good breakpoint
      if (endPosition < text.length) {
        // Find the last occurrence of sentence-ending punctuation
        const lastPeriod = text.lastIndexOf('.', endPosition);
        const lastQuestion = text.lastIndexOf('?', endPosition);
        const lastExclamation = text.lastIndexOf('!', endPosition);
        const lastNewline = text.lastIndexOf('\n', endPosition);
        
        // Find the max position among valid breakpoints that are within a reasonable range
        const validBreakpoints = [lastPeriod, lastQuestion, lastExclamation, lastNewline]
          .filter(pos => pos > currentPosition && pos > endPosition - 100);
        
        if (validBreakpoints.length > 0) {
          endPosition = Math.max(...validBreakpoints) + 1; // +1 to include the punctuation
        }
      }
      
      // Add the chunk
      chunks.push(text.substring(currentPosition, endPosition).trim());
      
      // Move position, considering overlap
      currentPosition = endPosition - this.options.chunkOverlap;
      
      // Ensure we're making progress
      if (currentPosition <= 0 || currentPosition >= endPosition) {
        currentPosition = endPosition;
      }
    }
    
    return chunks;
  }

  /**
   * Further refine large chunks
   * @param chunks - Initial chunks
   * @returns string[] - Refined chunks
   */
  private refineLargeChunks(chunks: string[]): string[] {
    const refinedChunks: string[] = [];
    
    for (const chunk of chunks) {
      // If chunk is already small enough, add it as is
      if (chunk.length <= this.options.chunkSize) {
        refinedChunks.push(chunk);
        continue;
      }
      
      // Otherwise, split it further
      const subChunks = this.splitByCharacters(chunk);
      refinedChunks.push(...subChunks);
    }
    
    return refinedChunks;
  }

  /**
   * Generate a unique ID for a chunk
   * @param documentId - The document ID
   * @param chunkIndex - The chunk index
   * @returns string - A unique chunk ID
   */
  private generateChunkId(documentId: string, chunkIndex: number): string {
    const hash = crypto.createHash('md5').update(`${documentId}-${chunkIndex}`).digest('hex');
    return `chunk-${hash}`;
  }

  /**
   * Update chunking options
   * @param options - New chunking options
   */
  updateOptions(options: Partial<ChunkingOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Get current chunking options
   * @returns ChunkingOptions - Current options
   */
  getOptions(): ChunkingOptions {
    return { ...this.options };
  }
}

export default ChunkingService; 