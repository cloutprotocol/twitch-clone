/**
 * Example: Refactored Card component using new theme system
 * Shows how to use semantic tokens for consistent theming
 */

import { cn, themeColors } from "@/lib/theme-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RefactoredCardProps {
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
}

export const RefactoredCard = ({ 
  title, 
  children, 
  variant = 'default',
  className 
}: RefactoredCardProps) => {
  return (
    <Card className={cn(
      // Base styles using semantic tokens
      "bg-background-secondary border-border-primary",
      "theme-transition",
      
      // Variant styles
      variant === 'elevated' && [
        "shadow-lg hover:shadow-xl",
        "hover:bg-background-tertiary",
        "transform hover:scale-[1.02]"
      ],
      
      variant === 'outlined' && [
        "border-2 border-border-secondary",
        "hover:border-border-focus"
      ],
      
      className
    )}>
      <CardHeader>
        <CardTitle className={cn(
          themeColors.text.primary,
          "text-lg font-semibold"
        )}>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={cn(
        themeColors.text.secondary
      )}>
        {children}
      </CardContent>
    </Card>
  );
};