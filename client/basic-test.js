const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Path to the original index.tsx and the basic test version
const originalIndex = path.join(__dirname, 'src', 'index.tsx');
const basicIndex = path.join(__dirname, 'src', 'index-basic.tsx');
const tempBackupPath = path.join(__dirname, 'src', 'index.tsx.backup');

try {
  console.log('Creating backup of original index.tsx...');
  // Create a backup of the original index.tsx
  if (fs.existsSync(originalIndex)) {
    fs.copyFileSync(originalIndex, tempBackupPath);
  }

  console.log('Replacing index.tsx with basic test version...');
  // Copy the basic test version to index.tsx
  fs.copyFileSync(basicIndex, originalIndex);

  console.log('Starting webpack server with basic test configuration...');
  // Start the webpack server
  execSync('npm start', { stdio: 'inherit' });
} catch (error) {
  console.error('Error during basic test:', error);
} finally {
  console.log('Restoring original index.tsx...');
  // Restore the original index.tsx
  if (fs.existsSync(tempBackupPath)) {
    fs.copyFileSync(tempBackupPath, originalIndex);
    fs.unlinkSync(tempBackupPath);
  }
} 