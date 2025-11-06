/**
 * AI Study Analyzer
 * Reads notes/syllabus, finds gaps, builds 7-day study plans
 */

import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIContext } from "@/lib/types";

export interface StudyMaterial {
  content: string;
  type: "notes" | "syllabus" | "textbook" | "lecture";
  subject: string;
}

export interface KnowledgeGap {
  topic: string;
  importance: "critical" | "high" | "medium" | "low";
  estimatedTime: string;
  priority: number;
  dependencies?: string[];
}

export interface StudyPlan {
  duration: number; // days
  topics: Array<{
    day: number;
    topics: string[];
    timeRequired: string;
    resources: Array<{
      type: string;
      title: string;
      url?: string;
    }>;
    focus: string;
  }>;
  recommendations: string[];
  expectedOutcome: string;
}

/**
 * AI Study Analyzer Service
 */
export class StudyAnalyzerService {
  /**
   * Analyze study materials and identify gaps
   */
  async analyzeGaps(materials: StudyMaterial[], studentContext?: any): Promise<{
    gaps: KnowledgeGap[];
    summary: string;
  }> {
    const materialsSummary = materials.map((m) => ({
      type: m.type,
      subject: m.subject,
      length: m.content.length,
      preview: m.content.substring(0, 200),
    }));

    const prompt = `You are an expert academic analyzer. Analyze the following study materials and identify knowledge gaps.

**Study Materials:**
${JSON.stringify(materialsSummary, null, 2)}

**Student Context:**
${studentContext ? JSON.stringify(studentContext, null, 2) : "Not provided"}

**Task:**
1. Identify key topics that are missing or incomplete
2. Prioritize gaps by importance for exam success
3. Estimate time needed to cover each gap
4. Identify topic dependencies

Return ONLY a JSON object:
{
  "gaps": [
    {
      "topic": "Topic name",
      "importance": "critical|high|medium|low",
      "estimatedTime": "X hours",
      "priority": 1,
      "dependencies": ["prerequisite topics"]
    }
  ],
  "summary": "Brief analysis of current knowledge state"
}`;

    try {
      const aiContext: AIContext = {
        task: "academic_analysis",
        user_id: studentContext?.userId,
        session_id: `study_analyzer_${Date.now()}`,
        metadata: {
          system_prompt: "You are a thorough academic analyst identifying learning gaps.",
          user_tier: studentContext?.tier || "free",
        },
      };

      const aiResponse = await aiOrchestrator(aiContext, prompt);

      // Parse JSON response
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          gaps: parsed.gaps || [],
          summary: parsed.summary || "Analysis complete",
        };
      }

      return { gaps: [], summary: "Unable to parse analysis" };
    } catch (error) {
      console.error("Study analyzer error:", error);
      return { gaps: [], summary: "Analysis failed" };
    }
  }

  /**
   * Generate 7-day study plan based on gaps
   */
  async generateStudyPlan(
    gaps: KnowledgeGap[],
    constraints: {
      availableHoursPerDay: number;
      urgency: "low" | "medium" | "high";
      preferredLearningStyle?: string;
    }
  ): Promise<StudyPlan> {
    const prompt = `Create a structured 7-day study plan to cover knowledge gaps efficiently.

**Knowledge Gaps:**
${JSON.stringify(gaps, null, 2)}

**Constraints:**
- ${constraints.availableHoursPerDay} hours per day
- Urgency: ${constraints.urgency}
- Learning style: ${constraints.preferredLearningStyle || "mixed"}

**Requirements:**
1. Distribute topics across 7 days logically
2. Prioritize critical topics early
3. Group related topics together
4. Include rest days if needed
5. Suggest learning resources (YouTube, Khan Academy, etc.)
6. Make it realistic and achievable

Return ONLY a JSON object:
{
  "duration": 7,
  "topics": [
    {
      "day": 1,
      "topics": ["topic1", "topic2"],
      "timeRequired": "3 hours",
      "resources": [
        {
          "type": "video",
          "title": "Resource name",
          "url": "optional URL or search term"
        }
      ],
      "focus": "What to focus on today"
    }
  ],
  "recommendations": ["tip1", "tip2"],
  "expectedOutcome": "What you'll achieve by end of week"
}`;

    try {
      const aiContext: AIContext = {
        task: "academic_planning",
        session_id: `study_planner_${Date.now()}`,
        metadata: {
          system_prompt: "You are an expert study planner creating realistic, effective schedules.",
        },
      };

      const aiResponse = await aiOrchestrator(aiContext, prompt);

      // Parse JSON response
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }

      return this.generateFallbackPlan(gaps, constraints);
    } catch (error) {
      console.error("Study planner error:", error);
      return this.generateFallbackPlan(gaps, constraints);
    }
  }

  /**
   * Generate practice questions based on mistakes
   */
  async generatePracticeQuestions(
    mistakes: Array<{
      topic: string;
      question: string;
      attemptedAnswer: string;
      correctAnswer: string;
    }>,
    count: number = 5
  ): Promise<Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: string;
  }>> {
    const prompt = `Generate ${count} practice questions similar to these mistakes to help the student improve.

**Student Mistakes:**
${JSON.stringify(mistakes, null, 2)}

Generate questions that:
1. Target the same weak concepts
2. Vary in difficulty
3. Include plausible distractors
4. Provide clear explanations

Return ONLY a JSON array:
[
  {
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": 0,
    "explanation": "Why this is correct",
    "difficulty": "easy|medium|hard"
  }
]`;

    try {
      const aiContext: AIContext = {
        task: "academic_assessment",
        session_id: `practice_gen_${Date.now()}`,
        metadata: {
          system_prompt: "You are an expert educator creating targeted practice questions.",
        },
      };

      const aiResponse = await aiOrchestrator(aiContext, prompt);

      // Parse JSON response
      const jsonMatch = aiResponse.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }

      return [];
    } catch (error) {
      console.error("Practice question generator error:", error);
      return [];
    }
  }

  /**
   * Fallback study plan generator
   */
  private generateFallbackPlan(
    gaps: KnowledgeGap[],
    constraints: { availableHoursPerDay: number }
  ): StudyPlan {
    const sortedGaps = gaps.sort((a, b) => a.priority - b.priority);
    const dailyLimit = constraints.availableHoursPerDay;
    let currentDay = 1;
    let currentTopics: string[] = [];

    const topics: StudyPlan["topics"] = [];

    sortedGaps.forEach((gap) => {
      if (currentTopics.length >= 3 || topics.length === 7) {
        // Start new day
        topics.push({
          day: currentDay,
          topics: currentTopics,
          timeRequired: `${currentTopics.length * dailyLimit} hours`,
          resources: [],
          focus: `Cover ${currentTopics.join(", ")}`,
        });
        currentDay++;
        currentTopics = [];
      }

      currentTopics.push(gap.topic);
    });

    // Add remaining topics
    if (currentTopics.length > 0 && topics.length < 7) {
      topics.push({
        day: currentDay,
        topics: currentTopics,
        timeRequired: `${currentTopics.length * dailyLimit} hours`,
        resources: [],
        focus: `Cover ${currentTopics.join(", ")}`,
      });
    }

    return {
      duration: 7,
      topics,
      recommendations: ["Focus on one topic at a time", "Take regular breaks", "Review previous topics daily"],
      expectedOutcome: `Complete understanding of ${gaps.length} previously weak topics`,
    };
  }
}

export const studyAnalyzerService = new StudyAnalyzerService();

