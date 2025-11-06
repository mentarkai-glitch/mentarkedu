/**
 * Vision Service - Image Analysis & Handwriting Recognition
 * 
 * FULL IMPLEMENTATION - Google Cloud Vision API integration
 * 
 * Use cases:
 * - Analyze handwritten notes from students
 * - Extract text from uploaded images
 * - Detect emotions from facial expressions (future)
 * - Analyze drawings/diagrams
 */

export interface ImageAnalysisOptions {
  imageUrl?: string;
  imageBase64?: string;
  features?: ("text" | "handwriting" | "objects" | "labels")[];
}

export interface ImageAnalysisResult {
  success: boolean;
  extracted_text?: string;
  labels?: string[];
  objects?: Array<{ name: string; confidence: number }>;
  full_text?: string;
  error?: string;
}

export interface JournalAnalysisResult {
  success: boolean;
  extracted_text?: string;
  insights?: string[];
  emotion_detected?: string;
  confidence_score?: number;
  error?: string;
}

/**
 * Analyze image using Google Cloud Vision API
 */
export async function analyzeImage(
  options: ImageAnalysisOptions
): Promise<ImageAnalysisResult> {
  console.log("👁️  Image analysis requested");

  // Check if API key is configured
  if (!process.env.GOOGLE_CLOUD_VISION_API_KEY) {
    return {
      success: false,
      error: "Google Cloud Vision API not configured",
    };
  }

  try {
    const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
    
    // Prepare image source
    const imageSource = options.imageBase64 
      ? { content: options.imageBase64 }
      : { source: { imageUri: options.imageUrl } };

    // Prepare features based on options
    const features = options.features || ["text", "labels"];
    const visionFeatures = features.map(feature => {
      switch (feature) {
        case "text":
        case "handwriting":
          return { type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 };
        case "labels":
          return { type: "LABEL_DETECTION", maxResults: 10 };
        case "objects":
          return { type: "OBJECT_LOCALIZATION", maxResults: 10 };
        default:
          return { type: "TEXT_DETECTION", maxResults: 1 };
      }
    });

    const requestBody = {
      requests: [{
        image: imageSource,
        features: visionFeatures
      }]
    };

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      throw new Error(`Vision API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.responses[0];

    // Handle errors from Vision API
    if (result.error) {
      return {
        success: false,
        error: `Vision API error: ${result.error.message}`,
      };
    }

    // Extract text from various detection types
    let extractedText = '';
    let fullText = '';

    if (result.fullTextAnnotation) {
      fullText = result.fullTextAnnotation.text;
      extractedText = fullText;
    } else if (result.textAnnotations && result.textAnnotations.length > 0) {
      extractedText = result.textAnnotations[0].description;
      fullText = extractedText;
    }

    // Extract labels
    const labels = result.labelAnnotations?.map((label: any) => ({
      name: label.description,
      confidence: label.score
    })) || [];

    // Extract objects
    const objects = result.localizedObjectAnnotations?.map((obj: any) => ({
      name: obj.name,
      confidence: obj.score
    })) || [];

    return {
      success: true,
      extracted_text: extractedText,
      full_text: fullText,
      labels: labels.map((l: any) => l.name),
      objects: objects,
    };

  } catch (error) {
    console.error("Vision API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Extract handwriting from image
 */
export async function extractHandwriting(
  imageUrl: string
): Promise<{ success: boolean; text?: string; error?: string }> {
  console.log("✍️  Handwriting extraction requested:", imageUrl);

  const result = await analyzeImage({
    imageUrl,
    features: ["handwriting", "text"],
  });

  return {
    success: result.success,
    text: result.extracted_text,
    error: result.error,
  };
}

/**
 * Analyze student's uploaded journal/notes with AI insights
 */
export async function analyzeStudentJournal(
  imageBase64: string,
  studentId: string
): Promise<JournalAnalysisResult> {
  console.log("📔 Journal analysis requested for student:", studentId);

  try {
    // First, extract text from image
    const visionResult = await analyzeImage({
      imageBase64,
      features: ["text", "handwriting"],
    });

    if (!visionResult.success) {
      return {
        success: false,
        error: visionResult.error,
      };
    }

    if (!visionResult.extracted_text || visionResult.extracted_text.trim().length === 0) {
      return {
        success: true,
        extracted_text: "",
        insights: ["No text detected in the image. Please ensure the image is clear and contains readable text."],
        emotion_detected: "neutral",
        confidence_score: 0.5,
      };
    }

    // Send extracted text to AI for sentiment/insight analysis
    const aiAnalysis = await analyzeJournalWithAI(visionResult.extracted_text, studentId);

    return {
      success: true,
      extracted_text: visionResult.extracted_text,
      insights: aiAnalysis.insights,
      emotion_detected: aiAnalysis.emotion,
      confidence_score: aiAnalysis.confidence,
    };

  } catch (error) {
    console.error("Journal analysis error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Analyze journal text with AI for insights and emotions
 */
async function analyzeJournalWithAI(
  text: string,
  studentId: string
): Promise<{
  insights: string[];
  emotion: string;
  confidence: number;
}> {
  try {
    // Use Gemini for emotion analysis
    const emotionResponse = await fetch("/api/ai/analyze-emotion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: text,
        context: "student_journal",
        student_id: studentId,
      }),
    });

    const emotionData = await emotionResponse.json();
    
    if (!emotionData.success) {
      throw new Error(emotionData.error || "Failed to analyze emotion");
    }

    // Generate insights using Claude
    const insightsResponse = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Please analyze this student journal entry and provide 3-4 brief insights about their thoughts, concerns, or patterns. Keep it encouraging and supportive:\n\n"${text}"`,
        persona: "friendly",
        session_id: `journal-analysis-${studentId}`,
      }),
    });

    const insightsData = await insightsResponse.json();
    
    if (!insightsData.success) {
      throw new Error(insightsData.error || "Failed to generate insights");
    }

    // Extract insights from AI response
    const insightsText = insightsData.data.response;
    const insights = insightsText
      .split('\n')
      .filter(line => line.trim().length > 0 && (line.includes('•') || line.includes('-') || line.includes('1.') || line.includes('2.')))
      .map(line => line.replace(/^[\s•\-1-9.]+\s*/, '').trim())
      .filter(insight => insight.length > 10);

    return {
      insights: insights.length > 0 ? insights : [
        "Your journal entry shows thoughtful reflection.",
        "Keep writing regularly to track your thoughts and progress.",
        "Consider discussing these thoughts with your mentor for deeper insights."
      ],
      emotion: emotionData.data.emotion || "neutral",
      confidence: emotionData.data.confidence || 0.7,
    };

  } catch (error) {
    console.error("AI analysis error:", error);
    
    // Fallback insights if AI fails
    return {
      insights: [
        "Thank you for sharing your thoughts in your journal.",
        "Regular journaling helps track your emotional and academic progress.",
        "Consider discussing these reflections with your AI mentor for guidance."
      ],
      emotion: "neutral",
      confidence: 0.5,
    };
  }
}

