import express from 'express';
import cors from 'cors';
import * as path from 'path';
import apiRoutes from './routes/api';
import documentRoutes from './routes/documents';
import { config } from './config';

// Create Express app
const app = express();
const PORT = config.port;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API routes
app.use('/api', apiRoutes);
app.use('/api/documents', documentRoutes);

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req: express.Request, res: express.Response) => {
    res.sendFile(path.join(__dirname, '../../client/build', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Ollama host: ${config.ollamaBaseUrl}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app; 