import OllamaService from './ollama';
import {
  DOCUMENT_SUMMARY_PROMPT,
  ENTITY_EXTRACTION_PROMPT,
  RELATIONSHIP_EXTRACTION_PROMPT,
  INTELLIGENCE_CLASSIFICATION_PROMPT,
  fillPromptTemplate
} from './prompts';

/**
 * Interface for document analysis result
 */
interface DocumentAnalysisResult {
  summary: string;
  entities: any[];
  relationships: any[];
  classification: any;
  confidence: number;
}

/**
 * Class to handle document analysis
 */
class DocumentAnalyzer {
  private ollamaService: OllamaService;

  /**
   * Constructor for DocumentAnalyzer
   * @param ollamaService - The Ollama service to use
   */
  constructor(ollamaService: OllamaService) {
    this.ollamaService = ollamaService;
  }

  /**
   * Generate a summary for a document
   * @param document - The document to summarize
   * @returns Promise<string> - The generated summary
   */
  async generateSummary(document: string): Promise<string> {
    try {
      const prompt = fillPromptTemplate(DOCUMENT_SUMMARY_PROMPT, { document });
      
      const messages = [
        { role: 'system' as const, content: 'You are an intelligence analyst assistant.' },
        { role: 'user' as const, content: prompt }
      ];

      return await this.ollamaService.generateChatResponse(messages);
    } catch (error) {
      console.error('Error generating summary:', error);
      throw new Error('Failed to generate summary');
    }
  }

  /**
   * Extract entities from a document
   * @param document - The document to extract entities from
   * @returns Promise<any[]> - The extracted entities
   */
  async extractEntities(document: string): Promise<any[]> {
    try {
      const prompt = fillPromptTemplate(ENTITY_EXTRACTION_PROMPT, { document });
      
      const messages = [
        { role: 'system' as const, content: 'You are an intelligence analyst assistant.' },
        { role: 'user' as const, content: prompt }
      ];

      const response = await this.ollamaService.generateChatResponse(messages);
      
      // Extract JSON from response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                        response.match(/\[([\s\S]*?)\]/) ||
                        response.match(/\{([\s\S]*?)\}/);
      
      if (jsonMatch) {
        try {
          // If the response is wrapped in JSON code block, extract the content
          const jsonContent = jsonMatch[0].startsWith('```') ? jsonMatch[1] : jsonMatch[0];
          return JSON.parse(jsonContent);
        } catch (parseError) {
          console.error('Error parsing JSON from response:', parseError);
          return [];
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error extracting entities:', error);
      throw new Error('Failed to extract entities');
    }
  }

  /**
   * Extract relationships from a document
   * @param document - The document to extract relationships from
   * @returns Promise<any[]> - The extracted relationships
   */
  async extractRelationships(document: string): Promise<any[]> {
    try {
      const prompt = fillPromptTemplate(RELATIONSHIP_EXTRACTION_PROMPT, { document });
      
      const messages = [
        { role: 'system' as const, content: 'You are an intelligence analyst assistant.' },
        { role: 'user' as const, content: prompt }
      ];

      const response = await this.ollamaService.generateChatResponse(messages);
      
      // Extract JSON from response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                        response.match(/\[([\s\S]*?)\]/) ||
                        response.match(/\{([\s\S]*?)\}/);
      
      if (jsonMatch) {
        try {
          // If the response is wrapped in JSON code block, extract the content
          const jsonContent = jsonMatch[0].startsWith('```') ? jsonMatch[1] : jsonMatch[0];
          return JSON.parse(jsonContent);
        } catch (parseError) {
          console.error('Error parsing JSON from response:', parseError);
          return [];
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error extracting relationships:', error);
      throw new Error('Failed to extract relationships');
    }
  }

  /**
   * Classify a document by intelligence categories
   * @param document - The document to classify
   * @returns Promise<any> - The classification result
   */
  async classifyDocument(document: string): Promise<any> {
    try {
      const prompt = fillPromptTemplate(INTELLIGENCE_CLASSIFICATION_PROMPT, { document });
      
      const messages = [
        { role: 'system' as const, content: 'You are an intelligence analyst assistant.' },
        { role: 'user' as const, content: prompt }
      ];

      const response = await this.ollamaService.generateChatResponse(messages);
      
      // Extract JSON from response
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || 
                        response.match(/\[([\s\S]*?)\]/) ||
                        response.match(/\{([\s\S]*?)\}/);
      
      if (jsonMatch) {
        try {
          // If the response is wrapped in JSON code block, extract the content
          const jsonContent = jsonMatch[0].startsWith('```') ? jsonMatch[1] : jsonMatch[0];
          return JSON.parse(jsonContent);
        } catch (parseError) {
          console.error('Error parsing JSON from response:', parseError);
          return {};
        }
      }
      
      return {};
    } catch (error) {
      console.error('Error classifying document:', error);
      throw new Error('Failed to classify document');
    }
  }

  /**
   * Analyze a document
   * @param document - The document to analyze
   * @returns Promise<DocumentAnalysisResult> - The analysis result
   */
  async analyzeDocument(document: string): Promise<DocumentAnalysisResult> {
    try {
      // Process in parallel for better performance
      const [summary, entities, relationships, classification] = await Promise.all([
        this.generateSummary(document),
        this.extractEntities(document),
        this.extractRelationships(document),
        this.classifyDocument(document)
      ]);

      // Calculate overall confidence
      const confidenceScore = this.calculateConfidenceScore(entities, relationships, classification);

      return {
        summary,
        entities,
        relationships,
        classification,
        confidence: confidenceScore
      };
    } catch (error) {
      console.error('Error analyzing document:', error);
      throw new Error('Failed to analyze document');
    }
  }

  /**
   * Calculate confidence score based on entity, relationship, and classification confidence
   * @param entities - The extracted entities
   * @param relationships - The extracted relationships
   * @param classification - The classification result
   * @returns number - The confidence score
   */
  private calculateConfidenceScore(entities: any[], relationships: any[], classification: any): number {
    // This is a simplified implementation
    // In a real application, you would want to use a more sophisticated approach
    
    // Count high, medium, and low confidence entities
    const entityConfidences = entities.map(entity => entity.confidence || 'low');
    const highConfidenceEntities = entityConfidences.filter(c => c === 'high').length;
    const mediumConfidenceEntities = entityConfidences.filter(c => c === 'medium').length;
    const lowConfidenceEntities = entityConfidences.filter(c => c === 'low').length;
    
    // Calculate entity confidence score
    const entityScore = entities.length === 0 ? 0 : 
      (highConfidenceEntities * 1.0 + mediumConfidenceEntities * 0.6 + lowConfidenceEntities * 0.3) / entities.length;
    
    // Calculate relationship confidence score similarly
    const relationshipConfidences = relationships.map(rel => rel.confidence || 'low');
    const highConfidenceRelationships = relationshipConfidences.filter(c => c === 'high').length;
    const mediumConfidenceRelationships = relationshipConfidences.filter(c => c === 'medium').length;
    const lowConfidenceRelationships = relationshipConfidences.filter(c => c === 'low').length;
    
    const relationshipScore = relationships.length === 0 ? 0 :
      (highConfidenceRelationships * 1.0 + mediumConfidenceRelationships * 0.6 + lowConfidenceRelationships * 0.3) / relationships.length;
    
    // Calculate classification confidence score
    const classificationScores = Array.isArray(classification) 
      ? classification.map(c => c.confidence || 0)
      : Object.values(classification).map((c: any) => c.confidence || 0);
    
    const classificationScore = classificationScores.length === 0 ? 0 :
      classificationScores.reduce((sum: number, score: number) => sum + score, 0) / (classificationScores.length * 100);
    
    // Combine scores with weights
    const weightedScore = (entityScore * 0.4) + (relationshipScore * 0.4) + (classificationScore * 0.2);
    
    // Return score between 0 and 1
    return Math.min(Math.max(weightedScore, 0), 1);
  }
}

export default DocumentAnalyzer;
export { DocumentAnalysisResult }; 