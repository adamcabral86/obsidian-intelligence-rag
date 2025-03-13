/**
 * Ollama Service Module
 * 
 * This module provides a service for interacting with the Ollama API.
 * It handles connections to the Ollama server and provides methods for 
 * generating embeddings, chat completions, and extracting metadata from text.
 * 
 * @module OllamaService
 */

/**
 * Service for interacting with the Ollama API
 * 
 * Provides methods for connecting to Ollama, generating embeddings
 * using the all-minilm model, and generating text completions using 
 * the llama3.2 model.
 * 
 * @class OllamaService
 */
export class OllamaService {
    /** The base URL of the Ollama API server */
    private host: string;

    /**
     * Creates a new instance of the OllamaService
     * 
     * @param host - The base URL of the Ollama API server
     */
    constructor(host: string) {
        this.host = host;
    }

    /**
     * Updates the host address for the Ollama API server
     * 
     * @param host - The new base URL for the Ollama API server
     */
    setHost(host: string): void {
        this.host = host;
    }

    /**
     * Checks if the Ollama service is available and responding
     * 
     * This method attempts to fetch the list of available models from the
     * Ollama API to verify that the connection is working properly.
     * 
     * @returns A promise that resolves to true if connected, false otherwise
     */
    async checkConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.host}/api/tags`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error('Failed to connect to Ollama:', response.statusText);
                return false;
            }

            const data = await response.json();
            return Array.isArray(data.models); // Check if we got a valid response
        } catch (error) {
            console.error('Error connecting to Ollama:', error);
            return false;
        }
    }

    /**
     * Gets the list of available models from the Ollama API
     * 
     * @returns A promise that resolves to an array of model names
     */
    async getAvailableModels(): Promise<string[]> {
        try {
            const response = await fetch(`${this.host}/api/tags`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to get models: ${response.statusText}`);
            }

            const data = await response.json();
            return data.models.map((model: any) => model.name);
        } catch (error) {
            console.error('Error getting available models:', error);
            return [];
        }
    }

    /**
     * Generates embeddings for a text using the specified model
     * 
     * This method sends a request to the Ollama API to generate embeddings
     * for the provided text using the all-minilm model (or other specified model).
     * Embeddings are vector representations of text that capture semantic meaning.
     * 
     * @param text - The text to generate embeddings for
     * @param model - The embedding model to use (defaults to all-minilm:latest)
     * @returns A promise that resolves to an array of numbers representing the embedding
     * @throws Error if the embedding generation fails
     */
    async generateEmbeddings(text: string, model: string = 'all-minilm:latest'): Promise<number[]> {
        try {
            const response = await fetch(`${this.host}/api/embeddings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: model,
                    prompt: text
                })
            });

            if (!response.ok) {
                throw new Error(`Failed to generate embeddings: ${response.statusText}`);
            }

            const data = await response.json();
            return data.embedding;
        } catch (error) {
            console.error('Error generating embeddings:', error);
            throw error;
        }
    }

    /**
     * Generates a text response from the specified model
     * 
     * This method sends a request to the Ollama API to generate a text response
     * for the provided prompt using the specified model (defaults to llama3.2).
     * 
     * @param prompt - The prompt to send to the model
     * @param model - The model to use (defaults to llama3.2:latest)
     * @param system - Optional system prompt to set context for the model
     * @returns A promise that resolves to the generated text
     * @throws Error if the response generation fails
     */
    async generateResponse(prompt: string, model: string = 'llama3.2:latest', system?: string): Promise<string> {
        try {
            const requestBody: any = {
                model: model,
                prompt: prompt,
                stream: false
            };

            if (system) {
                requestBody.system = system;
            }

            const response = await fetch(`${this.host}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Failed to generate response: ${response.statusText}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }

    /**
     * Extracts structured metadata from text using the chat model
     * 
     * This method uses the llama3.2 model (or other specified model) to analyze
     * text and extract structured metadata such as summaries, entities, topics,
     * sentiment, and confidence levels. The output is returned as a parsed JSON object.
     * 
     * @param text - The text to analyze
     * @param model - The model to use (defaults to llama3.2:latest)
     * @returns A promise that resolves to an object containing the extracted metadata
     * @throws Error if the metadata extraction fails
     */
    async extractMetadata(text: string, model: string = 'llama3.2:latest'): Promise<any> {
        const systemPrompt = `
You are an advanced intelligence analyst assistant that extracts structured metadata from intelligence reports.
Analyze the provided text and extract the following information in JSON format:
- summary: A concise summary of the content (max 5 sentences)
- topics: An array of key topics/concepts (max 5)
- entities: 
  - people: Array of people mentioned
  - organizations: Array of organizations mentioned
  - locations: Array of locations mentioned
  - equipment: Array of equipment/weapons/tools mentioned
- sentiment: The overall sentiment (positive, neutral, negative)
- confidence: Your confidence in the extraction (high, medium, low)
- category: Intelligence category if applicable (HUMINT, SIGINT, OSINT, etc.)

Return ONLY valid JSON without any additional text.
`;

        try {
            const response = await this.generateResponse(text, model, systemPrompt);
            
            // Attempt to parse the JSON response
            try {
                return JSON.parse(response);
            } catch (parseError) {
                console.error('Error parsing metadata response:', parseError);
                // If parsing fails, return a basic structure with the raw response
                return {
                    summary: "Failed to parse metadata",
                    raw_response: response,
                    confidence: "low"
                };
            }
        } catch (error) {
            console.error('Error extracting metadata:', error);
            throw error;
        }
    }
} 