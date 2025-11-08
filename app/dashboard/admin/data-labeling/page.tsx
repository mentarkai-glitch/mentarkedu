"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface OutcomeRecord {
  id: string;
  student_id: string;
  outcome_type: string;
  outcome_value: string;
  outcome_date: string | null;
  notes: string | null;
  confirmed: boolean;
  student_name: string;
  created_at: string;
  updated_at: string;
}

interface StudentRecord {
  user_id: string;
  profile_data: Record<string, any> | null;
  grade?: string | null;
}

const OUTCOME_TYPES = [
  { value: "dropout", label: "Dropout Risk" },
  { value: "burnout", label: "Burnout Risk" },
  { value: "success", label: "Success" },
  { value: "career_success", label: "Career Success" },
  { value: "sentiment", label: "Sentiment" },
];

const OUTCOME_VALUES: Record<string, string[]> = {
  dropout: ["high", "medium", "low", "none"],
  burnout: ["high", "medium", "low", "none"],
  success: ["achieved", "in_progress", "not_started"],
  career_success: ["placed", "interviewing", "exploring"],
  sentiment: ["positive", "neutral", "negative"],
};

const FILTER_OPTIONS = [
  { value: "needs_labeling", label: "Needs Confirmation" },
  { value: "labeled", label: "Confirmed" },
  { value: "all", label: "All" },
];

function getStudentDisplayName(student: StudentRecord): string {
  const first = student.profile_data?.first_name || "";
  const last = student.profile_data?.last_name || "";
  const fullName = `${first} ${last}`.trim();
  if (fullName.length > 0) return fullName;
  return student.profile_data?.full_name || student.user_id;
}

function getStudentMeta(student: StudentRecord): string {
  const grade = student.profile_data?.grade || student.grade;
  const stream = student.profile_data?.stream;
  const parts = [grade, stream].filter(Boolean);
  return parts.join(" · ");
}

function RequirementBadge({ confirmed }: { confirmed: boolean }) {
  return confirmed ? (
    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
      Confirmed
    </Badge>
  ) : (
    <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
      Needs Review
    </Badge>
  );
}

export default function DataLabelingDashboard() {
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(false);
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [filter, setFilter] = useState<string>("needs_labeling");
  const [outcomeFilter, setOutcomeFilter] = useState<string>("all");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newLabel, setNewLabel] = useState({
    student_id: "",
    outcome_type: "dropout",
    outcome_value: "high",
    outcome_date: "",
    notes: "",
    confirmed: false,
  });

  const [editing, setEditing] = useState<Record<string, Partial<OutcomeRecord>>>({});

  useEffect(() => {
    fetchOutcomes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, outcomeFilter]);

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOutcomes() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ type: filter, limit: "100" });
      if (outcomeFilter !== "all") {
        params.set("outcome_type", outcomeFilter);
      }
      const response = await fetch(`/api/ml/data-labeling?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Failed to load outcomes");
      }
      const data = await response.json();
      setOutcomes(data.data.outcomes);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unable to load outcomes");
    } finally {
      setLoading(false);
    }
  }

  async function fetchStudents() {
    try {
      const response = await fetch("/api/admin/students", {
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Failed to load students");
      }
      const payload = await response.json();
      setStudents(payload.data || []);
    } catch (err) {
      console.error("Failed to fetch students", err);
    }
  }

  function handleSelectStudent(id: string) {
    setNewLabel((prev) => ({ ...prev, student_id: id }));
  }

  function resetNewLabel() {
    setNewLabel({
      student_id: "",
      outcome_type: "dropout",
      outcome_value: "high",
      outcome_date: "",
      notes: "",
      confirmed: false,
    });
  }

  async function handleCreateLabel(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newLabel.student_id) {
      setError("Please select a student to label");
      return;
    }
    try {
      setCreating(true);
      setError(null);
      const response = await fetch("/api/ml/data-labeling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newLabel,
          outcome_date: newLabel.outcome_date || null,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Failed to create label");
      }
      resetNewLabel();
      await fetchOutcomes();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unable to create label");
    } finally {
      setCreating(false);
    }
  }

  function startEditing(outcome: OutcomeRecord) {
    setEditing((prev) => ({
      ...prev,
      [outcome.id]: {
        outcome_type: outcome.outcome_type,
        outcome_value: outcome.outcome_value,
        outcome_date: outcome.outcome_date || "",
        notes: outcome.notes || "",
        confirmed: outcome.confirmed,
      },
    }));
  }

  function updateEditing(id: string, field: string, value: any) {
    setEditing((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
  }

  async function saveOutcome(id: string) {
    const patch = editing[id];
    if (!patch) return;
    try {
      setError(null);
      const response = await fetch(`/api/ml/data-labeling?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...patch,
          outcome_date: patch.outcome_date || null,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Failed to update outcome");
      }
      setEditing((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await fetchOutcomes();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unable to update outcome");
    }
  }

  async function deleteOutcome(id: string) {
    if (!confirm("Delete this label?")) return;
    try {
      setError(null);
      const response = await fetch(`/api/ml/data-labeling?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Failed to delete outcome");
      }
      await fetchOutcomes();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unable to delete outcome");
    }
  }

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const name = getStudentDisplayName(student).toLowerCase();
      const query = newLabel.student_id.toLowerCase();
      if (!query) return true;
      return name.includes(query) || student.user_id.toLowerCase().includes(query);
    });
  }, [students, newLabel.student_id]);

  const outcomeOptions = OUTCOME_VALUES[newLabel.outcome_type] || [];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold">ML Data Labeling</h1>
            <p className="text-slate-400 text-sm mt-1">
              Review recent student outcomes, confirm statuses, and create new labels to seed the ML training pipeline.
            </p>
          </div>

          <Card className="bg-slate-900/70 border-slate-700">
            <CardHeader>
              <CardTitle>New Label</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateLabel} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label>Student</Label>
                  <Input
                    placeholder="Search name or paste student UUID"
                    value={newLabel.student_id}
                    onChange={(event) => setNewLabel((prev) => ({ ...prev, student_id: event.target.value }))}
                    className="bg-slate-900 border-slate-700"
                  />
                  {newLabel.student_id && filteredStudents.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto rounded border border-slate-700 bg-slate-950/90">
                      {filteredStudents.slice(0, 8).map((student) => (
                        <button
                          key={student.user_id}
                          type="button"
                          onClick={() => handleSelectStudent(student.user_id)}
                          className="w-full text-left px-3 py-2 hover:bg-slate-800/80"
                        >
                          <div className="font-medium">{getStudentDisplayName(student)}</div>
                          <div className="text-xs text-slate-400">{student.user_id}</div>
                          {getStudentMeta(student) && (
                            <div className="text-xs text-slate-500">{getStudentMeta(student)}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Outcome Type</Label>
                  <Select
                    value={newLabel.outcome_type}
                    onValueChange={(value) =>
                      setNewLabel((prev) => ({
                        ...prev,
                        outcome_type: value,
                        outcome_value: OUTCOME_VALUES[value]?.[0] || "",
                      }))
                    }
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OUTCOME_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Outcome Value</Label>
                  <Select
                    value={newLabel.outcome_value}
                    onValueChange={(value) =>
                      setNewLabel((prev) => ({
                        ...prev,
                        outcome_value: value,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-slate-900 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {outcomeOptions.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Outcome Date (optional)</Label>
                  <Input
                    type="date"
                    value={newLabel.outcome_date}
                    onChange={(event) =>
                      setNewLabel((prev) => ({
                        ...prev,
                        outcome_date: event.target.value,
                      }))
                    }
                    className="bg-slate-900 border-slate-700"
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <Label>Notes</Label>
                  <Textarea
                    rows={2}
                    value={newLabel.notes}
                    onChange={(event) =>
                      setNewLabel((prev) => ({
                        ...prev,
                        notes: event.target.value,
                      }))
                    }
                    className="bg-slate-900 border-slate-700"
                    placeholder="Context, evidence, or references (optional)"
                  />
                </div>

                <div className="flex items-center gap-3 md:col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      id="confirm-new-label"
                      type="checkbox"
                      checked={newLabel.confirmed}
                      onChange={(event) =>
                        setNewLabel((prev) => ({
                          ...prev,
                          confirmed: event.target.checked,
                        }))
                      }
                      className="h-4 w-4 rounded border-slate-700 bg-slate-900"
                    />
                    <Label htmlFor="confirm-new-label" className="text-sm">Mark as confirmed</Label>
                  </div>
                  <div className="flex-1" />
                  <Button type="submit" disabled={creating} className="bg-yellow-500 text-black hover:bg-yellow-400">
                    {creating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Add Label
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900/70 border-slate-700">
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <CardTitle>Existing Labels</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-40 bg-slate-900 border-slate-700">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                  <SelectTrigger className="w-44 bg-slate-900 border-slate-700">
                    <SelectValue placeholder="Outcome type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {OUTCOME_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fetchOutcomes}
                  className="bg-slate-900 border-slate-700"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
              </div>
            ) : outcomes.length === 0 ? (
              <div className="py-10 text-center text-slate-400">No labels found for the selected filters.</div>
            ) : (
              <div className="space-y-4">
                {outcomes.map((outcome) => {
                  const isEditing = Boolean(editing[outcome.id]);
                  const editState = editing[outcome.id] || {};
                  const options = OUTCOME_VALUES[editState.outcome_type || outcome.outcome_type] || [];
                  return (
                    <div key={outcome.id} className="rounded-lg border border-slate-800 bg-slate-950/60">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 py-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{outcome.student_name}</h3>
                            <RequirementBadge confirmed={outcome.confirmed} />
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {outcome.student_id}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Updated {formatDistanceToNow(new Date(outcome.updated_at))} ago
                          </div>
                        </div>
                        {!isEditing ? (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-slate-800 text-slate-200 border-slate-700 capitalize">
                              {outcome.outcome_type}
                            </Badge>
                            <Badge className="bg-yellow-500/10 text-yellow-300 border-yellow-500/20 capitalize">
                              {outcome.outcome_value}
                            </Badge>
                          </div>
                        ) : null}
                        <div className="flex items-center gap-2">
                          {!isEditing ? (
                            <Button size="sm" variant="outline" onClick={() => startEditing(outcome)}>
                              Edit
                            </Button>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                className="bg-emerald-500 text-black hover:bg-emerald-400"
                                onClick={() => saveOutcome(outcome.id)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditing((prev) => {
                                  const next = { ...prev };
                                  delete next[outcome.id];
                                  return next;
                                })}
                              >
                                Cancel
                              </Button>
                            </>
                          )}
                          <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteOutcome(outcome.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>

                      <Separator className="bg-slate-800" />

                      {!isEditing ? (
                        <div className="px-4 py-3 text-sm text-slate-300 space-y-1">
                          {outcome.outcome_date && (
                            <div>
                              <span className="text-slate-500">Outcome date:</span> {outcome.outcome_date}
                            </div>
                          )}
                          {outcome.notes && (
                            <div>
                              <span className="text-slate-500">Notes:</span> {outcome.notes}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <Label>Outcome Type</Label>
                            <Select
                              value={editState.outcome_type || outcome.outcome_type}
                              onValueChange={(value) => updateEditing(outcome.id, "outcome_type", value)}
                            >
                              <SelectTrigger className="bg-slate-900 border-slate-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {OUTCOME_TYPES.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Outcome Value</Label>
                            <Select
                              value={editState.outcome_value || outcome.outcome_value}
                              onValueChange={(value) => updateEditing(outcome.id, "outcome_value", value)}
                            >
                              <SelectTrigger className="bg-slate-900 border-slate-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(options.length > 0 ? options : OUTCOME_VALUES[outcome.outcome_type]).map((value) => (
                                  <SelectItem key={value} value={value}>
                                    {value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Outcome Date</Label>
                            <Input
                              type="date"
                              value={(editState.outcome_date as string) || outcome.outcome_date || ""}
                              onChange={(event) => updateEditing(outcome.id, "outcome_date", event.target.value)}
                              className="bg-slate-900 border-slate-700"
                            />
                          </div>
                          <div className="md:col-span-2 lg:col-span-3">
                            <Label>Notes</Label>
                            <Textarea
                              rows={2}
                              value={editState.notes ?? outcome.notes ?? ""}
                              onChange={(event) => updateEditing(outcome.id, "notes", event.target.value)}
                              className="bg-slate-900 border-slate-700"
                            />
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-300">
                            <input
                              id={`confirm-${outcome.id}`}
                              type="checkbox"
                              checked={Boolean(editState.confirmed ?? outcome.confirmed)}
                              onChange={(event) => updateEditing(outcome.id, "confirmed", event.target.checked)}
                              className="h-4 w-4 rounded border-slate-700 bg-slate-900"
                            />
                            <Label htmlFor={`confirm-${outcome.id}`} className="text-sm">Mark as confirmed</Label>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


