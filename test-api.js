import axios from 'axios';

// === PASTE YOUR FULL TOKEN HERE (from browser console: localStorage.getItem('remsana_auth_token')) ===
const TOKEN = process.env.TOKEN || 'PASTE_YOUR_TOKEN_HERE';

const BASE = 'https://rbbphpremsana.azurewebsites.net/api/v1';

async function test(method, path) {
  const url = BASE + path;
  console.log(`\nTesting: ${method.toUpperCase()} ${path}`);
  try {
    const res = await axios({ method, url, headers: { Authorization: 'Bearer ' + TOKEN } });
    console.log(`✅ ${res.status} OK`);
    // Only print first 200 chars of response to keep output short
    const str = JSON.stringify(res.data);
    console.log('Response:', str.length > 200 ? str.substring(0, 200) + '...' : str);
  } catch (err) {
    console.log(`❌ ${err.response?.status || 'NO RESPONSE'}`);
    const str = JSON.stringify(err.response?.data);
    // Only show short error, not full PHP stack trace
    if (str && str.length > 300) {
      console.log('Error: Server returned a long error page (likely PHP exception/500)');
    } else {
      console.log('Error:', str);
    }
  }
}

async function run() {
  console.log('Token:', TOKEN.substring(0, 30) + '...');

  await test('get', '/learning/progress/me');
  await test('get', '/users/me');
  await test('get', '/learning/programmes');

  console.log('\nDone!');
}

run();
