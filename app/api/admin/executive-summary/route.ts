import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";
import type { AIContext } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify admin
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin) {
      return errorResponse("Admin access required", 403);
    }

    const body = await request.json();
    const { timeframe = "monthly" } = body;

    // Get institute data
    const { data: userData } = await supabase
      .from("users")
      .select("institute_id")
      .eq("id", user.id)
      .single();

    const { data: institute } = await supabase
      .from("institutes")
      .select("*")
      .eq("id", userData?.institute_id)
      .single();

    // Collect comprehensive metrics
    const [students, teachers, arks, checkIns, interventions] = await Promise.all([
      supabase.from("students").select("risk_score, batch").then(({ data }) => data),
      supabase.from("teachers").select("user_id").then(({ data }) => data),
      supabase.from("arks").select("status, progress").then(({ data }) => data),
      supabase.from("daily_checkins").select("energy, focus").limit(1000).then(({ data }) => data),
      supabase.from("interventions").select("status, priority").then(({ data }) => data),
    ]);

    // Calculate metrics
    const totalStudents = students?.length || 0;
    const totalTeachers = teachers?.length || 0;
    const activeArks = arks?.filter((a) => a.status === "active").length || 0;
    const completedArks = arks?.filter((a) => a.status === "completed").length || 0;
    const avgProgress = arks && arks.length > 0
      ? Math.round(arks.reduce((acc: number, a: any) => acc + a.progress, 0) / arks.length)
      : 0;

    const highRiskStudents = students?.filter((s) => s.risk_score >= 70).length || 0;
    const avgRiskScore = students && students.length > 0
      ? Math.round(students.reduce((acc: number, s: any) => acc + s.risk_score, 0) / students.length)
      : 0;

    const avgEnergy = checkIns && checkIns.length > 0
      ? Number((checkIns.reduce((acc: number, ci: any) => acc + ci.energy, 0) / checkIns.length).toFixed(1))
      : 0;
    const avgFocus = checkIns && checkIns.length > 0
      ? Number((checkIns.reduce((acc: number, ci: any) => acc + ci.focus, 0) / checkIns.length).toFixed(1))
      : 0;

    const completionRate = totalStudents > 0 ? Math.round((completedArks / totalStudents) * 100) : 0;
    const engagementRate = totalStudents > 0 && checkIns
      ? Math.round((checkIns.filter((_, i) => i < totalStudents).length / totalStudents) * 100)
      : 0;

    // Generate AI executive summary
    const prompt = `As a senior educational analyst, create a comprehensive executive summary for this educational institute's mentorship platform performance.

**Institute Overview:**
- Name: ${institute?.name || "Unknown Institute"}
- Plan Type: ${institute?.plan_type || "Unknown"}
- Total Students: ${totalStudents}
- Total Teachers: ${totalTeachers}

**Key Metrics:**
- Engagement Rate: ${engagementRate}%
- ARK Completion Rate: ${completionRate}%
- Average ARK Progress: ${avgProgress}%
- Average Student Risk Score: ${avgRiskScore}/100
- High-Risk Students: ${highRiskStudents}
- Average Daily Energy: ${avgEnergy}/5
- Average Daily Focus: ${avgFocus}/5

**Activity Summary:**
- Active ARKs: ${activeArks}
- Completed ARKs: ${completedArks}
- Total Check-ins: ${checkIns?.length || 0}
- Interventions: ${interventions?.length || 0}

**Time Period:**
${timeframe === "monthly" ? "Last 30 days" : timeframe === "weekly" ? "Last 7 days" : "All time"}

**Task:**
Generate an executive summary with:
1. Performance highlights (2-3 key wins)
2. Areas requiring attention (2-3 concerns)
3. Risk assessment summary
4. Recommended strategic actions
5. ROI insights (student retention, engagement quality)

Return ONLY a JSON object:
{
  "highlights": [
    "Brief highlight 1",
    "Brief highlight 2"
  ],
  "concerns": [
    "Concern 1 with data",
    "Concern 2 with data"
  ],
  "risk_summary": {
    "overall_risk": "low|medium|high",
    "trend": "improving|stable|deteriorating",
    "critical_issues": ["Issue 1", "Issue 2"]
  },
  "strategic_actions": [
    {
      "priority": "high|medium|low",
      "action": "Specific recommended action",
      "impact": "Expected impact description"
    }
  ],
  "roi_insights": {
    "retention_rate": ${completionRate},
    "engagement_quality": "${engagementRate >= 70 ? "Excellent" : engagementRate >= 50 ? "Good" : "Needs Improvement"}",
    "growth_potential": "Brief assessment"
  }
}`;

    try {
      const aiContext: AIContext = {
        task: "insights",
        user_id: user.id,
        session_id: `executive_summary_${Date.now()}`,
        metadata: {
          system_prompt: "You are a senior educational analyst creating executive-level summaries for school administrators.",
          user_tier: "premium",
        },
      };

      const response = await aiOrchestrator(aiContext, prompt);

      // Parse AI response
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      let summary = null;
      if (jsonMatch) {
        try {
          summary = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Failed to parse executive summary:", e);
        }
      }

      // Fallback summary if AI fails
      if (!summary) {
        summary = generateFallbackSummary(
          totalStudents,
          totalTeachers,
          completionRate,
          engagementRate,
          avgRiskScore,
          highRiskStudents
        );
      }

      return successResponse({
        timeframe,
        summary,
        metrics: {
          total_students: totalStudents,
          total_teachers: totalTeachers,
          completion_rate: completionRate,
          engagement_rate: engagementRate,
          avg_risk_score: avgRiskScore,
          high_risk_students: highRiskStudents,
        },
        generated_at: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Executive summary generation error:", error);
      
      const fallbackSummary = generateFallbackSummary(
        totalStudents,
        totalTeachers,
        completionRate,
        engagementRate,
        avgRiskScore,
        highRiskStudents
      );

      return successResponse({
        timeframe,
        summary: fallbackSummary,
        metrics: {
          total_students: totalStudents,
          total_teachers: totalTeachers,
          completion_rate: completionRate,
          engagement_rate: engagementRate,
          avg_risk_score: avgRiskScore,
          high_risk_students: highRiskStudents,
        },
        generated_at: new Date().toISOString(),
        note: "Generated fallback summary due to AI service issue",
      });
    }
  } catch (error: any) {
    console.error("Executive summary error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

function generateFallbackSummary(
  totalStudents: number,
  totalTeachers: number,
  completionRate: number,
  engagementRate: number,
  avgRiskScore: number,
  highRiskStudents: number
): any {
  const highlights = [];
  const concerns = [];
  const strategicActions = [];

  if (engagementRate >= 70) {
    highlights.push(`Strong engagement with ${engagementRate}% of students actively using the platform`);
  }
  if (completionRate >= 60) {
    highlights.push(`Healthy ARK completion rate of ${completionRate}%`);
  }
  if (totalTeachers > 0 && totalStudents / totalTeachers <= 30) {
    highlights.push(`Good teacher-to-student ratio (${Math.round(totalStudents / totalTeachers)}:1)`);
  }

  if (avgRiskScore >= 60) {
    concerns.push(`Average risk score of ${avgRiskScore}/100 indicates students may need additional support`);
  }
  if (highRiskStudents > 0) {
    concerns.push(`${highRiskStudents} students flagged as high-risk requiring immediate attention`);
  }
  if (completionRate < 40) {
    concerns.push(`Low ARK completion rate (${completionRate}%) suggesting potential engagement barriers`);
  }

  if (highRiskStudents > 0) {
    strategicActions.push({
      priority: "high",
      action: `Implement targeted intervention program for ${highRiskStudents} high-risk students`,
      impact: "Expected to reduce dropout risk by 25-30%",
    });
  }
  if (engagementRate < 60) {
    strategicActions.push({
      priority: "high",
      action: "Launch engagement campaign to increase daily check-ins and ARK participation",
      impact: "Expected to improve engagement by 20-30%",
    });
  }

  const riskLevel = avgRiskScore >= 70 ? "high" : avgRiskScore >= 50 ? "medium" : "low";
  const trend = completionRate > 60 ? "improving" : completionRate > 40 ? "stable" : "deteriorating";

  return {
    highlights: highlights.length > 0 ? highlights : ["System operational and tracking student progress"],
    concerns: concerns.length > 0 ? concerns : ["Continue monitoring key metrics"],
    risk_summary: {
      overall_risk: riskLevel,
      trend: trend,
      critical_issues: highRiskStudents > 0 ? [`${highRiskStudents} high-risk students need attention`] : [],
    },
    strategic_actions: strategicActions.length > 0 ? strategicActions : [
      {
        priority: "medium",
        action: "Continue monitoring and optimizing mentorship programs",
        impact: "Sustained growth in student engagement",
      },
    ],
    roi_insights: {
      retention_rate: completionRate,
      engagement_quality: engagementRate >= 70 ? "Excellent" : engagementRate >= 50 ? "Good" : "Needs Improvement",
      growth_potential: `${totalStudents} active students showing strong platform adoption`,
    },
  };
}

