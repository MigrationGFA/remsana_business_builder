import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TEST_CREDENTIALS } from '../utils/testData';
import { Button } from './remsana';

// Development helper component - shows test login buttons
export function TestLoginHelper() {
  const navigate = useNavigate();

  const handleQuickLogin = (email: string, password: string) => {
    localStorage.setItem('remsana_user', JSON.stringify({
      email,
      name: email.split('@')[0],
    }));
    localStorage.setItem('remsana_auth_token', 'test_token_' + Date.now());
    navigate('/dashboard');
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      maxWidth: '300px',
      border: '2px solid #1C1C8B',
    }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#1F2121' }}>
        🧪 Test Login Helper
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleQuickLogin(TEST_CREDENTIALS.admin.email, TEST_CREDENTIALS.admin.password)}
          style={{ fontSize: '12px' }}
        >
          Login as Test User
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleQuickLogin(TEST_CREDENTIALS.smeOwner.email, TEST_CREDENTIALS.smeOwner.password)}
          style={{ fontSize: '12px' }}
        >
          Login as SME Owner
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleQuickLogin(TEST_CREDENTIALS.demo.email, TEST_CREDENTIALS.demo.password)}
          style={{ fontSize: '12px' }}
        >
          Login as Demo User
        </Button>
      </div>
      <p style={{ fontSize: '10px', color: '#6B7C7C', marginTop: '8px', marginBottom: 0 }}>
        Development mode only
      </p>
    </div>
  );
}
