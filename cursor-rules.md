# Cursor Rules for Intelligence RAG Assistant Development

This document outlines useful Cursor rules and tips for developing the Obsidian Intelligence RAG Assistant plugin. These rules help maintain code quality, consistency, and avoid common pitfalls when working with TypeScript, Obsidian API, and asynchronous operations.

## TypeScript-Specific Rules

### 1. Use Explicit Type Annotations

```typescript
// ❌ Bad - Relies on type inference
const getEmbeddings = async (text) => {
  return await ollamaService.generateEmbeddings(text);
};

// ✅ Good - Uses explicit type annotations
const getEmbeddings = async (text: string): Promise<number[]> => {
  return await ollamaService.generateEmbeddings(text);
};
```

### 2. Handle Promise Rejections

```typescript
// ❌ Bad - Unhandled promise rejection
async processBatch() {
  const results = await this.ollamaService.generateEmbeddings(text);
  return results;
}

// ✅ Good - Handles rejections
async processBatch(): Promise<number[]> {
  try {
    const results = await this.ollamaService.generateEmbeddings(text);
    return results;
  } catch (error) {
    console.error('Failed to generate embeddings:', error);
    throw new Error(`Processing failed: ${error.message}`);
  }
}
```

### 3. Avoid Type Assertions When Possible

```typescript
// ❌ Bad - Type assertion without verification
const data = response.json() as EmbeddingResponse;

// ✅ Good - Validate before asserting
const responseData = await response.json();
if (!isEmbeddingResponse(responseData)) {
  throw new Error('Invalid response format');
}
const data: EmbeddingResponse = responseData;
```

## Obsidian API Rules

### 1. Clean Up Event Listeners and Registrations

```typescript
// ❌ Bad - No cleanup
onload() {
  this.registerEvent(this.app.workspace.on('file-open', this.processFile));
}

// ✅ Good - Proper cleanup
onload() {
  this.registerEvent(this.app.workspace.on('file-open', this.processFile));
}

onunload() {
  // The plugin system automatically cleans up registered events
}
```

### 2. Handle Vault Access Securely

```typescript
// ❌ Bad - No error handling for file operations
async processMdFile(file) {
  const content = await this.app.vault.read(file);
  return content;
}

// ✅ Good - Handle potential errors
async processMdFile(file: TFile): Promise<string | null> {
  try {
    return await this.app.vault.read(file);
  } catch (error) {
    console.error(`Failed to read ${file.path}:`, error);
    return null;
  }
}
```

### 3. Respect Obsidian's UI Conventions

```typescript
// ❌ Bad - Inconsistent with Obsidian's UI
const button = new ButtonComponent(container)
  .setClass('my-custom-button')
  .setLabel('Process');

// ✅ Good - Follows Obsidian's UI patterns
const button = new ButtonComponent(container)
  .setClass('mod-cta')
  .setButtonText('Process');
```

## Asynchronous Processing Rules

### 1. Avoid UI Blocking Operations

```typescript
// ❌ Bad - Blocks UI during processing
async processAllFiles() {
  const files = this.app.vault.getMarkdownFiles();
  for (const file of files) {
    await this.processFile(file);
  }
}

// ✅ Good - Uses batching to prevent UI freezing
async processAllFiles() {
  const files = this.app.vault.getMarkdownFiles();
  const batchSize = this.settings.processingBatchSize;
  
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(batch.map(file => this.processFile(file)));
    
    // Allow UI to update between batches
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
```

### 2. Use Progress Indicators for Long Operations

```typescript
// ❌ Bad - No indication of progress
async indexVault() {
  const files = this.app.vault.getMarkdownFiles();
  for (const file of files) {
    await this.processFile(file);
  }
}

// ✅ Good - Shows progress to user
async indexVault() {
  const files = this.app.vault.getMarkdownFiles();
  const totalFiles = files.length;
  let processed = 0;
  
  const statusBarItem = this.addStatusBarItem();
  
  for (const file of files) {
    await this.processFile(file);
    processed++;
    statusBarItem.setText(`Indexing: ${processed}/${totalFiles} files`);
    
    // Allow UI to update
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  
  statusBarItem.setText('Indexing complete');
  setTimeout(() => {
    statusBarItem.setText('RAG: Ready');
  }, 3000);
}
```

### 3. Handle API Rate Limits

```typescript
// ❌ Bad - No rate limiting for API calls
async processFiles(files: TFile[]) {
  return Promise.all(files.map(file => this.processFile(file)));
}

// ✅ Good - Implements rate limiting for API calls
async processFiles(files: TFile[]) {
  const results = [];
  
  for (const file of files) {
    const result = await this.processFile(file);
    results.push(result);
    
    // Add delay between API calls to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return results;
}
```

## Performance Rules

### 1. Implement Caching for Expensive Operations

```typescript
// ❌ Bad - Recalculates embeddings every time
async getEmbeddings(text: string): Promise<number[]> {
  return await this.ollamaService.generateEmbeddings(text);
}

// ✅ Good - Uses a cache to avoid redundant calculations
private embeddingCache = new Map<string, {timestamp: number, embedding: number[]}>();
private readonly CACHE_TTL = 1000 * 60 * 60; // 1 hour

async getEmbeddings(text: string): Promise<number[]> {
  const hash = await this.hashText(text);
  const cached = this.embeddingCache.get(hash);
  
  if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
    return cached.embedding;
  }
  
  const embedding = await this.ollamaService.generateEmbeddings(text);
  this.embeddingCache.set(hash, {timestamp: Date.now(), embedding});
  
  return embedding;
}
```

### 2. Use Web Workers for CPU-Intensive Tasks

```typescript
// ❌ Bad - Runs intensive processing on main thread
async processText(text: string) {
  const chunks = this.chunker.splitText(text);
  const processedChunks = chunks.map(chunk => this.processChunk(chunk));
  return processedChunks;
}

// ✅ Good - Offloads to a worker
async processText(text: string) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('chunk-processor-worker.js');
    
    worker.onmessage = (event) => {
      resolve(event.data);
      worker.terminate();
    };
    
    worker.onerror = (error) => {
      reject(error);
      worker.terminate();
    };
    
    worker.postMessage({text, options: this.settings});
  });
}
```

## Documentation Rules

### 1. Use JSDoc for All Public APIs

```typescript
// ❌ Bad - Missing or incomplete documentation
async extractMetadata(text: string) {
  return this.ollamaService.extractMetadata(text);
}

// ✅ Good - Comprehensive JSDoc
/**
 * Extracts structured metadata from text using the Ollama LLM
 * 
 * This method analyzes the text and extracts key information such as:
 * - Summary
 * - Topics
 * - Entities (people, organizations, locations, equipment)
 * - Sentiment
 * - Intelligence category
 * 
 * @param text - The text to analyze for metadata extraction
 * @returns A promise that resolves to an object containing the extracted metadata
 * @throws Will throw an error if the LLM processing fails
 */
async extractMetadata(text: string): Promise<MetadataResult> {
  return this.ollamaService.extractMetadata(text);
}
```

### 2. Document Complex Algorithms

For complex algorithms like chunking or vector search, add explanatory comments:

```typescript
/**
 * Splits text into semantically meaningful chunks
 * 
 * Algorithm:
 * 1. First split by headers to maintain document structure
 * 2. For each header section, further split into paragraphs
 * 3. If paragraphs exceed max chunk size, split them at sentence boundaries
 * 4. For each chunk, calculate and store the overlap with previous/next chunks
 * 5. Return the chunks with their metadata and overlap information
 * 
 * @param text - The text to split into chunks
 * @returns An array of text chunks with metadata
 */
splitTextIntoChunks(text: string): TextChunk[] {
  // Implementation...
}
```

## Testing Rules

### 1. Test Async Code Properly

```typescript
// ❌ Bad - Incorrect handling of async tests
it('should generate embeddings', () => {
  const result = service.generateEmbeddings('test');
  expect(result).toHaveLength(384);
});

// ✅ Good - Proper async test
it('should generate embeddings', async () => {
  const result = await service.generateEmbeddings('test');
  expect(result).toHaveLength(384);
});
```

### 2. Mock External Dependencies

```typescript
// ❌ Bad - Relies on actual Ollama service
it('should process text', async () => {
  const result = await service.processText('test');
  expect(result).toBeDefined();
});

// ✅ Good - Mocks dependencies
it('should process text', async () => {
  // Mock the Ollama service
  service.ollamaService = {
    generateEmbeddings: jest.fn().mockResolvedValue(Array(384).fill(0.1)),
    extractMetadata: jest.fn().mockResolvedValue({
      summary: 'Test summary',
      entities: { people: ['John Doe'] }
    })
  } as unknown as OllamaService;
  
  const result = await service.processText('test');
  expect(result.summary).toBe('Test summary');
});
```

## Application of These Rules

By following these Cursor rules, you'll create a high-quality, maintainable, and performant Obsidian plugin. The Intelligence RAG Assistant will benefit from:

1. **Type Safety**: Catch errors at compile time rather than runtime
2. **Performance**: Properly manage resource-intensive operations
3. **Error Handling**: Gracefully deal with failures
4. **Documentation**: Make the codebase accessible to other developers
5. **Testing**: Ensure reliability of the plugin

Remember to set up ESLint in your project to automatically enforce many of these rules during development. 