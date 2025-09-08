import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { themeConfig } from "./theme-config"

/**
 * Enhanced cn utility with theme-aware class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get theme-aware color classes
 */
export const themeColors = {
  // Background variants
  bg: {
    primary: "bg-background-primary",
    secondary: "bg-background-secondary", 
    tertiary: "bg-background-tertiary",
    overlay: "bg-background-overlay",
  },
  
  // Text variants
  text: {
    primary: "text-text-primary",
    secondary: "text-text-secondary",
    tertiary: "text-text-tertiary",
    inverse: "text-text-inverse",
  },
  
  // Interactive variants
  interactive: {
    primary: "bg-interactive-primary hover:bg-interactive-hover active:bg-interactive-active",
    secondary: "bg-interactive-secondary hover:bg-interactive-hover",
    disabled: "bg-interactive-disabled cursor-not-allowed",
  },
  
  // Border variants
  border: {
    primary: "border-border-primary",
    secondary: "border-border-secondary", 
    focus: "border-border-focus",
  },
  
  // Status variants
  status: {
    success: "bg-status-success text-white",
    warning: "bg-status-warning text-white",
    error: "bg-status-error text-white",
    info: "bg-status-info text-white",
  },
  
  // Streaming specific
  streaming: {
    live: "bg-streaming-live text-white",
    offline: "bg-streaming-offline text-white",
    viewer: "text-streaming-viewer",
  }
} as const

/**
 * Component variant builder with theme support
 */
export function createThemeVariants<T extends Record<string, Record<string, string>>>(
  variants: T
) {
  return variants
}

/**
 * Responsive theme utilities
 */
export const responsive = {
  mobile: "sm:hidden",
  tablet: "hidden sm:block lg:hidden", 
  desktop: "hidden lg:block",
  touch: "lg:hover:hover",
} as const

/**
 * Animation utilities with theme support
 */
export const animations = {
  fadeIn: "animate-in fade-in duration-200",
  fadeOut: "animate-out fade-out duration-150",
  slideIn: "animate-in slide-in-from-bottom-2 duration-200",
  slideOut: "animate-out slide-out-to-bottom-2 duration-150",
  scaleIn: "animate-in zoom-in-95 duration-200",
  scaleOut: "animate-out zoom-out-95 duration-150",
} as const

/**
 * Focus management utilities
 */
export const focus = {
  ring: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2",
  within: "focus-within:ring-2 focus-within:ring-border-focus focus-within:ring-offset-2",
} as const