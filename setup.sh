#!/bin/bash

echo "🕉️  Trinetra - Smart Temple Management System"
echo "============================================="
echo ""
echo "📦 Installing dependencies..."
echo ""

# Install frontend dependencies
echo "📱 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "🔧 Installing data-server dependencies..."
cd data-server
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Open two terminal windows"
echo "2. In terminal 1, run: cd data-server && npm start"
echo "3. In terminal 2, run: cd frontend && npm run dev"
echo "4. Visit http://localhost:3000 in your browser"
echo ""
echo "Or use the provided scripts:"
echo "Terminal 1: ./start-backend.sh"
echo "Terminal 2: ./start-frontend.sh"
echo ""

