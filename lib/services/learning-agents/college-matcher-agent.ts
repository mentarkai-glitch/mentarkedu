/**
 * College Matcher Agent
 * Finds and recommends colleges based on exam scores, preferences, and student profile
 */

import { BaseAgent, type AgentContext, type AgentResult, type LearningAgent } from "./agent-framework";
import { createClient } from "@/lib/supabase/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIContext } from "@/lib/types";

export class CollegeMatcherAgent extends BaseAgent {
  constructor() {
    super();
  }

  getType(): "career_guide" {
    return "career_guide"; // Using existing agent type
  }

  /**
   * Find colleges matching student's profile and exam scores
   */
  async execute(context: AgentContext): Promise<AgentResult> {
    const supabase = await createClient();

    try {
      // Get student profile
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
        .eq("student_id", context.studentId)
        .order("exam_year", { ascending: false });

      // Get admission preferences
      const { data: preferences } = await supabase
        .from("admission_preferences")
        .select("*")
        .eq("student_id", context.studentId)
        .single();

      if (!preferences) {
        return {
          success: false,
          actions: [],
          error: "Admission preferences not configured",
        };
      }

      // Step 1: Filter colleges by exam scores
      const matchingColleges = await this.findMatchingColleges(
        examScores || [],
        preferences,
        context.studentId
      );

      if (matchingColleges.length === 0) {
        return {
          success: false,
          actions: [],
          error: "No matching colleges found. Consider improving exam scores or adjusting preferences.",
        };
      }

      // Step 2: Enrich with AI-powered analysis
      const enrichedColleges = await this.enrichWithAI(
        matchingColleges,
        student,
        preferences,
        context.studentId
      );

      // Step 3: Rank colleges
      const rankedColleges = this.rankColleges(enrichedColleges, preferences, student);

      // Step 4: Categorize (Safe, Moderate, Reach, Dream)
      const categorizedColleges = this.categorizeColleges(rankedColleges);

      // Step 5: Store recommendations
      await this.storeRecommendations(categorizedColleges, context.studentId);

      const actions = [
        `Analyzed ${examScores?.length || 0} exam scores`,
        `Filtered ${matchingColleges.length} matching colleges`,
        `Generated ${rankedColleges.length} personalized recommendations`,
        `Categorized: ${categorizedColleges.safe} safe, ${categorizedColleges.moderate} moderate, ${categorizedColleges.reach} reach, ${categorizedColleges.dream} dream`,
      ];

      return {
        success: true,
        actions,
        data: {
          recommendations: rankedColleges,
          categories: categorizedColleges,
          total_matched: matchingColleges.length,
        },
        metadata: {
          execution_time: Date.now(),
          exam_scores_used: examScores?.length || 0,
        },
      };
    } catch (error: any) {
      console.error("College Matcher Agent error:", error);
      return {
        success: false,
        actions: [],
        error: error.message,
      };
    }
  }

  /**
   * Find colleges matching exam scores
   */
  private async findMatchingColleges(
    examScores: any[],
    preferences: any,
    studentId: string
  ): Promise<any[]> {
    const supabase = await createClient();

    // Get primary exam (most recent and relevant)
    const primaryExam = this.getPrimaryExam(examScores);
    
    if (!primaryExam) {
      return [];
    }

    // Map exam types to course entrance exams
    const examMapping: Record<string, string[]> = {
      jee_main: ["JEE Main", "JEE Main"],
      jee_advanced: ["JEE Advanced", "JEE Advanced"],
      neet: ["NEET", "NEET"],
      board_12th: ["Board Entrance", "Board Merit"],
      sat: ["SAT", "SAT"],
      act: ["ACT", "ACT"],
    };

    const relevantExamTypes = examMapping[primaryExam.exam_type] || [];

    // Query colleges with courses matching exam type
    let query = supabase
      .from("college_courses")
      .select(`
        *,
        colleges (
          *,
          cutoff_predictions (
            *,
            target_year
          )
        )
      `)
      .contains("exam_type", relevantExamTypes)
      .eq("colleges.is_active", true);

    // Apply location filters
    if (preferences.preferred_states && preferences.preferred_states.length > 0) {
      query = query.in("colleges.state", preferences.preferred_states);
    }

    if (preferences.preferred_cities && preferences.preferred_cities.length > 0) {
      query = query.in("colleges.city", preferences.preferred_cities);
    }

    // Apply budget filter
    if (preferences.budget_max) {
      query = query.lte("fees_total", preferences.budget_max);
    }

    // Apply course interest filter
    if (preferences.interested_degrees && preferences.interested_degrees.length > 0) {
      query = query.in("degree", preferences.interested_degrees);
    }

    if (preferences.interested_fields && preferences.interested_fields.length > 0) {
      // This will need semantic matching or keyword search
      // For now, keep broad matching
    }

    const { data: courses, error } = await query;

    if (error || !courses) {
      console.error("Error fetching colleges:", error);
      return [];
    }

    // Filter by cutoff predictions
    const matchingCourses = courses
      .filter((course: any) => {
        const prediction = course.colleges.cutoff_predictions?.[0];
        if (!prediction || !primaryExam.rank) {
          return true; // Include if no cutoff data
        }

        // Check if student's rank is within predicted range
        const predictedCutoff = prediction.predicted_cutoff_general;
        return primaryExam.rank <= predictedCutoff * 1.5; // Allow 50% buffer
      })
      .map((course: any) => ({
        ...course,
        college: course.colleges,
        cutoff_prediction: course.colleges.cutoff_predictions?.[0] || null,
      }));

    return matchingCourses;
  }

  /**
   * Enrich college data with AI analysis
   */
  private async enrichWithAI(
    colleges: any[],
    student: any,
    preferences: any,
    studentId: string
  ): Promise<any[]> {
    const prompt = `Based on the following information, analyze and score these colleges for the student:

**Student Profile:**
- Goals: ${student.onboarding_profile?.goals?.join(", ") || "Not specified"}
- Interests: ${student.onboarding_profile?.interests?.join(", ") || "Not specified"}
- Learning Style: ${student.onboarding_profile?.learning_style || "Not specified"}
- Financial Comfort: ${student.onboarding_profile?.financial_comfort || "Not specified"}

**Preferences:**
- Budget: ${preferences.budget_max || "Not specified"}
- Preferred Locations: ${preferences.preferred_states?.join(", ") || "Any"}
- Course Interests: ${preferences.interested_degrees?.join(", ") || "Any"}

**Colleges Data:**
${colleges.slice(0, 10).map(
  (college: any, idx: number) => `
${idx + 1}. ${college.college.name} - ${college.name}
   Location: ${college.college.city}, ${college.college.state}
   Type: ${college.college.type} | Tier: ${college.college.tier}
   Fees: ₹${college.fees_total}/year
   Average Package: ₹${college.average_salary}L
   Cutoff Predicted: ${college.cutoff_prediction?.predicted_cutoff_general || "N/A"}
   Placement: ${college.placement_percentage}%
`.trim()
).join("\n")}

For each college, provide:
1. Career alignment score (0-100)
2. Budget fit score (0-100)
3. Overall match score (0-100)
4. Key strengths for this student
5. Any concerns or drawbacks

Return ONLY a JSON array with this structure:
[
  {
    "index": 0,
    "career_alignment": 85,
    "budget_fit": 90,
    "overall_match": 88,
    "strengths": ["Strong placement record", "Aligned with career goals"],
    "concerns": ["High competition", "Expensive location"]
  },
  ...
]`;

    try {
      const aiContext: AIContext = {
        task: "resource_recommendation",
        user_id: studentId,
        session_id: `college_matcher_${Date.now()}`,
        metadata: {
          student_profile: student.onboarding_profile,
          preferences,
          system_prompt: "You are a college admission counselor helping students find the best fit.",
          user_tier: "premium",
        },
      };

      const response = await aiOrchestrator(aiContext, prompt);
      
      // Parse AI response
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const aiAnalysis = JSON.parse(jsonMatch[0]);
        
        // Merge AI insights with college data
        return colleges.map((college, idx) => {
          const analysis = aiAnalysis[idx];
          return {
            ...college,
            ai_analysis: analysis,
            match_score: analysis?.overall_match || 0,
          };
        });
      }
    } catch (error) {
      console.error("Error in AI enrichment:", error);
    }

    // Return without AI enrichment if failed
    return colleges.map((college) => ({
      ...college,
      match_score: 50, // Default score
    }));
  }

  /**
   * Rank colleges by overall fit
   */
  private rankColleges(colleges: any[], preferences: any, student: any): any[] {
    return colleges
      .map((college) => {
        // Calculate admission probability
        const admissionProbability = this.calculateAdmissionProbability(
          college.cutoff_prediction,
          student
        );

        // Combine with match score
        const baseScore = college.match_score || 50;
        const finalScore = baseScore * 0.6 + admissionProbability * 0.4;

        return {
          ...college,
          admission_probability: admissionProbability,
          final_score: finalScore,
        };
      })
      .sort((a, b) => b.final_score - a.final_score);
  }

  /**
   * Categorize colleges (Safe, Moderate, Reach, Dream)
   */
  private categorizeColleges(colleges: any[]): {
    safe: any[];
    moderate: any[];
    reach: any[];
    dream: any[];
    counts: { safe: number; moderate: number; reach: number; dream: number };
  } {
    const categories = {
      safe: colleges.filter((c) => c.admission_probability >= 75),
      moderate: colleges.filter(
        (c) => c.admission_probability >= 50 && c.admission_probability < 75
      ),
      reach: colleges.filter((c) => c.admission_probability >= 25 && c.admission_probability < 50),
      dream: colleges.filter((c) => c.admission_probability < 25),
    };

    // Limit to top recommendations
    const topRecommendations = {
      safe: categories.safe.slice(0, 10),
      moderate: categories.moderate.slice(0, 10),
      reach: categories.reach.slice(0, 5),
      dream: categories.dream.slice(0, 3),
    };

    return {
      ...topRecommendations,
      counts: {
        safe: topRecommendations.safe.length,
        moderate: topRecommendations.moderate.length,
        reach: topRecommendations.reach.length,
        dream: topRecommendations.dream.length,
      },
    };
  }

  /**
   * Store recommendations in database
   */
  private async storeRecommendations(
    categorizedColleges: any,
    studentId: string
  ): Promise<void> {
    const supabase = await createClient();

    const allRecommendations = [
      ...categorizedColleges.safe,
      ...categorizedColleges.moderate,
      ...categorizedColleges.reach,
      ...categorizedColleges.dream,
    ];

    // Delete old recommendations
    await supabase.from("college_recommendations").delete().eq("student_id", studentId);

    // Insert new recommendations
    const recommendations = allRecommendations.map((college, idx) => ({
      student_id: studentId,
      college_id: college.college.id,
      course_id: college.id,
      match_score: college.final_score,
      admission_probability: college.admission_probability,
      category: this.getCategoryForCollege(college, categorizedColleges),
      recommendation_reasons: college.ai_analysis?.strengths || [],
      strengths: college.ai_analysis?.strengths || [],
      improvements_needed: college.ai_analysis?.concerns?.join(", ") || "",
      financial_fit_score: college.ai_analysis?.budget_fit || 50,
      career_alignment_score: college.ai_analysis?.career_alignment || 50,
    }));

    if (recommendations.length > 0) {
      await supabase.from("college_recommendations").insert(recommendations);
    }
  }

  /**
   * Get primary exam (most recent and relevant)
   */
  private getPrimaryExam(examScores: any[]): any | null {
    if (examScores.length === 0) return null;

    // Priority order: JEE Advanced > NEET > JEE Main > Others
    const priority = ["jee_advanced", "neet", "jee_main", "sat", "act", "board_12th"];

    for (const examType of priority) {
      const exam = examScores.find((e) => e.exam_type === examType);
      if (exam) return exam;
    }

    // Fallback to most recent
    return examScores[0];
  }

  /**
   * Calculate admission probability based on cutoff prediction
   */
  private calculateAdmissionProbability(prediction: any, student: any): number {
    if (!prediction || !student) return 50;

    // This is a simplified calculation
    // In production, use more sophisticated algorithms
    const cutoff = prediction.predicted_cutoff_general || 0;
    const studentRank = 10000; // This should come from exam scores

    if (studentRank <= cutoff * 0.8) return 90; // Very safe
    if (studentRank <= cutoff) return 75; // Safe
    if (studentRank <= cutoff * 1.2) return 50; // Moderate
    if (studentRank <= cutoff * 1.5) return 25; // Reach
    return 10; // Dream
  }

  /**
   * Get category for a college
   */
  private getCategoryForCollege(college: any, categorized: any): string {
    if (categorized.safe.includes(college)) return "safe";
    if (categorized.moderate.includes(college)) return "moderate";
    if (categorized.reach.includes(college)) return "reach";
    return "dream";
  }
}


