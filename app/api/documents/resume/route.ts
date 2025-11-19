import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

const DOCGEN_API_URL = process.env.DOCGEN_API_URL || "http://localhost:8000";

/**
 * Generate resume endpoint
 * Auto-populates from student profile and ARK progress
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { template, format, profile, branding } = body;

    // Get student profile and ARK data for auto-population
    const { data: student } = await supabase
      .from("students")
      .select("onboarding_profile, ai_identity_profile")
      .eq("user_id", user.id)
      .single();

    // Get ARK progress for experience section
    const { data: arks } = await supabase
      .from("arks")
      .select("*, ark_milestones(*)")
      .eq("student_id", user.id)
      .eq("status", "active");

    // Get achievements and badges
    const { data: achievements } = await supabase
      .from("student_achievements")
      .select("*")
      .eq("student_id", user.id)
      .order("earned_at", { ascending: false })
      .limit(10);

    // Build resume profile from available data
    const resumeProfile = profile || buildResumeFromStudentData(student, arks, achievements);

    // Call mentark-docgen resume endpoint
    const response = await fetch(`${DOCGEN_API_URL}/generate/resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template: template || "classic",
        format: format || "pdf",
        profile: resumeProfile,
        branding: branding || {},
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Resume generation failed" }));
      return errorResponse(error.detail || "Resume generation failed", response.status);
    }

    const result = await response.json();

    // Save resume metadata
    await supabase.from("student_documents").insert({
      student_id: user.id,
      document_type: "resume",
      docgen_file_id: result.id,
      template_used: template || "classic",
      metadata: {
        format: format || "pdf",
        profile_snapshot: resumeProfile,
      },
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "Failed to generate resume");
  }
}

/**
 * Get current resume
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: resume } = await supabase
      .from("student_documents")
      .select("*")
      .eq("student_id", user.id)
      .eq("document_type", "resume")
      .eq("is_active", true)
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    if (!resume) {
      return successResponse({ resume: null });
    }

    return successResponse({ resume });
  } catch (error) {
    return handleApiError(error, "Failed to fetch resume");
  }
}

/**
 * Helper function to build resume from student data
 */
function buildResumeFromStudentData(
  student: any,
  arks: any[],
  achievements: any[]
): any {
  const profile = student?.onboarding_profile || {};
  const aiProfile = student?.ai_identity_profile || {};

  // Build experience from ARKs
  const experience = (arks || []).map((ark) => ({
    title: ark.title,
    company: "Personal Project",
    start_date: ark.created_at?.split("T")[0] || "",
    end_date: ark.completed_at ? ark.completed_at.split("T")[0] : "Present",
    description: ark.description || "",
    bullets: (ark.ark_milestones || []).slice(0, 3).map((m: any) => m.title),
  }));

  // Build skills from ARK milestones
  const skills = new Set<string>();
  (arks || []).forEach((ark) => {
    (ark.ark_milestones || []).forEach((milestone: any) => {
      if (milestone.skills_to_gain) {
        milestone.skills_to_gain.forEach((skill: string) => skills.add(skill));
      }
    });
  });

  // Build certifications from achievements
  const certifications = (achievements || [])
    .filter((a: any) => a.type === "certificate")
    .map((a: any) => a.title);

  return {
    name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Student",
    title: profile.career_interest || aiProfile.career_goal || "",
    location: profile.location || profile.city || "",
    email: profile.email || "",
    phone: profile.phone || "",
    summary: profile.bio || aiProfile.personal_statement || "",
    experience: experience,
    education: profile.education || [],
    skills: Array.from(skills),
    certifications: certifications,
    projects: [],
  };
}


