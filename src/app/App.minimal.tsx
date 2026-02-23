// Minimal version for testing - use this if main App.tsx has errors
import React from 'react';


export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f0fa',
      padding: '40px',
      fontFamily: 'system-ui'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#1C1C8B', fontSize: '32px', marginBottom: '20px' }}>
          ✅ Remsana App
        </h1>
        <p style={{ color: '#1F2121', fontSize: '16px', marginBottom: '10px' }}>
          If you see this, React is working!
        </p>
        <p style={{ color: '#6B7C7C', fontSize: '14px', marginBottom: '20px' }}>
          This is a minimal test version. Check browser console (F12) for errors.
        </p>
        <div style={{
          padding: '20px',
          backgroundColor: '#f3f0fa',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <p style={{ fontSize: '12px', color: '#6B7C7C', margin: 0 }}>
            <strong>Next steps:</strong><br/>
            1. Open browser console (F12)<br/>
            2. Check for errors<br/>
            3. Verify react-router-dom is installed<br/>
            4. Check Docker logs: docker logs remsana-dev
          </p>
        </div>
      </div>
    </div>
  );
}
