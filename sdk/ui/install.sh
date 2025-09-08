#!/bin/bash

echo "🎨 Setting up Bags SDK UI"
echo "========================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if parent .env exists
if [ ! -f "../.env" ]; then
    echo ""
    echo "⚠️  Parent .env file not found. Please ensure you have configured:"
    echo "   - BAGS_API_KEY in ../.env"
    echo "   - HELIUS_API_KEY (optional) in ../.env"
else
    echo "✅ Parent .env file found"
fi

echo ""
echo "🎉 UI setup complete!"
echo ""
echo "Next steps:"
echo "1. Ensure your parent .env file has BAGS_API_KEY configured"
echo "2. Run 'npm start' to start the UI server"
echo "3. Open http://localhost:3003 in your browser"
echo "4. Connect your Phantom wallet and start creating tokens!"
echo ""
echo "📋 Features:"
echo "   ✅ Modern Tailwind CSS interface"
echo "   ✅ Drag & drop image upload (15MB max)"
echo "   ✅ Fee sharing with Twitter/Instagram users"
echo "   ✅ Real-time wallet integration"
echo "   ✅ Mobile responsive design"