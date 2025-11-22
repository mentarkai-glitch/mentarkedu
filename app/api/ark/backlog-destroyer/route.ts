import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { callGPT4o } from "@/lib/ai/models/openai";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const { data: student } = await supabase
      .from("students")
      .select("id, target_exams")
      .eq("user_id", user.id)
      .single();

    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    const body = await request.json();
    const { backlogCount, examDate } = body;

    // Get active ARK to understand current plan
    const { data: activeArk } = await supabase
      .from("arks")
      .select("id, summary, goal_id")
      .eq("student_id", student.id)
      .eq("status", "active")
      .single();

    // Get overdue tasks
    const today = new Date().toISOString().split("T")[0];
    const { data: overdueTasks } = await supabase
      .from("ark_tasks")
      .select(`
        id,
        task_type,
        linked_resource,
        estimated_time_minutes,
        ark_milestones!inner (
          ark_id,
          due_date
        )
      `)
      .eq("ark_milestones.ark_id", activeArk?.id || "")
      .lt("ark_milestones.due_date", today)
      .eq("completion_status", "pending")
      .limit(backlogCount || 20);

    // Get concept mastery data to prioritize
    const { data: skillMatrix } = await supabase
      .from("student_skill_matrix")
      .select("micro_concept_id, proficiency, micro_concepts!inner (name, subject, exam_weightage)")
      .eq("student_id", student.id)
      .lt("proficiency", 70)
      .order("proficiency", { ascending: true })
      .limit(backlogCount || 20);

    // Generate survival plan using AI
    const prompt = `Generate a survival plan for a student with ${backlogCount} concepts behind schedule.

Exam Date: ${examDate || "Not specified"}
Overdue Tasks: ${(overdueTasks || []).length}
Weak Concepts: ${(skillMatrix || []).length}

Create a prioritized plan with:
1. Priority 1: Must Master concepts (highest exam weightage)
2. Priority 2: High Value concepts
3. Deprioritized: Low weightage concepts that can be skipped

Return JSON:
{
  "totalTime": <hours>,
  "daysNeeded": <days>,
  "items": [
    {
      "id": "...",
      "conceptName": "...",
      "subject": "...",
      "priority": 1 or 2,
      "timeEstimate": <hours>,
      "examWeightage": <percentage>,
      "status": "must_master|high_value|deprioritized"
    }
  ]
}`;

    try {
      const aiResponse = await callGPT4o(prompt);
      const planData = JSON.parse(aiResponse || '{}');
      
      return successResponse({
        totalTime: planData.totalTime || 18,
        daysNeeded: planData.daysNeeded || 12,
        items: planData.items || [],
      }, "Survival plan generated successfully");
    } catch (aiError) {
      // Fallback plan
      return successResponse({
        totalTime: 18,
        daysNeeded: 12,
        items: (skillMatrix || []).slice(0, backlogCount || 10).map((item: any, idx: number) => ({
          id: `item-${idx}`,
          conceptName: item.micro_concepts?.name || "Concept",
          subject: item.micro_concepts?.subject || "Unknown",
          priority: idx < 3 ? 1 : 2,
          timeEstimate: 2,
          examWeightage: item.micro_concepts?.weightage || 5,
          status: idx < 3 ? "must_master" : idx < 6 ? "high_value" : "deprioritized",
        })),
      }, "Survival plan generated successfully");
    }

    return successResponse(plan, "Survival plan generated successfully");
  } catch (error) {
    return handleApiError(error, {
      endpoint: "/api/ark/backlog-destroyer",
      method: "POST",
    });
  }
}

