# 📚 API Reference

Complete reference for all Bags SDK functions, classes, and interfaces.

## 🏗️ Core Classes

### BagsSDKClient

Browser-compatible wrapper for the Bags API.

```javascript
import { BagsSDKClient } from './ui/bags-sdk-client.js';
const client = new BagsSDKClient();
```

#### Methods

##### `async testConnection()`

Tests connection to the Bags API.

**Returns:** `Promise<boolean>`

```javascript
const isConnected = await client.testConnection();
console.log('API connected:', isConnected);
```

##### `async createTokenInfo(formData)`

Creates token metadata and uploads to IPFS.

**Parameters:**
```typescript
interface FormData {
  name: string;           // Token name
  symbol: string;         // Token symbol (uppercase)
  description?: string;   // Token description
  image?: File;          // Image file (15MB max)
  websiteLink?: string;  // Website URL
  twitterLink?: string;  // Twitter URL  
  telegramLink?: string; // Telegram URL
}
```

**Returns:**
```typescript
interface TokenInfo {
  tokenMint: string;     // Token mint address
  tokenMetadata: string; // IPFS metadata URL
  tokenLaunch: string;   // Launch info
}
```

**Example:**
```javascript
const tokenInfo = await client.createTokenInfo({
  name: "My Token",
  symbol: "MTK",
  description: "An awesome token",
  image: fileInput.files[0],
  websiteLink: "https://mytoken.com"
});
```

##### `async getFeeShareWallet(username, platform)`

Looks up wallet address for social media username.

**Parameters:**
- `username` (string) - Username without @
- `platform` (string) - "twitter" or "instagram"

**Returns:** `Promise<string>` - Wallet address

**Throws:** Error if username not found

```javascript
try {
  const wallet = await client.getFeeShareWallet("elonmusk", "twitter");
  console.log("Wallet:", wallet);
} catch (error) {
  console.log("User not found:", error.message);
}
```

##### `async createFeeShareConfig(username, platform, creatorBps, claimerBps, creatorWallet, tokenMint)`

Creates fee sharing configuration.

**Parameters:**
- `username` (string) - Social media username
- `platform` (string) - "twitter" or "instagram"  
- `creatorBps` (number) - Creator fee in basis points (100 = 1%)
- `claimerBps` (number) - Claimer fee in basis points
- `creatorWallet` (string) - Creator's wallet address
- `tokenMint` (string) - Token mint address

**Returns:**
```typescript
interface FeeShareConfig {
  configKey: string;        // Configuration key
  transaction?: string;     // Base58 transaction (if needed)
  feeClaimerWallet: string; // Claimer's wallet
  creatorBps: number;       // Creator basis points
  claimerBps: number;       // Claimer basis points
}
```

**Example:**
```javascript
const feeConfig = await client.createFeeShareConfig(
  "elonmusk",
  "twitter", 
  1000,  // 10% creator
  9000,  // 90% claimer
  "YourWalletAddress...",
  "TokenMintAddress..."
);
```

##### `async createLaunchTransaction(params)`

Creates the token launch transaction.

**Parameters:**
```typescript
interface LaunchParams {
  tokenInfo: TokenInfo;
  feeShareConfig?: FeeShareConfig;
  launchWallet: string;
  initialBuyLamports: number;
}
```

**Returns:** 
- `string` (serialized transaction) OR
- `object` with `needsConfigSigning: true`

**Example:**
```javascript
const launchTx = await client.createLaunchTransaction({
  tokenInfo,
  feeShareConfig,
  launchWallet: "YourWallet...",
  initialBuyLamports: 10000000 // 0.01 SOL
});

if (launchTx.needsConfigSigning) {
  // Handle two-step process
  await signTransaction(launchTx.configTransaction);
  const finalTx = await client.createLaunchTransactionAfterConfig(launchTx);
  await signTransaction(finalTx);
} else {
  // Single transaction
  await signTransaction(launchTx);
}
```

##### `async createLaunchTransactionAfterConfig(params)`

Creates launch transaction after config is signed.

**Parameters:**
```typescript
interface AfterConfigParams {
  tokenInfo: TokenInfo;
  configKey: string;
  launchWallet: string;
  initialBuyLamports: number;
}
```

**Returns:** `Promise<string>` - Serialized transaction

## 🖥️ CLI Functions

### launchTokenWithSharedFees

Complete token launch with fee sharing (Node.js only).

```javascript
import { launchTokenWithSharedFees } from './index.js';
```

**Parameters:**
```typescript
async function launchTokenWithSharedFees(
  imageUrl: string,
  name: string,
  symbol: string,
  description: string,
  feeClaimerTwitterHandle: string,
  creatorFeeBps?: number,      // Default: 1000 (10%)
  feeClaimerFeeBps?: number,   // Default: 9000 (90%)
  initialBuySOL?: number,      // Default: 0.01
  telegram?: string,
  twitter?: string,
  website?: string
): Promise<LaunchResult>
```

**Returns:**
```typescript
interface LaunchResult {
  tokenMint: string;
  signature: string;
  tokenMetadata: string;
  tokenLaunch: string;
  feeShareWallet: string;
  feeSplit: {
    creator: number;
    feeClaimer: number;
  };
}
```

**Example:**
```javascript
const result = await launchTokenWithSharedFees(
  "https://example.com/image.png",
  "Shared Token",
  "SHARE",
  "Token with fee sharing",
  "elonmusk",
  2000,  // 20% creator
  8000,  // 80% claimer
  0.05,  // 0.05 SOL initial buy
  "https://t.me/token",
  "https://twitter.com/token",
  "https://token.com"
);

console.log("Token created:", result.tokenMint);
console.log("View at:", `https://bags.fm/${result.tokenMint}`);
```

### launchTokenStandard

Standard token launch without fee sharing.

**Parameters:**
```typescript
async function launchTokenStandard(
  imageUrl: string,
  name: string,
  symbol: string,
  description: string,
  telegram?: string,
  twitter?: string,
  website?: string,
  initialBuySOL?: number  // Default: 0.01
): Promise<StandardLaunchResult>
```

**Returns:**
```typescript
interface StandardLaunchResult {
  tokenMint: string;
  signature: string;
  tokenMetadata: string;
  tokenLaunch: string;
}
```

## 🎨 UI Classes

### BagsTokenLauncher

Main UI application class.

```javascript
// Automatically initialized in app.js
const launcher = new BagsTokenLauncher();
```

#### Key Methods

##### `async connectWallet()`

Connects to user's Phantom wallet.

```javascript
await launcher.connectWallet();
```

##### `async launchToken()`

Launches token using form data.

```javascript
await launcher.launchToken();
```

##### `validateImageFile(file)`

Validates uploaded image file.

**Parameters:**
- `file` (File) - Image file to validate

**Throws:** Error if invalid

```javascript
try {
  launcher.validateImageFile(file);
  console.log("File valid");
} catch (error) {
  console.log("Invalid file:", error.message);
}
```

## 🔧 Utility Functions

### signAndSendTransaction

Signs and sends a Solana transaction.

**Parameters:**
- `serializedTx` (string) - Base58 encoded transaction
- `keypair` (Keypair) - Solana keypair (CLI only)

**Returns:** `Promise<string>` - Transaction signature

```javascript
// CLI usage
const signature = await signAndSendTransaction(serializedTx, keypair);

// Browser usage (handled automatically)
const signature = await launcher.signAndSendTransaction(serializedTx);
```

### getFeeShareWallet

Looks up fee share wallet for Twitter username.

**Parameters:**
- `twitterUsername` (string) - Twitter username

**Returns:** `Promise<PublicKey | null>`

```javascript
const wallet = await getFeeShareWallet("elonmusk");
if (wallet) {
  console.log("Found wallet:", wallet.toString());
}
```

## 📊 Data Types

### Fee Split Configurations

Common fee sharing scenarios:

```javascript
// Basis points (100 = 1%, 10000 = 100%)

const FEE_SPLITS = {
  INFLUENCER_HEAVY: { creator: 500, claimer: 9500 },   // 5/95
  INFLUENCER_FOCUS: { creator: 1000, claimer: 9000 },  // 10/90
  BALANCED: { creator: 3000, claimer: 7000 },          // 30/70
  EQUAL: { creator: 5000, claimer: 5000 },             // 50/50
  CREATOR_FOCUS: { creator: 7000, claimer: 3000 },     // 70/30
  CREATOR_HEAVY: { creator: 8000, claimer: 2000 },     // 80/20
  MINIMAL_SHARE: { creator: 9500, claimer: 500 }       // 95/5
};
```

### Error Types

Common error patterns:

```javascript
// API Errors
"API key not configured"
"Failed to create token info"
"Failed to create fee share config"

// Validation Errors  
"File size must be under 15MB"
"File must be PNG, JPG, JPEG, GIF, or WebP"
"Token name and symbol are required"

// Wallet Errors
"Phantom wallet not found"
"Transaction was rejected by user"
"Insufficient SOL balance for transaction fees"

// Network Errors
"Network error: Please check your connection"
"RPC endpoint not responding"
"Transaction confirmation timeout"

// Fee Share Errors
"User @username not found or no wallet registered"
"Fee split must total 100% (10000 basis points)"
"Invalid Twitter/Instagram username"
```

## 🌐 Environment Variables

### Required

```bash
BAGS_API_KEY=your_bags_api_key_here
```

### Optional

```bash
# For better RPC performance
HELIUS_API_KEY=your_helius_api_key_here

# CLI only
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
PRIVATE_KEY=your_base58_private_key_here

# Server configuration
PORT=3003
NODE_ENV=development
```

## 🔗 API Endpoints

### Bags API Base URL
`https://public-api-v2.bags.fm/api/v1`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/ping` | Health check |
| POST | `/token-launch/create-token-info` | Create token metadata |
| POST | `/token-launch/fee-share/create-config` | Create fee share config |
| GET | `/token-launch/fee-share/wallet/{platform}` | Lookup wallet |
| POST | `/token-launch/create-launch-transaction` | Create launch transaction |
| POST | `/token-launch/create-config` | Create standard config |

### Headers

```javascript
{
  'x-api-key': 'your_bags_api_key',
  'Content-Type': 'application/json' // or multipart/form-data for uploads
}
```

## 📱 Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features
- ES6+ support
- Fetch API
- Web3 wallet extensions
- File API for uploads

### Wallet Support
- Phantom (primary)
- Solflare (experimental)
- Other Solana wallets (may work)

## 🔒 Security Notes

### Never Commit
- Private keys
- Wallet files (.json)
- Production .env files
- API keys in code

### Best Practices
- Use environment variables
- Validate all inputs
- Handle errors gracefully
- Use HTTPS in production
- Rate limit API calls

---

*For more examples and advanced usage, see [DOCS.md](./DOCS.md)*