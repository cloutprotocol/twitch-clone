import { TokenData } from "./token-chart-service";

/**
 * Format price with appropriate decimal places and currency symbol
 */
export function formatPrice(price: number): string {
  if (price === 0) return "$0.00";
  
  if (price < 0.01) {
    // For very small prices, show more decimal places
    return `$${price.toFixed(6)}`;
  } else if (price < 1) {
    // For prices under $1, show 4 decimal places
    return `$${price.toFixed(4)}`;
  } else if (price < 100) {
    // For prices under $100, show 2 decimal places
    return `$${price.toFixed(2)}`;
  } else {
    // For larger prices, show whole numbers or 2 decimal places
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

/**
 * Format percentage change with appropriate color coding
 */
export function formatPriceChange(change: number): {
  formatted: string;
  isPositive: boolean;
  colorClass: string;
} {
  const isPositive = change >= 0;
  const formatted = `${isPositive ? '+' : ''}${change.toFixed(2)}%`;
  const colorClass = isPositive ? 'text-status-success' : 'text-status-error';
  
  return {
    formatted,
    isPositive,
    colorClass,
  };
}

/**
 * Format large numbers (market cap, volume) with appropriate suffixes
 */
export function formatLargeNumber(num: number): string {
  if (num === 0) return "$0";
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e12) {
    return `$${(num / 1e12).toFixed(2)}T`;
  } else if (absNum >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`;
  } else if (absNum >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`;
  } else if (absNum >= 1e3) {
    return `$${(num / 1e3).toFixed(2)}K`;
  } else {
    return `$${num.toFixed(2)}`;
  }
}

/**
 * Format volume with appropriate suffixes
 */
export function formatVolume(volume: number): string {
  return formatLargeNumber(volume);
}

/**
 * Format market cap with appropriate suffixes
 */
export function formatMarketCap(marketCap: number): string {
  return formatLargeNumber(marketCap);
}

/**
 * Generate trading links for popular DEX platforms
 */
export function generateTradingLinks(tokenAddress: string): {
  jupiter: string;
  raydium: string;
  dexscreener: string;
} {
  return {
    jupiter: `https://jup.ag/swap/SOL-${tokenAddress}`,
    raydium: `https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${tokenAddress}`,
    dexscreener: `https://dexscreener.com/solana/${tokenAddress}`,
  };
}

/**
 * Get relative time string (e.g., "2 minutes ago")
 */
export function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Truncate token address for display
 */
export function truncateAddress(address: string, startChars: number = 4, endChars: number = 4): string {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    } catch (fallbackError) {
      console.error('Failed to copy to clipboard:', fallbackError);
      return false;
    }
  }
}

/**
 * Validate and sanitize token data
 */
export function sanitizeTokenData(data: TokenData): TokenData {
  return {
    ...data,
    price: Math.max(0, data.price || 0),
    priceChange24h: isFinite(data.priceChange24h) ? data.priceChange24h : 0,
    marketCap: Math.max(0, data.marketCap || 0),
    volume24h: Math.max(0, data.volume24h || 0),
    decimals: Math.max(0, Math.min(18, data.decimals || 9)), // Clamp between 0-18
    name: data.name || 'Unknown Token',
    symbol: data.symbol || 'UNKNOWN',
  };
}

/**
 * Check if token data is stale (older than 5 minutes)
 */
export function isTokenDataStale(lastUpdated: number): boolean {
  const STALE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
  return Date.now() - lastUpdated > STALE_THRESHOLD;
}

/**
 * Generate a deterministic color for a token based on its address
 */
export function getTokenColor(address: string): string {
  // Simple hash function to generate consistent colors
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    const char = address.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Generate HSL color with good saturation and lightness
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Format time for chart display
 */
export function formatChartTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Calculate price change percentage between two values
 */
export function calculatePriceChange(currentPrice: number, previousPrice: number): number {
  if (previousPrice === 0) return 0;
  return ((currentPrice - previousPrice) / previousPrice) * 100;
}

/**
 * Debounce function for API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}