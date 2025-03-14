import React from 'react';

/**
 * A minimal React component to test if basic rendering works
 */
const BasicApp: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '800px', 
      margin: '40px auto',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ color: '#3498db' }}>Intelligence RAG - Basic Test</h1>
      <p>This is a minimal React component to test if basic rendering works.</p>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '4px',
        marginTop: '20px' 
      }}>
        <h2 style={{ color: '#2c3e50' }}>If you can see this, React is working!</h2>
        <p>The issue might be with:</p>
        <ul>
          <li>Material UI Theme configuration</li>
          <li>React Router setup</li>
          <li>Component dependencies</li>
        </ul>
      </div>
    </div>
  );
};

export default BasicApp; 