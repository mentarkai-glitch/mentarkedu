"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Zap } from "lucide-react";
import { BacklogDestroyerModal } from "./BacklogDestroyerModal";

interface BacklogAlertProps {
  count: number;
}

export function BacklogAlert({ count }: BacklogAlertProps) {
  const [showDestroyer, setShowDestroyer] = useState(false);

  return (
    <>
      <Card className="bg-gradient-to-br from-orange-500/10 via-red-500/10 to-orange-500/10 border-orange-500/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Backlog Alert
                </h3>
                <p className="text-sm text-muted-foreground">
                  You have <span className="font-semibold text-foreground">{count} concepts</span> behind schedule.
                  Don't worry - we can help you catch up!
                </p>
              </div>
              <Button
                onClick={() => setShowDestroyer(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              >
                <Zap className="w-4 h-4 mr-2" />
                Activate Backlog Destroyer Mode
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showDestroyer && (
        <BacklogDestroyerModal
          open={showDestroyer}
          onClose={() => setShowDestroyer(false)}
          backlogCount={count}
        />
      )}
    </>
  );
}

