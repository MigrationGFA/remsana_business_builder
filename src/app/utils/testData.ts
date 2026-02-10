// Test data for development and testing

export const TEST_CREDENTIALS = {
  admin: {
    email: 'test@remsana.com',
    password: 'Test1234!',
    name: 'Test User',
    phone: '+2348012345678',
  },
  smeOwner: {
    email: 'smeowner@business.ng',
    password: 'Business2026!',
    name: 'SME Owner',
    phone: '+2348023456789',
  },
  demo: {
    email: 'demo@remsana.com',
    password: 'Demo1234!',
    name: 'Demo User',
    phone: '+2348034567890',
  },
};

export const TEST_BUSINESS_DATA = {
  businessName: 'Test Business Enterprises Ltd',
  tradingName: 'TBE',
  businessType: 'limited',
  businessPhone: '+2348012345678',
  businessEmail: 'info@testbusiness.ng',
  businessAddress: '123 Test Street, Victoria Island',
  lga: 'lagos-island',
  state: 'Lagos',
  industry: 'Technology & IT',
  revenue: '10m_100m',
  employees: '6-20',
  goals: ['Increase revenue', 'Digitalize operations', 'Improve customer experience'],
};

// Quick login helper for testing
export const quickLogin = (email: string, password: string) => {
  const credential = Object.values(TEST_CREDENTIALS).find(
    (cred) => cred.email === email && cred.password === password
  );
  
  if (credential) {
    localStorage.setItem('remsana_user', JSON.stringify({
      email: credential.email,
      name: credential.name,
      phone: credential.phone,
    }));
    localStorage.setItem('remsana_auth_token', 'test_token_' + Date.now());
    return true;
  }
  return false;
};
