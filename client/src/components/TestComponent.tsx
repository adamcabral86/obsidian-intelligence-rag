import React, { useState } from 'react';

const TestComponent: React.FC = () => {
  const [clicked, setClicked] = useState(false);
  
  return (
    <div style={{ padding: '20px', margin: '20px', background: '#f5f5f5', borderRadius: '5px' }}>
      <h2>Test Component</h2>
      <p>If you can see this component, React is rendering correctly.</p>
      <button 
        onClick={() => setClicked(true)}
        style={{
          padding: '10px 15px',
          background: '#3498db',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Click Me
      </button>
      {clicked && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#e8f8f5', borderRadius: '4px' }}>
          <p style={{ color: '#27ae60' }}>React state is working correctly!</p>
        </div>
      )}
    </div>
  );
};

export default TestComponent; 