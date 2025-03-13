# Intelligence RAG Assistant for Obsidian

An Obsidian plugin that uses Retrieval-Augmented Generation (RAG) with Ollama to enhance intelligence analysis of your notes. This plugin is specifically designed for intelligence personnel who need to process multiple reports, extract key information, find connections between seemingly unrelated reports, and quickly retrieve information using natural language queries.

## Features

- **Vector Database**: Create a semantic vector database of your notes for advanced retrieval
- **AI Metadata Extraction**: Automatically extract from notes:
  - Concise summaries
  - Key entities (people, organizations, equipment, locations)
  - Topics and concepts
  - Intelligence categories (HUMINT, SIGINT, OSINT, etc.)
  - Confidence scores for extracted information
- **Natural Language Querying**: Ask questions about your notes in plain language
- **Relationship Discovery**: Identify connections between seemingly unrelated notes
- **Entity Explorer**: Browse reports by people, organizations, equipment, and locations
- **Visualization**: Graph view showing semantic relationships between reports
- **Performance Optimized**: Built with strategies to minimize performance impact even on large collections

## Requirements

- [Obsidian](https://obsidian.md/) v0.15.0+
- [Ollama](https://ollama.ai/) running locally or on a remote server
  - `all-minilm:latest` model for generating embeddings
  - `llama3.2:latest` model for chat/RAG capabilities

## Installation

### For Users

1. Clone this repository to your Obsidian plugins folder:
   ```bash
   git clone https://github.com/yourusername/obsidian-intelligence-rag.git /path/to/your/obsidian/vault/.obsidian/plugins/
   ```
2. Install dependencies and build:
   ```bash
   cd /path/to/your/obsidian/vault/.obsidian/plugins/obsidian-intelligence-rag
   npm install
   npm run build
   ```
3. Start Ollama and pull the required models:
   ```bash
   # Start Ollama
   ollama serve
   
   # In another terminal, pull the models
   ollama pull all-minilm:latest
   ollama pull llama3.2:latest
   ```
4. Enable the plugin in Obsidian:
   - Open Settings → Community plugins
   - Disable Safe mode
   - Find "Intelligence RAG Assistant" and enable it

### For Developers

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/obsidian-intelligence-rag.git
   cd obsidian-intelligence-rag
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
4. For development with hot-reload:
   ```bash
   npm run dev
   ```
5. Link to your Obsidian plugins folder for testing:
   ```bash
   # Create a symbolic link to your Obsidian vault's plugins directory
   ln -s /absolute/path/to/obsidian-intelligence-rag /path/to/obsidian/vault/.obsidian/plugins/
   ```

## Configuration

1. In Obsidian settings, navigate to the "Intelligence RAG Assistant" section
2. Configure the Ollama host:
   - Local: `http://localhost:11434` (default)
   - Remote: `http://your-server-ip:11434` (if Ollama is running on another machine)
3. Set your preferred models for embeddings and chat/RAG
4. Adjust performance settings:
   - Processing batch size: Control how many notes are processed at once
   - Auto-process new notes: Enable/disable automatic processing of new or modified notes

## Usage

### Basic Usage

1. Click the Intelligence RAG icon in the ribbon or use the command "Open Intelligence RAG Assistant"
2. Use natural language to query your knowledge base:
   - "What equipment was mentioned in reports about Location X?"
   - "Summarize all information about Person Y across all reports"
   - "Find connections between Organization A and Organization B"

### Entity Explorer

1. Open the Entity Explorer from the plugin sidebar
2. Browse entities by category:
   - People
   - Organizations
   - Equipment
   - Locations
3. Click on any entity to see all reports that mention it

### Visualization

1. Access the visualization view to see semantic connections between reports
2. Filter by topics, entities, or time periods
3. Discover unexpected connections between seemingly unrelated reports

## Project Structure

```
obsidian-intelligence-rag/
├── main.ts                   # Plugin entry point
├── manifest.json             # Plugin manifest
├── styles.css                # Plugin styles
├── README.md                 # Documentation
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── src/
│   ├── core/
│   │   ├── database.ts       # Chroma DB interface
│   │   ├── indexer.ts        # Note indexing logic
│   │   ├── chunker.ts        # Text chunking strategies
│   │   ├── embeddings.ts     # Vector embedding generation via Ollama
│   │   └── metadata.ts       # Metadata extraction utilities
│   ├── ai/
│   │   ├── analyzer.ts       # Note analysis functionality
│   │   ├── rag.ts            # RAG implementation with llama3.2
│   │   ├── prompts.ts        # AI prompt templates
│   │   ├── ollama.ts         # Ollama API interface
│   │   └── models.ts         # AI model interfaces
│   ├── ui/
│   │   ├── sidebar.ts        # Sidebar view
│   │   ├── search.ts         # Search interface
│   │   ├── context-panel.ts  # Context panel
│   │   ├── entity-explorer.ts # Entity browsing interface
│   │   └── settings.ts       # Settings interface
│   └── utils/
│       ├── obsidian-helpers.ts  # Obsidian API utilities
│       ├── queue.ts          # Processing queue
│       ├── performance.ts    # Performance monitoring/optimization
│       └── logger.ts         # Logging utilities
```

## Development

### Technology Stack

- **TypeScript**: For type-safe code development
- **Obsidian API**: For integrating with Obsidian's UI and features
- **Ollama**: For AI model hosting and inference
  - all-minilm: Embedding model for vector generation
  - llama3.2: LLM for chat/RAG functionality
- **Chroma DB**: For vector storage and similarity search
- **Web Workers**: For performance-intensive tasks

### Contribution Guidelines

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

Please follow these guidelines:
- Use JSDoc comments for all functions and classes
- Follow the established code style and patterns
- Write tests for new functionality
- Document any new features or changes

### Code Style

- Use TypeScript for all code
- Use proper JSDoc comments throughout the codebase
- Follow the [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- Use async/await for asynchronous operations
- Properly handle errors and edge cases

## Troubleshooting

### Common Issues

1. **Connection to Ollama fails**:
   - Ensure Ollama is running (`ollama serve`)
   - Check that the host URL is correct in plugin settings
   - Verify that the required models are downloaded

2. **Processing is slow**:
   - Reduce the processing batch size in settings
   - Disable auto-processing of new notes
   - Check if your computer has sufficient resources for Ollama

3. **Embeddings are not generating**:
   - Verify that the all-minilm model is properly downloaded
   - Check the Ollama logs for any errors

## License

MIT

## Acknowledgements

- [Obsidian](https://obsidian.md/) for the amazing knowledge management platform
- [Ollama](https://ollama.ai/) for making local LLM deployment accessible
- [ChromaDB](https://www.trychroma.com/) for the vector database technology 