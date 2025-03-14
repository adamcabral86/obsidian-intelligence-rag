import React from 'react';
import { createRoot } from 'react-dom/client';
import BasicApp from './BasicApp';

// Get the root element
const rootElement = document.getElementById('root');

// Make sure the element exists
if (!rootElement) {
  throw new Error('Root element not found');
}

// Create a root
const root = createRoot(rootElement);

// Render the basic app without any providers or complex components
root.render(
  <React.StrictMode>
    <BasicApp />
  </React.StrictMode>
); 