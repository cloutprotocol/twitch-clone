/**
 * Error types for token chart functionality
 */
export enum TokenChartErrorType {
  TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND',
  API_UNAVAILABLE = 'API_UNAVAILABLE',
  RATE_LIMITED = 'RATE_LIMITED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  GENERAL_ERROR = 'GENERAL_ERROR',
}

export interface TokenChartError {
  type: TokenChartErrorType;
  message: string;
  action: 'retry' | 'show_fallback' | 'show_address_only' | 'retry_with_delay';
  retryAfter?: number; // seconds
}

/**
 * Error handler for token chart operations
 */
export class TokenChartErrorHandler {
  /**
   * Handle API errors and return appropriate error state
   */
  static handleApiError(error: Error, tokenAddress: string): TokenChartError {
    const errorMessage = error.message.toLowerCase();
    
    // Token not found (404 or similar)
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return {
        type: TokenChartErrorType.TOKEN_NOT_FOUND,
        message: 'Token data not available',
        action: 'show_address_only',
      };
    }
    
    // Rate limiting
    if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
      return {
        type: TokenChartErrorType.RATE_LIMITED,
        message: 'Loading market data...',
        action: 'retry_with_delay',
        retryAfter: 30,
      };
    }
    
    // Network/connectivity issues
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
      return {
        type: TokenChartErrorType.NETWORK_ERROR,
        message: 'Connection issue. Retrying...',
        action: 'retry',
      };
    }
    
    // API service unavailable
    if (errorMessage.includes('500') || errorMessage.includes('503') || errorMessage.includes('unavailable')) {
      return {
        type: TokenChartErrorType.API_UNAVAILABLE,
        message: 'Market data temporarily unavailable',
        action: 'show_fallback',
      };
    }
    
    // Invalid token address
    if (errorMessage.includes('invalid') && errorMessage.includes('address')) {
      return {
        type: TokenChartErrorType.INVALID_ADDRESS,
        message: 'Invalid token address',
        action: 'show_address_only',
      };
    }
    
    // General error
    return {
      type: TokenChartErrorType.GENERAL_ERROR,
      message: 'Unable to load market data',
      action: 'show_fallback',
    };
  }
  
  /**
   * Get user-friendly error message
   */
  static getUserMessage(error: TokenChartError): string {
    switch (error.type) {
      case TokenChartErrorType.TOKEN_NOT_FOUND:
        return 'This token doesn\'t have market data available yet.';
      
      case TokenChartErrorType.RATE_LIMITED:
        return 'Loading market data, please wait...';
      
      case TokenChartErrorType.NETWORK_ERROR:
        return 'Connection issue. Trying again...';
      
      case TokenChartErrorType.API_UNAVAILABLE:
        return 'Market data is temporarily unavailable.';
      
      case TokenChartErrorType.INVALID_ADDRESS:
        return 'This token address appears to be invalid.';
      
      default:
        return 'Unable to load market data right now.';
    }
  }
  
  /**
   * Determine if error should trigger a retry
   */
  static shouldRetry(error: TokenChartError): boolean {
    return error.action === 'retry' || error.action === 'retry_with_delay';
  }
  
  /**
   * Get retry delay in milliseconds
   */
  static getRetryDelay(error: TokenChartError, attempt: number = 1): number {
    if (error.retryAfter) {
      return error.retryAfter * 1000;
    }
    
    // Exponential backoff: 1s, 2s, 4s, 8s...
    return Math.min(1000 * Math.pow(2, attempt - 1), 30000);
  }
  
  /**
   * Check if error is recoverable
   */
  static isRecoverable(error: TokenChartError): boolean {
    return error.type !== TokenChartErrorType.INVALID_ADDRESS &&
           error.type !== TokenChartErrorType.TOKEN_NOT_FOUND;
  }
}

/**
 * Custom error class for token chart operations
 */
export class TokenChartServiceError extends Error {
  public readonly type: TokenChartErrorType;
  public readonly tokenAddress: string;
  public readonly retryAfter?: number;
  
  constructor(
    type: TokenChartErrorType,
    message: string,
    tokenAddress: string,
    retryAfter?: number
  ) {
    super(message);
    this.name = 'TokenChartServiceError';
    this.type = type;
    this.tokenAddress = tokenAddress;
    this.retryAfter = retryAfter;
  }
  
  /**
   * Create error from API response
   */
  static fromApiError(error: Error, tokenAddress: string): TokenChartServiceError {
    const errorInfo = TokenChartErrorHandler.handleApiError(error, tokenAddress);
    return new TokenChartServiceError(
      errorInfo.type,
      errorInfo.message,
      tokenAddress,
      errorInfo.retryAfter
    );
  }
}

/**
 * Error boundary helper for React components
 */
export interface ErrorBoundaryState {
  hasError: boolean;
  error: TokenChartError | null;
  tokenAddress?: string;
}

export const initialErrorState: ErrorBoundaryState = {
  hasError: false,
  error: null,
};

/**
 * Error state reducer for React components
 */
export function errorStateReducer(
  state: ErrorBoundaryState,
  action: { type: 'SET_ERROR'; error: TokenChartError; tokenAddress?: string } | { type: 'CLEAR_ERROR' }
): ErrorBoundaryState {
  switch (action.type) {
    case 'SET_ERROR':
      return {
        hasError: true,
        error: action.error,
        tokenAddress: action.tokenAddress,
      };
    
    case 'CLEAR_ERROR':
      return initialErrorState;
    
    default:
      return state;
  }
}