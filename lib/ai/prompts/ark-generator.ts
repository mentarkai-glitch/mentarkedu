import type { ARKCategory, ARKDuration, StudentProfile } from "@/lib/types";

export interface ARKGenerationInput {
  category: ARKCategory;
  duration: ARKDuration;
  goal: string;
  interests: string[];
  current_level?: string;
  student_name?: string;
  student_profile?: StudentProfile;
}

export function generateARKPrompt(input: ARKGenerationInput): string {
  const durationMap: Record<ARKDuration, string> = {
    short: "1-3 months",
    mid: "3-6 months",
    long: "6-12 months",
  };

  // Build comprehensive student context from profile
  const buildStudentContext = () => {
    if (!input.student_profile) return "";
    
    const profile = input.student_profile;
    return `
**Detailed Student Profile:**
- Grade: ${profile.grade} (${profile.level} level)
- School Type: ${profile.school_type}
- Location: ${profile.location}
${profile.board ? `- Board: ${profile.board}` : ""}
${profile.stream ? `- Stream: ${profile.stream}` : ""}
${profile.exam_prep ? `- Exam Preparation: ${profile.exam_prep}` : ""}
- Study Hours Available: ${profile.study_hours}
- Learning Style: ${profile.learning_style}
- Motivation Level: ${profile.motivation_level}/10
- Stress Level: ${profile.stress_level}/10
- Confidence Level: ${profile.confidence_level}/10
- Support System: ${profile.support_system}
- Digital Access: ${profile.digital_access}
- Financial Comfort: ${profile.financial_comfort}
- Biggest Challenges: ${profile.biggest_challenges.join(", ")}
- Career Clarity: ${profile.career_clarity}
- Interests: ${profile.interests.join(", ")}
- Goals: ${profile.goals.join(", ")}`;
  };

  return `Generate a personalized learning roadmap (ARK - Adaptive Roadmap of Knowledge) with the following specifications:

**Student Information:**
${input.student_name ? `- Name: ${input.student_name}` : ""}
- Goal: ${input.goal}
- Category: ${input.category}
- Duration: ${durationMap[input.duration]}
- Interests: ${input.interests.join(", ")}
${input.current_level ? `- Current Level: ${input.current_level}` : ""}
${buildStudentContext()}

**Requirements:**

1. Create a structured, step-by-step learning path with 5-8 major milestones
2. Each milestone should:
   - Have a clear, actionable title
   - Include a detailed description (2-3 sentences)
   - Build progressively on previous milestones
   - Be achievable within the time frame
3. Recommend 3-5 specific resources for each milestone (videos, articles, courses, tools)
4. Make it personal and motivating - reference their interests where relevant
5. Include practical projects or exercises to apply learning

**Output Format (JSON):**

{
  "title": "Clear, inspiring title for the ARK",
  "description": "2-3 sentence overview of what they'll achieve",
  "milestones": [
    {
      "title": "Milestone title",
      "description": "Detailed description",
      "estimated_duration": "X weeks",
      "skills_gained": ["skill1", "skill2"],
      "resources": [
        {
          "type": "video|article|course|book|tool",
          "title": "Resource title",
          "url": "URL or search term if URL unavailable",
          "description": "Why this resource is valuable"
        }
      ]
    }
  ],
  "success_criteria": ["What defines completion of this ARK"],
  "next_steps": "What to do after completing this roadmap"
}

Generate an inspiring, practical, and personalized ARK now:`;
}

export function refineARKWithClaude(arkData: any, studentContext: string): string {
  return `Review and refine this learning roadmap (ARK) to make it more personalized and effective:

**Original ARK:**
${JSON.stringify(arkData, null, 2)}

**Student Context:**
${studentContext}

**Refinement Tasks:**
1. Ensure milestones build logically on each other
2. Check that resources are high-quality and accessible
3. Add personal touches based on student interests
4. Verify the pacing is appropriate for the duration
5. Make descriptions more motivating and clear

Return the refined ARK in the same JSON format, with improvements highlighted in the descriptions.`;
}

