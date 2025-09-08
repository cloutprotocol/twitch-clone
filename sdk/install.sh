#!/bin/bash

echo "🎒 Setting up Bags SDK Fee Sharing Example"
echo "=========================================="

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

# Check if .env exists
if [ ! -f ".env" ]; then
    echo ""
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "✅ .env file created from template"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file and add your PRIVATE_KEY"
echo "2. Run 'npm test' to validate your setup"
echo "3. Run 'npm start' to launch a test token"
echo "4. Run 'node examples.js' for more examples"
echo ""
echo "⚠️  IMPORTANT: Add your wallet's private key to .env before running!"
echo "   You can export it from Phantom/Solflare wallet settings"