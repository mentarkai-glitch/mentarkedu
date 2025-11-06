import { CohereClient } from "cohere-ai";

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

export interface CohereOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
}

export async function callCohere(
  prompt: string,
  options: CohereOptions = {}
): Promise<{ content: string; tokens_used: number }> {
  try {
    const response = await cohere.chat({
      model: options.model || "command-r-plus",
      message: prompt,
      temperature: options.temperature || 0.7,
      maxTokens: options.max_tokens || 2000,
      preamble: options.system_prompt || "",
    });

    const content = response.text;
    const tokens_used = (response.meta?.tokens?.inputTokens || 0) + (response.meta?.tokens?.outputTokens || 0);

    return {
      content,
      tokens_used,
    };
  } catch (error) {
    console.error("Cohere API Error:", error);
    throw new Error("Failed to get response from Cohere");
  }
}

export async function callCohereEmbedding(
  text: string
): Promise<number[]> {
  try {
    const response = await cohere.embed({
      model: "embed-english-v3.0",
      texts: [text],
      inputType: "search_document",
    });

    return (response.embeddings as number[][])[0];
  } catch (error) {
    console.error("Cohere Embedding Error:", error);
    throw new Error("Failed to generate embedding with Cohere");
  }
}
