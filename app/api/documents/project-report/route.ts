import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

const DOCGEN_API_URL = process.env.DOCGEN_API_URL || "http://localhost:8000";

/**
 * Generate project report endpoint
 * Creates professional project documentation
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { project_id, project_data, format, template } = body;

    if (!project_data && !project_id) {
      return errorResponse("Project data or project_id is required", 400);
    }

    let project = project_data;

    // Fetch project if only ID provided
    if (project_id && !project_data) {
      const { data: fetchedProject, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", project_id)
        .eq("student_id", user.id)
        .single();

      if (projectError || !fetchedProject) {
        return errorResponse("Project not found", 404);
      }

      project = fetchedProject;
    }

    // Build project report data structure
    const reportData = {
      project: {
        title: project.title || project.name,
        description: project.description,
        status: project.status,
        start_date: project.start_date || project.created_at,
        end_date: project.end_date || project.updated_at,
        technologies: project.technologies || project.tech_stack || [],
        deliverables: project.deliverables || [],
        metrics: project.metrics || {},
        challenges: project.challenges || [],
        learnings: project.learnings || [],
      },
    };

    // Call mentark-docgen project report endpoint
    const response = await fetch(`${DOCGEN_API_URL}/generate/document`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        doc_type: "project_report",
        format: format || "pdf",
        template_id: template || "default",
        data: reportData,
        options: {
          compress: true,
          s3_upload: false,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Project report generation failed" }));
      return errorResponse(error.detail || "Project report generation failed", response.status);
    }

    const result = await response.json();

    // Save project report metadata
    await supabase.from("student_documents").insert({
      student_id: user.id,
      document_type: "project_report",
      docgen_file_id: result.id,
      template_used: template || "default",
      metadata: {
        format: format || "pdf",
        project_id: project_id || project.id,
        project_title: reportData.project.title,
      },
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/documents/project-report",
      method: "POST",
    });
  }
}







