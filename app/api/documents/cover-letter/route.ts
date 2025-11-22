import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

const DOCGEN_API_URL = process.env.DOCGEN_API_URL || "http://localhost:8000";

/**
 * Generate cover letter endpoint
 * Auto-generates from job details and student profile
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { job, profile, template } = body;

    if (!job) {
      return errorResponse("Job details are required", 400);
    }

    // Get student profile if not provided
    let coverProfile = profile;
    if (!coverProfile) {
      const { data: student } = await supabase
        .from("students")
        .select("onboarding_profile")
        .eq("user_id", user.id)
        .single();

      const studentProfile = student?.onboarding_profile || {};
      coverProfile = {
        name: `${studentProfile.first_name || ""} ${studentProfile.last_name || ""}`.trim(),
        email: studentProfile.email || "",
        phone: studentProfile.phone || "",
        location: studentProfile.location || studentProfile.city || "",
      };
    }

    // Build job details
    const jobDetails = {
      company: job.company_name || job.company || "",
      position: job.job_title || job.title || "",
      description: job.job_description || job.description || "",
      requirements: job.required_skills || [],
    };

    // Call mentark-docgen cover letter endpoint
    const response = await fetch(`${DOCGEN_API_URL}/generate/cover`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        template: template || "professional",
        format: "pdf",
        profile: coverProfile,
        job: jobDetails,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Cover letter generation failed" }));
      return errorResponse(error.detail || "Cover letter generation failed", response.status);
    }

    const result = await response.json();

    // Save cover letter metadata
    await supabase.from("student_documents").insert({
      student_id: user.id,
      document_type: "cover_letter",
      docgen_file_id: result.id,
      template_used: template || "professional",
      metadata: {
        job_id: job.job_id || job.id,
        company: jobDetails.company,
        position: jobDetails.position,
      },
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/documents/cover-letter",
      method: "POST",
    });
  }
}







