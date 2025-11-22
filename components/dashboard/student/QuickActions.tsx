"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileQuestion, 
  BookOpen, 
  HelpCircle, 
  MessageCircle,
  Target
} from "lucide-react";
import Link from "next/link";

const quickActions = [
  {
    title: "Mock Test",
    icon: FileQuestion,
    href: "/dashboard/student/mock-tests",
    color: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400",
  },
  {
    title: "PYQs",
    icon: BookOpen,
    href: "/dashboard/student/pyqs",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
  },
  {
    title: "Doubt Solver",
    icon: HelpCircle,
    href: "/dashboard/student/doubt-solver",
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400",
  },
  {
    title: "AI Mentor",
    icon: MessageCircle,
    href: "/chat",
    color: "from-orange-500/20 to-yellow-500/20 border-orange-500/30 text-orange-400",
  },
];

export function QuickActions() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                asChild
                variant="outline"
                className={`h-auto flex-col gap-2 p-4 ${action.color} hover:opacity-80`}
              >
                <Link href={action.href}>
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{action.title}</span>
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

