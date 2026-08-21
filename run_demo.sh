#!/usr/bin/env bash

# Guardra - Universal Launch Script
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

echo "=========================================================="
echo "🛡️  Launching Guardra Privacy Suite (Backend + Frontend)"
echo "=========================================================="

# Cleanup background processes on exit
cleanup() {
    echo ""
    echo "Shutting down Guardra services..."
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start FastAPI Backend
echo "🚀 Starting Guardra FastAPI Backend on http://localhost:8000 ..."
cd "$DIR/backend"
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 2

# 2. Start Vite Frontend
echo "✨ Starting Guardra React Web Dashboard on http://localhost:5173 ..."
cd "$DIR/frontend"
npm run dev -- --host &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "✅ Guardra Suite is live and running!"
echo "👉 Web Dashboard:    http://localhost:5173"
echo "👉 Backend API Docs: http://localhost:8000/docs"
echo "👉 Browser Extension: Open chrome://extensions -> Load Unpacked -> select $DIR/extension"
echo "=========================================================="
echo "Press Ctrl+C to stop all services."

wait
