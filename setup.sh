#!/bin/bash

# Trinetra Setup Script
# Smart India Hackathon 2025

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          🚀 TRINETRA - AUTOMATED SETUP                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v18+"
    exit 1
fi
echo "✅ Node.js found: $(node -v)"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python not found. Please install Python 3.10+"
    exit 1
fi
echo "✅ Python found: $(python3 --version)"

echo ""
echo "📦 Installing dependencies..."
echo ""

# Frontend
echo "1️⃣ Setting up Frontend..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend setup failed"
    exit 1
fi
cd ..
echo "✅ Frontend ready"
echo ""

# Data Server
echo "2️⃣ Setting up Data Server..."
cd data-server
npm install
if [ $? -ne 0 ]; then
    echo "❌ Data Server setup failed"
    exit 1
fi
cd ..
echo "✅ Data Server ready"
echo ""

# ML Service
echo "3️⃣ Setting up ML Service..."
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ ML Service setup failed"
    exit 1
fi
deactivate
cd ..
echo "✅ ML Service ready"
echo ""

# YOLO Service
echo "4️⃣ Setting up YOLO Service..."
cd yolo-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ YOLO Service setup failed"
    exit 1
fi
deactivate
cd ..
echo "✅ YOLO Service ready"
echo ""

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          ✅ SETUP COMPLETE!                                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 To start the application, run these commands in 4 terminals:"
echo ""
echo "Terminal 1 (Frontend):"
echo "  cd frontend && npm run dev"
echo ""
echo "Terminal 2 (Data Server):"
echo "  cd data-server && node server.js"
echo ""
echo "Terminal 3 (ML Service):"
echo "  cd ml-service && source venv/bin/activate && python app.py"
echo ""
echo "Terminal 4 (YOLO Service):"
echo "  cd yolo-service && source venv/bin/activate && python app_video3.py"
echo ""
echo "🌐 Then open: http://localhost:3000"
echo "🔑 Login: al1@gamil.com / password"
echo ""
echo "📖 For detailed instructions, see SETUP_INSTRUCTIONS.md"
echo ""
