# Requirements Document

## Introduction

This feature enhances the existing "attach token" functionality by adding live token charts and market data visualization directly within the stream player interface. The enhancement builds upon the current token attachment system where streamers can associate Solana tokens with their streams, now providing viewers with real-time market data, price charts, and trading information without leaving the stream.

The solution focuses on being lightweight, fast, and minimally invasive to the existing codebase while providing maximum value to both streamers and viewers interested in token performance.

## Requirements

### Requirement 1

**User Story:** As a viewer watching a stream with an attached token, I want to see live price charts and market data, so that I can make informed decisions about the token while enjoying the stream content.

#### Acceptance Criteria

1. WHEN a stream has a tokenAddress attached THEN the system SHALL display a collapsible token chart widget below the video player
2. WHEN the token chart widget is expanded THEN the system SHALL show real-time price data, market cap, volume, and a price chart
3. WHEN the token chart loads THEN the system SHALL fetch data within 2 seconds to maintain stream performance
4. WHEN the token data is unavailable THEN the system SHALL show a graceful fallback message
5. WHEN the viewer collapses the chart THEN the system SHALL remember the preference for the session

### Requirement 2

**User Story:** As a streamer who has attached a token to my stream, I want the token chart to automatically appear for my viewers, so that I can showcase my token's performance without manual intervention.

#### Acceptance Criteria

1. WHEN a streamer attaches a token using the existing "Attach Token" feature THEN the token chart SHALL automatically become available to viewers
2. WHEN the token is attached THEN the system SHALL validate the token exists on Solana and has market data available
3. WHEN the token chart is displayed THEN the system SHALL show the token name, symbol, and current price prominently
4. WHEN multiple viewers are watching THEN the system SHALL efficiently cache token data to minimize API calls

### Requirement 3

**User Story:** As a viewer, I want the token chart to be responsive and not interfere with the stream experience, so that I can focus on the content while having market data available when needed.

#### Acceptance Criteria

1. WHEN viewing on mobile devices THEN the token chart SHALL be optimized for smaller screens
2. WHEN the chart is loading THEN the system SHALL show loading indicators without blocking the video player
3. WHEN the chart updates THEN the system SHALL use smooth animations that don't distract from the stream
4. WHEN the stream layout changes THEN the token chart SHALL adapt responsively
5. WHEN the user scrolls THEN the token chart SHALL remain accessible but not interfere with video controls

### Requirement 4

**User Story:** As a developer maintaining the platform, I want the token chart integration to be lightweight and use existing infrastructure, so that it doesn't impact performance or require significant architectural changes.

#### Acceptance Criteria

1. WHEN implementing the feature THEN the system SHALL reuse existing token storage (tokenAddress field in Stream model)
2. WHEN fetching market data THEN the system SHALL use a single, reliable API service with proper error handling
3. WHEN caching data THEN the system SHALL use client-side caching to minimize server load
4. WHEN the feature is disabled THEN the system SHALL gracefully hide the chart without affecting other functionality
5. WHEN errors occur THEN the system SHALL log appropriately without breaking the stream experience

### Requirement 5

**User Story:** As a viewer interested in trading, I want quick access to external trading platforms, so that I can act on the market information I see in the chart.

#### Acceptance Criteria

1. WHEN viewing token data THEN the system SHALL provide links to popular DEX platforms (Jupiter, Raydium)
2. WHEN clicking trading links THEN the system SHALL open them in new tabs to preserve the stream experience
3. WHEN the token address is available THEN the system SHALL pre-populate trading interfaces with the correct token
4. WHEN trading links are unavailable THEN the system SHALL show the token address for manual copying
5. WHEN displaying external links THEN the system SHALL include appropriate disclaimers about external platforms