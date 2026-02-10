# Fix react-router-dom Installation

## Current Issue
The app shows a white page because `react-router-dom` is not installed in the Docker container.

## Solution

### Option 1: Install in Running Container (Quick Fix)
```bash
docker exec remsana-dev npm install react-router-dom
```
Wait 10 seconds, then refresh browser.

### Option 2: Restart Container (Recommended)
```bash
cd /Users/apple/Desktop/Projects/REMSANA-Business-Builder-1

# Stop and remove
docker stop remsana-dev
docker rm remsana-dev

# Start fresh - installs ALL dependencies
docker run --rm -d \
  --name remsana-dev \
  -p 5173:5173 \
  -v "$(pwd)":/app \
  -w /app \
  node:18-alpine \
  sh -c "npm install && npm run dev -- --host 0.0.0.0 --port 5173"
```

### Option 3: Watch Installation Progress
```bash
docker logs -f remsana-dev
```
Wait until you see:
- `added XXX packages` 
- `VITE v6.x.x ready`
- `Local: http://localhost:5173/`

## After Installation

1. **Change main.tsx back to use full App:**
   Edit `src/main.tsx` and change:
   ```tsx
   import App from "./app/App.no-router.tsx";
   ```
   Back to:
   ```tsx
   import App from "./app/App.tsx";
   ```

2. **Refresh browser** - should see Splash Screen

## Verify Installation

Check if react-router-dom is installed:
```bash
docker exec remsana-dev sh -c "ls node_modules/react-router-dom"
```

Should show directory contents, not "not found".

## Current Status

- ✅ App works WITHOUT router (test version)
- ⏳ Need to install react-router-dom for full app
- ✅ All pages are built and ready
