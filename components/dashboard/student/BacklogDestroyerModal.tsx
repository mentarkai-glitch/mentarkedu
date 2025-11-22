"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, CheckCircle2, Clock, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SurvivalPlanItem {
  id: string;
  conceptName: string;
  subject: string;
  priority: 1 | 2;
  timeEstimate: number; // hours
  examWeightage: number; // percentage
  status: "must_master" | "high_value" | "deprioritized";
}

interface BacklogDestroyerModalProps {
  open: boolean;
  onClose: () => void;
  backlogCount: number;
}

export function BacklogDestroyerModal({
  open,
  onClose,
  backlogCount,
}: BacklogDestroyerModalProps) {
  const [loading, setLoading] = useState(false);
  const [survivalPlan, setSurvivalPlan] = useState<SurvivalPlanItem[]>([]);
  const [totalTime, setTotalTime] = useState<number>(0);
  const [daysNeeded, setDaysNeeded] = useState<number>(0);

  useEffect(() => {
    if (open) {
      generateSurvivalPlan();
    }
  }, [open, backlogCount]);

  const generateSurvivalPlan = async () => {
    setLoading(true);
    try {
      // TODO: Call API to generate survival plan
      // const response = await fetch("/api/ark/backlog-destroyer", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ backlogCount }),
      // });
      // const data = await response.json();
      // setSurvivalPlan(data.plan);
      // setTotalTime(data.totalTime);
      // setDaysNeeded(data.daysNeeded);

      // Mock data
      setTimeout(() => {
        setSurvivalPlan([
          {
            id: "1",
            conceptName: "Lens Maker Formula",
            subject: "Physics - Optics",
            priority: 1,
            timeEstimate: 2,
            examWeightage: 8,
            status: "must_master",
          },
          {
            id: "2",
            conceptName: "Organic Reactions",
            subject: "Chemistry",
            priority: 1,
            timeEstimate: 3,
            examWeightage: 8,
            status: "must_master",
          },
          {
            id: "3",
            conceptName: "Integration Techniques",
            subject: "Math - Calculus",
            priority: 2,
            timeEstimate: 4,
            examWeightage: 5,
            status: "high_value",
          },
          {
            id: "4",
            conceptName: "Thermodynamics",
            subject: "Physics",
            priority: 2,
            timeEstimate: 3,
            examWeightage: 5,
            status: "high_value",
          },
          {
            id: "5",
            conceptName: "Advanced Calculus",
            subject: "Math",
            priority: 2,
            timeEstimate: 2,
            examWeightage: 1,
            status: "deprioritized",
          },
        ]);
        setTotalTime(18);
        setDaysNeeded(12);
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast.error("Failed to generate survival plan");
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    try {
      // TODO: Call API to activate survival plan
      // const response = await fetch("/api/ark/activate-survival-plan", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ plan: survivalPlan }),
      // });

      toast.success("Survival plan activated! Your ARK has been updated.");
      onClose();
    } catch (error) {
      toast.error("Failed to activate survival plan");
    }
  };

  const priority1Items = survivalPlan.filter((item) => item.priority === 1);
  const priority2Items = survivalPlan.filter((item) => item.priority === 2);
  const deprioritizedItems = survivalPlan.filter(
    (item) => item.status === "deprioritized"
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <DialogTitle>Backlog Destroyer Mode</DialogTitle>
              <DialogDescription>
                You have {backlogCount} concepts behind schedule. Let's create a survival plan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Generating your survival plan...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Estimated Time:</span>
                <span className="text-sm font-bold text-foreground">{totalTime} hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Spread Over:</span>
                <span className="text-sm font-bold text-foreground">{daysNeeded} days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Daily Commitment:</span>
                <span className="text-sm font-bold text-foreground">
                  ~{Math.ceil(totalTime / daysNeeded)} hours/day
                </span>
              </div>
            </div>

            {/* Priority 1 */}
            {priority1Items.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Priority 1: Must Master ({priority1Items.length} concepts)
                  </h3>
                  <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30">
                    {priority1Items.reduce((sum, item) => sum + item.examWeightage, 0)}% total weightage
                  </Badge>
                </div>
                <div className="space-y-2">
                  {priority1Items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.conceptName}</p>
                        <p className="text-xs text-muted-foreground">{item.subject}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {item.examWeightage}%
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {item.timeEstimate}h
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Priority 2 */}
            {priority2Items.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Priority 2: High Value ({priority2Items.length} concepts)
                  </h3>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
                    {priority2Items.reduce((sum, item) => sum + item.examWeightage, 0)}% total weightage
                  </Badge>
                </div>
                <div className="space-y-2">
                  {priority2Items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.conceptName}</p>
                        <p className="text-xs text-muted-foreground">{item.subject}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {item.examWeightage}%
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {item.timeEstimate}h
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Deprioritized */}
            {deprioritizedItems.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <X className="w-5 h-5 text-muted-foreground" />
                  <h3 className="text-sm font-semibold text-muted-foreground">
                    Deprioritized ({deprioritizedItems.length} concepts)
                  </h3>
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    Low weightage, can skip
                  </Badge>
                </div>
                <div className="space-y-2">
                  {deprioritizedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-lg opacity-60"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground line-through">{item.conceptName}</p>
                        <p className="text-xs text-muted-foreground">{item.subject}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.examWeightage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                onClick={handleActivate}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              >
                <Zap className="w-4 h-4 mr-2" />
                Activate Survival Plan
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

