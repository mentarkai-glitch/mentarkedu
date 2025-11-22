"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  Users,
  Filter,
  Search,
  ChevronRight,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface InterventionAlert {
  id: string;
  studentId: string;
  studentName: string;
  severity: "critical" | "high" | "medium" | "low";
  riskScore: number;
  alertType: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  riskFactors: string[];
}

interface InterventionWarRoomProps {
  instituteId?: string;
}

export function InterventionWarRoom({ instituteId }: InterventionWarRoomProps) {
  const [alerts, setAlerts] = useState<InterventionAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<InterventionAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch from API
    // const fetchAlerts = async () => {
    //   const response = await fetch(`/api/admin/interventions?institute_id=${instituteId}`);
    //   const data = await response.json();
    //   setAlerts(data.alerts);
    //   setLoading(false);
    // };
    // fetchAlerts();

    // Mock data
    setTimeout(() => {
      setAlerts([
        {
          id: "1",
          studentId: "1",
          studentName: "Rahul K.",
          severity: "critical",
          riskScore: 78,
          alertType: "burnout_risk",
          message: "High burnout risk detected. Student has missed 3 assignments and mood check-ins show consistent anxiety.",
          status: "open",
          createdAt: "2024-01-15T10:30:00Z",
          riskFactors: ["Missed 3 assignments", "Mood: Anxious (5 days)", "Test scores: -30%"],
        },
        {
          id: "2",
          studentId: "2",
          studentName: "Priya M.",
          severity: "high",
          riskScore: 65,
          alertType: "performance_drop",
          message: "Significant performance drop detected in recent tests.",
          status: "open",
          createdAt: "2024-01-14T14:20:00Z",
          riskFactors: ["Test scores: -30%", "Low engagement"],
        },
        {
          id: "3",
          studentId: "7",
          studentName: "Rohan D.",
          severity: "critical",
          riskScore: 82,
          alertType: "dropout_risk",
          message: "Very high dropout risk. Student has not logged in for 4 days.",
          status: "in_progress",
          createdAt: "2024-01-13T09:15:00Z",
          riskFactors: ["No login: 4 days", "Missed 5 assignments", "No check-ins"],
        },
      ]);
      setFilteredAlerts([
        {
          id: "1",
          studentId: "1",
          studentName: "Rahul K.",
          severity: "critical",
          riskScore: 78,
          alertType: "burnout_risk",
          message: "High burnout risk detected. Student has missed 3 assignments and mood check-ins show consistent anxiety.",
          status: "open",
          createdAt: "2024-01-15T10:30:00Z",
          riskFactors: ["Missed 3 assignments", "Mood: Anxious (5 days)", "Test scores: -30%"],
        },
        {
          id: "2",
          studentId: "2",
          studentName: "Priya M.",
          severity: "high",
          riskScore: 65,
          alertType: "performance_drop",
          message: "Significant performance drop detected in recent tests.",
          status: "open",
          createdAt: "2024-01-14T14:20:00Z",
          riskFactors: ["Test scores: -30%", "Low engagement"],
        },
        {
          id: "3",
          studentId: "7",
          studentName: "Rohan D.",
          severity: "critical",
          riskScore: 82,
          alertType: "dropout_risk",
          message: "Very high dropout risk. Student has not logged in for 4 days.",
          status: "in_progress",
          createdAt: "2024-01-13T09:15:00Z",
          riskFactors: ["No login: 4 days", "Missed 5 assignments", "No check-ins"],
        },
      ]);
      setLoading(false);
    }, 500);
  }, [instituteId]);

  useEffect(() => {
    let filtered = alerts;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (alert) =>
          alert.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alert.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by severity
    if (severityFilter !== "all") {
      filtered = filtered.filter((alert) => alert.severity === severityFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((alert) => alert.status === statusFilter);
    }

    setFilteredAlerts(filtered);
  }, [alerts, searchTerm, severityFilter, statusFilter]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const criticalAlerts = filteredAlerts.filter((a) => a.severity === "critical");
  const highAlerts = filteredAlerts.filter((a) => a.severity === "high");
  const openAlerts = filteredAlerts.filter((a) => a.status === "open");

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <CardTitle className="text-lg font-semibold">Intervention War Room</CardTitle>
          </div>
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">
            {openAlerts.length} open alerts
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-border bg-background text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-border bg-background text-sm"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-semibold text-foreground">
                🔴 Critical ({criticalAlerts.length})
              </h3>
            </div>
            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  getSeverityBadge={getSeverityBadge}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          </div>
        )}

        {/* High Risk Alerts */}
        {highAlerts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <h3 className="text-sm font-semibold text-foreground">
                🟡 At Risk ({highAlerts.length})
              </h3>
            </div>
            <div className="space-y-3">
              {highAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  getSeverityBadge={getSeverityBadge}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredAlerts.length === 0 && !loading && (
          <div className="py-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-sm font-medium text-foreground mb-1">No alerts found</p>
            <p className="text-xs text-muted-foreground">
              All students are performing well! 🎉
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading alerts...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AlertCard({
  alert,
  getSeverityBadge,
  getStatusBadge,
}: {
  alert: InterventionAlert;
  getSeverityBadge: (severity: string) => string;
  getStatusBadge: (status: string) => string;
}) {
  return (
    <Card className="bg-muted/30 border-border hover:border-red-500/30 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-foreground">{alert.studentName}</h4>
              <Badge className={getSeverityBadge(alert.severity)}>
                {alert.severity.toUpperCase()}
              </Badge>
              <Badge className={getStatusBadge(alert.status)}>
                {alert.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{new Date(alert.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        {alert.riskFactors.length > 0 && (
          <div className="mb-3 space-y-1">
            {alert.riskFactors.slice(0, 2).map((factor, index) => (
              <div
                key={index}
                className="text-xs text-muted-foreground flex items-center gap-1"
              >
                <span className="w-1 h-1 rounded-full bg-red-400"></span>
                {factor}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            asChild
          >
            <Link href={`/dashboard/teacher/students/${alert.studentId}`}>
              View Details
              <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
            onClick={() => {
              // TODO: Create intervention
              console.log("Create intervention for", alert.studentId);
            }}
          >
            Create Intervention
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

