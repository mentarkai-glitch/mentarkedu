/**
 * Enhanced Doubt Solver Service
 * Provides step-by-step solutions, concept linking, and related doubts discovery
 */

import { aiOrchestrator } from '@/lib/ai/orchestrator';
import { searchYouTubeVideos } from '@/lib/services/youtube';
import type { AIContext } from '@/lib/types';

export interface StepByStepSolution {
  steps: SolutionStep[];
  finalAnswer: string;
  alternativeMethods?: AlternativeMethod[];
  verification?: string;
  conceptTags: string[];
}

export interface SolutionStep {
  stepNumber: number;
  description: string;
  explanation: string;
  formula?: string;
  diagram?: string;
  intermediateResult?: string;
}

export interface AlternativeMethod {
  name: string;
  description: string;
  steps: SolutionStep[];
  whenToUse: string;
}

export interface ConceptLink {
  concept: string;
  relation: 'prerequisite' | 'related' | 'advanced' | 'application';
  description: string;
  resources?: {
    videos?: string[];
    articles?: string[];
  };
}

export interface RelatedDoubt {
  question: string;
  similarity: number; // 0-1
  category: string;
  answer?: string;
  tags: string[];
}

/**
 * Generate step-by-step solution with alternatives
 */
export async function generateStepByStepSolution(
  question: string,
  category: string,
  userId?: string
): Promise<StepByStepSolution> {
  try {
    const prompt = `Solve this ${category} question step-by-step:

Question: ${question}

Provide a detailed step-by-step solution with:
1. Clear explanation of each step
2. Formulas used (if applicable)
3. Intermediate results
4. Final answer
5. Alternative solution methods (if applicable)
6. Concept tags related to this problem

Return as JSON:
{
  "steps": [
    {
      "stepNumber": 1,
      "description": "Step description",
      "explanation": "Detailed explanation",
      "formula": "Formula if applicable",
      "intermediateResult": "Result of this step"
    }
  ],
  "finalAnswer": "Final answer",
  "alternativeMethods": [
    {
      "name": "Method name",
      "description": "When to use this method",
      "steps": [...],
      "whenToUse": "Description"
    }
  ],
  "verification": "How to verify the answer",
  "conceptTags": ["concept1", "concept2"]
}`;

    const context: AIContext = {
      task: 'mentor_chat',
      user_id: userId,
      metadata: { user_tier: 'free' }
    };

    const response = await aiOrchestrator(context, prompt);
    
    // Parse JSON response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const solution = JSON.parse(jsonMatch[0]) as StepByStepSolution;
        return solution;
      } catch (parseError) {
        // Fallback: construct solution from text
        return constructSolutionFromText(response.content, question);
      }
    }
    
    return constructSolutionFromText(response.content, question);
  } catch (error) {
    console.error('Error generating step-by-step solution:', error);
    throw error;
  }
}

/**
 * Extract solution from unstructured text
 */
function constructSolutionFromText(text: string, question: string): StepByStepSolution {
  const lines = text.split('\n').filter(l => l.trim());
  const steps: SolutionStep[] = [];
  let stepNumber = 1;
  
  for (const line of lines) {
    // Look for step indicators
    if (line.match(/step\s*\d+|step\s*[ivx]+|^\d+\./i)) {
      steps.push({
        stepNumber: stepNumber++,
        description: line.replace(/^(step\s*\d+|step\s*[ivx]+|\d+\.)\s*/i, '').trim(),
        explanation: line
      });
    }
  }
  
  // Extract final answer
  const answerMatch = text.match(/final\s*answer[:\s]+([^\n]+)/i) || 
                      text.match(/answer[:\s]+([^\n]+)/i);
  const finalAnswer = answerMatch ? answerMatch[1].trim() : 'See steps above';
  
  // Extract concepts
  const conceptTags: string[] = [];
  const conceptMatches = text.match(/(concept|topic|related to)[:\s]+([^\n]+)/gi);
  if (conceptMatches) {
    conceptMatches.forEach(match => {
      const concepts = match.split(/[,;]/).map(c => c.replace(/(concept|topic|related to)[:\s]+/gi, '').trim());
      conceptTags.push(...concepts);
    });
  }
  
  return {
    steps: steps.length > 0 ? steps : [{
      stepNumber: 1,
      description: 'Solution',
      explanation: text
    }],
    finalAnswer,
    conceptTags: conceptTags.length > 0 ? conceptTags : extractConceptsFromQuestion(question)
  };
}

/**
 * Extract concepts from question text
 */
function extractConceptsFromQuestion(question: string): string[] {
  // Simple keyword extraction
  const keywords = question.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 4 && !['what', 'how', 'why', 'when', 'where', 'explain', 'solve', 'help'].includes(word));
  
  return keywords.slice(0, 5);
}

/**
 * Find related concepts and link them
 */
export async function findRelatedConcepts(
  question: string,
  solution: StepByStepSolution,
  userId?: string
): Promise<ConceptLink[]> {
  try {
    const prompt = `Given this question and solution, identify related concepts:

Question: ${question}
Solution Concepts: ${solution.conceptTags.join(', ')}

For each related concept, identify:
1. The concept name
2. Its relation (prerequisite, related, advanced, or application)
3. A brief description
4. Why it's relevant

Return as JSON array:
[
  {
    "concept": "Concept name",
    "relation": "prerequisite|related|advanced|application",
    "description": "Why this concept is relevant"
  }
]`;

    const context: AIContext = {
      task: 'insights',
      user_id: userId,
      metadata: { user_tier: 'free' }
    };

    const response = await aiOrchestrator(context, prompt);
    
    const jsonMatch = response.content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        const concepts = JSON.parse(jsonMatch[0]) as ConceptLink[];
        
        // Fetch resources for each concept
        const conceptsWithResources = await Promise.all(
          concepts.map(async (concept) => {
            try {
              const videos = await searchYouTubeVideos(
                `${concept.concept} ${solution.conceptTags[0]} tutorial`,
                { maxResults: 3 }
              );
              
              return {
                ...concept,
                resources: {
                  videos: videos.success ? videos.videos.map(v => v.url) : []
                }
              };
            } catch (error) {
              return concept;
            }
          })
        );
        
        return conceptsWithResources;
      } catch (parseError) {
        console.error('Failed to parse concept links:', parseError);
      }
    }
    
    // Fallback: return basic concept links
    return solution.conceptTags.map(tag => ({
      concept: tag,
      relation: 'related' as const,
      description: `Related to ${tag}`
    }));
  } catch (error) {
    console.error('Error finding related concepts:', error);
    return [];
  }
}

/**
 * Discover related doubts from history
 */
export async function discoverRelatedDoubts(
  question: string,
  conceptTags: string[],
  doubtHistory: Array<{ question: string; category: string; answer?: string }>,
  userId?: string
): Promise<RelatedDoubt[]> {
  // Simple similarity matching based on concept tags and keywords
  const questionLower = question.toLowerCase();
  const questionWords = questionLower.split(/\s+/).filter(w => w.length > 3);
  
  const related: RelatedDoubt[] = doubtHistory
    .filter(doubt => {
      const doubtLower = doubt.question.toLowerCase();
      const doubtWords = doubtLower.split(/\s+/).filter(w => w.length > 3);
      
      // Calculate similarity
      const commonWords = questionWords.filter(w => doubtWords.includes(w));
      const similarity = commonWords.length / Math.max(questionWords.length, doubtWords.length);
      
      return similarity > 0.2; // At least 20% word overlap
    })
    .map(doubt => {
      const doubtLower = doubt.question.toLowerCase();
      const doubtWords = doubtLower.split(/\s+/).filter(w => w.length > 3);
      const commonWords = questionWords.filter(w => doubtWords.includes(w));
      const similarity = commonWords.length / Math.max(questionWords.length, doubtWords.length);
      
      return {
        question: doubt.question,
        similarity,
        category: doubt.category,
        answer: doubt.answer,
        tags: extractConceptsFromQuestion(doubt.question)
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5); // Top 5 related doubts
  
  return related;
}

/**
 * Verify solution using alternative approach
 */
export async function verifySolution(
  question: string,
  solution: StepByStepSolution,
  userId?: string
): Promise<string> {
  try {
    const prompt = `Verify this solution for the question:

Question: ${question}

Solution Steps:
${solution.steps.map(s => `${s.stepNumber}. ${s.description}: ${s.explanation}`).join('\n')}

Final Answer: ${solution.finalAnswer}

Provide a verification method or alternative check. Return a brief verification statement.`;

    const context: AIContext = {
      task: 'mentor_chat',
      user_id: userId,
      metadata: { user_tier: 'free' }
    };

    const response = await aiOrchestrator(context, prompt);
    return response.content;
  } catch (error) {
    console.error('Error verifying solution:', error);
    return 'Verification unavailable';
  }
}


