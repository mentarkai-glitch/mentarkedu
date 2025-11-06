/**
 * Goal Analyzer Service
 * AI-powered goal text analysis to extract structured data
 */

import { aiOrchestrator } from '@/lib/ai/orchestrator';

export interface AnalyzedGoal {
  exam?: string;
  subjects?: string[];
  targetScore?: string;
  timeline?: string;
  specificTopics?: string[];
  confidence: number;
  rawText: string;
}

/**
 * Analyze free-text goal to extract structured information
 */
export async function analyzeGoal(
  goalText: string,
  category: string
): Promise<AnalyzedGoal> {
  try {
    const prompt = buildAnalysisPrompt(goalText, category);
    
    const response = await aiOrchestrator.generate({
      model: 'claude-sonnet-4-5-20250929',
      prompt,
      temperature: 0.3,
      maxTokens: 300
    });

    // Parse structured response
    const analyzed = parseAnalysis(response.content, goalText);
    return analyzed;

  } catch (error) {
    console.error('Error analyzing goal:', error);
    return {
      confidence: 0,
      rawText: goalText
    };
  }
}

/**
 * Build analysis prompt for AI
 */
function buildAnalysisPrompt(goalText: string, category: string): string {
  return `Analyze this student goal and extract structured information. Return ONLY valid JSON.

Goal: "${goalText}"
Category: ${category}

Extract:
1. exam: specific exam name (JEE, NEET, Board, etc.) or null
2. subjects: array of subjects mentioned (Math, Physics, etc.)
3. targetScore: score/percentile target mentioned
4. timeline: time period or exam date
5. specificTopics: specific topics/chapters mentioned
6. confidence: 0-1 how confident you are

Return JSON like:
{
  "exam": "JEE Main",
  "subjects": ["Mathematics", "Physics"],
  "targetScore": "99 percentile",
  "timeline": "2026",
  "specificTopics": ["Mechanics", "Calculus"],
  "confidence": 0.85
}

JSON:`;
}

/**
 * Parse AI response into structured data
 */
function parseAnalysis(content: string, rawText: string): AnalyzedGoal {
  try {
    // Try to extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        rawText
      };
    }
  } catch (error) {
    console.error('Error parsing analysis:', error);
  }

  // Fallback: basic keyword extraction
  return extractFromKeywords(rawText);
}

/**
 * Basic keyword extraction as fallback
 */
function extractFromKeywords(text: string): AnalyzedGoal {
  const lowerText = text.toLowerCase();
  
  const exams = ['jee', 'neet', 'bitsat', 'kvpy', 'ntse', 'board', 'sat', 'act'];
  const subjects = ['math', 'physics', 'chemistry', 'biology', 'english', 'science'];
  
  const foundExam = exams.find(exam => lowerText.includes(exam));
  const foundSubjects = subjects.filter(sub => lowerText.includes(sub));
  
  return {
    exam: foundExam || undefined,
    subjects: foundSubjects.length > 0 ? foundSubjects : undefined,
    confidence: 0.5,
    rawText: text
  };
}

/**
 * Suggest questions based on analyzed goal
 */
export function suggestQuestions(analyzed: AnalyzedGoal): string[] {
  const suggestions: string[] = [];
  
  if (analyzed.exam && analyzed.confidence > 0.7) {
    suggestions.push(`I see you're preparing for ${analyzed.exam}. When is your exam?`);
  }
  
  if (analyzed.subjects && analyzed.subjects.length > 0 && analyzed.confidence > 0.7) {
    suggestions.push(`Great! You mentioned ${analyzed.subjects.join(', ')}. Which one needs the most work?`);
  }
  
  if (analyzed.targetScore && analyzed.confidence > 0.7) {
    suggestions.push(`I see your target is ${analyzed.targetScore}. What's your current score?`);
  }
  
  return suggestions;
}

