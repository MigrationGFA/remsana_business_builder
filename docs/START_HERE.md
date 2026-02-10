# 🚀 START HERE - Run Your Server

## Quick Start (Copy & Paste This)

```bash
cd /Users/apple/Desktop/Projects/REMSANA-Business-Builder-1
./run-server.sh
```

**Then open:** http://localhost:5173

---

## What This Does

1. ✅ Stops any existing container (if running)
2. ✅ Starts a new Docker container with Node.js
3. ✅ Installs all npm dependencies
4. ✅ Starts the Vite development server
5. ✅ Makes it available at http://localhost:5173

---

## Manual Command (If Script Doesn't Work)

Copy and paste this entire command:

```bash
cd /Users/apple/Desktop/Projects/REMSANA-Business-Builder-1 && docker run --rm -d --name remsana-dev -p 5173:5173 -v "$(pwd)":/app -w /app node:18-alpine sh -c "npm install && npm run dev -- --host 0.0.0.0 --port 5173"
```

---

## After Starting

**Wait 30-60 seconds** for dependencies to install, then:

1. Open your browser
2. Go to: **http://localhost:5173**
3. You should see the Remsana interface!

---

## Check If Server Is Running

```bash
docker ps | grep remsana-dev
```

If you see output, the container is running!

---

## View Server Logs

```bash
docker logs -f remsana-dev
```

You should see something like:
```
VITE v6.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## Stop the Server

```bash
docker stop remsana-dev
```

---

## Troubleshooting

### "No such container" error
→ This is normal if you haven't started it yet. Just run `./run-server.sh`

### "Permission denied" error  
→ Make sure Docker Desktop is running (check menu bar)

### Port 5173 already in use
→ Stop existing container: `docker stop remsana-dev`

### Server not loading
→ Check logs: `docker logs remsana-dev`
→ Make sure you wait 30-60 seconds after starting

---

**Ready? Run:** `./run-server.sh` 🚀
