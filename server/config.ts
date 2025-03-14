import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file manually
function loadEnvFile(filePath: string): Record<string, string> {
  const config: Record<string, string> = {};
  
  try {
    if (fs.existsSync(filePath)) {
      const envFile = fs.readFileSync(filePath, 'utf8');
      const lines = envFile.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const [key, value] = trimmedLine.split('=');
          if (key && value) {
            config[key.trim()] = value.trim();
          }
        }
      }
      
      console.log('Environment variables loaded successfully from:', filePath);
    } else {
      console.warn('Environment file not found at:', filePath);
    }
  } catch (error) {
    console.error('Error loading environment file:', error);
  }
  
  return config;
}

// Get the absolute path to the .env file
const envPath = path.resolve(__dirname, '../.env');
const envConfig = loadEnvFile(envPath);

// Configuration object
export const config = {
  port: parseInt(envConfig.PORT || process.env.PORT || '3001', 10),
  ollamaBaseUrl: envConfig.OLLAMA_BASE_URL || process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  chromaDbPath: envConfig.CHROMA_DB_PATH || process.env.CHROMA_DB_PATH || './chromadb',
  environment: process.env.NODE_ENV || 'development',
};

// Log config for debugging
console.log('Application configuration:');
console.log('PORT:', config.port);
console.log('OLLAMA_BASE_URL:', config.ollamaBaseUrl);
console.log('CHROMA_DB_PATH:', config.chromaDbPath); 