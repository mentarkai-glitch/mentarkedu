"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { 
  Heart, 
  Zap, 
  AlertCircle, 
  Target,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function DailyCheckInWidget() {
  const [mood, setMood] = useState<number>(3);
  const [energy, setEnergy] = useState<number>(3);
  const [stress, setStress] = useState<number>(3);
  const [focus, setFocus] = useState<number>(3);
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          energy,
          stress,
          focus,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
        toast.success("Check-in submitted!");
        setTimeout(() => {
          setOpen(false);
          setSubmitted(false);
        }, 2000);
      } else {
        toast.error("Failed to submit check-in");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    }
  };

  const getEmoji = (value: number) => {
    if (value <= 1) return "😔";
    if (value <= 2) return "😐";
    if (value <= 3) return "🙂";
    if (value <= 4) return "😊";
    return "😄";
  };

  if (submitted) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">Check-in submitted!</p>
          <p className="text-xs text-muted-foreground mt-1">Thank you for checking in</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-1">Daily Check-in</h3>
            <p className="text-xs text-muted-foreground">How are you feeling today?</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Check In
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Daily Check-in</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      Mood
                    </Label>
                    <span className="text-2xl">{getEmoji(mood)}</span>
                  </div>
                  <Slider
                    value={[mood]}
                    onValueChange={([value]) => setMood(value)}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      Energy
                    </Label>
                    <span className="text-2xl">{getEmoji(energy)}</span>
                  </div>
                  <Slider
                    value={[energy]}
                    onValueChange={([value]) => setEnergy(value)}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-400" />
                      Stress
                    </Label>
                    <span className="text-2xl">{getEmoji(6 - stress)}</span>
                  </div>
                  <Slider
                    value={[stress]}
                    onValueChange={([value]) => setStress(value)}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      Focus
                    </Label>
                    <span className="text-2xl">{getEmoji(focus)}</span>
                  </div>
                  <Slider
                    value={[focus]}
                    onValueChange={([value]) => setFocus(value)}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>

                <Button onClick={handleSubmit} className="w-full">
                  Submit Check-in
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="text-xs text-muted-foreground">
          Quick check-in helps us understand your state and provide better support
        </div>
      </CardContent>
    </Card>
  );
}

