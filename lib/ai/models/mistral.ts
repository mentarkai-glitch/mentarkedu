/**
 * Mistral AI Integration
 * 
 * Mistral provides high-quality language models with excellent reasoning capabilities
 * and multilingual support.
 */

export interface MistralOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
}

export async function callMistral(
  prompt: string,
  options: MistralOptions = {}
): Promise<{ content: string; tokens_used: number }> {
  try {
    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'mistral-large-latest',
        messages: [
          ...(options.system_prompt ? [{ role: 'system', content: options.system_prompt }] : []),
          { role: 'user', content: prompt }
        ],
        max_tokens: options.max_tokens || 2000,
        temperature: options.temperature || 0.7,
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0].message.content,
      tokens_used: data.usage?.total_tokens || 0,
    };
    
  } catch (error) {
    console.error("Mistral API Error:", error);
    throw new Error("Failed to get response from Mistral");
  }
}

export async function callMistralEmbedding(
  text: string
): Promise<number[]> {
  try {
    const response = await fetch('https://api.mistral.ai/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-embed',
        input: text,
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral Embedding API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
    
  } catch (error) {
    console.error("Mistral Embedding Error:", error);
    throw new Error("Failed to generate embedding with Mistral");
  }
}
