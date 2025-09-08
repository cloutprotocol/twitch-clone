# 🚀 Quick Start Guide

Get up and running with the Bags SDK in 5 minutes!

## ⚡ Super Quick Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd sdk
npm install

# 2. Configure environment
cp .env.example .env
# Add your BAGS_API_KEY to .env

# 3. Launch web UI
npm run ui
# Open http://localhost:3003

# 4. Connect wallet and create tokens! 🎉
```

## 🎯 What You Can Do

### 🌐 Web Interface
- **Modern UI** with drag & drop image upload
- **Fee sharing** with Twitter/Instagram users
- **Real-time wallet** balance and connection
- **Mobile responsive** design

### 💻 Command Line
- **Programmatic** token creation
- **Batch operations** and automation
- **Advanced scripting** capabilities

## 📋 Checklist

Before creating your first token:

- [ ] **Bags API Key** - Get from [bags.fm](https://bags.fm)
- [ ] **Phantom Wallet** - Install browser extension
- [ ] **SOL Balance** - ~0.01 SOL for transaction fees
- [ ] **Token Image** - PNG/JPG/GIF/WebP under 15MB
- [ ] **Token Details** - Name, symbol, description ready

## 🎨 Create Your First Token

### Option 1: Web UI (Recommended)

1. **Start the server**: `npm run ui`
2. **Open browser**: http://localhost:3003
3. **Connect wallet**: Click "Connect Wallet"
4. **Upload image**: Drag & drop your token image
5. **Fill details**: Name, symbol, description
6. **Optional fee sharing**: Enter Twitter username
7. **Launch**: Click "Create Token" and sign transactions

### Option 2: Command Line

```javascript
// Edit and run examples.js
import { launchTokenWithSharedFees } from './index.js';

await launchTokenWithSharedFees(
  "https://your-image-url.com/image.png",
  "My Awesome Token",
  "MAT", 
  "The best token ever created!",
  "elonmusk", // Fee sharing with @elonmusk
  1000,       // 10% for you
  9000        // 90% for them
);
```

## 🔧 Common Commands

```bash
# Web interface
npm run ui              # Start web UI
npm run ui:dev          # Start with auto-reload

# Command line
npm run dev             # Interactive mode
npm run examples        # Run example scripts
npm test                # Run tests

# Development
npm run dev:watch       # CLI with auto-reload
npm run test:watch      # Tests with auto-reload
```

## 💡 Pro Tips

### Fee Sharing Strategies

- **Influencer Launch**: 5-10% creator, 90-95% influencer
- **Partnership**: 50/50 split
- **Creator Heavy**: 80-90% creator, 10-20% partner
- **Minimal Share**: 95% creator, 5% partner

### Best Practices

- **Test first** with small amounts
- **Verify usernames** have registered Bags wallets
- **Optimize images** for faster uploads
- **Keep SOL** for transaction fees
- **Save transaction signatures** for records

## 🆘 Need Help?

### Quick Fixes

- **"bs58 not defined"** → Refresh the page
- **"API key not configured"** → Check .env file
- **"Wallet not connected"** → Click Connect Wallet
- **"Transaction failed"** → Check SOL balance

### Debug Mode

```javascript
// In browser console
localStorage.setItem('debug', 'true');
location.reload();
```

### Check Logs

- **Browser**: Open Developer Tools → Console
- **CLI**: Check terminal output
- **Server**: Check server logs

## 🎉 Success!

Once your token is created, you'll get:

- **Token Mint Address** - Your token's unique ID
- **Transaction Signatures** - Proof of creation
- **Bags.fm Link** - View your token live
- **Fee Sharing Config** - If enabled

## 📚 Next Steps

- Read the full [DOCS.md](./DOCS.md) for advanced features
- Explore [examples.js](./examples.js) for more use cases
- Check out the [UI components](./ui/) for customization
- Join the community for support and updates

---

**Happy token creating! 🚀**