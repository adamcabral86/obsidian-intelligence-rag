# Plan
This standalone application will leverage Retrieval-Augmented Generation (RAG) to enhance the way users interact with their documents. The app will create and maintain a Chroma vector database that stores chunked versions of documents along with AI-generated metadata, enabling powerful semantic search and knowledge discovery.

## Core Concept
- Index documents into a Chroma vector database for semantic retrieval
- Use AI to analyze documents and generate enriched metadata (summaries, keywords, entities, etc.)
- Provide a seamless interface for querying the knowledge base and discovering connections
- Enable AI-assisted document analysis and knowledge management

## Intelligence Use Case
This application is specifically designed for intelligence personnel who need to:
- Ingest and process multiple intelligence reports
- Extract key information (people, equipment, locations, events)
- Find connections between seemingly unrelated reports
- Quickly retrieve relevant information using natural language queries
- Generate comprehensive summaries across multiple documents

# Features

## Database & Indexing
- **Document Management**: Upload, manage, and organize documents
- **Automatic Indexing**: Process documents and update the vector database
- **Chunking Strategy**: Intelligent chunking of documents based on content structure (paragraphs, headers, etc.)
- **Metadata Extraction**: AI-powered generation of:
  - Document summaries
  - Key concepts/topics
  - Named entities (people, places, organizations, equipment)
  - Detected sentiment/tone
  - Classification by intelligence categories (HUMINT, SIGINT, OSINT, etc.)
  - Confidence scores for extracted information
- **Relationship Mapping**: Identify connections between reports that aren't explicitly linked
- **Vector Embeddings**: Generate and store embeddings using Ollama with all-minilm model
- **Incremental Processing**: Process only new or modified documents to minimize performance impact

## User Interface
- **Modern Web Interface**: Clean, responsive design for desktop and mobile
- **Document Explorer**: Browse and manage uploaded documents
- **Search Interface**: Powerful semantic search capabilities
- **Context Panel**: Show related documents based on current selection
- **Query Builder**: User-friendly interface for constructing complex intelligence queries
- **Visualization**: Graph view of semantic relationships between documents
- **Entity Explorer**: Browse documents by extracted entities (people, equipment, organizations)
- **Confidence Indicators**: Visual indicators for AI-generated metadata reliability

## RAG Capabilities
- **Natural Language Queries**: Ask questions about documents in plain language
- **Knowledge Synthesis**: Generate summaries across multiple related documents
- **Content Recommendations**: Suggest relevant documents based on current context
- **Intelligence Assistant**: Help extract insights from across the knowledge base
- **Semantic Connections**: Discover thematically related content
- **Chain-of-Thought Analysis**: Follow potential connections between seemingly unrelated documents

## Settings & Configuration
- **Ollama Configuration**: Settings to connect to local Ollama instance
  - Host address configuration
  - Model selection options
- **Chunking Configuration**: Customize chunking strategies
- **Processing Queue**: Manage background processing of documents
- **Database Management**: Tools for rebuilding, maintaining the vector database
- **Performance Controls**: Options to limit resource usage during processing
  - Batch size controls for processing
  - Processing priority settings

## Performance Optimization Strategies
- **Lazy Loading**: Only load embeddings when needed
- **Incremental Updates**: Process only changed documents rather than full reindexing
- **Batched Processing**: Process documents in small batches to prevent UI freezing
- **Worker Threads**: Use separate threads for heavy processing tasks
- **Caching**: Cache frequent queries and their results
- **Reduced Embedding Dimensions**: Use dimension reduction techniques if needed
- **Database Pruning**: Remove outdated or less relevant embeddings
- **Progress Indicators**: Show clear progress for long-running operations

# Layout

## Project Structure
```
intelligence-rag-app/
├── server/
│   ├── index.ts                # Server entry point
│   ├── routes/
│   │   ├── api.ts              # API routes
│   │   ├── auth.ts             # Authentication routes
│   │   └── documents.ts        # Document management routes
│   ├── services/
│   │   ├── database.ts         # Chroma DB interface
│   │   ├── indexer.ts          # Document indexing logic
│   │   ├── chunker.ts          # Text chunking strategies
│   │   ├── embeddings.ts       # Vector embedding generation via Ollama
│   │   └── metadata.ts         # Metadata extraction utilities
│   ├── ai/
│   │   ├── analyzer.ts         # Document analysis functionality
│   │   ├── rag.ts              # RAG implementation with llama3.2
│   │   ├── prompts.ts          # AI prompt templates
│   │   ├── ollama.ts           # Ollama API interface
│   │   └── models.ts           # AI model interfaces
│   └── utils/
│       ├── queue.ts            # Processing queue
│       ├── performance.ts      # Performance monitoring/optimization
│       └── logger.ts           # Logging utilities
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DocumentExplorer.tsx  # Document browsing interface
│   │   │   ├── SearchInterface.tsx   # Search interface
│   │   │   ├── EntityExplorer.tsx    # Entity browsing interface
│   │   │   ├── Visualization.tsx     # Visualization components
│   │   │   └── Settings.tsx          # Settings interface
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Home page
│   │   │   ├── Search.tsx            # Search page
│   │   │   ├── Documents.tsx         # Document management page
│   │   │   ├── Entities.tsx          # Entity explorer page
│   │   │   └── Settings.tsx          # Settings page
│   │   ├── services/
│   │   │   ├── api.ts                # API client
│   │   │   └── auth.ts               # Authentication service
│   │   ├── App.tsx                   # Main application component
│   │   └── index.tsx                 # Client entry point
│   ├── public/
│   │   ├── index.html                # HTML template
│   │   └── assets/                   # Static assets
│   └── package.json                  # Client dependencies
├── package.json                      # Project dependencies
├── tsconfig.json                     # TypeScript configuration
└── README.md                         # Documentation
```

## Data Flow
1. **Document Upload**: User uploads documents to the system
2. **Preprocessing**: Clean and prepare documents for processing
3. **Chunking**: Split documents into meaningful chunks
4. **AI Analysis**: Generate metadata for chunks using llama3.2
5. **Vector Generation**: Create embeddings for chunks and metadata using all-minilm
6. **Database Storage**: Store chunks, metadata, and vectors in Chroma
7. **Query Processing**: Transform user queries into vector searches
8. **Result Rendering**: Display and format search results

# Tasks / Prompts

## Development Roadmap

### Phase 1: Core Infrastructure
- [ ] Set up project structure with Express backend and React frontend
- [ ] Implement Ollama integration for all-minilm embeddings and llama3.2 chat
- [ ] Develop document upload and management functionality
- [ ] Create chunking strategies optimized for intelligence reports
- [ ] Implement metadata extraction with focus on intelligence-relevant entities

### Phase 2: Basic RAG Functionality
- [ ] Implement vector embedding generation via Ollama
- [ ] Create basic search interface using RAG
- [ ] Develop simple visualization of related documents
- [ ] Add settings panel for Ollama configuration
- [ ] Implement basic performance optimization strategies

### Phase 3: Intelligence-Specific Features
- [ ] Enhance metadata extraction for intelligence-specific entities
- [ ] Implement relationship mapping between documents
- [ ] Add entity explorer for browsing by people, organizations, equipment
- [ ] Create visualization tools for intelligence analysis
- [ ] Improve query processing with intelligence-specific capabilities

### Phase 4: Polish & Optimization
- [ ] Optimize performance for large collections of documents
- [ ] Refine user interface for intelligence workflows
- [ ] Improve error handling and recovery
- [ ] Add comprehensive user documentation
- [ ] Implement advanced performance optimization strategies

## AI Prompts for Development Assistance

### Prompt 1: Express Backend Setup with Ollama Integration
```
Create the foundational structure for an Express backend that integrates with Ollama. The backend should:
1. Set up a proper Express server with TypeScript
2. Connect to a locally running Ollama instance
3. Include configuration options for the Ollama host address
4. Implement basic API calls to both all-minilm for embeddings and llama3.2 for chat
5. Include proper error handling for connection issues
6. Provide TypeScript implementation with clear documentation
```

### Prompt 2: React Frontend Setup for Intelligence RAG App
```
Create the foundational structure for a React frontend for an intelligence RAG application. The frontend should:
1. Use modern React with TypeScript and hooks
2. Set up a responsive layout with a sidebar, main content area, and header
3. Include routing for different sections (documents, search, entities, settings)
4. Implement a clean, professional UI suitable for intelligence work
5. Include basic state management for application settings
6. Provide TypeScript implementation with clear documentation
```

### Prompt 3: Document Management System
```
Design a document management system for the intelligence RAG application that:
1. Allows users to upload, organize, and manage documents
2. Implements proper file validation and security measures
3. Provides a clean UI for browsing and managing documents
4. Includes document metadata display and editing
5. Supports document categorization and tagging
6. Provides TypeScript implementation for both backend and frontend
```

### Prompt 4: Intelligence-Optimized Chunking Strategy
```
Design an intelligent text chunking algorithm for intelligence reports. The algorithm should:
1. Break down reports into semantically meaningful chunks
2. Recognize and preserve sections about specific entities (people, equipment, organizations)
3. Handle different report structures (bulletins, assessments, field reports)
4. Maintain critical context when splitting content
5. Be optimized for performance with large documents
6. Include implementation details in TypeScript
```

### Prompt 5: Intelligence Metadata Extraction
```
Create a system for extracting intelligence-relevant metadata from document chunks using llama3.2. The system should:
1. Generate concise summaries of document content
2. Extract key people, organizations, equipment, and locations
3. Identify relationships between entities
4. Assess confidence levels for extracted information
5. Classify information by intelligence categories
6. Provide TypeScript implementation with Ollama API calls
7. Include performance optimization strategies
```

### Prompt 6: Chroma DB Implementation with Performance Optimization
```
Design a Chroma DB integration for the intelligence RAG application that:
1. Efficiently stores and retrieves document chunks and intelligence metadata
2. Implements incremental updates to minimize performance impact
3. Uses batched processing to avoid UI freezing
4. Includes caching strategies for frequent queries
5. Provides database pruning capabilities for optimization
6. Includes persistent storage
7. Provides TypeScript implementation details
```

### Prompt 7: Intelligence Analysis UI Design
```
Create a user interface design for intelligence analysis in the RAG application that:
1. Provides a clean, professional appearance suitable for intelligence work
2. Provides intuitive access to semantic search optimized for intelligence queries
3. Includes an entity explorer for browsing by people, organizations, and equipment
4. Displays relationship graphs between documents and entities
5. Shows confidence levels for AI-generated insights
6. Implements performance-conscious rendering for large result sets
7. Include TypeScript implementation details with performance considerations
```

## Resources & Dependencies
- Express.js for the backend
- React for the frontend
- Chroma DB (vector database)
- Ollama for AI models:
  - all-minilm:latest for embeddings
  - llama3.2:latest for chat/RAG
- TypeScript for type safety
- Optional SQLite for efficient metadata storage
