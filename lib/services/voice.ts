/**
 * Voice Service - Text-to-Speech (TTS) and Speech-to-Text (STT)
 * 
 * STUB IMPLEMENTATION - To be activated when Google Cloud TTS/STT keys are configured
 * 
 * Future integration options:
 * - Google Cloud Text-to-Speech API
 * - Google Cloud Speech-to-Text API
 * - ElevenLabs (for higher quality voice)
 * - Web Speech API (browser-based, free)
 */

export interface TTSOptions {
  text: string;
  voice?: "male" | "female" | "neutral";
  speed?: number; // 0.5 to 2.0
  language?: string; // e.g., "en-US", "en-IN"
}

export interface STTOptions {
  audioBlob: Blob;
  language?: string;
}

/**
 * Convert text to speech using Google Cloud TTS API
 */
export async function textToSpeech(
  options: TTSOptions
): Promise<{ success: boolean; audio_url?: string; audio_data?: string; error?: string }> {
  try {
    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;

    if (!apiKey) {
      return {
        success: false,
        error: "Google Cloud TTS API key not configured",
      };
    }

    // Determine voice gender
    let ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL' = 'NEUTRAL';
    if (options.voice === 'male') ssmlGender = 'MALE';
    if (options.voice === 'female') ssmlGender = 'FEMALE';

    const requestBody = {
      input: { text: options.text },
      voice: {
        languageCode: options.language || 'en-US',
        ssmlGender,
        name: undefined as string | undefined, // Let API choose best voice for language
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: Math.max(0.25, Math.min(4.0, options.speed || 1.0)),
        pitch: 0.0,
        volumeGainDb: 0.0,
      },
    };

    // For Indian English, use specific voice
    if (options.language === 'en-IN') {
      requestBody.voice.name = 'en-IN-Standard-A';
    }

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `TTS API error: ${response.status} ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.audioContent) {
      throw new Error('No audio content received from TTS API');
    }

    // Return base64 audio data (can be converted to blob URL on client)
    return {
      success: true,
      audio_data: data.audioContent,
      // Optionally create a blob URL (requires browser environment)
      // audio_url: typeof window !== 'undefined' ? URL.createObjectURL(new Blob([base64ToArrayBuffer(data.audioContent)], { type: 'audio/mp3' })) : undefined,
    };
  } catch (error: any) {
    console.error('TTS error:', error);
    return {
      success: false,
      error: error.message || 'Failed to generate speech',
    };
  }
}

/**
 * Convert speech to text using Google Cloud Speech-to-Text API
 */
export async function speechToText(
  options: STTOptions
): Promise<{ success: boolean; transcript?: string; confidence?: number; error?: string }> {
  try {
    const apiKey = process.env.GOOGLE_CLOUD_STT_API_KEY || process.env.GOOGLE_CLOUD_TTS_API_KEY; // Can use same API key

    if (!apiKey) {
      return {
        success: false,
        error: "Google Cloud STT API key not configured",
      };
    }

    // Convert Blob to base64
    const base64Audio = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // Remove data URL prefix if present
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(options.audioBlob);
    });

    // Detect audio encoding from blob type
    let encoding: 'LINEAR16' | 'WEBM_OPUS' | 'MP3' | 'FLAC' = 'LINEAR16';
    const mimeType = options.audioBlob.type.toLowerCase();
    if (mimeType.includes('webm') || mimeType.includes('opus')) {
      encoding = 'WEBM_OPUS';
    } else if (mimeType.includes('mp3')) {
      encoding = 'MP3';
    } else if (mimeType.includes('flac')) {
      encoding = 'FLAC';
    }

    const requestBody = {
      config: {
        encoding,
        sampleRateHertz: 16000, // Default, can be auto-detected
        languageCode: options.language || 'en-US',
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: false,
      },
      audio: {
        content: base64Audio,
      },
    };

    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `STT API error: ${response.status} ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return {
        success: false,
        error: 'No transcription results returned',
      };
    }

    // Get the best transcription (first result)
    const bestResult = data.results[0];
    const alternative = bestResult.alternatives?.[0];

    if (!alternative || !alternative.transcript) {
      return {
        success: false,
        error: 'No transcript found in results',
      };
    }

    return {
      success: true,
      transcript: alternative.transcript,
      confidence: alternative.confidence || 0,
    };
  } catch (error: any) {
    console.error('STT error:', error);
    return {
      success: false,
      error: error.message || 'Failed to transcribe speech',
    };
  }
}

/**
 * Browser-based Web Speech API (fallback for demo purposes)
 */
export function useBrowserSpeechRecognition(): {
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
} {
  const isSupported =
    typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window);

  const startListening = () => {
    if (!isSupported) {
      console.error("Speech recognition not supported in this browser");
      return;
    }

    // Implementation would go here for demo
    console.log("🎤 Browser speech recognition started (stub)");
  };

  const stopListening = () => {
    console.log("🎤 Browser speech recognition stopped");
  };

  return {
    isSupported,
    startListening,
    stopListening,
  };
}

/**
 * Browser-based Text-to-Speech (fallback for demo purposes)
 */
export function useBrowserTextToSpeech(): {
  isSupported: boolean;
  speak: (text: string) => void;
  stop: () => void;
} {
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const speak = (text: string) => {
    if (!isSupported) {
      console.error("Speech synthesis not supported in this browser");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
  };

  return {
    isSupported,
    speak,
    stop,
  };
}

