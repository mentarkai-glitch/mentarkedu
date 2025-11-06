import axios from "axios";

export interface PerplexityOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  userTier?: 'free' | 'premium' | 'enterprise';
  taskComplexity?: number;
  taskType?: string;
}

/**
 * Select optimal Perplexity model based on user tier and task complexity
 * Implements cost optimization strategy:
 * - Sonar Pro for regular use (cost-effective)
 * - Deep Research for premium features (higher quality, higher cost)
 */
function selectPerplexityModel(userTier?: string, taskComplexity?: number, taskType?: string): string {
  // Sonar Deep Research for enterprise users or research tasks
  if (userTier === 'enterprise' || taskType === 'research') {
    return "sonar-deep-research"; // Expert-level research model - highest cost, best quality
  }
  
  // Sonar Reasoning Pro for premium users, STEM problems, or high complexity tasks
  if (userTier === 'premium' || taskType === 'stem' || taskType === 'career' || (taskComplexity && taskComplexity > 7)) {
    return "sonar-reasoning-pro"; // Precise reasoning with Chain of Thought - premium quality
  }
  
  // Sonar for basic queries - cost-effective
  return "sonar"; // Lightweight, cost-effective search model - lowest cost
}

export async function callPerplexity(
  prompt: string,
  options: PerplexityOptions = {}
): Promise<{ content: string; tokens_used: number }> {
  try {
    // Select model based on user tier, task complexity, and task type
    const selectedModel = options.model || selectPerplexityModel(options.userTier, options.taskComplexity, options.taskType);
    
    console.log(`🎯 Perplexity Model Selection:`, {
      selectedModel,
      userTier: options.userTier,
      taskComplexity: options.taskComplexity,
      taskType: options.taskType,
      strategy: selectedModel === 'sonar-deep-research' ? 'Deep Research (Enterprise)' : 
                selectedModel === 'sonar-reasoning-pro' ? 'Reasoning Pro (Premium)' : 
                'Sonar (Cost-Effective)'
    });

    const response = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: selectedModel,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      content: response.data.choices[0]?.message?.content || "",
      tokens_used: response.data.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error("Perplexity API Error:", error);
    throw new Error("Failed to get response from Perplexity");
  }
}

