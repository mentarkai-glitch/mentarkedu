import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

const DOCGEN_API_URL = process.env.DOCGEN_API_URL || "http://localhost:8000";

/**
 * Generate ARK progress report endpoint
 * Creates comprehensive reports on ARK progress, skills gained, and achievements
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { ark_id, format, report_type } = body;

    // Fetch ARK data
    const { data: ark, error: arkError } = await supabase
      .from("arks")
      .select("*, ark_milestones(*), category:categories(*)")
      .eq("id", ark_id)
      .eq("student_id", user.id)
      .single();

    if (arkError || !ark) {
      return errorResponse("ARK not found", 404);
    }

    // Get student profile
    const { data: student } = await supabase
      .from("students")
      .select("onboarding_profile")
      .eq("user_id", user.id)
      .single();

    const profile = student?.onboarding_profile || {};

    // Build report data
    const reportData = {
      student: {
        name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Student",
        email: profile.email || "",
      },
      ark: {
        title: ark.title,
        description: ark.description,
        category: ark.category?.name || ark.category_id,
        status: ark.status,
        progress: ark.progress || 0,
        created_at: ark.created_at,
        completed_at: ark.completed_at,
      },
      milestones: (ark.ark_milestones || []).map((m: any) => ({
        title: m.title,
        description: m.description,
        status: m.status,
        completed_at: m.completed_at,
        skills: m.skills_to_gain || [],
      })),
      skills_gained: extractSkillsFromARK(ark),
      report_type: report_type || "progress", // 'progress', 'completion', 'skills'
    };

    // Determine document type based on report type
    const docType = report_type === "completion" ? "certificate" : "project_report";
    const templateId = report_type === "completion" ? "ark_certificate" : "ark_report";

    const response = await fetch(`${DOCGEN_API_URL}/generate/document`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        doc_type: docType,
        format: format || "pdf",
        template_id: templateId,
        data: reportData,
        options: {
          compress: true,
          s3_upload: false,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "ARK report generation failed" }));
      return errorResponse(error.detail || "ARK report generation failed", response.status);
    }

    const result = await response.json();

    // Save ARK report metadata
    await supabase.from("student_documents").insert({
      student_id: user.id,
      document_type: `ark_${report_type}_report`,
      docgen_file_id: result.id,
      template_used: templateId,
      format: format || "pdf",
      metadata: {
        ark_id,
        report_type,
        ark_title: ark.title,
        progress: ark.progress,
      },
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, "Failed to generate ARK report");
  }
}

/**
 * Extract skills from ARK milestones
 */
function extractSkillsFromARK(ark: any): string[] {
  const skills = new Set<string>();
  (ark.ark_milestones || []).forEach((milestone: any) => {
    if (milestone.skills_to_gain && Array.isArray(milestone.skills_to_gain)) {
      milestone.skills_to_gain.forEach((skill: string) => skills.add(skill));
    }
  });
  return Array.from(skills);
}

