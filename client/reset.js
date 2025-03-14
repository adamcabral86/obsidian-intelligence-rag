const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Path to package.json
const packageJsonPath = path.join(__dirname, 'package.json');

// New package.json with consistent versions
const newPackageJson = {
  "name": "intelligence-rag-client",
  "version": "1.0.0",
  "description": "React frontend for Intelligence RAG application",
  "main": "index.js",
  "scripts": {
    "start": "webpack serve --mode development --port 3000 --open",
    "build": "webpack --mode production",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@emotion/react": "^11.10.6",
    "@emotion/styled": "^11.10.6",
    "@mui/icons-material": "^5.11.16",
    "@mui/material": "^5.12.0",
    "@types/react": "^18.0.33",
    "@types/react-dom": "^18.0.11",
    "@types/react-router-dom": "^5.3.3",
    "axios": "^1.3.5",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.10.0",
    "typescript": "^5.0.4"
  },
  "devDependencies": {
    "css-loader": "^6.7.3",
    "file-loader": "^6.2.0",
    "html-webpack-plugin": "^5.5.0",
    "style-loader": "^3.3.2",
    "ts-loader": "^9.4.2",
    "webpack": "^5.78.0",
    "webpack-cli": "^5.0.1",
    "webpack-dev-server": "^4.13.2"
  }
};

console.log('=== Intelligence RAG Client Reset ===');

try {
  // Remove node_modules
  console.log('Removing node_modules directory...');
  if (fs.existsSync(path.join(__dirname, 'node_modules'))) {
    if (process.platform === 'win32') {
      try {
        execSync('rmdir /s /q node_modules', { stdio: 'inherit' });
      } catch (error) {
        console.log('Using alternative method to remove node_modules...');
        execSync('rd /s /q node_modules', { stdio: 'inherit' });
      }
    } else {
      execSync('rm -rf node_modules', { stdio: 'inherit' });
    }
  }

  // Remove package-lock.json
  console.log('Removing package-lock.json...');
  if (fs.existsSync(path.join(__dirname, 'package-lock.json'))) {
    fs.unlinkSync(path.join(__dirname, 'package-lock.json'));
  }

  // Write new package.json
  console.log('Writing new package.json with compatible versions...');
  fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2));

  // Install dependencies
  console.log('Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Build the project
  console.log('Building the project...');
  execSync('npm run build', { stdio: 'inherit' });

  // Start the client
  console.log('Starting the client...');
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  console.error('Error during reset:', error);
} 