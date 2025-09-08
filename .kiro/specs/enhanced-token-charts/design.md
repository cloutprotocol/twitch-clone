# Design Document

## Overview

The Enhanced Token Charts feature extends the existing token attachment system by adding real-time market data visualization directly within the stream player interface. The design leverages existing infrastructure (Helius RPC, token storage) while introducing minimal new dependencies to maintain the platform's lightweight architecture.

The solution uses a combination of Jupiter API for price data and DexScreener API for chart data, both of which are free, reliable, and specifically designed for Solana tokens. The implementation follows a progressive enhancement approach where the chart gracefully degrades if data is unavailable.

## Architecture

### Data Flow
```
Stream with tokenAddress → Token Chart Component → API Services → Cache → UI Display
                                                 ↓
                                    Jupiter API (Price/Market Data)
                                    DexScreener API (Chart Data)
                                    Helius RPC (Token Metadata)
```

### Component Hierarchy
```
StreamPlayer
├── Video
├── Header
└── TokenChart (NEW)
    ├── TokenChartHeader
    ├── TokenChartWidget
    │   ├── PriceDisplay
    │   ├── MarketStats
    │   └── TradingChart
    └── TokenChartActions
```

### API Strategy
1. **Jupiter API** - Primary source for price, market cap, and volume data
   - Endpoint: `https://price.jup.ag/v4/price?ids={tokenAddress}`
   - Free, no rate limits, Solana-focused
   - Real-time pricing data

2. **DexScreener API** - Chart data and additional market metrics
   - Endpoint: `https://api.dexscreener.com/latest/dex/tokens/{tokenAddress}`
   - Free tier with reasonable limits
   - Provides OHLCV data for charts

3. **Helius RPC** - Token metadata (already available)
   - Used for token name, symbol, decimals
   - Fallback for basic token information

## Components and Interfaces

### TokenChart Component
```typescript
interface TokenChartProps {
  tokenAddress: string;
  streamId: string;
  className?: string;
}

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  decimals: number;
  logoURI?: string;
}

interface ChartData {
  timestamp: number;
  price: number;
  volume: number;
}
```

### TokenChartService
```typescript
class TokenChartService {
  // Cache management
  private cache = new Map<string, CachedTokenData>();
  private readonly CACHE_DURATION = 30000; // 30 seconds
  
  // API methods
  async getTokenData(address: string): Promise<TokenData>
  async getChartData(address: string, timeframe: string): Promise<ChartData[]>
  async getTokenMetadata(address: string): Promise<TokenMetadata>
  
  // Caching methods
  private getCachedData(key: string): CachedTokenData | null
  private setCachedData(key: string, data: TokenData): void
}
```

### TokenChartWidget Component Structure
```typescript
const TokenChartWidget = ({ tokenAddress, streamId }: TokenChartProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchTokenData, 30000);
    return () => clearInterval(interval);
  }, [tokenAddress]);
  
  // Component renders...
}
```

## Data Models

### Token Data Structure
```typescript
interface TokenData {
  address: string;
  name: string;
  symbol: string;
  price: number;           // Current price in USD
  priceChange24h: number;  // 24h price change percentage
  marketCap: number;       // Market capitalization
  volume24h: number;       // 24h trading volume
  decimals: number;        // Token decimals
  logoURI?: string;        // Token logo URL
  lastUpdated: number;     // Timestamp of last update
}

interface ChartDataPoint {
  timestamp: number;       // Unix timestamp
  price: number;          // Price at timestamp
  volume: number;         // Volume at timestamp
}

interface TradingLinks {
  jupiter: string;        // Jupiter swap URL
  raydium: string;        // Raydium swap URL
  dexscreener: string;    // DexScreener chart URL
}
```

### API Response Interfaces
```typescript
// Jupiter API Response
interface JupiterPriceResponse {
  data: {
    [tokenAddress: string]: {
      id: string;
      mintSymbol: string;
      vsToken: string;
      vsTokenSymbol: string;
      price: number;
    }
  };
  timeTaken: number;
}

// DexScreener API Response
interface DexScreenerResponse {
  schemaVersion: string;
  pairs: Array<{
    chainId: string;
    dexId: string;
    url: string;
    pairAddress: string;
    baseToken: {
      address: string;
      name: string;
      symbol: string;
    };
    priceNative: string;
    priceUsd: string;
    volume: {
      h24: number;
      h6: number;
      h1: number;
      m5: number;
    };
    priceChange: {
      h24: number;
      h6: number;
      h1: number;
      m5: number;
    };
    liquidity: {
      usd: number;
      base: number;
      quote: number;
    };
    fdv: number;
    marketCap: number;
  }>;
}
```

## Error Handling

### Error States and Fallbacks
1. **Token Not Found**: Display token address with copy button
2. **API Unavailable**: Show cached data with "Last updated" timestamp
3. **Network Error**: Retry mechanism with exponential backoff
4. **Invalid Token**: Graceful message with option to remove token
5. **Rate Limiting**: Queue requests and show loading state

### Error Handling Strategy
```typescript
class TokenChartErrorHandler {
  static handleApiError(error: Error, tokenAddress: string): ErrorState {
    if (error.message.includes('404')) {
      return {
        type: 'TOKEN_NOT_FOUND',
        message: 'Token data not available',
        action: 'show_address_only'
      };
    }
    
    if (error.message.includes('rate limit')) {
      return {
        type: 'RATE_LIMITED',
        message: 'Loading market data...',
        action: 'retry_with_delay'
      };
    }
    
    return {
      type: 'GENERAL_ERROR',
      message: 'Unable to load market data',
      action: 'show_fallback'
    };
  }
}
```

## Testing Strategy

### Unit Tests
- TokenChartService API methods
- Data transformation functions
- Error handling scenarios
- Cache management logic

### Integration Tests
- API endpoint responses
- Component rendering with real data
- Error state handling
- Performance under load

### E2E Tests
- Full user flow: stream with token → chart display → interactions
- Mobile responsiveness
- Chart expansion/collapse
- Trading link functionality

### Performance Tests
- API response times
- Cache effectiveness
- Memory usage with multiple tokens
- Concurrent user scenarios

### Test Data Strategy
```typescript
// Mock data for testing
const mockTokenData: TokenData = {
  address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  name: "USD Coin",
  symbol: "USDC",
  price: 1.00,
  priceChange24h: 0.01,
  marketCap: 25000000000,
  volume24h: 2500000000,
  decimals: 6,
  logoURI: "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  lastUpdated: Date.now()
};

// Test scenarios
const testScenarios = [
  'valid_token_with_data',
  'token_not_found',
  'api_rate_limited',
  'network_error',
  'invalid_token_address',
  'missing_market_data'
];
```

## Implementation Notes

### File Structure
```
components/stream-player/
├── token-chart/
│   ├── index.tsx              # Main TokenChart component
│   ├── token-chart-widget.tsx # Collapsible chart widget
│   ├── token-chart-header.tsx # Price and basic info
│   ├── price-chart.tsx        # Chart visualization
│   └── trading-links.tsx      # External platform links
├── lib/
│   ├── token-chart-service.ts # API service
│   ├── token-chart-cache.ts   # Caching logic
│   └── token-chart-utils.ts   # Utility functions
└── hooks/
    └── use-token-data.ts      # React hook for token data
```

### Integration Points
1. **Stream Player**: Add TokenChart component below Header
2. **Database**: Use existing `tokenAddress` field in Stream model
3. **API Routes**: Create `/api/token-data/[address]` for server-side caching
4. **Environment**: Add API keys for external services (if needed)

### Performance Considerations
- Client-side caching with 30-second TTL
- Debounced API calls to prevent spam
- Lazy loading of chart component
- Optimized re-renders with React.memo
- Progressive loading (price first, then chart)

### Security Considerations
- Validate token addresses before API calls
- Sanitize external URLs before opening
- Rate limiting on server-side endpoints
- CORS configuration for external APIs
- Input validation for all user interactions