import axios from 'axios';
import type { AIContext } from "@/lib/types";

const DEEPL_API_BASE_URL = "https://api-free.deepl.com/v2";

export interface DeepLOptions {
  source_lang?: string;
  target_lang?: string;
  formality?: 'default' | 'more' | 'less' | 'prefer_more' | 'prefer_less';
  split_sentences?: '0' | '1' | 'nonewlines';
  preserve_formatting?: '0' | '1';
}

export interface TranslationResult {
  content: string;
  source_lang: string;
  target_lang: string;
  confidence: number;
  alternatives?: string[];
}

export async function callDeepL(
  text: string,
  options: DeepLOptions = {}
): Promise<{ content: string; tokens_used: number; translation?: TranslationResult }> {
  try {
    if (!process.env.DEEPL_API_KEY) {
      throw new Error("DEEPL_API_KEY is not set in environment variables");
    }

    const params = {
      auth_key: process.env.DEEPL_API_KEY,
      text: text,
      source_lang: options.source_lang?.toUpperCase() || 'AUTO',
      target_lang: options.target_lang?.toUpperCase() || 'EN',
      formality: options.formality || 'default',
      split_sentences: options.split_sentences || '1',
      preserve_formatting: options.preserve_formatting || '0'
    };

    const response = await axios.post(`${DEEPL_API_BASE_URL}/translate`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (response.data.translations && response.data.translations.length > 0) {
      const translation = response.data.translations[0];
      
      return {
        content: translation.text,
        tokens_used: Math.ceil(text.length / 4) + Math.ceil(translation.text.length / 4), // Rough estimate
        translation: {
          content: translation.text,
          source_lang: translation.detected_source_language || params.source_lang,
          target_lang: params.target_lang,
          confidence: 0.95, // DeepL is highly accurate
          alternatives: translation.alternatives || []
        }
      };
    } else {
      throw new Error("No translation received from DeepL API");
    }

  } catch (error: any) {
    console.error("DeepL API Error:", error.response?.data || error.message);
    throw new Error("Failed to get translation from DeepL");
  }
}

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<string> {
  try {
    const result = await callDeepL(text, {
      source_lang: sourceLanguage,
      target_lang: targetLanguage
    });
    return result.content;
  } catch (error) {
    console.error("Translation failed:", error);
    return text; // Return original text if translation fails
  }
}

export async function detectLanguage(text: string): Promise<string> {
  try {
    const result = await callDeepL(text, {
      source_lang: 'AUTO',
      target_lang: 'EN' // We don't care about the translation, just detection
    });
    
    return result.translation?.source_lang || 'EN';
  } catch (error) {
    console.error("Language detection failed:", error);
    return 'EN'; // Default to English
  }
}

export async function getSupportedLanguages(): Promise<{ language: string; name: string }[]> {
  try {
    if (!process.env.DEEPL_API_KEY) {
      throw new Error("DEEPL_API_KEY is not set");
    }

    const response = await axios.get(`${DEEPL_API_BASE_URL}/languages`, {
      params: {
        auth_key: process.env.DEEPL_API_KEY,
        type: 'target' // Get target languages
      }
    });

    return response.data.map((lang: any) => ({
      language: lang.language,
      name: lang.name
    }));
  } catch (error) {
    console.error("Failed to get supported languages:", error);
    return [
      { language: 'EN', name: 'English' },
      { language: 'ES', name: 'Spanish' },
      { language: 'FR', name: 'French' },
      { language: 'DE', name: 'German' },
      { language: 'IT', name: 'Italian' },
      { language: 'PT', name: 'Portuguese' },
      { language: 'RU', name: 'Russian' },
      { language: 'JA', name: 'Japanese' },
      { language: 'ZH', name: 'Chinese' }
    ];
  }
}

