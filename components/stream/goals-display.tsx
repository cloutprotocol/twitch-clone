"use client";

import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, Target, Settings, Edit3, Trash2 } from "lucide-react";
import { useSharedTokenData } from "@/hooks/use-shared-token-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Goal {
  id: string;
  tokenAddress: string;
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
  canEdit?: boolean;
  username?: string;
}

export const GoalsDisplay = ({ streamId, tokenAddress, className, canEdit = false, username }: GoalsDisplayProps) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use shared token data instead of separate market cap API
  const { priceData, isLoading: tokenDataLoading } = useSharedTokenData(tokenAddress || '');
  const currentMarketCap = priceData?.marketCap || 0;

  useEffect(() => {
    const fetchGoals = async () => {
      if (!tokenAddress) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch(`/api/stream/${streamId}/goals?tokenAddress=${encodeURIComponent(tokenAddress)}`);
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

    if (streamId && tokenAddress) {
      fetchGoals();
    }
  }, [streamId, tokenAddress]);

  // Check for goal completion when market cap changes
  useEffect(() => {
    if (currentMarketCap > 0 && goals.length > 0 && tokenAddress) {
      const completedGoals = goals.filter(goal => 
        currentMarketCap >= goal.marketCap && !goal.isReached
      );
      
      if (completedGoals.length > 0) {
        updateGoalCompletion(completedGoals, currentMarketCap);
      }
    }
  }, [currentMarketCap, goals, streamId, tokenAddress]);

  const updateGoalCompletion = async (completedGoals: Goal[], marketCap: number) => {
    if (!tokenAddress) return;
    
    try {
      await fetch(`/api/stream/${streamId}/goals/update-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completedGoals: completedGoals.map(g => g.id),
          marketCap: marketCap,
          tokenAddress: tokenAddress,
        }),
      });
      
      // Refresh goals data after updating completion
      const response = await fetch(`/api/stream/${streamId}/goals?tokenAddress=${encodeURIComponent(tokenAddress)}`);
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

  const calculateProgress = (): number => {
    if (goals.length === 0) return 0;
    
    // Find the highest goal that has been reached
    const completedGoals = goals.filter(goal => goal.isReached);
    const highestCompleted = completedGoals.length > 0 
      ? Math.max(...completedGoals.map(g => g.marketCap))
      : 0;
    
    // Find the next goal to reach
    const nextGoal = goals
      .filter(goal => !goal.isReached)
      .sort((a, b) => a.marketCap - b.marketCap)[0];
    
    if (!nextGoal) {
      // All goals completed
      return 100;
    }
    
    // Calculate progress from highest completed to next goal
    const progressStart = highestCompleted;
    const progressEnd = nextGoal.marketCap;
    const progressRange = progressEnd - progressStart;
    const currentProgress = Math.max(0, currentMarketCap - progressStart);
    
    const baseProgress = (completedGoals.length / goals.length) * 100;
    const nextGoalProgress = progressRange > 0 
      ? (currentProgress / progressRange) * (100 / goals.length)
      : 0;
    
    return Math.min(100, baseProgress + nextGoalProgress);
  };

  const handleEditGoals = () => {
    if (!username || !tokenAddress) return;
    // Navigate to goals editing page with token context
    window.location.href = `/u/${username}/goals?token=${encodeURIComponent(tokenAddress)}`;
  };

  const handleDeleteGoals = async () => {
    if (!tokenAddress || !confirm('Are you sure you want to delete all goals for this token?')) return;
    
    try {
      await fetch(`/api/stream/goals`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tokenAddress }),
      });
      setGoals([]);
    } catch (error) {
      console.error("Failed to delete goals:", error);
    }
  };

  if (isLoading || !tokenAddress) {
    return null;
  }

  if (goals.length === 0) {
    return canEdit ? (
      <Card className={`${className} bg-background-secondary border-border-primary`}>
        <CardContent className="p-4 text-center">
          <Target className="h-6 w-6 mx-auto mb-2 text-text-secondary" />
          <p className="text-xs text-text-secondary mb-3">No goals set for this token</p>
          <Button size="sm" onClick={handleEditGoals} className="text-xs h-8 px-3 touch-manipulation">
            Set Goals
          </Button>
        </CardContent>
      </Card>
    ) : null;
  }

  const completedGoals = goals.filter(goal => goal.isReached).length;
  const overallProgress = calculateProgress();
  const sortedGoals = [...goals].sort((a, b) => b.marketCap - a.marketCap); // Highest to lowest for vertical display

  return (
    <Card className={`${className} bg-background-secondary border-border-primary`}>
      <CardHeader className="pb-2 px-4 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <Target className="h-4 w-4" />
            Token Goals ({completedGoals}/{goals.length})
          </CardTitle>
          <div className="flex items-center gap-1">
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 touch-manipulation">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={handleEditGoals}>
                    <Edit3 className="h-3 w-3 mr-2" />
                    Edit Goals
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteGoals} className="text-red-600">
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete Goals
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="h-8 w-8 p-0 touch-manipulation"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        {!isCollapsed && (
          <div className="text-xs text-text-secondary mt-1">
            Current: {formatMarketCap(currentMarketCap)}
          </div>
        )}
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="px-4 pb-4 pt-0">
          {/* Vertical Progress Bar */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center flex-shrink-0">
              <div className="w-3 h-20 sm:h-24 bg-background-tertiary rounded-full relative overflow-hidden">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 to-green-400 rounded-full transition-all duration-500"
                  style={{ height: `${overallProgress}%` }}
                />
              </div>
              <div className="text-xs text-text-secondary mt-1 font-medium">
                {overallProgress.toFixed(0)}%
              </div>
            </div>
            
            {/* Goals List */}
            <div className="flex-1 space-y-2 min-w-0">
              {sortedGoals.map((goal, index) => {
                const isReached = goal.isReached;
                const isNext = !isReached && goals.filter(g => !g.isReached && g.marketCap < goal.marketCap).length === 0;
                
                return (
                  <div key={goal.id} className="flex items-center gap-2 py-1">
                    <div 
                      className={`w-4 h-4 rounded-sm flex items-center justify-center text-xs font-bold transition-all flex-shrink-0 ${
                        isReached 
                          ? 'bg-green-500 text-white' 
                          : isNext
                            ? 'bg-green-500/20 border-2 border-green-500 text-green-500'
                            : 'bg-background-tertiary border border-border-primary text-text-secondary'
                      }`}
                    >
                      {isReached ? '✓' : goal.order}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-medium truncate leading-tight ${
                        isReached ? 'text-green-400' : isNext ? 'text-text-primary' : 'text-text-secondary'
                      }`}>
                        {formatMarketCap(goal.marketCap)}
                      </div>
                      <div className={`text-xs truncate leading-tight ${
                        isReached ? 'text-green-300' : 'text-text-secondary'
                      }`}>
                        {goal.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};