import { createClient } from "@/lib/supabase/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIContext } from "@/lib/types";

export interface ARKRecommendation {
  ark_id: string;
  title: string;
  category: string;
  reason: string;
  confidence_score: number;
  alignment_factors: {
    skills_match: number;
    goal_alignment: number;
    difficulty_fit: number;
    interest_match: number;
  };
  preview?: {
    description: string;
    estimated_duration: string;
    skills_gained: string[];
  };
}

export async function getARKRecommendations(
  userId: string,
  type: 'general' | 'career' = 'general',
  careerPath?: string
): Promise<ARKRecommendation[]> {
  const supabase = await createClient();

  // Get user's existing ARKs and progress
  const { data: userArks } = await supabase
    .from('arks')
    .select('*, milestones(*, tasks(*))')
    .eq('user_id', userId);

  // Get user's completed tasks and skills
  const { data: completedTasks } = await supabase
    .from('ark_tasks')
    .select('skills_developed, title')
    .eq('user_id', userId)
    .eq('completed', true);

  const userSkills = completedTasks
    ?.flatMap(t => t.skills_developed || [])
    .filter(Boolean) || [];

  // Get all available ARKs (templates or other users' public ARKs)
  const { data: allArks } = await supabase
    .from('arks')
    .select('id, title, category, description, milestones(*)')
    .neq('user_id', userId)
    .limit(50);

  // Get user profile for personalization
  const { data: student } = await supabase
    .from('students')
    .select('onboarding_profile')
    .eq('user_id', userId)
    .single();

  const profile = student?.onboarding_profile as any;

  // Build AI prompt for recommendations
  const prompt = `Recommend ARKs (Adaptive Roadmaps of Knowledge) for a student.

**Student's Current Progress:**
- Completed ARKs: ${userArks?.length || 0}
- Skills Developed: ${userSkills.slice(0, 15).join(', ') || 'None yet'}
- Completed Tasks: ${completedTasks?.length || 0}

**Student Profile:**
${profile ? `
- Grade: ${profile.grade || 'Unknown'}
- Interests: ${profile.interests?.join(', ') || 'None'}
- Goals: ${profile.goals?.join(', ') || 'None'}
- Learning Style: ${profile.learning_style || 'Unknown'}
` : 'No profile available'}

**Available ARKs to Recommend:**
${allArks?.slice(0, 20).map(ark => `
- ${ark.title} (${ark.category}): ${ark.description || 'No description'}
`).join('') || 'No ARKs available'}

**Task:** ${type === 'career' && careerPath 
  ? `Recommend ARKs that align with the career path: ${careerPath}`
  : 'Recommend ARKs based on the student\'s progress, skills, goals, and interests'}

For each recommended ARK, provide:
1. ARK ID and title
2. Category
3. Reason for recommendation (why it fits)
4. Confidence score (0.0 to 1.0)
5. Alignment factors (skills_match, goal_alignment, difficulty_fit, interest_match)
6. Preview (description, estimated_duration, skills_gained)

**Output Format (JSON):**
{
  "recommendations": [
    {
      "ark_id": "uuid",
      "title": "ARK Title",
      "category": "academic|personal|career|emotional|health",
      "reason": "Why this ARK is recommended",
      "confidence_score": 0.85,
      "alignment_factors": {
        "skills_match": 0.80,
        "goal_alignment": 0.90,
        "difficulty_fit": 0.75,
        "interest_match": 0.85
      },
      "preview": {
        "description": "Brief description",
        "estimated_duration": "3-6 months",
        "skills_gained": ["skill1", "skill2"]
      }
    }
  ]
}

Return only the JSON object with 3-5 recommendations.`;

  const context: AIContext = {
    task: "ark_recommendation",
    user_id: userId,
    metadata: {
      type,
      career_path: careerPath,
      user_skills: userSkills,
      completed_arks: userArks?.length || 0
    }
  };

  const aiResponse = await aiOrchestrator(context, prompt);

  // Parse AI response
  try {
    const jsonMatch = aiResponse.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : aiResponse.content;
    const parsed = JSON.parse(jsonString);
    return parsed.recommendations || [];
  } catch {
    // Return recommendations based on available ARKs if AI parsing fails
    return (allArks || []).slice(0, 5).map(ark => ({
      ark_id: ark.id,
      title: ark.title,
      category: ark.category,
      reason: `Recommended based on your learning journey`,
      confidence_score: 0.7,
      alignment_factors: {
        skills_match: 0.7,
        goal_alignment: 0.7,
        difficulty_fit: 0.7,
        interest_match: 0.7
      },
      preview: {
        description: ark.description || 'No description available',
        estimated_duration: '3-6 months',
        skills_gained: []
      }
    }));
  }
}

