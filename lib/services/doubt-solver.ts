/**
 * Doubt Solver Service
 * Hybrid GPT + Wolfram Alpha for verified answers
 */

import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { wolframService } from "@/lib/services/wolfram";
import { searchAgent } from "@/lib/services/search-agent";
import type { AIContext } from "@/lib/types";

export interface DoubtQuery {
  question: string;
  userId?: string;
  subject?: string;
  difficulty?: "easy" | "medium" | "hard" | "advanced";
}

export interface DoubtSolution {
  answer: string;
  explanation: string;
  stepByStep?: string[];
  formula?: string;
  visualHint?: string;
  verification?: {
    source: "wolfram" | "perplexity" | "llm";
    confidence: number;
  };
  relatedTopics?: string[];
  practiceProblems?: Array<{
    problem: string;
    difficulty: string;
  }>;
}

/**
 * Doubt Solver - Hybrid approach
 */
export class DoubtSolverService {
  /**
   * Solve academic doubt with verification
   */
  async solve(doubtQuery: DoubtQuery): Promise<DoubtSolution> {
    const { question, userId, subject, difficulty } = doubtQuery;

    // 1. Classify query type
    const queryType = this.classifyQueryType(question);

    // 2. Route to appropriate solver
    if (queryType === "computational" && wolframService.isAvailable()) {
      return await this.solveWithWolfram(question, doubtQuery);
    } else if (queryType === "conceptual") {
      return await this.solveWithAI(question, doubtQuery);
    } else {
      return await this.solveHybrid(question, doubtQuery);
    }
  }

  /**
   * Classify query type
   */
  private classifyQueryType(question: string): "computational" | "conceptual" | "mixed" {
    const isComputational = wolframService.isSuitableQuery(question);
    
    const conceptualKeywords = [
      "explain",
      "what is",
      "how does",
      "why",
      "describe",
      "define",
      "understand",
      "concept",
      "theory",
      "principle",
    ];
    
    const isConceptual = conceptualKeywords.some((keyword) =>
      question.toLowerCase().includes(keyword)
    );

    if (isComputational && isConceptual) return "mixed";
    if (isComputational) return "computational";
    if (isConceptual) return "conceptual";
    
    return "mixed";
  }

  /**
   * Solve with Wolfram Alpha
   */
  private async solveWithWolfram(question: string, context: DoubtQuery): Promise<DoubtSolution> {
    const wolframResult = await wolframService.query(question);

    // Enhance with AI explanation
    const explanationPrompt = `Explain this Wolfram Alpha result in simple terms for a ${context.difficulty || "medium"} level student: "${wolframResult.result}"

Original question: "${question}"
${context.subject ? `Subject: ${context.subject}` : ""}

Provide:
1. A clear explanation of what the result means
2. Key concepts involved
3. Step-by-step reasoning (if applicable)`;

    try {
      const aiContext: AIContext = {
        task: "academic_explanation",
        user_id: context.userId,
        session_id: `doubt_solver_${Date.now()}`,
        metadata: {
          subject: context.subject,
          difficulty: context.difficulty,
          system_prompt: "You are a patient, clear teacher explaining academic concepts.",
        },
      };

      const aiExplanation = await aiOrchestrator(aiContext, explanationPrompt);

      return {
        answer: wolframResult.result,
        explanation: aiExplanation.content,
        stepByStep: this.extractStepByStep(aiExplanation.content),
        verification: {
          source: "wolfram",
          confidence: 0.95,
        },
      };
    } catch (error) {
      console.error("AI explanation error:", error);
      return {
        answer: wolframResult.result,
        explanation: "Computed result from verified source.",
        verification: {
          source: "wolfram",
          confidence: 0.95,
        },
      };
    }
  }

  /**
   * Solve with AI
   */
  private async solveWithAI(question: string, context: DoubtQuery): Promise<DoubtSolution> {
    const prompt = `You are an expert tutor helping a student understand their doubt. Provide a clear, comprehensive answer.

**Question:** ${question}
**Subject:** ${context.subject || "General"}
**Difficulty Level:** ${context.difficulty || "medium"}
**Grade:** High school / College

**Required Format:**
1. Direct answer (concise)
2. Detailed explanation (clear and logical)
3. Step-by-step reasoning (if applicable)
4. Key concepts to remember
5. Related topics worth exploring
6. A practice problem (optional)

Be encouraging, clear, and adjust complexity to the student's level.`;

    try {
      const aiContext: AIContext = {
        task: "academic_explanation",
        user_id: context.userId,
        session_id: `doubt_solver_${Date.now()}`,
        metadata: {
          subject: context.subject,
          difficulty: context.difficulty,
        },
      };

      const aiResponse = await aiOrchestrator(aiContext, prompt);

      return {
        answer: this.extractAnswer(aiResponse.content),
        explanation: aiResponse.content,
        stepByStep: this.extractStepByStep(aiResponse.content),
        relatedTopics: this.extractRelatedTopics(aiResponse.content),
        verification: {
          source: "llm",
          confidence: 0.85,
        },
      };
    } catch (error) {
      console.error("AI doubt solver error:", error);
      throw error;
    }
  }

  /**
   * Hybrid approach - combine multiple sources
   */
  private async solveHybrid(question: string, context: DoubtQuery): Promise<DoubtSolution> {
    // Try Perplexity first for web-verified info
    const searchResult = await searchAgent.execute({
      query: question,
      userId: context.userId,
      context: "academic",
    });

    // Enhance with AI for better explanation
    const enhancedPrompt = `Based on this information: "${searchResult.answer}"

Original question: "${question}"
Subject: ${context.subject || "General"}

Provide:
1. A clear, concise direct answer
2. Step-by-step explanation
3. Related concepts
4. Where applicable, suggest Wolfram Alpha for computational verification`;

    try {
      const aiContext: AIContext = {
        task: "academic_explanation",
        user_id: context.userId,
        session_id: `doubt_solver_hybrid_${Date.now()}`,
        metadata: {
          subject: context.subject,
          difficulty: context.difficulty,
        },
      };

      const aiResponse = await aiOrchestrator(aiContext, enhancedPrompt);

      return {
        answer: searchResult.answer,
        explanation: aiResponse.content,
        stepByStep: this.extractStepByStep(aiResponse.content),
        relatedTopics: searchResult.relatedQueries.slice(0, 3),
        verification: {
          source: "perplexity",
          confidence: searchResult.confidence,
        },
      };
    } catch (error) {
      console.error("Hybrid doubt solver error:", error);
      
      // Fallback to basic search result
      return {
        answer: searchResult.answer,
        explanation: "Explanation based on verified web sources.",
        relatedTopics: searchResult.relatedQueries.slice(0, 3),
        verification: {
          source: "perplexity",
          confidence: searchResult.confidence,
        },
      };
    }
  }

  /**
   * Helper methods to extract structured data from AI responses
   */
  private extractAnswer(content: string): string {
    // Look for patterns like "Answer:" or "**Answer:**" or numbered lists starting with answer
    const answerMatch = content.match(/(?:answer|solution)[:\-]\s*(.+?)(?:\n\n|\n[A-Z]|\*\*)/i);
    if (answerMatch) return answerMatch[1].trim();

    // Fallback: first paragraph
    const firstPara = content.split(/\n\n/)[0];
    return firstPara.length > 500 ? firstPara.substring(0, 500) + "..." : firstPara;
  }

  private extractStepByStep(content: string): string[] {
    const steps: string[] = [];

    // Look for numbered lists
    const numberedListRegex = /^\d+\.\s+(.+)$/gm;
    let match;
    while ((match = numberedListRegex.exec(content)) !== null) {
      steps.push(match[1].trim());
    }

    // Look for bullet points under "Steps:" or "Solution:"
    const stepsMatch = content.match(/(?:steps|solution|method)[:\-]\s*\n?((?:[-*•]\s*.+\n?)+)/i);
    if (stepsMatch) {
      const bullets = stepsMatch[1].match(/[-*•]\s*(.+)/g);
      if (bullets) {
        steps.push(...bullets.map((b) => b.replace(/[-*•]\s*/, "").trim()));
      }
    }

    return steps.length > 0 ? steps : [];
  }

  private extractRelatedTopics(content: string): string[] {
    const topicsMatch = content.match(/(?:related topics|see also|learn more about)[:\-]?\s*(.+)/i);
    if (topicsMatch) {
      return topicsMatch[1]
        .split(/[,;]/)
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 5);
    }
    return [];
  }
}

export const doubtSolverService = new DoubtSolverService();

