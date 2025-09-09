"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Target, Trophy, Check } from "lucide-react";
import { useSharedTokenData } from "@/hooks/use-shared-token-data";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Goal {
  id: string;
  marketCap: number;
  description: string;
  order: number;
  isReached: boolean;
  reachedAt?: Date;
}

interface GoalsDisplayProps {
  streamId: string;
  tokenAddress?: string;
  className?: string;
}

export const GoalsDisplay = ({ streamId, tokenAddress, className }: GoalsDisplayProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use shared token data instead of separate market cap API
  const { priceData, isLoading: tokenDataLoading } = useSharedTokenData(tokenAddress || '');
  const currentMarketCap = priceData?.marketCap || 0;

  // Debug logging
  console.log('Goals Display - Token Data:', {
    tokenAddress,
    priceData,
    currentMarketCap,
    isLoading: tokenDataLoading
  });

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch(`/api/stream/${streamId}/goals`);
        if (response.ok) {
          const data = await response.json();
          setGoals(data.goals || []);
        }
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (streamId) {
      fetchGoals();
    }
  }, [streamId]);

  // Check for goal completion when market cap changes
  useEffect(() => {
    if (currentMarketCap > 0 && goals.length > 0) {
      const completedGoals = goals.filter(goal => 
        currentMarketCap >= goal.marketCap && !goal.isReached
      );
      
      if (completedGoals.length > 0) {
        updateGoalCompletion(completedGoals, currentMarketCap);
      }
    }
  }, [currentMarketCap, goals, streamId]);

  const updateGoalCompletion = async (completedGoals: Goal[], marketCap: number) => {
    try {
      await fetch(`/api/stream/${streamId}/goals/update-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completedGoals: completedGoals.map(g => g.id),
          marketCap: marketCap,
        }),
      });
      
      // Refresh goals data after updating completion
      const response = await fetch(`/api/stream/${streamId}/goals`);
      if (response.ok) {
        const data = await response.json();
        setGoals(data.goals || []);
      }
    } catch (error) {
      console.error("Failed to update goal completion:", error);
    }
  };

  const formatMarketCap = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const calculateProgress = (targetMarketCap: number): number => {
    if (currentMarketCap >= targetMarketCap) return 100;
    return Math.min((currentMarketCap / targetMarketCap) * 100, 100);
  };

  const getNextGoal = (): Goal | null => {
    return goals.find(goal => !goal.isReached) || null;
  };

  const getHighestCompletedGoal = (): Goal | null => {
    const completedGoals = goals.filter(goal => goal.isReached);
    if (completedGoals.length === 0) return null;
    return completedGoals.reduce((highest, current) => 
      current.marketCap > highest.marketCap ? current : highest
    );
  };

  if (isLoading || goals.length === 0) {
    return null;
  }

  const nextGoal = getNextGoal();
  const completedGoals = goals.filter(goal => goal.isReached).length;
  const highestCompletedGoal = getHighestCompletedGoal();

  return (
    <Card className={`${className} bg-background-secondary border-border-primary`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <Target className="h-4 w-4" />
            Token Goals ({completedGoals}/{goals.length})
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-6 w-6 p-0"
          >
            {isCollapsed ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronUp className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isCollapsed && (
          <div className="text-xs text-text-secondary">
            Current: {formatMarketCap(currentMarketCap)}
            {nextGoal && (
              <span className="ml-2">
                Next: {formatMarketCap(nextGoal.marketCap)}
              </span>
            )}
          </div>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="pt-0 space-y-3">
          {goals.map((goal, index) => {
            const progress = calculateProgress(goal.marketCap);
            const isActive = !goal.isReached && (!nextGoal || goal.id === nextGoal.id);
            const isHighestCompleted = highestCompletedGoal && goal.id === highestCompletedGoal.id;
            
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        goal.isReached 
                          ? isHighestCompleted
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg ring-2 ring-yellow-300'
                            : 'bg-green-500 text-white'
                          : isActive 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-background-tertiary text-text-secondary border border-border-primary'
                      }`}
                    >
                      {goal.isReached ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        goal.order
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium truncate ${
                        isHighestCompleted 
                          ? 'text-yellow-400 font-bold' 
                          : 'text-text-primary'
                      }`}>
                        {formatMarketCap(goal.marketCap)}
                      </div>
                      <div className={`text-xs truncate ${
                        isHighestCompleted 
                          ? 'text-yellow-300' 
                          : 'text-text-secondary'
                      }`}>
                        {goal.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs">
                    {goal.isReached ? (
                      <Check className={`h-4 w-4 ${
                        isHighestCompleted ? 'text-yellow-400' : 'text-green-500'
                      }`} />
                    ) : (
                      <span className="text-text-secondary">{progress.toFixed(0)}%</span>
                    )}
                  </div>
                </div>
                
                <Progress 
                  value={progress} 
                  className={`h-1.5 ${
                    isHighestCompleted 
                      ? 'bg-yellow-900/20' 
                      : isActive 
                        ? 'opacity-100' 
                        : 'opacity-60'
                  }`}
                />
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
};