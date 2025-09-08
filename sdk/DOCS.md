# Bags SDK Documentation

Complete documentation for the Bags SDK Fee Sharing Token Launcher - a modern, browser-based interface for creating Solana tokens with fee sharing capabilities.

## 📚 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [UI Components](#ui-components)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Examples](#examples)

## 🎯 Overview

The Bags SDK provides two main interfaces for token creation:

1. **Command Line Interface** - Node.js scripts for programmatic token creation
2. **Web Interface** - Modern browser-based UI for user-friendly token creation

### Key Features

- ✅ **Fee Sharing** - Split trading fees with Twitter/Instagram influencers
- ✅ **File Upload** - Drag & drop image upload (15MB max, PNG/JPG/GIF/WebP)
- ✅ **Wallet Integration** - Phantom wallet connection with real-time balance
- ✅ **Two-Step Transactions** - Automatic handling of config + launch transactions
- ✅ **Helius RPC** - Enhanced performance with Helius integration
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Error Handling** - Comprehensive error messages and recovery

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- Phantom wallet extension
- Bags API key ([Get one here](https://bags.fm))
- SOL for transaction fees

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd sdk

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys
```

### Environment Setup

Create a `.env` file with:

```env
# Required
BAGS_API_KEY=your_bags_api_key_here

# Optional (for better performance)
HELIUS_API_KEY=your_helius_api_key_here

# For CLI usage only
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PRIVATE_KEY=your_base58_private_key_here
```

### Launch Web UI

```bash
npm run ui
# Open http://localhost:3003
```

### Run CLI Examples

```bash
# Interactive mode
npm run dev

# Run examples
npm run examples

# Run tests
npm test
```

## 🏗️ Architecture

### Project Structure

```
sdk/
├── ui/                     # Web interface
│   ├── index.html         # Main UI
│   ├── app.js            # Application logic
│   ├── bags-sdk-client.js # API wrapper
│   └── server.js         # Express server
├── index.js              # Main SDK implementation
├── examples.js           # Usage examples
├── test.js              # Test suite
├── dev.js               # Interactive development
└── interactive.js       # Enhanced interactive mode
```

### Data Flow

```
User Input → UI → BagsSDKClient → Bags API → Solana Network
     ↓
Wallet Connection → Transaction Signing → Confirmation
```

## 📖 API Reference

### BagsSDKClient

The main client for interacting with the Bags API.

#### Constructor

```javascript
const client = new BagsSDKClient();
```

#### Methods

##### `createTokenInfo(formData)`

Creates token metadata and uploads to IPFS.

**Parameters:**
- `formData.name` (string) - Token name
- `formData.symbol` (string) - Token symbol  
- `formData.description` (string) - Token description
- `formData.image` (File) - Token image file
- `formData.websiteLink` (string, optional) - Website URL
- `formData.twitterLink` (string, optional) - Twitter URL
- `formData.telegramLink` (string, optional) - Telegram URL

**Returns:**
```javascript
{
  tokenMint: "string",
  tokenMetadata: "string", 
  tokenLaunch: "string"
}
```

##### `createFeeShareConfig(username, platform, creatorBps, claimerBps, creatorWallet, tokenMint)`

Sets up fee sharing configuration.

**Parameters:**
- `username` (string) - Social media username (without @)
- `platform` (string) - "twitter" or "instagram"
- `creatorBps` (number) - Creator fee in basis points (1000 = 10%)
- `claimerBps` (number) - Claimer fee in basis points (9000 = 90%)
- `creatorWallet` (string) - Creator's wallet address
- `tokenMint` (string) - Token mint address

**Returns:**
```javascript
{
  configKey: "string",
  transaction: "string", // Base58 encoded transaction
  feeClaimerWallet: "string",
  creatorBps: number,
  claimerBps: number
}
```

##### `createLaunchTransaction(params)`

Creates the token launch transaction.

**Parameters:**
```javascript
{
  tokenInfo: object,
  feeShareConfig: object,
  launchWallet: string,
  initialBuyLamports: number
}
```

**Returns:**
- String (serialized transaction) OR
- Object with `needsConfigSigning: true` for two-step process

### CLI Functions

##### `launchTokenWithSharedFees(params)`

Complete token launch with fee sharing (CLI only).

**Parameters:**
- `imageUrl` (string) - Image URL
- `name` (string) - Token name
- `symbol` (string) - Token symbol
- `description` (string) - Token description
- `feeClaimerTwitterHandle` (string) - Twitter username
- `creatorFeeBps` (number, default: 1000) - Creator fee basis points
- `feeClaimerFeeBps` (number, default: 9000) - Claimer fee basis points
- `telegram` (string, optional) - Telegram URL
- `twitter` (string, optional) - Twitter URL
- `website` (string, optional) - Website URL

## 🎨 UI Components

### Main Interface

The web UI consists of several key components:

#### Header
- Wallet connection button
- Balance display (SOL + USD)
- Connection status indicator

#### Token Creation Form
- **Image Upload**: Drag & drop area with validation
- **Token Details**: Name, symbol, description inputs
- **Fee Sharing**: Platform selection, username input, fee slider
- **Social Links**: Optional website, Twitter, Telegram
- **Initial Buy**: SOL amount for initial purchase

#### Results Modal
- Success/error display
- Transaction signatures
- Links to Bags.fm and Solscan
- Fee sharing confirmation

### Styling

The UI uses Tailwind CSS with a custom glass morphism theme:

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

## ⚙️ Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BAGS_API_KEY` | Yes | Your Bags API key |
| `HELIUS_API_KEY` | No | Helius RPC key for better performance |
| `SOLANA_RPC_URL` | CLI only | Solana RPC endpoint |
| `PRIVATE_KEY` | CLI only | Base58 encoded private key |

### API Endpoints

- **Base URL**: `https://public-api-v2.bags.fm/api/v1`
- **Ping**: `GET /ping`
- **Token Info**: `POST /token-launch/create-token-info`
- **Fee Share Config**: `POST /token-launch/fee-share/create-config`
- **Launch Transaction**: `POST /token-launch/create-launch-transaction`
- **Wallet Lookup**: `GET /token-launch/fee-share/wallet/{platform}`

### File Upload Limits

- **Max Size**: 15MB
- **Formats**: PNG, JPG, JPEG, GIF, WebP
- **Field Name**: `image` (required)
- **Content-Type**: `multipart/form-data`

## 🛠️ Development

### Local Development

```bash
# Start web UI with hot reload
npm run ui:dev

# Run CLI in watch mode
npm run dev:watch

# Run tests continuously
npm run test:watch
```

### Adding New Features

1. **UI Changes**: Edit files in `ui/` directory
2. **API Changes**: Update `bags-sdk-client.js`
3. **CLI Changes**: Update `index.js` or create new files
4. **Tests**: Add tests to `test.js`

### Code Style

- Use ES6+ features
- Async/await for promises
- Comprehensive error handling
- Console logging for debugging
- JSDoc comments for functions

### Testing

```bash
# Run all tests
npm test

# Test specific functionality
node test.js

# Test UI components
node ui/test-fee-share.js
```

## 🚀 Deployment

### Web UI Deployment

1. **Build for Production**:
```bash
cd ui
npm install
npm run build  # If you add a build script
```

2. **Environment Setup**:
```bash
# Production .env
BAGS_API_KEY=your_production_api_key
HELIUS_API_KEY=your_helius_key
NODE_ENV=production
```

3. **Deploy Options**:
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **Docker**: Use provided Dockerfile
- **VPS**: PM2 or similar process manager

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3003
CMD ["npm", "start"]
```

### Security Considerations

- Never commit `.env` files
- Use HTTPS in production
- Validate all user inputs
- Rate limit API calls
- Monitor for suspicious activity

## 🔧 Troubleshooting

### Common Issues

#### "bs58 is not defined"
**Solution**: The Base58 library failed to load. Refresh the page or check network connection.

#### "API key not configured"
**Solution**: Ensure `BAGS_API_KEY` is set in `.env` file and server is restarted.

#### "Wallet not connected"
**Solution**: Click "Connect Wallet" and approve the connection in Phantom.

#### "Transaction failed"
**Solution**: Check SOL balance for fees, ensure wallet is unlocked, try again.

#### "Fee share wallet not found"
**Solution**: The Twitter/Instagram username doesn't have a registered Bags wallet.

### Debug Mode

Enable detailed logging:

```javascript
// In browser console
localStorage.setItem('debug', 'true');
location.reload();
```

### Network Issues

If experiencing RPC issues:

1. Check Helius API key
2. Try different RPC endpoint
3. Check Solana network status
4. Verify wallet connection

## 📝 Examples

### Basic Token Launch (No Fee Sharing)

```javascript
// CLI
import { launchTokenStandard } from './index.js';

const result = await launchTokenStandard(
  "https://example.com/image.png",
  "My Token",
  "MTK",
  "A simple token",
  "https://t.me/mytoken",
  "https://twitter.com/mytoken", 
  "https://mytoken.com",
  0.01 // 0.01 SOL initial buy
);
```

### Fee Sharing Token Launch

```javascript
// CLI
import { launchTokenWithSharedFees } from './index.js';

const result = await launchTokenWithSharedFees(
  "https://example.com/image.png",
  "Shared Token",
  "SHARE",
  "Token with fee sharing",
  "elonmusk", // Twitter username
  2000,       // 20% for creator
  8000,       // 80% for claimer
  "https://t.me/sharedtoken",
  "https://twitter.com/sharedtoken",
  "https://sharedtoken.com"
);
```

### Custom Fee Splits

Common fee sharing scenarios:

```javascript
// Influencer Heavy (5/95)
creatorFeeBps: 500,   // 5%
feeClaimerFeeBps: 9500 // 95%

// Equal Partnership (50/50)
creatorFeeBps: 5000,   // 50%
feeClaimerFeeBps: 5000 // 50%

// Creator Heavy (80/20)
creatorFeeBps: 8000,   // 80%
feeClaimerFeeBps: 2000 // 20%

// Minimal Fee Share (95/5)
creatorFeeBps: 9500,   // 95%
feeClaimerFeeBps: 500  // 5%
```

### Error Handling

```javascript
try {
  const result = await launchTokenWithSharedFees(/* params */);
  console.log('Success:', result.tokenMint);
} catch (error) {
  if (error.message.includes('wallet not found')) {
    console.log('User needs to register with Bags');
  } else if (error.message.includes('insufficient funds')) {
    console.log('Need more SOL for fees');
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## 📞 Support

- **Documentation**: This file
- **Examples**: See `examples.js`
- **Issues**: Check console logs and error messages
- **Bags API**: [Official Documentation](https://docs.bags.fm)

## 📄 License

MIT License - see LICENSE file for details.

---

*Built with ❤️ for the Solana ecosystem*