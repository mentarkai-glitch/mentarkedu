"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, FileText, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Intervention {
  id: string;
  student_id: string;
  type: string;
  title: string;
  content: string;
  priority: string;
  status: string;
  created_at: string;
  students: {
    users: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

interface Student {
  id: string;
  full_name: string;
}

export default function TeacherInterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    type: "note",
    title: "",
    content: "",
    priority: "medium",
  });

  useEffect(() => {
    fetchInterventions();
    fetchStudents();
  }, []);

  const fetchInterventions = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/teacher/interventions");
      const data = await response.json();

      if (data.success) {
        setInterventions(data.data.interventions || []);
      } else {
        toast.error(data.error || "Failed to fetch interventions");
      }
    } catch (error) {
      console.error("Error fetching interventions:", error);
      toast.error("Failed to fetch interventions");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/teacher/students");
      const data = await response.json();

      if (data.success) {
        setStudents(data.data.students || []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleCreateIntervention = async () => {
    if (!formData.student_id || !formData.title || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("/api/teacher/interventions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Intervention created successfully");
        setShowCreateDialog(false);
        setFormData({
          student_id: "",
          type: "note",
          title: "",
          content: "",
          priority: "medium",
        });
        fetchInterventions();
      } else {
        toast.error(data.error || "Failed to create intervention");
      }
    } catch (error) {
      console.error("Error creating intervention:", error);
      toast.error("Failed to create intervention");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "high":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "cancelled":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/teacher"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Interventions</h1>
          <p className="text-muted-foreground mt-1">
            Manage student interventions and support actions
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Intervention
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Intervention</DialogTitle>
              <DialogDescription>
                Record an intervention action for a student
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="student">Student</Label>
                <Select
                  value={formData.student_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, student_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="counseling">Counseling</SelectItem>
                    <SelectItem value="remedial">Remedial Class</SelectItem>
                    <SelectItem value="parent_call">Parent Call</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Brief title for this intervention"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Describe the intervention..."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateIntervention} className="w-full">
                Create Intervention
              </Button>
            </div>
            </DialogContent>
          </Dialog>
          </div>
      </div>

      {/* Interventions List */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Loading interventions...</p>
          </CardContent>
        </Card>
      ) : interventions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No interventions yet</p>
            <p className="text-muted-foreground text-sm mt-2">
              Create your first intervention to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {interventions.map((intervention) => (
            <motion.div
              key={intervention.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{intervention.title}</h3>
                        <Badge variant="outline">{intervention.type}</Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{intervention.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Student: {intervention.students.users.full_name}
                        </span>
                        <span>
                          Created: {new Date(intervention.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getPriorityColor(intervention.priority)}>
                        {intervention.priority}
                      </Badge>
                      <Badge className={getStatusColor(intervention.status)}>
                        {intervention.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

