import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Simple test page
function TestPage() {
  return (
    <div style={{ padding: '40px', backgroundColor: '#f3f0fa', minHeight: '100vh' }}>
      <h1 style={{ color: '#1C1C8B', fontSize: '32px', marginBottom: '20px' }}>
        ✅ Remsana App is Loading!
      </h1>
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', maxWidth: '600px' }}>
        <p style={{ color: '#1F2121', fontSize: '16px', marginBottom: '10px' }}>
          React Router is working correctly.
        </p>
        <p style={{ color: '#6B7C7C', fontSize: '14px' }}>
          If you see this page, the basic setup is working. Check the browser console (F12) for any errors.
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TestPage />} />
        <Route path="*" element={<TestPage />} />
      </Routes>
    </Router>
  );
}

export default App;
