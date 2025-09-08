"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { Toaster } from "sonner"

interface ExtendedThemeProviderProps extends Omit<ThemeProviderProps, 'themes'> {
  children: React.ReactNode
}

// Theme-aware Toaster component
function ThemedToaster() {
  const { theme } = useTheme()
  
  return (
    <Toaster 
      theme={theme === 'light' ? 'light' : 'dark'} 
      position="top-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--background-secondary))',
          color: 'hsl(var(--text-primary))',
          border: '1px solid hsl(var(--border-primary))',
        },
      }}
    />
  )
}

export function ThemeProvider({ children, ...props }: ExtendedThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      themes={['light', 'dark', 'high-contrast']}
      enableSystem={true}
      storageKey="rarecube-theme"
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
      <ThemedToaster />
    </NextThemesProvider>
  )
}