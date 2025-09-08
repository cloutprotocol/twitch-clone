# 🎒 Bags SDK - Fee Sharing Token Launcher

A complete toolkit for creating Solana tokens with fee sharing capabilities. Features both a modern web interface and powerful CLI tools.

## ✨ Features

- 🌐 **Modern Web UI** - Beautiful Tailwind CSS interface with drag & drop
- 💻 **CLI Tools** - Programmatic token creation and automation
- 🤝 **Fee Sharing** - Split trading fees with Twitter/Instagram influencers
- 📁 **File Upload** - Drag & drop image upload (15MB max, multiple formats)
- 🔗 **Wallet Integration** - Phantom wallet with real-time balance
- ⚡ **Helius RPC** - Enhanced performance with Helius integration
- 📱 **Mobile Responsive** - Works perfectly on all devices
- 🔒 **Secure** - Browser-based signing, no private keys stored

## 🚀 Quick Start

### Web Interface (Recommended)

```bash
# 1. Install and configure
git clone <repo-url> && cd sdk
npm install
cp .env.example .env
# Add your BAGS_API_KEY to .env

# 2. Launch web UI
npm run ui
# Open http://localhost:3003

# 3. Connect wallet and create tokens! 🎉
```

### Command Line Interface

```bash
# Interactive mode
npm run dev

# Run examples
npm run examples

# Run tests
npm test
```

## 📚 Documentation

- **[📋 Quick Start Guide](./QUICK_START.md)** - Get running in 5 minutes
- **[📖 Complete Documentation](./DOCS.md)** - Full feature guide
- **[🔧 API Reference](./API_REFERENCE.md)** - All functions and classes
- **[🌐 Web UI Guide](./ui/README.md)** - UI-specific documentation

## 🎯 What You Can Build

### 🌐 Web Interface
- **Drag & drop** token image upload
- **Real-time** wallet balance display  
- **Interactive** fee sharing configuration
- **Mobile-friendly** responsive design
- **One-click** token launches

### 💻 Command Line
- **Batch** token creation
- **Automated** deployment scripts
- **Custom** fee sharing logic
- **Integration** with other tools

## 📁 Project Structure

```
sdk/
├── ui/                    # 🌐 Web Interface
│   ├── index.html        # Main UI
│   ├── app.js           # Application logic
│   ├── bags-sdk-client.js # API wrapper
│   └── server.js        # Express server
├── index.js              # 💻 Main CLI SDK
├── examples.js           # 📝 Usage examples
├── test.js              # 🧪 Test suite
├── dev.js               # 🛠️ Interactive development
├── DOCS.md              # 📖 Complete documentation
├── API_REFERENCE.md     # 🔧 API reference
└── QUICK_START.md       # 🚀 Quick start guide
```

## 🎨 Screenshots

### Web Interface
- Modern glass morphism design
- Intuitive fee sharing controls
- Real-time transaction feedback
- Mobile responsive layout

### CLI Interface  
- Interactive prompts
- Comprehensive logging
- Error handling and recovery
- Batch processing capabilities

## 🛠️ Available Commands

```bash
# 🌐 Web Interface
npm run ui              # Start web UI
npm run ui:dev          # Start with auto-reload

# 💻 Command Line
npm run dev             # Interactive mode
npm run examples        # Run example scripts
npm test                # Run tests

# 🔧 Development
npm run dev:watch       # CLI with auto-reload
npm run test:watch      # Tests with auto-reload
```

## 🎯 Fee Sharing Examples

### Influencer Partnership (10/90)
```javascript
creatorFeeBps: 1000,    // 10% for creator
feeClaimerFeeBps: 9000  // 90% for influencer
```

### Equal Partnership (50/50)
```javascript
creatorFeeBps: 5000,    // 50% for creator
feeClaimerFeeBps: 5000  // 50% for partner
```

### Creator Heavy (80/20)
```javascript
creatorFeeBps: 8000,    // 80% for creator
feeClaimerFeeBps: 2000  // 20% for partner
```

## 🔒 Security & Best Practices

- ✅ **Environment Variables** - Never commit `.env` files
- ✅ **Wallet Safety** - Use dedicated test wallets
- ✅ **Input Validation** - All inputs are validated
- ✅ **Error Handling** - Comprehensive error recovery
- ✅ **Rate Limiting** - Built-in API rate limiting
- ✅ **HTTPS Only** - Secure connections in production

## 🆘 Troubleshooting

### Common Issues
- **"bs58 not defined"** → Refresh the page
- **"API key not configured"** → Check `.env` file
- **"Wallet not connected"** → Click Connect Wallet button
- **"Transaction failed"** → Check SOL balance for fees

### Debug Mode
```javascript
// Enable detailed logging
localStorage.setItem('debug', 'true');
location.reload();
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if needed
5. Submit a pull request

## 📞 Support

- **📖 Documentation** - See DOCS.md for complete guide
- **🔧 API Reference** - See API_REFERENCE.md for all functions
- **🚀 Quick Start** - See QUICK_START.md for fast setup
- **🌐 Web UI** - See ui/README.md for UI-specific docs

## 📄 License

MIT License - Built with ❤️ for the Solana ecosystem