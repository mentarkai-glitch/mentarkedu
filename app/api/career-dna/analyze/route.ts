import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIContext } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { student_profile, interests, goals, chat_history } = body;

    if (!student_profile) {
      return errorResponse("Student profile is required", 400);
    }

    // Get all career categories
    const { data: categories, error: categoriesError } = await supabase
      .from('career_categories')
      .select('*')
      .order('name');

    if (categoriesError) throw categoriesError;

    // Build AI prompt for career DNA analysis
    const prompt = `Analyze this student's profile and calculate their affinity scores for different career categories.

**Student Profile:**
- Grade: ${student_profile.grade} (${student_profile.level})
- Interests: ${student_profile.interests.join(', ')}
- Goals: ${student_profile.goals.join(', ')}
- Learning Style: ${student_profile.learning_style}
- Career Clarity: ${student_profile.career_clarity}
- Biggest Challenges: ${student_profile.biggest_challenges.join(', ')}

**Available Career Categories:**
${categories?.map(c => `- ${c.name}: ${c.description}`).join('\n')}

**Task:** Calculate an affinity score (0.0 to 1.0) for each career category based on the student's profile, interests, goals, and learning style. Consider:
1. Direct alignment with stated interests and goals
2. Learning style compatibility
3. Grade level appropriateness
4. Career clarity level

**Output Format (JSON):**
{
  "analysis": {
    "primary_strengths": ["strength1", "strength2"],
    "development_areas": ["area1", "area2"],
    "career_readiness": "high|medium|low",
    "recommended_focus": "brief recommendation"
  },
  "affinity_scores": {
    "Technology & Engineering": 0.85,
    "Medicine & Healthcare": 0.45,
    "Business & Finance": 0.70,
    "Arts & Creative": 0.60,
    "Science & Research": 0.75,
    "Education & Training": 0.55,
    "Law & Public Service": 0.30,
    "Sports & Fitness": 0.40,
    "Media & Communication": 0.65,
    "Agriculture & Environment": 0.50
  }
}

Return only the JSON object.`;

    // Get AI analysis
    const context: AIContext = {
      task: "insights",
      user_id: user.id,
      metadata: {
        student_profile,
        categories: categories?.map(c => ({ id: c.id, name: c.name }))
      }
    };

    const aiResponse = await aiOrchestrator(context, prompt);

    // Parse AI response
    let analysisData;
    try {
      const jsonMatch = aiResponse.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : aiResponse.content;
      analysisData = JSON.parse(jsonString);
    } catch (parseError) {
      return errorResponse("Failed to parse career analysis from AI response", 500);
    }

    // Save career profile to database
    const careerProfiles = Object.entries(analysisData.affinity_scores).map(([categoryName, score]) => {
      const category = categories?.find(c => c.name === categoryName);
      if (!category) return null;
      
      return {
        student_id: user.id,
        category_id: category.id,
        affinity_score: score as number
      };
    }).filter(Boolean);

    // Delete existing career profiles
    await supabase
      .from('student_career_profiles')
      .delete()
      .eq('student_id', user.id);

    // Insert new career profiles
    if (careerProfiles.length > 0) {
      const { error: insertError } = await supabase
        .from('student_career_profiles')
        .insert(careerProfiles);

      if (insertError) throw insertError;
    }

    return successResponse({
      analysis: analysisData.analysis,
      affinity_scores: analysisData.affinity_scores,
      categories: categories?.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        icon: c.icon,
        color: c.color
      }))
    });
  } catch (error) {
    return handleApiError(error);
  }
}
