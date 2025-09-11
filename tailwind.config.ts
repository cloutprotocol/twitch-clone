import { withUt } from "uploadthing/tw";
import { themeConfig } from "./lib/theme-config";

/** @type {import('tailwindcss').Config} */
module.exports = withUt({
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Legacy shadcn/ui colors for backward compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // New semantic theme colors
        'background-primary': themeConfig.colors.background.primary,
        'background-secondary': themeConfig.colors.background.secondary,
        'background-tertiary': themeConfig.colors.background.tertiary,
        'background-overlay': 'hsl(var(--background-overlay) / var(--background-overlay-opacity))',
        
        'text-primary': themeConfig.colors.text.primary,
        'text-secondary': themeConfig.colors.text.secondary,
        'text-tertiary': themeConfig.colors.text.tertiary,
        'text-inverse': themeConfig.colors.text.inverse,
        
        'interactive-primary': themeConfig.colors.interactive.primary,
        'interactive-secondary': themeConfig.colors.interactive.secondary,
        'interactive-hover': themeConfig.colors.interactive.hover,
        'interactive-active': themeConfig.colors.interactive.active,
        'interactive-disabled': themeConfig.colors.interactive.disabled,
        
        'border-primary': themeConfig.colors.border.primary,
        'border-secondary': themeConfig.colors.border.secondary,
        'border-focus': themeConfig.colors.border.focus,
        
        'status-success': themeConfig.colors.status.success,
        'status-warning': themeConfig.colors.status.warning,
        'status-error': themeConfig.colors.status.error,
        'status-info': themeConfig.colors.status.info,
        
        'streaming-live': themeConfig.colors.streaming.live,
        'streaming-offline': themeConfig.colors.streaming.offline,
        'streaming-viewer': themeConfig.colors.streaming.viewer,
        
        'highlight-primary': themeConfig.colors.highlight.primary,
        'highlight-primary-alpha': themeConfig.colors.highlight.primaryAlpha,
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'fade-out': 'fadeOut 0.15s ease-in',
        'slide-up': 'slideUp 0.2s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.15s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Custom plugin for theme utilities
    function({ addUtilities }: any) {
      addUtilities({
        '.theme-transition': {
          'transition-property': 'color, background-color, border-color, opacity, transform',
          'transition-duration': '150ms',
          'transition-timing-function': 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.no-transition': {
          'transition': 'none !important',
        },
      })
    }
  ],
});
