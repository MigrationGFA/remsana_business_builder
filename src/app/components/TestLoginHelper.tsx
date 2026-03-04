import { useNavigate } from 'react-router-dom';
import { Button } from './remsana';

// Development helper component - shows test login buttons
// SECURITY: This component is ONLY for development. Never use in production!
export function TestLoginHelper() {
  const navigate = useNavigate();

  const handleQuickLogin = (email: string, password: string) => {
    // DISABLED: Direct localStorage manipulation bypasses authentication
    console.warn('⚠️ TestLoginHelper: Direct login is disabled. Please use proper authentication.');
    navigate('/login');
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
          onClick={() => navigate('/login')}
          style={{ fontSize: '12px' }}
        >
          Go to Login Page
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/signup')}
          style={{ fontSize: '12px' }}
        >
          Go to Sign Up Page
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => console.log('Backend URL:', import.meta.env.VITE_API_BASE_URL || 'NOT SET')}
          style={{ fontSize: '12px' }}
        >
          Check Backend Config
        </Button>
      </div>
      <p style={{ fontSize: '10px', color: '#6B7C7C', marginTop: '8px', marginBottom: 0 }}>
        Development mode only
      </p>
    </div>
  );
}
