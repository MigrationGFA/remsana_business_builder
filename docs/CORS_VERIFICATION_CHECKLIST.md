# CORS Fix Verification Checklist

Use this checklist to verify the CORS fix has been implemented correctly.

---

## ✅ Implementation Checklist

### Before Deployment

- [ ] Created file: `app/Filters/Cors.php`
- [ ] Added allowed origin: `https://businessbuilder-test.azurewebsites.net`
- [ ] Added dev origins: `http://localhost:5174` and `http://localhost:5173`
- [ ] Registered `'cors'` in `app/Config/Filters.php` aliases
- [ ] Added `'cors'` to `$globals['before']` array
- [ ] Handles OPTIONS preflight requests (returns 200)
- [ ] Committed changes to git
- [ ] Pushed to deployment branch

---

## ✅ Post-Deployment Tests

### Test 1: OPTIONS Preflight Request
```bash
curl -X OPTIONS https://rbbphpremsana-test.azurewebsites.net/api/v1/auth/login \
  -H "Origin: https://businessbuilder-test.azurewebsites.net" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  -v
```

**Expected:** Should see these headers in response:
- [ ] `Access-Control-Allow-Origin: https://businessbuilder-test.azurewebsites.net`
- [ ] `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- [ ] `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Api-Key`
- [ ] HTTP Status: 200 OK

---

### Test 2: Actual API Request
```bash
curl -X POST https://rbbphpremsana-test.azurewebsites.net/api/v1/auth/login \
  -H "Origin: https://businessbuilder-test.azurewebsites.net" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' \
  -v
```

**Expected:** Should see CORS header in response:
- [ ] `Access-Control-Allow-Origin: https://businessbuilder-test.azurewebsites.net`
- [ ] Response body (even if error - proves CORS works)

---

### Test 3: Browser Console Test

1. Open: `https://businessbuilder-test.azurewebsites.net`
2. Open Developer Tools (F12) → Console tab
3. Paste and run:

```javascript
fetch('https://rbbphpremsana-test.azurewebsites.net/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@test.com', password: 'test123' })
})
.then(r => console.log('✅ CORS Working! Status:', r.status))
.catch(e => console.error('❌ CORS Still Broken:', e));
```

**Expected:**
- [ ] Console shows: `✅ CORS Working! Status: [some number]`
- [ ] NO CORS error message
- [ ] Network tab shows response (even 401 is OK)

---

### Test 4: Frontend Application Test

1. Navigate to: `https://businessbuilder-test.azurewebsites.net/login`
2. Try to login with any credentials
3. Open Network tab (F12 → Network)
4. Look at the login request

**Expected:**
- [ ] Request shows in Network tab
- [ ] Response Headers include `Access-Control-Allow-Origin`
- [ ] NO red CORS error
- [ ] Either success or 401 error (both mean CORS works!)

**If login fails with 401:**
- [ ] This is OK! It means CORS is working, just credentials are wrong
- [ ] Frontend can now communicate with backend ✅

---

## ✅ Endpoint Coverage

Verify CORS works on all endpoints:

- [ ] `/api/v1/auth/login` (POST)
- [ ] `/api/v1/auth/register` (POST)
- [ ] `/api/v1/auth/logout` (POST)
- [ ] `/api/v1/auth/forgot-password` (POST)
- [ ] `/api/v1/auth/reset-password` (POST)
- [ ] `/api/v1/auth/mfa/setup` (POST)
- [ ] `/api/v1/auth/mfa/challenge` (POST)

**Pro Tip:** Test at least 2-3 different endpoints to ensure global filter works.

---

## ✅ Development Environment Test

Test that localhost also works:

1. Frontend: `http://localhost:5174`
2. Try login from local dev environment

**Expected:**
- [ ] No CORS errors in local development
- [ ] API requests reach backend
- [ ] Responses received successfully

---

## 🔍 Common Issues

### Issue: "Still seeing CORS error"

**Check:**
- [ ] Backend deployment completed successfully?
- [ ] Filter registered in correct position (before other filters)?
- [ ] Origin exactly matches (case-sensitive, no trailing slash)?
- [ ] Clear browser cache (Ctrl+Shift+Delete)?
- [ ] Hard refresh (Ctrl+F5)?

**Debug:**
```bash
# Check if filter file exists on server
ssh your-server
cat app/Filters/Cors.php

# Check if changes are deployed
git log -1
```

---

### Issue: "Works in Postman but not browser"

**Explanation:** Postman doesn't enforce CORS. Only browsers do.

**Check:**
- [ ] OPTIONS request handling implemented?
- [ ] Returns HTTP 200 for OPTIONS?
- [ ] Browser console shows OPTIONS request in Network tab?

---

### Issue: "GET works but POST fails"

**Check:**
- [ ] POST is in `Access-Control-Allow-Methods`?
- [ ] OPTIONS preflight returns 200?
- [ ] Content-Type in `Access-Control-Allow-Headers`?

---

### Issue: "Authorization header not sent"

**Check:**
- [ ] `Authorization` in `Access-Control-Allow-Headers`?
- [ ] `Access-Control-Allow-Credentials: true` set?
- [ ] Frontend sending credentials in fetch options?

---

## ✅ Performance Check

After fix is working, verify:

- [ ] API response times normal (< 500ms average)?
- [ ] No extra OPTIONS requests on every single call?
  - (`Access-Control-Max-Age: 86400` should cache for 24h)
- [ ] Server logs don't show errors related to CORS?

---

## 📝 Sign-Off

When all tests pass:

**Backend Developer:** _________________ Date: _________

**Frontend Developer:** _________________ Date: _________

**Verified in Production:** YES / NO

**Any Issues Found:** ____________________________________

**Notes:** 
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

## 📞 Next Steps After Verification

Once all checkboxes are checked:

1. ✅ Notify frontend team
2. ✅ Update documentation with CORS configuration
3. ✅ Test all frontend features (login, signup, etc.)
4. ✅ Monitor server logs for any CORS-related issues
5. ✅ Consider adding production domain when ready

---

**Document Version:** 1.0  
**Last Updated:** March 4, 2026  
**Next Review:** After production deployment
