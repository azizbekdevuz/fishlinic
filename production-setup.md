# 🚀 Production Setup for Semi-Exhibition

## Environment Variables Setup

Create a `.env.local` file in the root directory with:

```env
# Production Environment Variables for Semi-Exhibition
NODE_ENV=production

# Next.js App URLs
NEXT_PUBLIC_WS_URL=http://localhost:4000
NEXT_PUBLIC_CAM_URL=http://localhost:8080/video
NEXT_PUBLIC_ASSISTANT_URL=http://localhost:5000

# Mock Server Configuration
PORT=4000
DATA_DIR=../exhibition-data

# Ollama Configuration (for Virtual Assistant)
OLLAMA_URL=http://localhost:11434
ASSISTANT_MODEL=qwen2.5:3b

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=exhibition-secret-key-2024
```

## Production Build Commands

### 1. Build Next.js Application
```bash
npm run build
```

### 2. Start Production Services
```bash
# Terminal 1: Start Next.js in production mode
npm start

# Terminal 2: Start Mock Server
cd mock-server
npm start

# Terminal 3: Start Ollama (if not running as service)
# ollama serve
# Note: Virtual Assistant is now integrated into Next.js, no separate service needed
```

## Quick Production Start Script

Save this as `start-exhibition.bat` (Windows) or `start-exhibition.sh` (Linux/Mac):

### Windows (start-exhibition.bat):
```batch
@echo off
echo Starting Fishlinic Exhibition Demo...

echo Building Next.js application...
call npm run build

echo Starting services...
start "Next.js App" cmd /k "npm start"
start "Mock Server" cmd /k "cd mock-server && npm start"
echo Note: Ensure Ollama is running (ollama serve) for Virtual Assistant features

echo All services started! 
echo Dashboard: http://localhost:3000
echo Virtual Assistant: http://localhost:3000/vassistant
pause
```

### Linux/Mac (start-exhibition.sh):
```bash
#!/bin/bash
echo "Starting Fishlinic Exhibition Demo..."

echo "Building Next.js application..."
npm run build

echo "Starting services..."
gnome-terminal -- bash -c "npm start; exec bash" &
gnome-terminal -- bash -c "cd mock-server && npm start; exec bash" &
echo "Note: Ensure Ollama is running (ollama serve) for Virtual Assistant features"

echo "All services started!"
echo "Dashboard: http://localhost:3000"
echo "Virtual Assistant: http://localhost:3000/vassistant"
```

## Service Ports
- **Next.js Dashboard**: http://localhost:3000
- **Mock Telemetry Server**: http://localhost:4000
- **Ollama API**: http://localhost:11434 (for Virtual Assistant)
- **Camera Stream**: http://localhost:8080 (if available)

## Exhibition URLs
- **Main Dashboard**: http://localhost:3000/dashboard
- **Virtual Assistant**: http://localhost:3000/vassistant
- **Homepage**: http://localhost:3000

## Troubleshooting
- Ensure all ports (3000, 4000, 11434) are available
- Verify Ollama is running: `ollama serve` or check `http://localhost:11434`
- Ensure Ollama model is pulled: `ollama pull qwen2.5:3b` (or your configured model)
- Verify Node.js dependencies are installed
