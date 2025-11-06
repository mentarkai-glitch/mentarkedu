/**
 * Visual Explainer Service
 * Gemini-powered diagrams and visual explanations
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIContext } from "@/lib/types";

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export interface VisualExplanation {
  description: string;
  diagramPrompt: string;
  mermaidDiagram?: string;
  imageUrl?: string;
  keyPoints: string[];
  type: "flowchart" | "concept_map" | "hierarchy" | "timeline" | "comparison";
}

/**
 * Visual Explainer Service
 */
export class VisualExplainerService {
  /**
   * Generate visual explanation for a concept
   */
  async generateExplanation(
    concept: string,
    subject: string = "general",
    level: "beginner" | "intermediate" | "advanced" = "intermediate"
  ): Promise<VisualExplanation> {
    const prompt = `You are a visual learning expert. Create a clear visual explanation for this concept.

**Concept:** ${concept}
**Subject:** ${subject}
**Level:** ${level}

Provide:
1. A clear description of how to visualize this concept
2. A diagram prompt for creating the visual
3. A Mermaid diagram code (if appropriate)
4. Key visual elements to highlight
5. The best diagram type (flowchart, concept_map, hierarchy, timeline, or comparison)

Return ONLY a JSON object:
{
  "description": "How to visualize this concept",
  "diagramPrompt": "Detailed prompt for image generation",
  "mermaidDiagram": "Optional Mermaid diagram code",
  "keyPoints": ["point1", "point2"],
  "type": "flowchart"
}`;

    try {
      const aiContext: AIContext = {
        task: "visual_explanation",
        session_id: `visual_explainer_${Date.now()}`,
        metadata: {
          system_prompt: "You are a visual learning designer creating clear, effective diagrams.",
        },
      };

      const aiResponse = await aiOrchestrator(aiContext, prompt);

      // Parse JSON response
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          mermaidDiagram: parsed.mermaidDiagram || undefined,
        };
      }

      return this.generateFallbackExplanation(concept, subject);
    } catch (error) {
      console.error("Visual explainer error:", error);
      return this.generateFallbackExplanation(concept, subject);
    }
  }

  /**
   * Generate image using Gemini (if available)
   */
  async generateImage(diagramPrompt: string): Promise<string | null> {
    if (!genAI) {
      return null;
    }

    try {
      // Note: Gemini doesn't directly generate images
      // This would integrate with image generation API like DALL-E or Stable Diffusion
      // For now, return null and indicate it's a stub
      console.log("Image generation stub - would call DALL-E or Stable Diffusion");
      return null;
    } catch (error) {
      console.error("Image generation error:", error);
      return null;
    }
  }

  /**
   * Fallback explanation
   */
  private generateFallbackExplanation(concept: string, subject: string): VisualExplanation {
    return {
      description: `Visualize ${concept} as a concept map with key ideas connected.`,
      diagramPrompt: `Create a visual diagram showing ${concept} in ${subject}`,
      keyPoints: ["Main concept", "Key relationships", "Important details"],
      type: "concept_map",
    };
  }

  /**
   * Generate multiple visual explanations for different learning styles
   */
  async generateMultipleViews(concept: string): Promise<{
    flowchart?: VisualExplanation;
    conceptMap?: VisualExplanation;
    hierarchy?: VisualExplanation;
  }> {
    const [flowchart, conceptMap, hierarchy] = await Promise.all([
      this.generateExplanation(concept, "general", "intermediate"),
      this.generateExplanation(concept, "general", "intermediate"),
      this.generateExplanation(concept, "general", "intermediate"),
    ]);

    return {
      flowchart: flowchart.type === "flowchart" ? flowchart : undefined,
      conceptMap: conceptMap.type === "concept_map" ? conceptMap : undefined,
      hierarchy: hierarchy.type === "hierarchy" ? hierarchy : undefined,
    };
  }
}

export const visualExplainerService = new VisualExplainerService();

