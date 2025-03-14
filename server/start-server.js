// Node.js script to start the server
// Run with: node server/start-server.js

const { spawn } = require('child_process');
const path = require('path');

// Change to the server directory
process.chdir(path.join(__dirname));

console.log('Starting server...');
console.log('Current directory:', process.cwd());

// Run npm run dev
const child = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// Log any errors
child.on('error', (error) => {
  console.error('Error starting server:', error);
});

// Log when the process exits
child.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
}); 