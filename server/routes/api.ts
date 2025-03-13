import express from 'express';
import OllamaService from '../ai/ollama';
import EmbeddingService from '../services/embeddings';
import RAGService, { RAGQuery } from '../ai/rag';
import DocumentAnalyzer from '../ai/analyzer';
import { getAllModels } from '../ai/models';

const router = express.Router();

// Initialize services
const ollamaService = new OllamaService();
const embeddingService = new EmbeddingService(ollamaService);
const ragService = new RAGService(ollamaService);
const documentAnalyzer = new DocumentAnalyzer(ollamaService);

/**
 * @route GET /api/health
 * @desc Check API health
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    const ollamaAvailable = await ollamaService.isAvailable();
    
    res.json({
      status: 'ok',
      ollama: ollamaAvailable ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to check API health',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route GET /api/models
 * @desc Get available models
 * @access Public
 */
router.get('/models', async (req, res) => {
  try {
    // Get default models
    const defaultModels = getAllModels();
    
    // Try to get available models from Ollama
    let ollamaModels: string[] = [];
    try {
      ollamaModels = await ollamaService.getAvailableModels();
    } catch (error) {
      console.error('Error getting Ollama models:', error);
    }
    
    // Combine default models with Ollama models
    const allModels = defaultModels.map(model => ({
      ...model,
      available: ollamaModels.includes(model.name)
    }));
    
    res.json({
      models: allModels,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting models:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get models',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/embeddings
 * @desc Generate embeddings for text
 * @access Public
 */
router.post('/embeddings', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        status: 'error',
        message: 'Text is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const embedding = await embeddingService.generateEmbedding(text);
    
    res.json({
      embedding,
      dimensions: embedding.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate embeddings',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/analyze
 * @desc Analyze a document
 * @access Public
 */
router.post('/analyze', async (req, res) => {
  try {
    const { document } = req.body;
    
    if (!document) {
      return res.status(400).json({
        status: 'error',
        message: 'Document is required',
        timestamp: new Date().toISOString()
      });
    }
    
    const analysis = await documentAnalyzer.analyzeDocument(document);
    
    res.json({
      ...analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing document:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to analyze document',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/rag
 * @desc Generate a RAG response
 * @access Public
 */
router.post('/rag', async (req, res) => {
  try {
    const { query, chunks } = req.body;
    
    if (!query || !chunks || !Array.isArray(chunks)) {
      return res.status(400).json({
        status: 'error',
        message: 'Query and chunks are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const ragQuery: RAGQuery = {
      query,
      maxResults: req.body.maxResults || 5,
      threshold: req.body.threshold || 0.7
    };
    
    const result = await ragService.generateRAGResult(ragQuery, chunks);
    
    res.json({
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating RAG response:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate RAG response',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route POST /api/chat
 * @desc Generate a chat response
 * @access Public
 */
router.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        status: 'error',
        message: 'Messages are required',
        timestamp: new Date().toISOString()
      });
    }
    
    const response = await ollamaService.generateChatResponse(messages);
    
    res.json({
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating chat response:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate chat response',
      timestamp: new Date().toISOString()
    });
  }
});

export default router; 