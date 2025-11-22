"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MessageCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Link from "next/link";

export function PanicButton() {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
        <CardContent className="p-4">
          <Button
            onClick={() => setShowDialog(true)}
            variant="ghost"
            className="w-full h-auto flex items-center gap-3 p-4 hover:bg-red-500/10"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">Need Help?</p>
              <p className="text-xs text-muted-foreground">Connect with a human mentor</p>
            </div>
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Get Help Now</DialogTitle>
            <DialogDescription>
              We're here to help. Choose how you'd like to connect:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <Button
              asChild
              className="w-full justify-start"
              variant="outline"
            >
              <Link href="/chat">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat with AI Mentor
              </Link>
            </Button>
            <Button
              asChild
              className="w-full justify-start"
              variant="outline"
            >
              <Link href="/dashboard/student/daily-assistant">
                <MessageCircle className="w-4 h-4 mr-2" />
                Schedule Counselor Call
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setShowDialog(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

