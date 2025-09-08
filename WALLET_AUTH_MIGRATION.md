# Wallet Authentication Migration Guide

This guide outlines the migration from Clerk to a custom wallet-based authentication system using Sign-In with Solana (SIWS).

## ✅ What's Been Implemented

### 1. Database Schema Updates
- Added `Account`, `Session`, `Wallet`, and `SignNonce` models
- Made `email` optional for wallet-only users
- Added wallet support with Solana integration

### 2. Authentication System
- **NextAuth.js** integration with Prisma adapter
- **SIWS (Sign-In with Solana)** custom provider
- Secure nonce-based signature verification
- Session management with JWT tokens

### 3. Wallet Integration
- Solana wallet adapter integration (Phantom, Solflare, etc.)
- Automatic user creation on first wallet connection
- Wallet address verification via Ed25519 signatures

### 4. UI Components
- `WalletConnectionModal` - Wallet connection interface
- `SignInButton` - Replacement for Clerk's SignInButton
- Updated navigation components with wallet auth

### 5. Security Features
- TTL-based nonce expiration (5 minutes)
- Replay attack protection
- Domain-bound message signing
- Secure session cookies

## 🚀 Getting Started

### 1. Environment Setup
Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

**Required Environment Variables:**
```env
# NextAuth
NEXTAUTH_SECRET="generate-a-random-secret-32-chars+"
NEXTAUTH_URL="http://localhost:3000"

# Database (your existing MongoDB URL)
DATABASE_URL="mongodb://..."

# Solana RPC (public endpoint or your private one)
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.mainnet-beta.solana.com"
```

### 2. Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Create TTL index for automatic nonce cleanup
node scripts/create-ttl-index.js

# Migrate existing Clerk users (optional, for gradual transition)
npx ts-node scripts/migrate-clerk-users.ts
```

### 3. Development Server
```bash
npm run dev
```

## 🔄 Migration Strategy

### Phase 1: Parallel Operation (Recommended)
Both authentication systems can run simultaneously:

1. New users can sign in with wallets
2. Existing users can continue using Clerk
3. Gradual user migration over time

### Phase 2: Complete Migration
After user adoption:

1. Remove Clerk dependencies
2. Clean up legacy authentication code
3. Drop `externalUserId` column

## 📱 User Experience

### New Wallet Authentication Flow
1. User clicks "Connect Wallet"
2. Wallet selection modal appears
3. User selects wallet (Phantom, Solflare, etc.)
4. Wallet prompts for connection approval
5. System generates secure nonce
6. User signs message with wallet
7. Server verifies signature and creates session
8. User is logged in

### Supported Wallets
- **Phantom** (most popular)
- **Solflare** 
- **Math Wallet**
- **Ledger Hardware Wallets**
- Easily extensible for more wallets

## 🔧 Technical Architecture

### Authentication Flow
```
Client                Server               Database
  |                     |                     |
  ├─ Request nonce ────>│                     │
  │                     ├─ Generate nonce ──>│
  │                     │<── Store nonce ────┤
  │<── Return nonce ────┤                     │
  |                     |                     |
  ├─ Sign message ──────┤                     │
  ├─ Submit signature ──>│                     │
  │                     ├─ Verify signature ──│
  │                     ├─ Mark nonce used ──>│
  │                     ├─ Create/find user ─>│
  │                     ├─ Create session ───>│
  │<── Session cookie ──┤                     │
```

### Security Measures
- **Nonce Uniqueness**: Each sign-in requires a fresh, time-limited nonce
- **Domain Binding**: Messages include domain to prevent cross-site attacks
- **Signature Verification**: Ed25519 cryptographic verification
- **Session Security**: HTTPOnly, Secure cookies with proper SameSite policy

## 🐛 Troubleshooting

### Common Issues

**"Wallet not detected"**
- Ensure wallet browser extension is installed
- Try refreshing the page
- Check if wallet is connected to the correct network

**"Signature verification failed"**
- Wallet may be on wrong network (mainnet vs devnet)
- Try disconnecting and reconnecting wallet
- Clear browser cache/cookies

**"Nonce expired"**
- Nonces expire after 5 minutes for security
- Simply retry the connection process

### Development Issues

**Prisma Client Out of Sync**
```bash
npx prisma generate
```

**Missing Dependencies**
```bash
npm install
```

## 📊 Monitoring & Analytics

### Key Metrics to Track
- Wallet connection success rate
- Sign-in completion rate
- Session duration
- Popular wallet types
- Error rates by wallet type

### Database Queries
```sql
-- Active users by authentication method
SELECT provider, COUNT(*) FROM Account GROUP BY provider;

-- Wallet distribution
SELECT label, COUNT(*) FROM Wallet GROUP BY label;

-- Recent sign-ins
SELECT * FROM SignNonce WHERE used = true ORDER BY createdAt DESC LIMIT 10;
```

## 🔮 Future Enhancements

### Planned Features
1. **Multi-wallet support** - Users can connect multiple wallets
2. **Wallet labeling** - Custom names for different wallets
3. **Transaction history** - Track user's on-chain activity
4. **Token gating** - Access control based on token holdings
5. **Social features** - Wallet-based friend discovery

### Integration Opportunities
- **Token launcher integration** - Seamless token creation
- **NFT profile pictures** - Use owned NFTs as avatars  
- **DeFi features** - Portfolio tracking, yield farming
- **DAO voting** - Governance participation

## 🤝 Contributing

To extend the authentication system:

1. **Adding new wallet providers**: Update `wallet-provider.tsx`
2. **Custom sign-in flow**: Modify `WalletConnectionModal`
3. **Additional verification**: Extend SIWS provider in `auth.ts`
4. **UI improvements**: Update authentication components

## 📚 Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Sign-In with Ethereum Standard](https://eips.ethereum.org/EIPS/eip-4361)
- [SIWS Implementation](https://github.com/phantom-labs/sign-in-with-solana)

---

**Migration Status**: ✅ Complete and Ready for Production

All core functionality has been implemented and tested. The system is production-ready with proper security measures, error handling, and user experience optimizations.