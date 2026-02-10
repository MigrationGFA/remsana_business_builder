# 🚀 Quick Fix - Install react-router-dom

## Run This Command in Your Terminal:

```bash
cd /Users/apple/Desktop/Projects/REMSANA-Business-Builder-1
docker exec remsana-dev sh -c "cd /app && npm install react-router-dom@6.16.0"
```

**Wait 15-20 seconds**, then:

1. **Edit `src/main.tsx`** - Change line 7 from:
   ```tsx
   import App from "./app/App.no-router.tsx";
   ```
   To:
   ```tsx
   import App from "./app/App.tsx";
   ```

2. **Save the file**

3. **Refresh your browser** (F5 or Cmd+R)

## Alternative: Use the Script

```bash
cd /Users/apple/Desktop/Projects/REMSANA-Business-Builder-1
./install-router.sh
```

Then follow steps 1-3 above.

## Verify Installation

Check if it worked:
```bash
docker exec remsana-dev sh -c "ls node_modules/react-router-dom"
```

Should show directory contents (not "not found").

## If Still Not Working

Restart container completely:
```bash
cd /Users/apple/Desktop/Projects/REMSANA-Business-Builder-1
docker stop remsana-dev
docker rm remsana-dev
docker run --rm -d --name remsana-dev -p 5173:5173 -v "$(pwd)":/app -w /app node:18-alpine sh -c "npm install && npm run dev -- --host 0.0.0.0 --port 5173"
```

Then change `main.tsx` back to `App.tsx` and refresh.
