"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, GraduationCap, Target, IndianRupee } from "lucide-react";

type AcademicStage =
  | "class_11"
  | "class_12"
  | "undergraduate"
  | "postgraduate"
  | "graduate"
  | "working_professional"
  | "gap_year"
  | "other";

const stageOptions: { value: AcademicStage; label: string }[] = [
  { value: "class_11", label: "Class 11 (Senior Secondary)" },
  { value: "class_12", label: "Class 12 (Senior Secondary)" },
  { value: "undergraduate", label: "Undergraduate / Graduation" },
  { value: "postgraduate", label: "Postgraduate / Masters" },
  { value: "graduate", label: "Graduate (Completed degree)" },
  { value: "working_professional", label: "Working Professional" },
  { value: "gap_year", label: "Gap Year / Drop Year" },
  { value: "other", label: "Other" },
];

const graduationYears = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "5th Year",
  "Final Year",
  "Completed",
];

const competitiveExamOptions = [
  "JEE Main",
  "JEE Advanced",
  "NEET",
  "AIIMS",
  "CUET",
  "BITSAT",
  "CLAT",
  "CAT",
  "UPSC",
  "Others",
];

const graduationTracks = [
  "B.Tech / BE (Engineering)",
  "MBBS / BDS (Medical)",
  "B.Com / BBA / BMS",
  "B.Sc (Science)",
  "BA (Arts & Humanities)",
  "BCA / BSc IT",
  "Design / Architecture (B.Des / B.Arch)",
  "Law (Integrated / LLB)",
  "Hotel Management / Tourism",
  "Pharmacy / Allied Health",
  "Vocational / Diploma",
  "Other / Not sure yet",
];

interface TrainAIProfile {
  academicStage: AcademicStage | "";
  graduationCourse: string;
  graduationYear: string;
  graduationTarget: string;
  competitiveExams: string[];
  otherExam: string;
  monthlyBudget: string;
  careerGoal: string;
}

interface ProfileResponse {
  success: boolean;
  data?: {
    grade?: string | null;
    batch?: string | null;
    interests?: any[] | null;
    goals?: any[] | null;
    onboarding_profile?: Record<string, any> | null;
  };
}

export default function TrainMentarkAIPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileMeta, setProfileMeta] = useState<{
    grade?: string | null;
    batch?: string | null;
    interests?: any[] | null;
    goals?: any[] | null;
    onboarding_profile?: Record<string, any> | null;
  }>({});

  const [form, setForm] = useState<TrainAIProfile>({
    academicStage: "",
    graduationCourse: "",
    graduationYear: "",
    graduationTarget: "",
    competitiveExams: [],
    otherExam: "",
    monthlyBudget: "",
    careerGoal: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/students/profile");
        const json: ProfileResponse = await response.json();
        if (json.success && json.data) {
          setProfileMeta({
            grade: json.data.grade ?? null,
            batch: json.data.batch ?? null,
            interests: json.data.interests ?? [],
            goals: json.data.goals ?? [],
            onboarding_profile: json.data.onboarding_profile ?? {},
          });

          const onboarding = (json.data.onboarding_profile as Record<string, any>) || {};
          setForm((prev) => ({
            academicStage: onboarding.academicStage || onboarding.academic_stage || prev.academicStage,
            graduationCourse: onboarding.graduationCourse || onboarding.graduation_course || "",
            graduationYear: onboarding.graduationYear || onboarding.graduation_year || "",
            graduationTarget: onboarding.graduationTarget || onboarding.graduation_target || "",
            competitiveExams:
              onboarding.competitiveExams ||
              onboarding.competitive_exams ||
              onboarding.exam_focus ||
              [],
            otherExam: onboarding.otherExam || onboarding.other_exam || "",
            monthlyBudget:
              typeof onboarding.monthlyBudgetInr !== "undefined"
                ? String(onboarding.monthlyBudgetInr)
                : onboarding.monthly_budget_inr
                ? String(onboarding.monthly_budget_inr)
                : "",
            careerGoal: onboarding.careerGoal || onboarding.career_goal || "",
          }));
        }
      } catch (error) {
        console.error("Failed to fetch profile for Train AI page:", error);
        toast.error("Could not load your profile details");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const isCompetitiveStage = useMemo(
    () => form.academicStage === "class_11" || form.academicStage === "class_12",
    [form.academicStage]
  );

  const isGraduationStage = useMemo(
    () =>
      form.academicStage === "undergraduate" ||
      form.academicStage === "postgraduate" ||
      form.academicStage === "graduate",
    [form.academicStage]
  );

  const shouldShowGraduationTarget = useMemo(
    () =>
      form.academicStage === "class_11" ||
      form.academicStage === "class_12" ||
      form.academicStage === "gap_year" ||
      form.academicStage === "graduate",
    [form.academicStage]
  );

  const toggleExam = (exam: string) => {
    setForm((prev) => {
      const selected = new Set(prev.competitiveExams);
      if (selected.has(exam)) {
        selected.delete(exam);
      } else {
        selected.add(exam);
      }
      return { ...prev, competitiveExams: Array.from(selected) };
    });
  };

  const handleSave = async () => {
    if (!form.academicStage) {
      toast.error("Please select your academic stage.");
      return;
    }

    setSaving(true);
    try {
      const existingProfile = profileMeta.onboarding_profile || {};
      const updatedProfile = {
        ...existingProfile,
        academicStage: form.academicStage,
        graduationCourse: form.graduationCourse,
        graduationYear: form.graduationYear,
        graduationTarget: form.graduationTarget,
        competitiveExams: form.competitiveExams,
        otherExam: form.otherExam,
        monthlyBudgetInr: form.monthlyBudget ? Number(form.monthlyBudget) : null,
        careerGoal: form.careerGoal,
        last_ai_training_at: new Date().toISOString(),
      };

      const response = await fetch("/api/students/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: profileMeta.grade,
          batch: profileMeta.batch,
          interests: profileMeta.interests,
          goals: profileMeta.goals,
          onboarding_profile: updatedProfile,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error || "Failed to save details");
      }

      toast.success("Mentark AI updated! Expect sharper suggestions within 24 hours.");
      router.push("/dashboard/student");
    } catch (error: any) {
      console.error("Failed to save Train AI profile:", error);
      toast.error(error?.message || "Could not save your AI training data");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <div className="h-12 w-12 border-b-2 border-yellow-400 rounded-full animate-spin mx-auto mb-4" />
          <p>Loading your personalised controls...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden w-full">
      <div className="container mx-auto max-w-4xl px-3 sm:px-6 py-8 md:py-12">
        <div className="flex items-center gap-3 text-muted-foreground mb-6">
          <Link href="/dashboard/student">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-yellow-300 hover:bg-card">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Badge className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-200">
            India-first Mentark
          </Badge>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="glass border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent">
            <CardHeader>
              <CardTitle className="text-foreground text-xl sm:text-2xl flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-yellow-300" />
                Train Mentark AI with Your Story
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Share your graduation plan, course year, and competitive exam prep so Mentark behaves like an Indian
                mentor. Recommendations, reminders, and budgets will reference Indian universities, entrance exams, and
                pricing in Indian rupees.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="border border-border bg-card/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-yellow-400" />
                Academic Stage &amp; Goals
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Tell Mentark where you are in your journey so ARKs, mentors, and nudges stay context aware.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <section className="space-y-4">
                <Label className="text-muted-foreground">Where are you right now?</Label>
                <Select
                  value={form.academicStage}
                  onValueChange={(value: AcademicStage) => setForm((prev) => ({ ...prev, academicStage: value }))}
                >
                  <SelectTrigger className="bg-background/40 border border-border text-muted-foreground">
                    <SelectValue placeholder="Select your academic stage" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border text-muted-foreground">
                    {stageOptions.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Mentark uses this to suggest relevant milestones, scholarships, and internships in India.
                </p>
              </section>

              {shouldShowGraduationTarget && (
                <section className="space-y-2">
                  <Label className="text-muted-foreground">Preferred graduation track (optional)</Label>
                  <Select
                    value={form.graduationTarget}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, graduationTarget: value }))}
                  >
                    <SelectTrigger className="bg-background/40 border border-border text-muted-foreground">
                      <SelectValue placeholder="Choose the graduation path you’re aiming for" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border border-border text-muted-foreground">
                      {graduationTracks.map((track) => (
                        <SelectItem key={track} value={track}>
                          {track}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Helps Mentark recommend the right institutes, professors, and scholarship alerts for your goal.
                  </p>
                </section>
              )}

              {isGraduationStage && (
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Course / Degree</Label>
                    <Input
                      value={form.graduationCourse}
                      onChange={(event) => setForm((prev) => ({ ...prev, graduationCourse: event.target.value }))}
                      placeholder="e.g. B.Tech Computer Science, B.Com Honours"
                      className="bg-background/40 border border-border text-muted-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Year / Semester</Label>
                    <Select
                      value={form.graduationYear}
                      onValueChange={(value) => setForm((prev) => ({ ...prev, graduationYear: value }))}
                    >
                      <SelectTrigger className="bg-background/40 border border-border text-muted-foreground">
                        <SelectValue placeholder="Select your current year" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border border-border text-muted-foreground">
                        {graduationYears.map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </section>
              )}

              {isCompetitiveStage && (
                <section className="space-y-3">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Target className="h-4 w-4 text-yellow-400" />
                    Competitive exams you&apos;re targeting
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {competitiveExamOptions.map((exam) => (
                      <label
                        key={exam}
                        className="flex items-start gap-3 rounded-lg border border-border bg-background/30 px-3 py-2 text-sm text-muted-foreground hover:border-yellow-500/40 cursor-pointer"
                      >
                        <Checkbox
                          checked={form.competitiveExams.includes(exam)}
                          onCheckedChange={() => toggleExam(exam)}
                        />
                        <span>{exam}</span>
                      </label>
                    ))}
                  </div>
                  {form.competitiveExams.includes("Others") && (
                    <Input
                      value={form.otherExam}
                      onChange={(event) => setForm((prev) => ({ ...prev, otherExam: event.target.value }))}
                      placeholder="Enter the exam name"
                      className="bg-background/40 border border-border text-muted-foreground placeholder:text-muted-foreground"
                    />
                  )}
                </section>
              )}

              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <IndianRupee className="h-4 w-4 text-yellow-400" />
                    Monthly learning budget (Optional)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.monthlyBudget}
                    onChange={(event) => setForm((prev) => ({ ...prev, monthlyBudget: event.target.value }))}
                    placeholder="e.g. 2500"
                    className="bg-background/40 border border-border text-muted-foreground placeholder:text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    Helps Mentark recommend courses, coaching, or subscriptions within your Indian budget.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Dream role / college (Optional)</Label>
                  <Textarea
                    value={form.careerGoal}
                    onChange={(event) => setForm((prev) => ({ ...prev, careerGoal: event.target.value }))}
                    placeholder="Tell us about your ideal college, company, or role so Mentark can guide you."
                    className="bg-background/40 border border-border text-muted-foreground placeholder:text-muted-foreground h-32"
                  />
                </div>
              </section>

              <div className="rounded-lg border border-border bg-background/30 p-4 text-sm text-muted-foreground space-y-2">
                <p className="font-semibold text-yellow-200 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Why this matters
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Mentark adapts milestones to Indian academic calendars and entrance exam timelines.</li>
                  <li>Resources, mentors, and scholarships suggested will respect Indian family budgets.</li>
                  <li>AI reminders become more relevant when we know your course load and exam dates.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end"
        >
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:bg-card"
            onClick={() => router.push("/dashboard/student")}
          >
            Skip for now
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-yellow-500 text-black hover:bg-yellow-400 font-semibold"
          >
            {saving ? "Saving..." : "Save & Train Mentark AI"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}


