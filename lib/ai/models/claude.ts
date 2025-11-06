import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

export interface ClaudeOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
}

export async function callClaude(
  prompt: string,
  options: ClaudeOptions = {}
): Promise<{ content: string; tokens_used: number }> {
  try {
    const response = await anthropic.messages.create({
      model: options.model || "claude-sonnet-4-5-20250929",
      max_tokens: options.max_tokens || 2000,
      temperature: options.temperature || 0.7,
      system: options.system_prompt || "",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    return {
      content,
      tokens_used: response.usage.input_tokens + response.usage.output_tokens,
    };
  } catch (error) {
    console.error("Claude API Error:", error);
    throw new Error("Failed to get response from Claude");
  }
}

