import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface GeminiOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
}

export async function callGemini(
  prompt: string,
  options: GeminiOptions = {}
): Promise<{ content: string; tokens_used: number }> {
  try {
    const model = genAI.getGenerativeModel({
      model: options.model || "gemini-1.5-pro",
    });

    // Combine system prompt with user prompt if provided
    const fullPrompt = options.system_prompt 
      ? `${options.system_prompt}\n\nUser: ${prompt}`
      : prompt;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.max_tokens || 2000,
      },
    });

    const response = result.response;
    const content = response.text();
    
    // Estimate token usage (rough approximation)
    const inputTokens = Math.ceil(fullPrompt.length / 4);
    const outputTokens = Math.ceil(content.length / 4);
    const tokens_used = inputTokens + outputTokens;

    return {
      content,
      tokens_used,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to get response from Gemini");
  }
}

export async function analyzeEmotion(
  text: string
): Promise<{ score: number; emotion: string }> {
  try {
    const prompt = `Analyze the emotional tone of this text and return ONLY a JSON object with this exact format:
{"score": <number between -1 and 1>, "emotion": "<primary emotion>"}

Text: "${text}"

Score guidelines:
- 1.0: Very positive/motivated/excited
- 0.5: Somewhat positive
- 0.0: Neutral
- -0.5: Somewhat negative/stressed
- -1.0: Very negative/burnout/distressed`;

    const response = await callGemini(prompt);
    const parsed = JSON.parse(response.content);

    return {
      score: parsed.score,
      emotion: parsed.emotion,
    };
  } catch (error) {
    console.error("Emotion Analysis Error:", error);
    return { score: 0, emotion: "neutral" };
  }
}

