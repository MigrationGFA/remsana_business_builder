const axios = require('axios');
const https = require('https');
const BASE = 'https://rbbphpremsana-test.azurewebsites.net/api/v1';
const EMAIL = 'feuffeimulleidda-8021@yopmail.com';
const PASS = 'Tolubolu123$';

// Bypass local DNS failure by using direct IP + Host header
const agent = new https.Agent({ rejectUnauthorized: false });
const client = axios.create({
  baseURL: 'https://20.50.2.69/api/v1',
  headers: { 'Host': 'rbbphpremsana-test.azurewebsites.net' },
  httpsAgent: agent,
  timeout: 15000,
});

async function test() {
  console.log('=== REMSANA API ENDPOINT AUDIT ===');
  console.log('Base:', BASE);
  console.log('');

  // 1. Login
  console.log('--- 1. POST /auth/login ---');
  let token = '';
  let mfaRequired = false;
  try {
    const r = await client.post('/auth/login', { email: EMAIL, password: PASS });
    const d = r.data?.data ?? r.data;
    console.log('Status:', r.status);
    if (d?.mfa_required) {
      console.log('MFA Required: true');
      console.log('challenge_token:', d.challenge_token ? d.challenge_token.substring(0,30)+'...' : 'MISSING');
      mfaRequired = true;
    } else {
      token = d?.access_token || d?.token || '';
      console.log('Token:', token ? token.substring(0,30)+'...' : 'MISSING');
    }
  } catch(e) {
    console.log('ERR:', e.response?.status, e.response?.data?.message || e.message);
  }

  if (mfaRequired) {
    console.log('');
    console.log('*** MFA account - registering fresh account for testing ***');
    console.log('');
  }

  // 2. Register fresh account to get a token
  console.log('--- 2. POST /auth/register ---');
  try {
    const r = await client.post('/auth/register', {
      email: 'test-audit-' + Date.now() + '@yopmail.com',
      password: 'Test1234$',
      full_name: 'Audit Test'
    });
    const d = r.data?.data ?? r.data;
    console.log('Status:', r.status);
    token = d?.access_token || d?.token || '';
    console.log('Token:', token ? token.substring(0,30)+'...' : 'MISSING');
    if (d?.user) console.log('User:', JSON.stringify(d.user).substring(0,120));
  } catch(e) {
    console.log('ERR:', e.response?.status, e.response?.data?.message || e.message);
  }

  if (!token) {
    console.log('');
    console.log('*** No token available - cannot test authenticated endpoints ***');
    return;
  }

  const auth = { headers: { Authorization: 'Bearer ' + token } };
  console.log('');
  console.log('=== AUTHENTICATED ENDPOINTS ===');
  console.log('');

  const endpoints = [
    // Auth
    { m: 'GET',  p: '/auth/me' },
    { m: 'POST', p: '/auth/mfa/setup' },
    // Dashboard
    { m: 'GET',  p: '/dashboard' },
    { m: 'GET',  p: '/dashboard/stats' },
    { m: 'GET',  p: '/dashboard/notifications' },
    // Onboarding
    { m: 'GET',  p: '/onboarding/status' },
    { m: 'GET',  p: '/onboarding/steps' },
    // Learning
    { m: 'GET',  p: '/learning/programmes' },
    { m: 'GET',  p: '/learning/programmes/100DAY_SME' },
    { m: 'GET',  p: '/learning/progress/me' },
    // Loans
    { m: 'GET',  p: '/loans/eligibility' },
    { m: 'GET',  p: '/loans/offers' },
    { m: 'GET',  p: '/loans/status' },
    // Navbar / User
    { m: 'GET',  p: '/user/profile' },
    { m: 'GET',  p: '/notifications' },
    // Insider
    { m: 'GET',  p: '/insider/feed' },
    { m: 'GET',  p: '/insider/categories' },
  ];

  for (const ep of endpoints) {
    const label = ep.m + ' ' + ep.p;
    try {
      let r;
      if (ep.m === 'POST') {
        r = await client.post(ep.p, {}, auth);
      } else {
        r = await client.get(ep.p, auth);
      }
      const body = JSON.stringify(r.data).substring(0, 150);
      console.log('\u2705', r.status, label, '-', body);
    } catch(e) {
      const status = e.response?.status || 'NETWORK';
      const msg = e.response?.data?.message || e.message || '';
      console.log('\u274C', status, label, '-', String(msg).substring(0, 120));
    }
  }

  // Test specific lesson endpoints
  console.log('');
  console.log('--- Learning Lesson Details & Actions ---');
  try {
    const prog = await client.get('/learning/programmes/100DAY_SME', auth);
    const pd = prog.data?.data ?? prog.data;
    const modules = pd?.modules || pd?.programme?.modules || [];
    if (modules.length > 0 && modules[0].lessons?.length > 0) {
      const lesson = modules[0].lessons[0];
      const lessonId = lesson.id;
      console.log('First lesson ID:', lessonId);
      
      const lessonEndpoints = [
        { m: 'GET',  p: '/learning/lessons/' + lessonId },
        { m: 'POST', p: '/learning/lessons/' + lessonId + '/view' },
        { m: 'POST', p: '/learning/lessons/' + lessonId + '/video-progress', body: { progress_sec: 10 } },
        { m: 'POST', p: '/learning/lessons/' + lessonId + '/complete' },
      ];
      
      for (const ep of lessonEndpoints) {
        const label = ep.m + ' ' + ep.p;
        try {
          let r;
          if (ep.m === 'POST') {
            r = await client.post(ep.p, ep.body || {}, auth);
          } else {
            r = await client.get(ep.p, auth);
          }
          console.log('\u2705', r.status, label);
        } catch(e) {
          console.log('\u274C', e.response?.status || 'NET', label, '-', (e.response?.data?.message || e.message || '').substring(0, 100));
        }
      }

      // Quiz endpoints
      if (lesson.quiz_id || lesson.has_quiz) {
        const quizId = lesson.quiz_id;
        console.log('Quiz ID:', quizId);
        if (quizId) {
          try {
            const qr = await client.post('/learning/quizzes/' + quizId + '/attempt', { answers: [] }, auth);
            console.log('\u2705', qr.status, 'POST /learning/quizzes/' + quizId + '/attempt');
          } catch(e) {
            console.log('\u274C', e.response?.status || 'NET', 'POST /learning/quizzes/' + quizId + '/attempt', '-', (e.response?.data?.message || e.message || '').substring(0, 100));
          }
        }
      }
    }
  } catch(e) {
    console.log('Could not get programme:', e.response?.status, e.response?.data?.message || e.message);
  }

  // Test Forgot Password
  console.log('');
  console.log('--- Auth Extra ---');
  try {
    const r = await client.post('/auth/forgot-password', { email: 'test@yopmail.com' });
    console.log('\u2705', r.status, 'POST /auth/forgot-password');
  } catch(e) {
    console.log('\u274C', e.response?.status || 'NET', 'POST /auth/forgot-password', '-', (e.response?.data?.message || e.message || '').substring(0, 100));
  }

  // Test engagement API
  console.log('');
  console.log('--- Engagement API (Node.js backend) ---');
  const ENG_BASE = 'https://rbbnodejsremsana-test.azurewebsites.net';
  const engEndpoints = [
    { m: 'GET', p: '/health' },
    { m: 'GET', p: '/api/v1/status' },
  ];
  for (const ep of engEndpoints) {
    try {
      const r = await axios.get(ENG_BASE + ep.p, { timeout: 10000 });
      console.log('\u2705', r.status, ep.m, ep.p, '-', JSON.stringify(r.data).substring(0, 100));
    } catch(e) {
      console.log('\u274C', e.response?.status || 'NET', ep.m, ep.p, '-', (e.response?.data?.message || e.message || '').substring(0, 80));
    }
  }

  console.log('');
  console.log('=== AUDIT COMPLETE ===');
}

test().catch(e => console.error('Fatal:', e.message));
