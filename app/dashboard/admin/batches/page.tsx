"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Users, Calendar, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Batch {
  name: string;
  grade: string;
  studentCount: number;
}

export default function BatchManagementPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: "",
    grade: "",
    exam_focus: "",
    schedule: "",
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/batches");
      const data = await response.json();

      if (data.success) {
        setBatches(data.data.batches || []);
      } else {
        toast.error(data.error || "Failed to fetch batches");
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
      toast.error("Failed to fetch batches");
    } finally {
      setLoading(false);
    }
  };

  const handleAddBatch = async () => {
    if (!newBatch.name || !newBatch.grade) {
      toast.error("Batch name and grade are required");
      return;
    }

    try {
      const response = await fetch("/api/admin/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBatch),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Batch created successfully");
        setShowAddDialog(false);
        setNewBatch({ name: "", grade: "", exam_focus: "", schedule: "" });
        fetchBatches();
      } else {
        toast.error(data.error || "Failed to create batch");
      }
    } catch (error) {
      console.error("Error creating batch:", error);
      toast.error("Failed to create batch");
    }
  };

  const filteredBatches = batches.filter((batch) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      batch.name.toLowerCase().includes(searchLower) ||
      batch.grade.toLowerCase().includes(searchLower)
    );
  });

  const totalStudents = batches.reduce((acc, batch) => acc + batch.studentCount, 0);
  const uniqueGrades = Array.from(new Set(batches.map((b) => b.grade))).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Batch Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage student batches and schedules
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Batch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Batch</DialogTitle>
              <DialogDescription>
                Create a new batch for organizing students
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Batch Name</Label>
                <Input
                  value={newBatch.name}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, name: e.target.value })
                  }
                  placeholder="e.g., JEE 2025 Morning"
                />
              </div>
              <div>
                <Label>Grade</Label>
                <Select
                  value={newBatch.grade}
                  onValueChange={(value) =>
                    setNewBatch({ ...newBatch, grade: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">Grade 9</SelectItem>
                    <SelectItem value="10">Grade 10</SelectItem>
                    <SelectItem value="11">Grade 11</SelectItem>
                    <SelectItem value="12">Grade 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Exam Focus (Optional)</Label>
                <Select
                  value={newBatch.exam_focus}
                  onValueChange={(value) =>
                    setNewBatch({ ...newBatch, exam_focus: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Exam" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="JEE">JEE</SelectItem>
                    <SelectItem value="NEET">NEET</SelectItem>
                    <SelectItem value="AIIMS">AIIMS</SelectItem>
                    <SelectItem value="CUET">CUET</SelectItem>
                    <SelectItem value="SSC">SSC</SelectItem>
                    <SelectItem value="UPSC">UPSC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddBatch} className="w-full">
                Create Batch
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search batches..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Batches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">{batches.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">{totalStudents}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Grades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <p className="text-3xl font-bold">{uniqueGrades}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batches Grid */}
      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Loading...</div>
      ) : filteredBatches.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No batches found
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBatches.map((batch, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{batch.name}</CardTitle>
                    <CardDescription>Grade {batch.grade}</CardDescription>
                  </div>
                  <Badge variant="outline">{batch.studentCount} students</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Students
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

