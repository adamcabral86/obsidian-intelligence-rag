/**
 * Interface for a prompt template
 */
interface PromptTemplate {
  name: string;
  description: string;
  template: string;
  variables: string[];
}

/**
 * Prompt template for document summarization
 */
export const DOCUMENT_SUMMARY_PROMPT: PromptTemplate = {
  name: 'document-summary',
  description: 'Generate a concise summary of a document',
  template: `You are an intelligence analyst assistant. Provide a concise summary of the following document.
Focus on key information that would be relevant for intelligence analysis.
Extract the main points, key findings, and important details.

DOCUMENT:
{{document}}

SUMMARY:`,
  variables: ['document']
};

/**
 * Prompt template for entity extraction
 */
export const ENTITY_EXTRACTION_PROMPT: PromptTemplate = {
  name: 'entity-extraction',
  description: 'Extract entities from a document',
  template: `You are an intelligence analyst assistant. Extract all relevant entities from the following document.
Focus on the following entity types:
- People (names, roles, affiliations)
- Organizations (names, types, locations)
- Locations (places, coordinates, regions)
- Equipment (weapons, vehicles, technology)
- Events (meetings, operations, incidents)
- Dates and Times

For each entity, provide:
1. The entity name
2. The entity type
3. A brief description or context
4. The confidence level (high, medium, low)

DOCUMENT:
{{document}}

ENTITIES (in JSON format):`,
  variables: ['document']
};

/**
 * Prompt template for relationship extraction
 */
export const RELATIONSHIP_EXTRACTION_PROMPT: PromptTemplate = {
  name: 'relationship-extraction',
  description: 'Extract relationships between entities',
  template: `You are an intelligence analyst assistant. Extract relationships between entities in the following document.
Focus on relationships such as:
- Person to Person (e.g., colleague, superior, subordinate)
- Person to Organization (e.g., member, leader, employee)
- Person to Location (e.g., resident, visitor, native)
- Organization to Organization (e.g., parent, subsidiary, partner)
- Organization to Location (e.g., headquarters, branch, area of operation)
- Equipment to Person/Organization (e.g., owner, operator, manufacturer)

For each relationship, provide:
1. The source entity
2. The relationship type
3. The target entity
4. A brief description or context
5. The confidence level (high, medium, low)

DOCUMENT:
{{document}}

RELATIONSHIPS (in JSON format):`,
  variables: ['document']
};

/**
 * Prompt template for intelligence classification
 */
export const INTELLIGENCE_CLASSIFICATION_PROMPT: PromptTemplate = {
  name: 'intelligence-classification',
  description: 'Classify a document by intelligence categories',
  template: `You are an intelligence analyst assistant. Classify the following document according to intelligence categories.
Consider the following categories:
- HUMINT (Human Intelligence)
- SIGINT (Signals Intelligence)
- OSINT (Open Source Intelligence)
- IMINT (Imagery Intelligence)
- MASINT (Measurement and Signature Intelligence)
- GEOINT (Geospatial Intelligence)
- TECHINT (Technical Intelligence)

For each applicable category, provide:
1. The category name
2. A confidence score (0-100)
3. A brief justification

DOCUMENT:
{{document}}

CLASSIFICATION (in JSON format):`,
  variables: ['document']
};

/**
 * Prompt template for RAG query
 */
export const RAG_QUERY_PROMPT: PromptTemplate = {
  name: 'rag-query',
  description: 'Generate a response to a query using RAG',
  template: `You are an intelligence analysis assistant. Use ONLY the following information to answer the user's question.
If you don't know the answer based on the provided information, say "I don't have enough information to answer that question."
Do not make up or hallucinate any information.

CONTEXT INFORMATION:
{{context}}

USER QUERY:
{{query}}

RESPONSE:`,
  variables: ['context', 'query']
};

/**
 * Fill a prompt template with variables
 * @param template - The prompt template
 * @param variables - The variables to fill the template with
 * @returns string - The filled prompt
 */
export const fillPromptTemplate = (
  template: PromptTemplate,
  variables: Record<string, string>
): string => {
  let filledPrompt = template.template;
  
  for (const variable of template.variables) {
    if (!variables[variable]) {
      throw new Error(`Missing variable: ${variable}`);
    }
    
    filledPrompt = filledPrompt.replace(
      new RegExp(`{{${variable}}}`, 'g'),
      variables[variable]
    );
  }
  
  return filledPrompt;
};

/**
 * Get all prompt templates
 * @returns PromptTemplate[] - All prompt templates
 */
export const getAllPromptTemplates = (): PromptTemplate[] => {
  return [
    DOCUMENT_SUMMARY_PROMPT,
    ENTITY_EXTRACTION_PROMPT,
    RELATIONSHIP_EXTRACTION_PROMPT,
    INTELLIGENCE_CLASSIFICATION_PROMPT,
    RAG_QUERY_PROMPT
  ];
};

export default {
  fillPromptTemplate,
  getAllPromptTemplates,
  DOCUMENT_SUMMARY_PROMPT,
  ENTITY_EXTRACTION_PROMPT,
  RELATIONSHIP_EXTRACTION_PROMPT,
  INTELLIGENCE_CLASSIFICATION_PROMPT,
  RAG_QUERY_PROMPT
}; 