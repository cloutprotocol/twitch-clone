# Theme System Refactoring Guide

## Overview
This guide outlines the comprehensive refactoring of rarecube.tv's theme system for better performance, maintainability, and modern standards.

## What's New

### 1. Semantic Color System
- **Before**: Hardcoded hex values (`#252731`, `#2D2E35`)
- **After**: Semantic tokens (`bg-background-secondary`, `border-border-primary`)

### 2. Enhanced Theme Provider
- **Before**: Forced dark theme only
- **After**: Multi-theme support (light, dark, high-contrast, system)

### 3. Performance Optimizations
- **Before**: Global transitions on all elements
- **After**: Selective transitions only on interactive elements
- **Before**: No CSS optimization
- **After**: CSS custom properties with optimized values

### 4. Better Developer Experience
- **Before**: Scattered color values
- **After**: Centralized theme configuration
- **Before**: No type safety
- **After**: TypeScript-first theme utilities

## Migration Steps

### Step 1: Replace Hardcoded Colors

**Before:**
```tsx
<nav className="bg-[#252731] border-[#2D2E35]">
```

**After:**
```tsx
<nav className="bg-background-secondary border-border-primary">
```

### Step 2: Use Theme Utilities

**Before:**
```tsx
import { cn } from "@/lib/utils";
```

**After:**
```tsx
import { cn, themeColors } from "@/lib/theme-utils";
```

### Step 3: Update Component Variants

**Before:**
```tsx
<Button className="bg-blue-600 hover:bg-blue-600/80">
```

**After:**
```tsx
<Button className={themeColors.interactive.primary}>
```

### Step 4: Add Theme Toggle (Optional)

```tsx
import { ThemeToggle } from "@/components/theme/theme-toggle";

// Add to your navbar or settings
<ThemeToggle />
```

## New Theme Tokens

### Background Hierarchy
- `bg-background-primary` - Main background
- `bg-background-secondary` - Cards, sidebars
- `bg-background-tertiary` - Elevated elements
- `bg-background-overlay` - Modals, overlays

### Text Hierarchy
- `text-text-primary` - Main text
- `text-text-secondary` - Descriptions, labels
- `text-text-tertiary` - Placeholders, disabled
- `text-text-inverse` - Text on dark backgrounds

### Interactive Elements
- `bg-interactive-primary` - Primary buttons
- `bg-interactive-secondary` - Secondary buttons
- `hover:bg-interactive-hover` - Hover states
- `active:bg-interactive-active` - Active states

### Borders
- `border-border-primary` - Main borders
- `border-border-secondary` - Subtle dividers
- `border-border-focus` - Focus rings

### Status Colors
- `bg-status-success` - Success states
- `bg-status-warning` - Warning states
- `bg-status-error` - Error states
- `bg-status-info` - Info states

### Streaming Specific
- `bg-streaming-live` - Live indicators
- `bg-streaming-offline` - Offline states
- `text-streaming-viewer` - Viewer counts

## Performance Benefits

1. **Reduced CSS Bundle Size**: Semantic tokens reduce duplicate color values
2. **Better Caching**: CSS custom properties enable better browser caching
3. **Optimized Transitions**: Only animate necessary properties
4. **Reduced Repaints**: Semantic tokens reduce layout thrashing

## Accessibility Improvements

1. **High Contrast Theme**: Built-in support for accessibility
2. **Reduced Motion**: Respects `prefers-reduced-motion`
3. **Better Focus Management**: Consistent focus rings
4. **Color Contrast**: Optimized color ratios for WCAG compliance

## Breaking Changes

### Components to Update
1. All navbar components (`app/(browse)/_components/navbar/`)
2. All sidebar components (`app/(browse)/_components/sidebar/`)
3. Dashboard components (`app/(dashboard)/`)
4. Stream player components (`components/stream-player/`)

### CSS Classes to Replace
- `bg-[#252731]` → `bg-background-secondary`
- `border-[#2D2E35]` → `border-border-primary`
- `bg-[#0e0e10]` → `bg-background-primary`
- `text-muted-foreground` → `text-text-secondary`

## Testing Checklist

- [ ] All themes render correctly (light, dark, high-contrast)
- [ ] Theme switching works without layout shift
- [ ] Performance metrics improved (Lighthouse scores)
- [ ] Accessibility tests pass
- [ ] Mobile responsiveness maintained
- [ ] No visual regressions in components

## Next Steps

1. **Phase 1**: Update core layout components (navbar, sidebar)
2. **Phase 2**: Migrate stream player components
3. **Phase 3**: Update dashboard and auth components
4. **Phase 4**: Add theme customization features
5. **Phase 5**: Performance optimization and monitoring

## Resources

- [Theme Configuration](./lib/theme-config.ts)
- [Theme Utilities](./lib/theme-utils.ts)
- [Example Components](./components/examples/)
- [CSS Tokens](./lib/theme-tokens.css)