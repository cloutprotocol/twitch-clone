/**
 * Centralized theme configuration
 * Modern approach with semantic tokens and design system principles
 */

export const themeConfig = {
  // Brand colors - easy to update globally
  brand: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      500: '#0ea5e9',
      600: '#0284c7',
      900: '#0c4a6e',
    },
    accent: {
      50: '#fdf4ff',
      100: '#fae8ff',
      500: '#d946ef',
      600: '#c026d3',
      900: '#581c87',
    }
  },

  // Semantic color tokens
  colors: {
    // Background hierarchy
    background: {
      primary: 'hsl(var(--background-primary))',
      secondary: 'hsl(var(--background-secondary))',
      tertiary: 'hsl(var(--background-tertiary))',
      overlay: 'hsl(var(--background-overlay))',
    },
    
    // Text hierarchy
    text: {
      primary: 'hsl(var(--text-primary))',
      secondary: 'hsl(var(--text-secondary))',
      tertiary: 'hsl(var(--text-tertiary))',
      inverse: 'hsl(var(--text-inverse))',
    },
    
    // Interactive elements
    interactive: {
      primary: 'hsl(var(--interactive-primary))',
      secondary: 'hsl(var(--interactive-secondary))',
      hover: 'hsl(var(--interactive-hover))',
      active: 'hsl(var(--interactive-active))',
      disabled: 'hsl(var(--interactive-disabled))',
    },
    
    // Borders and dividers
    border: {
      primary: 'hsl(var(--border-primary))',
      secondary: 'hsl(var(--border-secondary))',
      focus: 'hsl(var(--border-focus))',
    },
    
    // Status colors
    status: {
      success: 'hsl(var(--status-success))',
      warning: 'hsl(var(--status-warning))',
      error: 'hsl(var(--status-error))',
      info: 'hsl(var(--status-info))',
    },
    
    // Live streaming specific
    streaming: {
      live: 'hsl(var(--streaming-live))',
      offline: 'hsl(var(--streaming-offline))',
      viewer: 'hsl(var(--streaming-viewer))',
    }
  },

  // Animation tokens for consistent motion
  animation: {
    duration: {
      fast: '150ms',
      normal: '250ms',
      slow: '350ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  },

  // Spacing scale
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },

  // Typography scale
  typography: {
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
    }
  }
} as const;

export type ThemeConfig = typeof themeConfig;