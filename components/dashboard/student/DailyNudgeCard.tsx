"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, X, MessageCircle } from "lucide-react";
import Link from "next/link";

interface DailyNudge {
  id: string;
  message: string;
  actionItem?: string;
  type: "motivation" | "reminder" | "support" | "celebration";
  actionUrl?: string;
}

export function DailyNudgeCard() {
  const [nudge, setNudge] = useState<DailyNudge | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // TODO: Fetch from API
    // const fetchNudge = async () => {
    //   const response = await fetch("/api/mentor/nudge");
    //   const data = await response.json();
    //   setNudge(data);
    // };
    // fetchNudge();

    // Mock data
    setNudge({
      id: "1",
      message: "You've been consistent this week! Your 7-day streak shows real dedication. Keep this momentum going.",
      actionItem: "Complete today's 'THE ONE THING' to maintain your streak",
      type: "celebration",
      actionUrl: "/dashboard/student"
    });
  }, []);

  if (dismissed || !nudge) {
    return null;
  }

  const getTypeColor = () => {
    switch (nudge.type) {
      case "celebration": return "from-green-500/20 to-emerald-500/20 border-green-500/30";
      case "motivation": return "from-blue-500/20 to-cyan-500/20 border-blue-500/30";
      case "reminder": return "from-yellow-500/20 to-orange-500/20 border-yellow-500/30";
      case "support": return "from-purple-500/20 to-pink-500/20 border-purple-500/30";
      default: return "from-muted/20 to-muted/20 border-border";
    }
  };

  return (
    <Card className={`bg-gradient-to-br ${getTypeColor()}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm text-foreground leading-relaxed">
              {nudge.message}
            </p>
            {nudge.actionItem && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Action:</span>
                <span className="text-xs text-foreground">{nudge.actionItem}</span>
              </div>
            )}
            <div className="flex items-center gap-2 pt-2">
              {nudge.actionUrl && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                >
                  <Link href={nudge.actionUrl}>
                    <MessageCircle className="w-3 h-3 mr-1.5" />
                    Tell me more
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setDismissed(true);
              // TODO: Mark as read in API
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

