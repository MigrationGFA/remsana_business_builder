// Temporary version without router to test if react-router-dom is the issue
import React, { useState, useEffect } from 'react';

function SplashScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Show completion message instead of navigating
          return 100;
        }
        return prev + 5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      color: 'white',
      position: 'relative'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '16px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#f3f0fa',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px'
        }}>
          🚀
        </div>
      </div>

      <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: 600 }}>
        REMSANA
      </h1>
      <p style={{ fontSize: '18px', marginBottom: '32px', textAlign: 'center', opacity: 0.9 }}>
        Build Your Business<br/>Level Up Your Skills
      </p>

      <div style={{
        width: '300px',
        height: '8px',
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '12px'
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          backgroundColor: 'white',
          transition: 'width 0.3s ease',
          borderRadius: '4px'
        }}></div>
      </div>
      <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '40px' }}>
        Loading... {progress}%
      </p>

      {progress >= 100 && (
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '400px',
          textAlign: 'center',
          marginTop: '20px'
        }}>
          <p style={{ fontSize: '14px', marginBottom: '10px', fontWeight: 500 }}>
            ✅ App Loaded Successfully!
          </p>
          <p style={{ fontSize: '12px', opacity: 0.9 }}>
            To enable full navigation, install react-router-dom:<br/>
            <code style={{ 
              backgroundColor: 'rgba(0,0,0,0.2)', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontSize: '11px',
              display: 'inline-block',
              marginTop: '8px'
            }}>
              docker exec remsana-dev npm install react-router-dom
            </code>
          </p>
        </div>
      )}

      <p style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        fontSize: '12px',
        opacity: 0.6
      }}>
        v1.0.0
      </p>
    </div>
  );
}

export default function App() {
  return <SplashScreen />;
}
