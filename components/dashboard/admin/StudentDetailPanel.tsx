"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  Phone,
  MessageCircle,
  Calendar,
  User,
  X,
  TrendingDown,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface StudentStatus {
  id: string;
  name: string;
  riskScore: number;
  status: "on_track" | "at_risk" | "critical";
  lastActivity: string;
  batch: string;
}

interface StudentDetailPanelProps {
  student: StudentStatus;
  onClose: () => void;
}

export function StudentDetailPanel({ student, onClose }: StudentDetailPanelProps) {
  // TODO: Fetch detailed student data
  const riskFactors = [
    "Missed 3 assignments",
    "Mood check-ins: 'Anxious' (5 days)",
    "Test scores: -30% trend",
  ];

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-400";
    if (score >= 40) return "text-yellow-400";
    return "text-green-400";
  };

  const getRiskBadge = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "at_risk":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-green-500/20 text-green-400 border-green-500/30";
    }
  };

  return (
    <AnimatePresence>
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {student.name}
                </SheetTitle>
                <SheetDescription>
                  Batch: {student.batch}
                </SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Risk Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Risk Score</span>
                <Badge className={getRiskBadge(student.status)}>
                  {student.status.toUpperCase()}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Risk</span>
                  <span className={`font-bold ${getRiskColor(student.riskScore)}`}>
                    {student.riskScore}%
                  </span>
                </div>
                <Progress value={student.riskScore} className="h-2" />
              </div>
            </div>

            {/* Risk Factors */}
            {riskFactors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-foreground">Risk Factors</span>
                </div>
                <div className="space-y-2">
                  {riskFactors.map((factor, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted/50 rounded-lg border border-border"
                    >
                      <p className="text-sm text-foreground">{factor}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Recent Activity</span>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground">
                  Last active: {student.lastActivity}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3 pt-4 border-t">
              <span className="text-sm font-medium text-foreground">Quick Actions</span>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // TODO: Open intervention form
                    console.log("Assign counselor");
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Assign Counselor
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // TODO: Call parent
                    console.log("Call parent");
                  }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Parent
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => {
                    // TODO: Schedule meeting
                    console.log("Schedule meeting");
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={`/dashboard/teacher/students/${student.id}`}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    View Details
                  </Link>
                </Button>
              </div>
            </div>

            {/* Create Intervention */}
            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              onClick={() => {
                // TODO: Open intervention form
                console.log("Create intervention");
              }}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Create Intervention
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </AnimatePresence>
  );
}

