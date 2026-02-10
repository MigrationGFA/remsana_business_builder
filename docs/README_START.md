# 🚀 Quick Start Guide

## Starting the Development Server

### Option 1: Using Docker (Recommended)

**Prerequisites:**
1. Make sure Docker Desktop is **running** (check your Applications or menu bar)
2. Wait for Docker Desktop to fully start (you'll see a green icon when ready)

**Start the server:**
```bash
./start-server.sh
```

Then open your browser to: **http://localhost:5173**

**Stop the server:**
```bash
docker stop remsana-dev
```

**View logs:**
```bash
docker logs -f remsana-dev
```

---

### Option 2: Using Node.js (If installed)

If you have Node.js installed locally:

```bash
npm install
npm run dev
```

Then open your browser to: **http://localhost:5173**

---

### Option 3: Manual Docker Command

If the script doesn't work, try this directly:

```bash
docker run --rm -d \
  --name remsana-dev \
  -p 5173:5173 \
  -v "$PWD":/app \
  -w /app \
  node:18-alpine \
  sh -c "npm install && npm run dev -- --host 0.0.0.0 --port 5173"
```

---

## Troubleshooting

### "Docker is not running"
- Open Docker Desktop application
- Wait for it to fully start (green icon in menu bar)
- Try again

### "Permission denied" error
- Make sure Docker Desktop is running
- You may need to grant Docker permissions in System Settings

### Port 5173 already in use
- Stop the existing container: `docker stop remsana-dev`
- Or use a different port by modifying the script

### Server not loading
- Check logs: `docker logs remsana-dev`
- Make sure port 5173 is not blocked by firewall
- Try accessing `http://127.0.0.1:5173` instead of `localhost`

---

## What's Running?

The development server provides:
- **Hot Module Replacement (HMR)** - Changes reflect instantly
- **Fast Refresh** - React components update without losing state
- **Source Maps** - Easy debugging in browser DevTools

---

**Need help?** Check the logs with `docker logs remsana-dev`
