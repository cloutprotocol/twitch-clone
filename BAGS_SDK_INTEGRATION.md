# Bags SDK Integration

This document explains how the Bags SDK has been integrated into your Twitch clone project for token launching functionality.

## Overview

The integration allows users to launch Solana tokens directly from your platform's dashboard with optional fee sharing capabilities.

## Architecture

### 1. Environment Variables
All Bags SDK configuration is centralized in your main `.env` file:
- `BAGS_API_KEY`: Your Bags API key
- `SOLANA_RPC_URL`: Solana RPC endpoint
- `HELIUS_API_KEY`: Optional Helius API key for better performance

### 2. API Routes
- `/api/bags/launch`: Handles token launching
- `/api/bags/fee-share-wallet`: Looks up fee share wallets for Twitter usernames

### 3. Components
- `TokenLauncher`: Main React component for the launch interface
- Located at: `app/(dashboard)/u/[username]/launch/`

### 4. Utilities
- `lib/bags-sdk.ts`: Wrapper class for Bags SDK functionality
- Handles wallet creation, token launching, and fee sharing

## Features

### Standard Token Launch
- Create tokens without fee sharing
- Configurable initial buy amount
- Social links integration

### Fee Sharing Launch
- Share fees with Twitter users
- Configurable fee splits (creator vs fee claimer)
- Automatic wallet lookup for Twitter usernames

### Security
- Private keys are handled client-side only
- API routes are protected with Clerk authentication
- No sensitive data stored on servers

## Usage

1. Navigate to `/u/[username]/launch` in your dashboard
2. Fill in token details (name, symbol, description)
3. Optionally upload a token image
4. Choose between standard or fee-sharing launch
5. Configure fee splits if using fee sharing
6. Provide your private key
7. Launch the token

## Installation

Run the installation script:
```bash
./scripts/install-bags-sdk.sh
```

Or install manually:
```bash
npm install @bagsfm/bags-sdk @solana/web3.js bs58
```

## Configuration

Add these environment variables to your `.env` file:
```env
BAGS_API_KEY=your_bags_api_key_here
SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your_helius_key
HELIUS_API_KEY=your_helius_api_key_here
```

## Development

The integration is designed to be:
- **Secure**: Private keys never leave the client
- **Scalable**: Uses Next.js API routes for server-side operations
- **Maintainable**: Clean separation of concerns
- **User-friendly**: Intuitive interface matching your existing design

## Future Enhancements

Potential improvements:
1. Image upload integration with your existing UploadThing setup
2. Transaction history and tracking
3. Batch token operations
4. Advanced fee sharing configurations
5. Integration with your streaming rewards system

## Support

For issues related to:
- **Bags SDK**: Check the SDK documentation in `/sdk/`
- **Integration**: Review this document and the code comments
- **UI Components**: Refer to your existing component library