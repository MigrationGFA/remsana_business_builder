import axios from 'axios';

const TOKEN = process.env.TOKEN || 'PASTE_YOUR_TOKEN_HERE';
const BASE = 'https://rbbphpremsana.azurewebsites.net/api/v1';

const results = { pass: [], fail: [] };

async function test(method, path, body = null) {
  const url = BASE + path;
  const label = `${method.toUpperCase()} ${path}`;
  try {
    const config = { method, url, headers: { Authorization: 'Bearer ' + TOKEN } };
    if (body) config.data = body;
    const res = await axios(config);
    results.pass.push({ label, status: res.status });
    console.log(`  ✅ ${label} → ${res.status}`);
  } catch (err) {
    const status = err.response?.status || 'NETWORK_ERROR';
    results.fail.push({ label, status });
    console.log(`  ❌ ${label} → ${status}`);
  }
}

async function run() {
  console.log('🔑 Token:', TOKEN.substring(0, 30) + '...\n');

  // ── AUTH ──
  console.log('── AUTH ──');
  // Skipping register, login (would create accounts / need credentials)
  // await test('post', '/auth/register', { email: 'test@test.com', password: 'Test1234!' });
  await test('post', '/auth/forgot-password', { email: 'test-no-exist@test.com' });
  await test('post', '/auth/mfa/setup');
  // Skipping mfa/verify-setup, mfa/challenge, mfa/disable (need actual codes)

  // ── USER PROFILE ──
  console.log('\n── USER PROFILE ──');
  await test('get', '/users/me');
  await test('put', '/users/me', { full_name: 'lashe test3', phone_number: '+2349599000039' });

  // ── SUBSCRIPTIONS ──
  console.log('\n── SUBSCRIPTIONS ──');
  await test('get', '/subscriptions/me');
  await test('post', '/subscriptions/upgrade', { tier: 'pro' });
  await test('post', '/subscriptions/cancel', { reason: 'test cancel' });

  // ── ONBOARDING ──
  console.log('\n── ONBOARDING ──');
  await test('get', '/onboarding');
  // Skipping PUT/POST onboarding to avoid overwriting real data

  // ── DASHBOARD ──
  console.log('\n── DASHBOARD ──');
  await test('get', '/dashboard/me');

  // ── LEARNING ──
  console.log('\n── LEARNING ──');
  await test('get', '/learning/programmes/100DAY_SME');
  await test('get', '/learning/progress/me');
  await test('get', '/learning/certificates');
  // Test with a fake lesson ID (will either 404 or return "not found")
  await test('get', '/learning/lessons/test-lesson-id');

  // ── LOANS ──
  console.log('\n── LOANS ──');
  await test('get', '/loans/me');
  await test('get', '/loans/offers');
  await test('post', '/loans/eligibility', { nin: '00000000000', monthlyIncome: '100000', employmentType: 'employed' });

  // ── CAC / BUSINESS REGISTRATION ──
  console.log('\n── CAC / BUSINESS REGISTRATION ──');
  await test('get', '/cac/business-name/me');
  await test('get', '/cac/business-name/approved-objects');

  // ── INSIDER ADMIN ──
  console.log('\n── INSIDER ADMIN ──');
  await test('get', '/insider/admin/dashboard/summary');
  await test('get', '/insider/admin/system/health');
  await test('get', '/insider/admin/users?page=1&limit=5');
  await test('get', '/insider/admin/audit-logs?limit=5');
  await test('get', '/insider/admin/alerts');
  await test('get', '/insider/admin/finances/summary');
  await test('get', '/insider/admin/transactions?page=1&limit=5');
  await test('get', '/insider/admin/cac/registrations?page=1&limit=5');
  await test('get', '/insider/admin/content/videos?page=1&limit=5');

  // ── INSIDER ANALYST ──
  console.log('\n── INSIDER ANALYST ──');
  await test('get', '/insider/analyst/metrics/summary');
  await test('get', '/insider/analyst/learning/summary');
  await test('get', '/insider/analyst/users/total');
  await test('get', '/insider/analyst/users/active');
  await test('get', '/insider/analyst/revenue/mrr');
  await test('get', '/insider/analyst/revenue/arpu');
  await test('get', '/insider/analyst/churn/rate');
  await test('get', '/insider/analyst/cohorts?page=1&limit=5');
  await test('get', '/insider/analyst/retention/funnel');
  await test('get', '/insider/analyst/registration/funnel');

  // ── SUMMARY ──
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 RESULTS: ${results.pass.length} passed, ${results.fail.length} failed\n`);

  if (results.pass.length > 0) {
    console.log('✅ WORKING ENDPOINTS:');
    results.pass.forEach(r => console.log(`   ${r.status} ${r.label}`));
  }

  if (results.fail.length > 0) {
    console.log('\n❌ FAILING ENDPOINTS:');
    results.fail.forEach(r => console.log(`   ${r.status} ${r.label}`));
  }

  console.log('\n' + '='.repeat(60));
  console.log('Note: Engagement API endpoints (chat, tickets) use a separate');
  console.log('server (VITE_ENGAGEMENT_API_URL) and are not tested here.');
  console.log('='.repeat(60));
}

run();
