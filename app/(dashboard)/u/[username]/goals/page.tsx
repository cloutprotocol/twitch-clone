"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Goal {
  id: string;
  marketCap: number;
  description: string;
}

const defaultGoals: Goal[] = [
  { id: "1", marketCap: 50000, description: "First milestone - community building" },
  { id: "2", marketCap: 100000, description: "Marketing push and partnerships" },
  { id: "3", marketCap: 250000, description: "Major exchange listings" },
  { id: "4", marketCap: 500000, description: "Product development phase 2" },
  { id: "5", marketCap: 1000000, description: "Global expansion and adoption" },
];

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [isSaving, setIsSaving] = useState(false);

  const handleGoalChange = (id: string, field: keyof Goal, value: string | number) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, [field]: value } : goal
    ));
  };

  const formatMarketCap = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  const handleSaveGoals = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to save goals
      const response = await fetch("/api/stream/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goals }),
      });

      if (response.ok) {
        toast.success("Goals saved successfully!");
        router.back();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to save goals");
      }
    } catch (error) {
      toast.error("Failed to save goals");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Token Goals</h1>
          <p className="text-text-secondary">Set market cap goals to track your token's progress</p>
        </div>
      </div>

      <Card className="bg-background-secondary border-border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-text-primary">
            <Target className="h-5 w-5" />
            Market Cap Goals
          </CardTitle>
          <CardDescription className="text-text-secondary">
            Configure up to 5 goals based on market cap milestones. These will be displayed above your chat with live progress tracking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {goals.map((goal, index) => (
            <div key={goal.id} className="space-y-4 p-4 border border-border-primary rounded-lg bg-background-tertiary">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <h3 className="font-medium text-text-primary">Goal {index + 1}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`marketcap-${goal.id}`} className="text-text-primary">
                    Market Cap ($)
                  </Label>
                  <Input
                    id={`marketcap-${goal.id}`}
                    type="number"
                    value={goal.marketCap}
                    onChange={(e) => handleGoalChange(goal.id, "marketCap", parseInt(e.target.value) || 0)}
                    className="mt-1"
                    placeholder="Enter market cap value"
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    Currently: {formatMarketCap(goal.marketCap)}
                  </p>
                </div>
                
                <div className="md:col-span-1">
                  <Label htmlFor={`description-${goal.id}`} className="text-text-primary">
                    Goal Description
                  </Label>
                  <Textarea
                    id={`description-${goal.id}`}
                    value={goal.description}
                    onChange={(e) => handleGoalChange(goal.id, "description", e.target.value)}
                    className="mt-1 min-h-[80px]"
                    placeholder="Describe what you'll achieve at this milestone..."
                    maxLength={100}
                  />
                  <p className="text-xs text-text-secondary mt-1">
                    {goal.description.length}/100 characters
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end gap-3 pt-6 border-t border-border-primary">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveGoals}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Goals
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}