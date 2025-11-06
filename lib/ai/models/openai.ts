import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface OpenAIOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
}

export async function callGPT4o(
  prompt: string,
  options: OpenAIOptions = {}
): Promise<{ content: string; tokens_used: number }> {
  try {
    // o1 models don't support system messages - merge into user prompt
    const model = options.model || "gpt-4o";
    const isO1Model = model.startsWith('o1');
    
    const messages: any[] = [];
    if (options.system_prompt && !isO1Model) {
      messages.push({ role: "system" as const, content: options.system_prompt });
    }
    
    // For o1 models, prepend system prompt to user message
    const userContent = isO1Model && options.system_prompt 
      ? `${options.system_prompt}\n\n${prompt}`
      : prompt;
    
    messages.push({ role: "user" as const, content: userContent });
    
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 2000,
    });

    return {
      content: response.choices[0]?.message?.content || "",
      tokens_used: response.usage?.total_tokens || 0,
    };
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw new Error("Failed to get response from GPT-4o");
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error("OpenAI Embedding Error:", error);
    throw new Error("Failed to generate embedding");
  }
}

