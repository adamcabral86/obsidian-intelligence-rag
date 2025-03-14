# Intelligence RAG

A powerful Retrieval-Augmented Generation system for analyzing, searching, and extracting insights from documents.

## Features

- **Document Management**: Upload, organize, and manage documents in various formats (PDF, DOCX, TXT, etc.)
- **Semantic Search**: Ask questions about your documents using natural language and get accurate answers
- **Entity Extraction**: Automatically extract and explore entities like people, organizations, and locations
- **Configurable Settings**: Fine-tune embedding models, chunking parameters, and other RAG system settings

## Architecture

The application consists of two main parts:

### Backend (Express.js + TypeScript)

- **Document Processing**: Handles document uploads, parsing, and chunking
- **Vector Database**: Stores document embeddings using ChromaDB
- **Embedding Generation**: Creates vector embeddings using Ollama models
- **RAG Implementation**: Retrieves relevant document chunks and generates answers using LLMs
- **Entity Extraction**: Identifies and categorizes named entities from documents

### Frontend (React + TypeScript + Material UI)

- **Document Uploader**: Interface for uploading and managing documents
- **Search Interface**: Natural language query interface with source citations
- **Entity Viewer**: Visualization and exploration of extracted entities
- **Settings Panel**: Configuration interface for the RAG system

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Ollama (for running local LLMs)
- ChromaDB (for vector storage)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/intelligence-rag.git
   cd intelligence-rag
   ```

2. Install dependencies for both backend and frontend:
   ```
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the server directory with the following variables:
     ```
     PORT=3001
     OLLAMA_BASE_URL=http://localhost:11434
     CHROMA_DB_PATH=./chromadb
     ```

4. Start the development servers:
   ```
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd ../client
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Upload Documents**: Navigate to the Documents page and upload your files
2. **Search**: Go to the Search page and ask questions about your documents
3. **Explore Entities**: Visit the Entities page to explore extracted entities
4. **Configure Settings**: Adjust system settings on the Settings page

## Technologies Used

- **Frontend**:
  - React
  - TypeScript
  - Material UI
  - React Router
  - Axios

- **Backend**:
  - Express.js
  - TypeScript
  - Ollama (for LLMs and embeddings)
  - ChromaDB (vector database)
  - Multer (file uploads)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project uses Ollama for running local LLMs
- ChromaDB for efficient vector storage and retrieval
- Material UI for the frontend components 