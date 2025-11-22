"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Users, 
  AlertCircle, 
  CheckCircle2,
  TrendingDown
} from "lucide-react";
import { StudentDetailPanel } from "./StudentDetailPanel";

interface StudentStatus {
  id: string;
  name: string;
  riskScore: number;
  status: "on_track" | "at_risk" | "critical";
  lastActivity: string;
  batch: string;
}

interface BatchRadarProps {
  batchId?: string;
  instituteId?: string;
}

export function BatchRadar({ batchId, instituteId }: BatchRadarProps) {
  const [selectedBatch, setSelectedBatch] = useState<string>(batchId || "all");
  const [students, setStudents] = useState<StudentStatus[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API
    // const fetchStudents = async () => {
    //   const response = await fetch(`/api/admin/batches/${selectedBatch}/radar`);
    //   const data = await response.json();
    //   setStudents(data.students);
    //   setLoading(false);
    // };
    // fetchStudents();

    // Mock data
    setTimeout(() => {
      setStudents([
        { id: "1", name: "Rahul K.", riskScore: 78, status: "critical", lastActivity: "2 days ago", batch: "JEE 2025" },
        { id: "2", name: "Priya M.", riskScore: 65, status: "at_risk", lastActivity: "1 day ago", batch: "JEE 2025" },
        { id: "3", name: "Amit S.", riskScore: 35, status: "on_track", lastActivity: "Today", batch: "JEE 2025" },
        { id: "4", name: "Sneha R.", riskScore: 25, status: "on_track", lastActivity: "Today", batch: "JEE 2025" },
        { id: "5", name: "Vikram P.", riskScore: 45, status: "at_risk", lastActivity: "3 days ago", batch: "JEE 2025" },
        { id: "6", name: "Ananya T.", riskScore: 20, status: "on_track", lastActivity: "Today", batch: "JEE 2025" },
        { id: "7", name: "Rohan D.", riskScore: 82, status: "critical", lastActivity: "4 days ago", batch: "JEE 2025" },
        { id: "8", name: "Kavya N.", riskScore: 30, status: "on_track", lastActivity: "Today", batch: "JEE 2025" },
        { id: "9", name: "Arjun M.", riskScore: 55, status: "at_risk", lastActivity: "2 days ago", batch: "JEE 2025" },
        { id: "10", name: "Isha K.", riskScore: 15, status: "on_track", lastActivity: "Today", batch: "JEE 2025" },
        { id: "11", name: "Neha S.", riskScore: 40, status: "on_track", lastActivity: "1 day ago", batch: "JEE 2025" },
        { id: "12", name: "Ravi T.", riskScore: 70, status: "critical", lastActivity: "3 days ago", batch: "JEE 2025" },
      ]);
      setLoading(false);
    }, 500);
  }, [selectedBatch]);

  const getStatusDot = (status: string) => {
    switch (status) {
      case "on_track":
        return "🟢";
      case "at_risk":
        return "🟡";
      case "critical":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_track":
        return "text-green-400";
      case "at_risk":
        return "text-yellow-400";
      case "critical":
        return "text-red-400";
      default:
        return "text-muted-foreground";
    }
  };

  const onTrackCount = students.filter((s) => s.status === "on_track").length;
  const atRiskCount = students.filter((s) => s.status === "at_risk").length;
  const criticalCount = students.filter((s) => s.status === "critical").length;

  // Calculate grid dimensions (roughly square)
  const gridSize = Math.ceil(Math.sqrt(students.length));
  const gridCols = Math.min(gridSize, 6); // Max 6 columns for readability

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <CardTitle className="text-lg font-semibold">Batch Radar</CardTitle>
          </div>
          <Select value={selectedBatch} onValueChange={setSelectedBatch}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              <SelectItem value="JEE 2025">JEE 2025</SelectItem>
              <SelectItem value="NEET 2025">NEET 2025</SelectItem>
              <SelectItem value="AIIMS 2025">AIIMS 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Legend */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-lg">🟢</span>
            <span className="text-sm text-muted-foreground">On Track ({onTrackCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🟡</span>
            <span className="text-sm text-muted-foreground">At Risk ({atRiskCount})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🔴</span>
            <span className="text-sm text-muted-foreground">Critical ({criticalCount})</span>
          </div>
        </div>

        {/* Radar Grid */}
        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading batch radar...</p>
          </div>
        ) : (
          <TooltipProvider>
            <div
              className="grid gap-2 p-4 bg-muted/20 rounded-lg border border-border"
              style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
            >
              {students.map((student, index) => (
                <Tooltip key={student.id}>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedStudent(student)}
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-2xl
                        transition-all cursor-pointer
                        ${student.status === "on_track" ? "hover:bg-green-500/20" : ""}
                        ${student.status === "at_risk" ? "hover:bg-yellow-500/20" : ""}
                        ${student.status === "critical" ? "hover:bg-red-500/20 animate-pulse" : ""}
                      `}
                    >
                      {getStatusDot(student.status)}
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <p className="font-semibold">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Risk: {student.riskScore}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last active: {student.lastActivity}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{onTrackCount}</div>
            <div className="text-xs text-muted-foreground mt-1">On Track</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{atRiskCount}</div>
            <div className="text-xs text-muted-foreground mt-1">At Risk</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{criticalCount}</div>
            <div className="text-xs text-muted-foreground mt-1">Critical</div>
          </div>
        </div>
      </CardContent>

      {/* Student Detail Panel */}
      {selectedStudent && (
        <StudentDetailPanel
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </Card>
  );
}

