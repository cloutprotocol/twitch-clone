"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

interface ExtendedThemeProviderProps extends Omit<ThemeProviderProps, 'themes'> {
  children: React.ReactNode
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
    </NextThemesProvider>
  )
}

// Hook for accessing theme with type safety
export function useTheme() {
  const context = React.useContext(NextThemesProvider as any)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}