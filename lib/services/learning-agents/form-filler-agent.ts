/**
 * Form Filler Agent
 * Automatically fills college admission forms with AI-powered career guidance
 */

import { BaseAgent, type AgentContext, type AgentResult } from "./agent-framework";
import { createClient } from "@/lib/supabase/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIContext } from "@/lib/types";

export class FormFillerAgent extends BaseAgent {
  constructor() {
    super();
  }

  getType(): "form_filler" {
    return "form_filler";
  }

  /**
   * Fill admission form and provide career guidance
   */
  async execute(context: AgentContext): Promise<AgentResult> {
    const supabase = await createClient();

    try {
      const { college_id, course_id, form_template_id } = context.metadata || {};

      if (!college_id || !course_id) {
        return {
          success: false,
          actions: [],
          error: "College ID and Course ID are required",
        };
      }

      // Get student data
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("onboarding_profile, ai_identity_profile, user_id")
        .eq("user_id", context.studentId)
        .single();

      if (studentError || !student) {
        return {
          success: false,
          actions: [],
          error: "Student not found",
        };
      }

      // Get exam scores
      const { data: examScores } = await supabase
        .from("student_exam_scores")
        .select("*")
        .eq("student_id", context.studentId);

      // Get college and course details
      const { data: course } = await supabase
        .from("college_courses")
        .select("*, colleges(*)")
        .eq("id", course_id)
        .single();

      if (!course) {
        return {
          success: false,
          actions: [],
          error: "Course not found",
        };
      }

      // Get form template
      const { data: formTemplate } = form_template_id
        ? await supabase.from("form_templates").select("*").eq("id", form_template_id).single()
        : { data: null };

      // Step 1: Generate career guidance and course suggestions
      const careerGuidance = await this.generateCareerGuidance(
        student,
        course,
        context.studentId
      );

      // Step 2: Auto-fill form data
      const examScoresArray = examScores || [];
      const formData = await this.generateFormData(student, course, examScoresArray, formTemplate);

      // Step 3: Check required documents
      const documents = await this.checkDocuments(student, examScoresArray);

      // Step 4: Generate AI recommendations
      const aiRecommendations = await this.generateAIRecommendations(
        student,
        course,
        context.studentId
      );

      const actions = [
        `Analyzed student profile and career goals`,
        `Generated career guidance for ${course.name}`,
        `Auto-filled ${Object.keys(formData).length} form fields`,
        `Identified ${documents.pending.length} pending documents`,
        `Created personalized recommendations`,
      ];

      return {
        success: true,
        actions,
        data: {
          form_data: formData,
          career_guidance: careerGuidance,
          documents: documents,
          ai_recommendations: aiRecommendations,
          course: course,
          college: course.colleges,
        },
        metadata: {
          college_id,
          course_id,
          execution_time: Date.now(),
        },
      };
    } catch (error: any) {
      console.error("Form Filler Agent error:", error);
      return {
        success: false,
        actions: [],
        error: error.message,
      };
    }
  }

  /**
   * Generate career guidance based on course selection
   */
  private async generateCareerGuidance(
    student: any,
    course: any,
    studentId: string
  ): Promise<any> {
    const prompt = `Provide comprehensive career guidance for this student applying to ${course.colleges.name} - ${course.name}:

**Student Profile:**
- Goals: ${student.onboarding_profile?.goals?.join(", ") || "Not specified"}
- Interests: ${student.onboarding_profile?.interests?.join(", ") || "Not specified"}
- Learning Style: ${student.onboarding_profile?.learning_style || "Not specified"}
- Career Clarity: ${student.onboarding_profile?.career_clarity || "Not specified"}

**Course Information:**
- Name: ${course.name}
- Degree: ${course.degree}
- Duration: ${course.duration_years} years
- Average Salary: ₹${course.average_salary}L
- Placement Rate: ${course.placement_percentage}%
- Top Recruiters: ${course.top_recruiters?.join(", ") || "N/A"}

**Your Task:**
1. **Career Path Mapping**: Show 10-year career trajectory
   - Year 1-2: Entry positions
   - Year 3-5: Mid-level growth
   - Year 6-10: Senior roles

2. **Skills Analysis**: What skills will student gain
3. **Career Options**: Top 5 career paths after this course
4. **Industry Outlook**: Growth prospects in this field
5. **ROI Analysis**: Return on investment
6. **ARK Suggestions**: Learning resources to prepare

Return ONLY a JSON object:
{
  "career_paths": [
    {
      "role": "Software Engineer",
      "description": "Build and maintain software applications",
      "salary_range": "₹8-20L",
      "growth_rate": "20% annually"
    }
  ],
  "skills_gained": ["Programming", "Problem Solving", "Team Collaboration"],
  "10_year_trajectory": {
    "entry": "Junior Developer - ₹8L",
    "mid_level": "Senior Developer - ₹15L",
    "senior": "Tech Lead - ₹30L+"
  },
  "industry_outlook": "Very strong growth in tech sector",
  "roi_analysis": {
    "total_cost": "₹8L over 4 years",
    "break_even": "1.5 years post graduation",
    "lifetime_earnings": "₹2-3 crore estimated"
  },
  "ark_suggestions": {
    "topics": ["Data Structures", "Algorithms", "System Design"],
    "resources": ["YouTube: Abdul Bari", "Coursera: Stanford CS"]
  }
}`;

    try {
      const aiContext: AIContext = {
        task: "insights",
        user_id: studentId,
        session_id: `form_filler_${Date.now()}`,
        metadata: {
          student_profile: student.onboarding_profile,
          system_prompt: "You are a career counselor helping students make informed decisions.",
          user_tier: "premium",
        },
      };

      const response = await aiOrchestrator(aiContext, prompt);

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error("Error in career guidance:", error);
    }

    // Fallback
    return {
      career_paths: [],
      skills_gained: [],
      industry_outlook: "Positive",
    };
  }

  /**
   * Generate auto-filled form data
   */
  private async generateFormData(
    student: any,
    course: any,
    examScores: any[],
    formTemplate: any
  ): Promise<any> {
    // Basic auto-filled data
    const profile = student.onboarding_profile || {};
    const primaryExam = examScores && examScores.length > 0 ? examScores[0] : null;

    const formData: any = {
      // Personal Information (basic fields)
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      date_of_birth: profile.date_of_birth || "",
      gender: profile.gender || "",
      email: "", // Should come from auth
      phone: profile.phone || "",
      address: profile.address || "",
      city: profile.location || "",
      state: profile.state || "",
      pincode: profile.pincode || "",
      nationality: "Indian",

      // Academic Information
      board_10th: profile.board || "",
      percentage_10th: profile.percentage_10th || "",
      year_10th: profile.year_10th || "",
      board_12th: profile.board_12th || "",
      percentage_12th: profile.percentage_12th || "",
      year_12th: profile.year_12th || "",

      // Entrance Exam Information
      exam_name: primaryExam?.exam_type || course.exam_type?.[0] || "",
      exam_year: primaryExam?.exam_year || new Date().getFullYear(),
      score: primaryExam?.marks_obtained || "",
      rank: primaryExam?.rank || "",
      percentile: primaryExam?.percentile || "",

      // Course Selection
      preferred_course: course.name,
      preferred_specialization: course.specialization || "",

      // Category
      category: profile.category || "General",

      // Parent/Guardian Information
      father_name: profile.father_name || "",
      father_occupation: profile.father_occupation || "",
      mother_name: profile.mother_name || "",
      mother_occupation: profile.mother_occupation || "",
      annual_income: profile.annual_income || "",

      // Documents
      documents_submitted: [],
    };

    // If form template has specific fields, adapt
    if (formTemplate?.fields) {
      // Template-specific form structure
      // This would need more sophisticated mapping
    }

    return formData;
  }

  /**
   * Check required documents
   */
  private async checkDocuments(student: any, examScores: any[]): Promise<any> {
    const requiredDocs = [
      "10th Marksheet",
      "12th Marksheet",
      "Entrance Exam Scorecard",
      "Category Certificate (if applicable)",
      "Domicile Certificate",
      "Passport Size Photographs",
      "Identity Proof (Aadhar/PAN)",
      "Income Certificate (if applying for scholarships)",
    ];

    const submittedDocs: string[] = []; // Would come from database
    const pendingDocs = requiredDocs.filter((doc) => !submittedDocs.includes(doc));

    return {
      required: requiredDocs,
      submitted: submittedDocs,
      pending: pendingDocs,
      status: pendingDocs.length === 0 ? "complete" : "pending",
    };
  }

  /**
   * Generate AI recommendations for the application
   */
  private async generateAIRecommendations(
    student: any,
    course: any,
    studentId: string
  ): Promise<any> {
    const prompt = `Analyze this college application and provide recommendations:

**Student Applying To:**
${course.colleges.name} - ${course.name}

**Student Profile:**
- Interests: ${student.onboarding_profile?.interests?.join(", ") || "Not specified"}
- Goals: ${student.onboarding_profile?.goals?.join(", ") || "Not specified"}
- Strengths: ${student.ai_identity_profile?.strengths || "Not specified"}

**Application Context:**
- Course: ${course.name}
- Placement: ${course.placement_percentage}%
- Average Salary: ₹${course.average_salary}L

Provide:
1. Why this college aligns with the student
2. How to strengthen the application
3. What to highlight in essays/interviews
4. Scholarship opportunities to explore
5. Preparation tips if admitted

Return ONLY a JSON object:
{
  "alignment_reasons": ["Strong fit for student goals", "Excellent placement record"],
  "strengthening_tips": ["Highlight relevant achievements", "Connect goals to course"],
  "essay_highlights": ["Passion for technology", "Problem-solving skills"],
  "scholarship_opportunities": ["Merit-based scholarship available"],
  "preparation_tips": ["Start learning fundamentals early", "Join student groups"]
}`;

    try {
      const aiContext: AIContext = {
        task: "resource_recommendation",
        user_id: studentId,
        session_id: `form_recommendations_${Date.now()}`,
        metadata: {
          student_profile: student.onboarding_profile,
          system_prompt: "You are an admission counselor helping students strengthen their applications.",
          user_tier: "premium",
        },
      };

      const response = await aiOrchestrator(aiContext, prompt);

      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error("Error in AI recommendations:", error);
    }

    // Fallback
    return {
      alignment_reasons: [],
      strengthening_tips: [],
      essay_highlights: [],
      scholarship_opportunities: [],
      preparation_tips: [],
    };
  }

  /**
   * Create ARK automatically based on career guidance
   */
  async createCareerARK(
    studentId: string,
    careerGuidance: any,
    course: any
  ): Promise<string | null> {
    // This would integrate with ARK creation system
    // For now, return ARK ID or null
    return null;
  }
}


