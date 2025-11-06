import { createClient } from "@/lib/supabase/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIContext } from "@/lib/types";

export interface CareerAlignment {
  career_path: string;
  alignment_score: number;
  skills_match: string[];
  skills_gap: string[];
  recommended_arks: string[];
  job_opportunities: JobOpportunity[];
  confidence_boost: number;
}

export interface JobOpportunity {
  title: string;
  company?: string;
  description: string;
  required_skills: string[];
  match_score: number;
  confidence_level: 'ready' | 'nearly_ready' | 'developing';
}

export interface ConfidenceAnalysis {
  overall_confidence: number;
  confidence_factors: {
    skill_mastery: number;
    milestone_completion: number;
    consistency: number;
    resource_utilization: number;
  };
  strengths: string[];
  improvement_areas: string[];
  confidence_trend: 'increasing' | 'stable' | 'decreasing';
  recommendations: string[];
}

export async function analyzeCareerAlignment(
  userId: string,
  careerPath?: string
): Promise<CareerAlignment> {
  const supabase = await createClient();

  // Get user's ARKs and progress
  const { data: arks } = await supabase
    .from('arks')
    .select('*, milestones(*, tasks(*))')
    .eq('user_id', userId);

  // Get user's skills from completed tasks
  const { data: completedTasks } = await supabase
    .from('ark_tasks')
    .select('skills_developed')
    .eq('user_id', userId)
    .eq('completed', true);

  const allSkills = completedTasks
    ?.flatMap(t => t.skills_developed || [])
    .filter(Boolean) || [];

  // Build AI prompt for career alignment
  const prompt = `Analyze career alignment for a student pursuing ${careerPath || 'their chosen career path'}.

**Student's Skills (from completed ARKs):**
${allSkills.slice(0, 20).join(', ') || 'None yet'}

**Completed ARKs:** ${arks?.length || 0}

**Task:** Analyze alignment with ${careerPath || 'their career goals'} and provide:
1. Overall alignment score (0.0 to 1.0)
2. Skills that match the career path
3. Skills gap (skills needed but not yet developed)
4. Recommended ARKs to bridge the gap
5. Job opportunities with match scores
6. Confidence boost percentage

**Output Format (JSON):**
{
  "career_path": "${careerPath || 'General Career Path'}",
  "alignment_score": 0.75,
  "skills_match": ["skill1", "skill2"],
  "skills_gap": ["skill3", "skill4"],
  "recommended_arks": ["ARK title 1", "ARK title 2"],
  "job_opportunities": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "description": "Job description",
      "required_skills": ["skill1", "skill2"],
      "match_score": 0.80,
      "confidence_level": "nearly_ready"
    }
  ],
  "confidence_boost": 15
}

Return only the JSON object.`;

  const context: AIContext = {
    task: "insights",
    user_id: userId,
    metadata: {
      career_path: careerPath,
      skills: allSkills,
      arks_count: arks?.length || 0
    }
  };

  const aiResponse = await aiOrchestrator(context, prompt);

  // Parse AI response
  try {
    const jsonMatch = aiResponse.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : aiResponse.content;
    return JSON.parse(jsonString) as CareerAlignment;
  } catch {
    // Return default structure if parsing fails
    return {
      career_path: careerPath || 'General Career Path',
      alignment_score: 0.5,
      skills_match: [],
      skills_gap: [],
      recommended_arks: [],
      job_opportunities: [],
      confidence_boost: 0
    };
  }
}

export async function calculateConfidenceScore(
  userId: string
): Promise<ConfidenceAnalysis> {
  const supabase = await createClient();

  // Get user's progress data
  const { data: arks } = await supabase
    .from('arks')
    .select('*, milestones(*, tasks(*))')
    .eq('user_id', userId);

  const { data: completedTasks } = await supabase
    .from('ark_tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', true);

  const { data: allTasks } = await supabase
    .from('ark_tasks')
    .select('*')
    .eq('user_id', userId);

  // Calculate metrics
  const totalTasks = allTasks?.length || 0;
  const completedCount = completedTasks?.length || 0;
  const completionRate = totalTasks > 0 ? completedCount / totalTasks : 0;

  // Get milestone completion
  const completedMilestones = arks?.flatMap(ark => 
    ark.milestones?.filter((m: { completed_at: string | null }) => m.completed_at) || []
  ).length || 0;

  const totalMilestones = arks?.flatMap(ark => ark.milestones || []).length || 0;
  const milestoneRate = totalMilestones > 0 ? completedMilestones / totalMilestones : 0;

  // Build AI prompt for confidence analysis
  const prompt = `Analyze a student's confidence level based on their learning progress.

**Progress Metrics:**
- Total ARKs: ${arks?.length || 0}
- Tasks Completed: ${completedCount} / ${totalTasks} (${Math.round(completionRate * 100)}%)
- Milestones Completed: ${completedMilestones} / ${totalMilestones} (${Math.round(milestoneRate * 100)}%)

**Task:** Calculate confidence score and provide analysis including:
1. Overall confidence (0.0 to 1.0)
2. Confidence factors (skill_mastery, milestone_completion, consistency, resource_utilization)
3. Strengths
4. Improvement areas
5. Confidence trend (increasing/stable/decreasing)
6. Recommendations

**Output Format (JSON):**
{
  "overall_confidence": 0.70,
  "confidence_factors": {
    "skill_mastery": 0.75,
    "milestone_completion": 0.80,
    "consistency": 0.65,
    "resource_utilization": 0.70
  },
  "strengths": ["strength1", "strength2"],
  "improvement_areas": ["area1", "area2"],
  "confidence_trend": "increasing",
  "recommendations": ["rec1", "rec2"]
}

Return only the JSON object.`;

  const context: AIContext = {
    task: "insights",
    user_id: userId,
    metadata: {
      completion_rate: completionRate,
      milestone_rate: milestoneRate,
      arks_count: arks?.length || 0
    }
  };

  const aiResponse = await aiOrchestrator(context, prompt);

  // Parse AI response
  try {
    const jsonMatch = aiResponse.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : aiResponse.content;
    return JSON.parse(jsonString) as ConfidenceAnalysis;
  } catch {
    // Return default structure if parsing fails
    return {
      overall_confidence: completionRate * 0.7 + milestoneRate * 0.3,
      confidence_factors: {
        skill_mastery: completionRate,
        milestone_completion: milestoneRate,
        consistency: completionRate * 0.8,
        resource_utilization: completionRate * 0.6
      },
      strengths: [],
      improvement_areas: [],
      confidence_trend: 'stable',
      recommendations: []
    };
  }
}

