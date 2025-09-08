# Implementation Plan

- [ ] 1. Create token data service and utilities
  - Implement TokenChartService class with Jupiter and DexScreener API integration
  - Create caching mechanism with 30-second TTL for token data
  - Add error handling for API failures and rate limiting
  - Write utility functions for price formatting and data transformation
  - _Requirements: 1.3, 2.2, 4.2, 4.3_

- [ ] 2. Create token data React hook
  - Implement useTokenData hook for managing token data state
  - Add real-time updates with 30-second intervals
  - Handle loading, error, and success states
  - Implement cleanup for component unmounting
  - _Requirements: 1.1, 1.4, 4.4_

- [ ] 3. Build core TokenChart component structure
  - Create main TokenChart component with collapsible functionality
  - Implement responsive design for mobile and desktop
  - Add loading states and error fallbacks
  - Create session-based expand/collapse preference storage
  - _Requirements: 1.1, 1.5, 3.1, 3.4_

- [ ] 4. Implement TokenChartHeader component
  - Display token name, symbol, and current price prominently
  - Show 24h price change with color coding (green/red)
  - Add token logo display with fallback
  - Implement responsive layout for different screen sizes
  - _Requirements: 2.3, 3.1_

- [ ] 5. Create TokenChartWidget with market data
  - Display market cap, volume, and other key metrics
  - Implement smooth animations for data updates
  - Add loading skeletons for better UX
  - Create responsive grid layout for market stats
  - _Requirements: 1.2, 3.3_

- [ ] 6. Build price chart visualization component
  - Integrate lightweight charting library (Chart.js or similar)
  - Implement time-based price chart with volume bars
  - Add interactive features (hover, zoom) without disrupting stream
  - Optimize chart rendering for performance
  - _Requirements: 1.2, 3.3, 4.3_

- [ ] 7. Create trading links component
  - Generate Jupiter and Raydium swap URLs with pre-populated token
  - Add DexScreener chart link for detailed analysis
  - Implement external link handling with new tab opening
  - Add appropriate disclaimers and safety warnings
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ] 8. Add server-side API endpoint for token data
  - Create /api/token-data/[address] route for server-side caching
  - Implement request validation and rate limiting
  - Add error handling and appropriate HTTP status codes
  - Create fallback mechanisms for API failures
  - _Requirements: 4.2, 4.4_

- [ ] 9. Integrate TokenChart into StreamPlayer component
  - Add TokenChart component below Header in stream layout
  - Ensure proper responsive behavior with existing layout
  - Test integration with collapsed/expanded chat sidebar
  - Verify no interference with video controls or chat
  - _Requirements: 1.1, 3.4, 3.5_

- [ ] 10. Add token validation and metadata fetching
  - Implement token address validation using existing Helius RPC
  - Fetch token metadata (name, symbol, decimals) as fallback
  - Add token existence check when attaching tokens
  - Update existing attach-token API to validate market data availability
  - _Requirements: 2.2, 4.1_

- [ ] 11. Implement error handling and fallback states
  - Create graceful fallback UI for when token data is unavailable
  - Add retry mechanisms with exponential backoff
  - Implement "token not found" state with address display
  - Add copy-to-clipboard functionality for token addresses
  - _Requirements: 1.4, 4.5, 5.4_

- [ ] 12. Add performance optimizations and caching
  - Implement client-side caching with proper cache invalidation
  - Add request deduplication for multiple viewers of same stream
  - Optimize component re-renders with React.memo and useMemo
  - Add lazy loading for chart component to improve initial load
  - _Requirements: 2.4, 4.3_

- [ ] 13. Create comprehensive test suite
  - Write unit tests for TokenChartService and utility functions
  - Add component tests for all TokenChart components
  - Create integration tests for API endpoints
  - Add E2E tests for complete user flow
  - _Requirements: 4.4, 4.5_

- [ ] 14. Add mobile-specific optimizations
  - Optimize chart component for touch interactions
  - Implement mobile-friendly responsive breakpoints
  - Add swipe gestures for chart navigation
  - Ensure proper scaling on various mobile screen sizes
  - _Requirements: 3.1, 3.4_

- [ ] 15. Final integration and testing
  - Test complete feature with real token data
  - Verify performance with multiple concurrent users
  - Test error scenarios and recovery mechanisms
  - Validate accessibility compliance and keyboard navigation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_