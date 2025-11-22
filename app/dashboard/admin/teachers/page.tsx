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
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Teacher {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  specialization: string[];
  assigned_batches: string[];
}

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [newTeacher, setNewTeacher] = useState({
    email: "",
    full_name: "",
    specialization: [] as string[],
    assigned_batches: [] as string[],
  });
  const [editForm, setEditForm] = useState({
    specialization: [] as string[],
    assigned_batches: [] as string[],
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("limit", limit.toString());
      params.append("offset", ((page - 1) * limit).toString());
      
      const response = await fetch(`/api/admin/teachers?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setTeachers(data.data.teachers || []);
        setTotal(data.data.total || 0);
      } else {
        toast.error(data.error || "Failed to fetch teachers");
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Failed to fetch teachers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [page]);

  const handleEdit = async (teacher: Teacher) => {
    try {
      // Fetch full teacher data
      const response = await fetch(`/api/admin/teachers/${teacher.id}`);
      const data = await response.json();

      if (data.success) {
        const teacherData = data.data.teacher;
        setEditingTeacher(teacher);
        setEditForm({
          specialization: teacherData.specialization || [],
          assigned_batches: teacherData.assigned_batches || [],
        });
        setShowEditDialog(true);
      } else {
        toast.error(data.error || "Failed to load teacher data");
      }
    } catch (error) {
      console.error("Error loading teacher:", error);
      toast.error("Failed to load teacher data");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTeacher) return;

    try {
      const response = await fetch(`/api/admin/teachers/${editingTeacher.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Teacher updated successfully");
        setShowEditDialog(false);
        setEditingTeacher(null);
        fetchTeachers();
      } else {
        toast.error(data.error || "Failed to update teacher");
      }
    } catch (error) {
      console.error("Error updating teacher:", error);
      toast.error("Failed to update teacher");
    }
  };

  const handleAddTeacher = async () => {
    try {
      const response = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTeacher),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Teacher added successfully");
        setShowAddDialog(false);
        setNewTeacher({
          email: "",
          full_name: "",
          specialization: [],
          assigned_batches: [],
        });
        fetchTeachers();
      } else {
        toast.error(data.error || "Failed to add teacher");
      }
    } catch (error) {
      console.error("Error adding teacher:", error);
      toast.error("Failed to add teacher");
    }
  };

  const filteredTeachers = teachers.filter((teacher) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      teacher.full_name.toLowerCase().includes(searchLower) ||
      teacher.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Teacher Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage teachers and their assignments
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
              <DialogDescription>
                Create a new teacher account. They will receive an email invitation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={newTeacher.full_name}
                  onChange={(e) =>
                    setNewTeacher({ ...newTeacher, full_name: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) =>
                    setNewTeacher({ ...newTeacher, email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>
              <Button onClick={handleAddTeacher} className="w-full">
                Add Teacher
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search teachers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Total Teachers</p>
          <p className="text-2xl font-bold">{teachers.length}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Active Assignments</p>
          <p className="text-2xl font-bold">
            {teachers.reduce((acc, t) => acc + t.assigned_batches.length, 0)}
          </p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Specializations</p>
          <p className="text-2xl font-bold">
            {new Set(teachers.flatMap((t) => t.specialization)).size}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No teachers found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Assigned Batches</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">
                    {teacher.full_name}
                  </TableCell>
                  <TableCell>{teacher.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.specialization.map((spec, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {teacher.specialization.length === 0 && (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.assigned_batches.map((batch, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {batch}
                        </Badge>
                      ))}
                      {teacher.assigned_batches.length === 0 && (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(teacher)}
                      >
                        <Edit className="h-4 w-4" />
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
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>
              Update teacher information for {editingTeacher?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="specialization">
                Specialization (comma-separated)
              </Label>
              <Input
                id="specialization"
                value={editForm.specialization.join(", ")}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    specialization: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter((s) => s.length > 0),
                  })
                }
                placeholder="e.g., Physics, Mathematics, Chemistry"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assigned_batches">
                Assigned Batches (comma-separated)
              </Label>
              <Input
                id="assigned_batches"
                value={editForm.assigned_batches.join(", ")}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    assigned_batches: e.target.value
                      .split(",")
                      .map((b) => b.trim())
                      .filter((b) => b.length > 0),
                  })
                }
                placeholder="e.g., Batch A, Batch B"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingTeacher(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

