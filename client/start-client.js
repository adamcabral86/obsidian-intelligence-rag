// Node.js script to start the client
// Run with: node client/start-client.js

const { spawn } = require('child_process');
const path = require('path');

// Change to the client directory
process.chdir(path.join(__dirname));

console.log('Starting client...');
console.log('Current directory:', process.cwd());

// Run npm start
const child = spawn('npm', ['start'], {
  stdio: 'inherit',
  shell: true
});

// Log any errors
child.on('error', (error) => {
  console.error('Error starting client:', error);
});

// Log when the process exits
child.on('exit', (code) => {
  console.log(`Client process exited with code ${code}`);
}); 