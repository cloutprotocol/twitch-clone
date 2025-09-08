#!/bin/bash

echo "🚀 Installing Bags SDK dependencies..."

# Install the required packages
npm install @bagsfm/bags-sdk @solana/web3.js bs58

echo "✅ Bags SDK dependencies installed successfully!"

echo ""
echo "📝 Next steps:"
echo "1. Add your Bags API key to your .env file:"
echo "   BAGS_API_KEY=your_bags_api_key_here"
echo ""
echo "2. Add your Solana RPC URL to your .env file:"
echo "   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com"
echo ""
echo "3. Users will need to provide their private key when launching tokens"
echo ""
echo "🎉 Your token launcher is ready to use!"