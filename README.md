# Intelligence RAG Application

A standalone application that leverages Retrieval-Augmented Generation (RAG) to enhance the way intelligence personnel interact with their documents. The app creates and maintains a Chroma vector database that stores chunked versions of documents along with AI-generated metadata, enabling powerful semantic search and knowledge discovery.

## Features

- **Document Management**: Upload, manage, and organize intelligence reports
- **Automatic Indexing**: Process documents and update the vector database
- **Intelligent Chunking**: Break down documents into meaningful chunks
- **Metadata Extraction**: AI-powered generation of summaries, entities, relationships, and classifications
- **Semantic Search**: Find relevant information using natural language queries
- **Knowledge Synthesis**: Generate summaries across multiple related documents
- **Relationship Mapping**: Identify connections between reports that aren't explicitly linked
- **Entity Explorer**: Browse documents by extracted entities (people, equipment, organizations)
- **Visualization**: Graph view of semantic relationships between documents

## Technology Stack

- **Backend**: Express.js with TypeScript
- **Frontend**: React with TypeScript
- **Vector Database**: Chroma DB
- **AI Models**: Ollama with all-minilm (embeddings) and llama3.2 (chat/RAG)

## Prerequisites

- Node.js (v16+)
- Ollama installed and running locally
- all-minilm and llama3.2 models pulled in Ollama

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/intelligence-rag-app.git
   cd intelligence-rag-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following content:
   ```
   PORT=3000
   OLLAMA_HOST=http://localhost:11434
   EMBEDDING_MODEL=all-minilm:latest
   CHAT_MODEL=llama3.2:latest
   ```

4. Make sure Ollama is running and the required models are available:
   ```
   ollama pull all-minilm:latest
   ollama pull llama3.2:latest
   ```

## Development

1. Start the development server:
   ```
   npm run dev
   ```

2. The server will be available at http://localhost:3000/api

## Production

1. Build the application:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

## API Endpoints

- `GET /api/health`: Check API health
- `GET /api/models`: Get available models
- `POST /api/embeddings`: Generate embeddings for text
- `POST /api/analyze`: Analyze a document
- `POST /api/rag`: Generate a RAG response
- `POST /api/chat`: Generate a chat response

## Project Structure

```
intelligence-rag-app/
├── server/
│   ├── index.ts                # Server entry point
│   ├── routes/
│   │   ├── api.ts              # API routes
│   ├── services/
│   │   ├── embeddings.ts       # Vector embedding generation
│   ├── ai/
│   │   ├── analyzer.ts         # Document analysis functionality
│   │   ├── rag.ts              # RAG implementation
│   │   ├── prompts.ts          # AI prompt templates
│   │   ├── ollama.ts           # Ollama API interface
│   │   └── models.ts           # AI model interfaces
├── client/                     # React frontend (to be implemented)
├── package.json                # Project dependencies
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Ollama](https://ollama.ai/) for providing the local AI models
- [Chroma DB](https://www.trychroma.com/) for the vector database
- [Express.js](https://expressjs.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend framework 