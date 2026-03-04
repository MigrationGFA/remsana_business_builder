# 🚀 Deployment Guide - Backend URL Configuration

## The Problem

Your backend is deployed separately from the frontend. The frontend needs to know where to find the backend API.

**Backend URL:** `https://rbbphpremsana-test.azurewebsites.net`  
**API Path:** `/api/v1`

---

## How It Works

### **Development** ✅
- Frontend runs on `http://localhost:5174`
- `.env` file has: `VITE_API_BASE_URL=/api/v1` (relative path)
- Vite proxy forwards `/api` → backend domain
- **Result:** API calls work!

### **Production** ❌ (Without Fix)
- Frontend deployed to Azure/Vercel/etc
- API calls to `/api/v1` (relative path)
- Browser looks for `/api/v1` on the FRONTEND domain
- **Result:** 404 Not Found!

### **Production** ✅ (With Fix)
- Frontend deployed to Azure/Vercel/etc
- `.env.production` has: `VITE_API_BASE_URL=https://rbbphpremsana-test.azurewebsites.net/api/v1`
- API calls go directly to backend
- **Result:** API calls work!

---

## Configuration Files

### **1. `.env` (Development)**
```env
# Relative path - Vite proxy handles routing
VITE_API_BASE_URL=/api/v1
```

### **2. `.env.production` (Production)**
```env
# Full URL - Direct backend connection
VITE_API_BASE_URL=https://rbbphpremsana-test.azurewebsites.net/api/v1
```

### **3. `vite.config.ts` (Development Proxy)**
```typescript
export default defineConfig({
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'https://rbbphpremsana-test.azurewebsites.net',
        changeOrigin: true,
      }
    }
  }
})
```

---

## Deployment Steps

### **Option A: Azure Static Web Apps**

**1. Configure Environment Variable**
```bash
# In Azure Portal → Static Web App → Configuration
# Add application setting:
Name: VITE_API_BASE_URL
Value: https://rbbphpremsana-test.azurewebsites.net/api/v1
```

**2. Build Command**
```bash
npm run build
```

**3. Azure will automatically use the environment variable**

---

### **Option B: Vercel**

**1. Add Environment Variable**
```bash
# In Vercel Dashboard → Project → Settings → Environment Variables
Name: VITE_API_BASE_URL
Value: https://rbbphpremsana-test.azurewebsites.net/api/v1
Environment: Production
```

**2. Deploy**
```bash
vercel --prod
```

---

### **Option C: Netlify**

**1. Add Environment Variable**
```bash
# In Netlify Dashboard → Site Settings → Environment Variables
Key: VITE_API_BASE_URL
Value: https://rbbphpremsana-test.azurewebsites.net/api/v1
```

**2. Build Settings**
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
```

---

### **Option D: Manual Build**

**1. Create `.env.production` file** (already done!)

**2. Build**
```bash
npm run build
```

**3. Upload `dist` folder to hosting**

---

## Testing the Fix

### **Test in Development**
```bash
npm run dev
# Should see in console:
# 🔧 API Configuration: { baseURL: "/api/v1", mode: "development" }
```

### **Test Production Build Locally**
```bash
# Build with production env
npm run build

# Preview production build
npm run preview

# Test login/signup - should work!
```

### **Common Issues**

#### **Issue 1: CORS Errors**
```
Error: Access-Control-Allow-Origin blocked
```

**Solution:** Backend must allow your frontend domain
```php
// Backend CORS configuration
header('Access-Control-Allow-Origin: https://your-frontend.azurestaticapps.net');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

#### **Issue 2: 404 on API Calls**
```
Error: Request failed with status code 404
```

**Solution:** Check that VITE_API_BASE_URL has the FULL URL in production:
```bash
# Check in browser console:
console.log(import.meta.env.VITE_API_BASE_URL);
# Should show: "https://rbbphpremsana-test.azurewebsites.net/api/v1"
# NOT: "/api/v1"
```

#### **Issue 3: Environment Variable Not Applied**
```bash
# Rebuild the app - environment variables are baked into build
npm run build

# Clear browser cache
# Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
```

---

## Security Notes

### **✅ Safe in Production**
- Backend URL is public (visible in network requests anyway)
- No credentials in environment variables
- API endpoints protected by authentication

### **❌ Never Put These in .env Files**
- Database credentials
- API keys/secrets
- User passwords
- JWT signing keys

These belong in the **backend** environment variables, not frontend!

---

## Quick Verification

After deployment, open browser console and check:
```javascript
// Verify API configuration
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

// Expected in production:
// "https://rbbphpremsana-test.azurewebsites.net/api/v1"

// Expected in development:  
// "/api/v1"
```

---

## Need Different Environments?

### **Staging Environment**
Create `.env.staging`:
```env
VITE_API_BASE_URL=https://rbbphpremsana-staging.azurewebsites.net/api/v1
```

Build for staging:
```bash
npm run build -- --mode staging
```

### **Multiple Backends**
```env
# .env.production
VITE_API_BASE_URL=https://rbbphpremsana-test.azurewebsites.net/api/v1
VITE_ADMIN_API_URL=https://rbbphpremsana-test.azurewebsites.net/api/admin
```

---

## Checklist Before Production

- [ ] `.env.production` created with FULL backend URL
- [ ] Build command includes environment variables
- [ ] CORS configured on backend for frontend domain
- [ ] Test production build locally with `npm run preview`
- [ ] Verify API calls in browser Network tab
- [ ] Check console for "API Configuration" log
- [ ] Test login/signup flow
- [ ] Test protected routes redirect properly

---

## Support

If you still see issues after following this guide:

1. Check browser Network tab for actual URLs being called
2. Verify CORS headers in response
3. Check backend logs for incoming requests
4. Clear browser cache and rebuild app
5. Verify environment variable in deployment platform settings
