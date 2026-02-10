# 🚀 Quick Start - Run Server in Browser

## You don't have npm installed, so we'll use Docker!

### Step 1: Make sure Docker Desktop is running
- Open **Docker Desktop** from your Applications folder
- Wait until you see the Docker icon in your menu bar (top right)
- The icon should be green/active when ready

### Step 2: Run this command in your terminal:

```bash
cd /Users/apple/Desktop/Projects/REMSANA-Business-Builder-1
./start.sh
```

**OR** copy and paste this single command:

```bash
docker run --rm -d --name remsana-dev -p 5173:5173 -v "$PWD":/app -w /app node:18-alpine sh -c "cd /Users/apple/Desktop/Projects/REMSANA-Business-Builder-1 && npm install && npm run dev -- --host 0.0.0.0 --port 5173"
```

### Step 3: Open your browser
Go to: **http://localhost:5173**

---

## If you get "permission denied" error:

1. **Make sure Docker Desktop is running** (check Applications or menu bar)
2. **Grant Docker permissions** if macOS asks
3. Try running the command again

---

## To stop the server:
```bash
docker stop remsana-dev
```

## To see what's happening:
```bash
docker logs -f remsana-dev
```

---

## Troubleshooting

### "Cannot connect to Docker daemon"
→ Docker Desktop is not running. Open it from Applications.

### "Port 5173 already in use"
→ Stop the existing container: `docker stop remsana-dev`

### Still having issues?
Run this to check Docker:
```bash
docker ps
```

If that works, then try the start command again!
