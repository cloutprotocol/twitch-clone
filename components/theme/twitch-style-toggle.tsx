"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/theme-utils"

export function TwitchStyleThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button 
        variant="ghost" 
        size="icon"
        className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-background-tertiary"
      >
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-4 w-4" />
      case 'dark':
        return <Moon className="h-4 w-4" />
      case 'system':
        return <Monitor className="h-4 w-4" />
      default:
        return <Moon className="h-4 w-4" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className={cn(
            "h-8 w-8 rounded-md",
            "text-text-secondary hover:text-text-primary",
            "hover:bg-background-tertiary",
            "transition-colors duration-200"
          )}
        >
          {getIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={cn(
          "min-w-[140px] p-1",
          "bg-background-secondary border-border-primary",
          "shadow-lg"
        )}
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-sm cursor-pointer",
            "text-text-primary hover:bg-background-tertiary",
            "focus:bg-background-tertiary",
            theme === "light" && "bg-background-tertiary"
          )}
        >
          <Sun className="h-4 w-4" />
          <span className="text-sm">Light</span>
          {theme === "light" && (
            <div className="ml-auto h-1 w-1 rounded-full bg-interactive-primary" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-sm cursor-pointer",
            "text-text-primary hover:bg-background-tertiary",
            "focus:bg-background-tertiary",
            theme === "dark" && "bg-background-tertiary"
          )}
        >
          <Moon className="h-4 w-4" />
          <span className="text-sm">Dark</span>
          {theme === "dark" && (
            <div className="ml-auto h-1 w-1 rounded-full bg-interactive-primary" />
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-sm cursor-pointer",
            "text-text-primary hover:bg-background-tertiary",
            "focus:bg-background-tertiary",
            theme === "system" && "bg-background-tertiary"
          )}
        >
          <Monitor className="h-4 w-4" />
          <span className="text-sm">System</span>
          {theme === "system" && (
            <div className="ml-auto h-1 w-1 rounded-full bg-interactive-primary" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}