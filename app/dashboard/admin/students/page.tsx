"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Edit, Trash2, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Student {
  id: string;
  email: string;
  full_name: string;
  grade: string;
  batch: string;
  interests: string[];
  goals: string[];
  risk_score: number;
}

export default function StudentManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const [editForm, setEditForm] = useState({
    grade: "",
    batch: "",
    interests: [] as string[],
    goals: [] as string[],
    risk_score: 0,
  });

  useEffect(() => {
    fetchStudents();
  }, [batchFilter, gradeFilter, page]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (batchFilter !== "all") params.append("batch", batchFilter);
      if (gradeFilter !== "all") params.append("grade", gradeFilter);
      params.append("limit", limit.toString());
      params.append("offset", ((page - 1) * limit).toString());

      const response = await fetch(`/api/admin/students?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setStudents(data.data.students || []);
        setTotal(data.data.total || 0);
      } else {
        toast.error(data.error || "Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (student: Student) => {
    try {
      // Fetch full student data
      const response = await fetch(`/api/admin/students/${student.id}`);
      const data = await response.json();

      if (data.success) {
        const studentData = data.data.student;
        setEditingStudent(student);
        setEditForm({
          grade: studentData.grade || "",
          batch: studentData.batch || "",
          interests: studentData.interests || [],
          goals: studentData.goals || [],
          risk_score: studentData.risk_score || 0,
        });
        setShowEditDialog(true);
      } else {
        toast.error(data.error || "Failed to load student data");
      }
    } catch (error) {
      console.error("Error loading student:", error);
      toast.error("Failed to load student data");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingStudent) return;

    try {
      const response = await fetch(`/api/admin/students/${editingStudent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Student updated successfully");
        setShowEditDialog(false);
        setEditingStudent(null);
        fetchStudents();
      } else {
        toast.error(data.error || "Failed to update student");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const response = await fetch(`/api/admin/students/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        toast.success("Student deleted successfully");
        fetchStudents();
      } else {
        toast.error(data.error || "Failed to delete student");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    }
  };

  const filteredStudents = students.filter((student) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      student.full_name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.batch.toLowerCase().includes(searchLower)
    );
  });

  // Get unique batches and grades for filters
  const uniqueBatches = Array.from(new Set(students.map((s) => s.batch))).sort();
  const uniqueGrades = Array.from(new Set(students.map((s) => s.grade))).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Student Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage all students in your institute
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/admin/students/bulk-import">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
          </Link>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or batch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={batchFilter} onValueChange={setBatchFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Batches" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {uniqueBatches.map((batch) => (
              <SelectItem key={batch} value={batch}>
                {batch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Grades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {uniqueGrades.map((grade) => (
              <SelectItem key={grade} value={grade}>
                Grade {grade}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Total Students</p>
          <p className="text-2xl font-bold">{students.length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">High Risk</p>
          <p className="text-2xl font-bold text-red-500">
            {students.filter((s) => s.risk_score >= 70).length}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Active Batches</p>
          <p className="text-2xl font-bold">{uniqueBatches.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No students found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Interests</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">
                    {student.full_name}
                  </TableCell>
                  <TableCell>{student.email}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.batch}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        student.risk_score >= 70
                          ? "destructive"
                          : student.risk_score >= 40
                          ? "default"
                          : "secondary"
                      }
                    >
                      {student.risk_score}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {student.interests.slice(0, 2).map((interest, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                      {student.interests.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{student.interests.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(student)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(student.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
              Update student information for {editingStudent?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  value={editForm.grade}
                  onChange={(e) =>
                    setEditForm({ ...editForm, grade: e.target.value })
                  }
                  placeholder="e.g., 11, 12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Input
                  id="batch"
                  value={editForm.batch}
                  onChange={(e) =>
                    setEditForm({ ...editForm, batch: e.target.value })
                  }
                  placeholder="e.g., Batch A, Batch B"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="risk_score">Risk Score (0-100)</Label>
              <Input
                id="risk_score"
                type="number"
                min="0"
                max="100"
                value={editForm.risk_score}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    risk_score: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interests">
                Interests (comma-separated)
              </Label>
              <Input
                id="interests"
                value={editForm.interests.join(", ")}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    interests: e.target.value
                      .split(",")
                      .map((i) => i.trim())
                      .filter((i) => i.length > 0),
                  })
                }
                placeholder="e.g., Physics, Mathematics, Chemistry"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goals">Goals (comma-separated)</Label>
              <Input
                id="goals"
                value={editForm.goals.join(", ")}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    goals: e.target.value
                      .split(",")
                      .map((g) => g.trim())
                      .filter((g) => g.length > 0),
                  })
                }
                placeholder="e.g., JEE Main, NEET, IIT"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingStudent(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {total > limit && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} students
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="w-full sm:w-auto"
            >
              Previous
            </Button>
            <span className="flex items-center px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(Math.ceil(total / limit), page + 1))}
              disabled={page >= Math.ceil(total / limit)}
              className="w-full sm:w-auto"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

