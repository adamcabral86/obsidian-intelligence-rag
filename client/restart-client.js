const { execSync } = require('child_process');
const path = require('path');

console.log('=== Intelligence RAG Client Restart ===');
console.log('Cleaning node_modules...');

try {
  // Install dependencies
  console.log('Installing dependencies with npm...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Build the application
  console.log('Building the application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Start the client
  console.log('Starting the client application...');
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  console.error('Error during restart:', error);
} 