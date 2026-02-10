import React from 'react';

// Minimal test version to check if React is working
export default function AppTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f3f0fa', minHeight: '100vh' }}>
      <h1 style={{ color: '#1C1C8B', fontSize: '32px' }}>✅ React is Working!</h1>
      <p style={{ color: '#1F2121', fontSize: '16px' }}>If you see this, React is rendering correctly.</p>
      <p style={{ color: '#6B7C7C', fontSize: '14px' }}>Check browser console (F12) for any errors.</p>
    </div>
  );
}
