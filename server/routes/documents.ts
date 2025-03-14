import express, { Request, Response } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import OllamaService from '../ai/ollama';
import EmbeddingService from '../services/embeddings';
import ChunkingService, { Document } from '../services/chunker';
import ChromaService from '../services/database';
import IndexerService from '../services/indexer';
import DocumentAnalyzer from '../ai/analyzer';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter to only allow certain types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept text files, PDFs, and common document formats
  const allowedTypes = [
    'text/plain',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/markdown',
    'text/csv'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported. Please upload a document in a supported format.'));
  }
};

// Configure upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  }
});

// Initialize services
const initializeServices = () => {
  const ollamaService = new OllamaService();
  const embeddingService = new EmbeddingService(ollamaService);
  const chromaService = new ChromaService(ollamaService, embeddingService);
  const documentAnalyzer = new DocumentAnalyzer(ollamaService);
  const indexerService = new IndexerService(ollamaService, embeddingService, chromaService, documentAnalyzer);
  
  return { indexerService, chromaService };
};

// Services initialization
const { indexerService, chromaService } = initializeServices();

/**
 * @route POST /api/documents/upload
 * @desc Upload a document
 * @access Public
 */
router.post('/upload', upload.single('document'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded',
        timestamp: new Date().toISOString()
      });
    }
    
    // Extract file info
    const { originalname, path: filePath, size, mimetype } = req.file;
    const title = req.body.title || originalname;
    
    // Read file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Create document object
    const document: Omit<Document, 'id'> = {
      title,
      content,
      source: 'upload',
      createdAt: new Date().toISOString(),
      metadata: {
        filename: originalname,
        size,
        mimetype
      }
    };
    
    // Queue document for processing
    const documentId = await indexerService.queueDocument(document);
    
    res.json({
      status: 'success',
      message: 'Document uploaded and queued for processing',
      documentId,
      title,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to upload document',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/documents
 * @desc Get all documents
 * @access Public
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get document IDs from index
    const documentIds = await indexerService.getAllDocuments();
    
    // Get metadata for each document
    const documentsPromises = documentIds.map(async (id) => {
      const metadata = await chromaService.getDocumentMetadata(id);
      return {
        id,
        title: metadata?.title || 'Unknown',
        createdAt: metadata?.createdAt || new Date().toISOString(),
        source: metadata?.source || 'unknown'
      };
    });
    
    const documents = await Promise.all(documentsPromises);
    
    res.json({
      status: 'success',
      count: documents.length,
      documents,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting documents:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to get documents',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/documents/:id
 * @desc Get a document by ID
 * @access Public
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get document chunks
    const chunks = await chromaService.getDocumentChunks(id);
    
    if (chunks.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Document not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get metadata from first chunk
    const metadata = chunks[0].metadata;
    
    // Combine content from all chunks
    const content = chunks.map(chunk => chunk.content).join('\n\n');
    
    res.json({
      status: 'success',
      document: {
        id,
        title: metadata.title,
        content,
        createdAt: metadata.createdAt,
        source: metadata.source,
        metadata: {
          totalChunks: metadata.totalChunks,
          summary: metadata.summary,
          entities: metadata.entities,
          category: metadata.category,
          confidenceScore: metadata.confidenceScore,
          tags: metadata.tags
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to get document',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route DELETE /api/documents/:id
 * @desc Delete a document
 * @access Public
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Delete document from index
    await indexerService.deleteDocument(id);
    
    res.json({
      status: 'success',
      message: 'Document deleted',
      documentId: id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to delete document',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/documents/queue/status
 * @desc Get indexing queue status
 * @access Public
 */
router.get('/queue/status', (req: Request, res: Response) => {
  try {
    const queueStatus = indexerService.getQueueStatus();
    
    res.json({
      status: 'success',
      queue: queueStatus,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting queue status:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to get queue status',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/documents/queue/clear
 * @desc Clear completed and failed items from queue
 * @access Public
 */
router.post('/queue/clear', (req: Request, res: Response) => {
  try {
    indexerService.clearCompletedAndFailed();
    
    res.json({
      status: 'success',
      message: 'Completed and failed items cleared from queue',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error clearing queue:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to clear queue',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route DELETE /api/documents/queue/:id
 * @desc Remove document from queue
 * @access Public
 */
router.delete('/queue/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const removed = indexerService.removeFromQueue(id);
    
    if (removed) {
      res.json({
        status: 'success',
        message: 'Document removed from queue',
        documentId: id,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Document not found in queue or is currently processing',
        documentId: id,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Error removing document from queue:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to remove document from queue',
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 