/**
 * Groq API - Fast inference for Llama models
 * 
 * Groq provides fast inference for Llama 3.1 and other open-source models
 * API: https://console.groq.com/docs
 */

export interface GroqOptions {
  model?: "llama-3.1-70b-versatile" | "llama-3.1-8b-instant" | "llama-3-70b-8192" | "mixtral-8x7b-32768";
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface GroqResponse {
  content: string;
  tokens_used: number;
  model: string;
}

/**
 * Call Groq API (Llama models)
 */
export async function callGroq(
  prompt: string,
  options: GroqOptions = {}
): Promise<GroqResponse> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY environment variable is not set");
  }

  const model = options.model || "llama-3.1-70b-versatile";
  const systemPrompt = options.system_prompt || "You are a helpful AI assistant.";

  const requestBody = {
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 2048,
    top_p: options.top_p ?? 1.0,
    stream: options.stream ?? false,
  };

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Groq API error: ${response.status} ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from Groq API");
    }

    const content = data.choices[0].message?.content || "";
    const tokens_used = data.usage?.total_tokens || 0;

    return {
      content,
      tokens_used,
      model: data.model || model,
    };
  } catch (error: any) {
    console.error("Groq API error:", error);
    throw new Error(`Groq API call failed: ${error.message || "Unknown error"}`);
  }
}

