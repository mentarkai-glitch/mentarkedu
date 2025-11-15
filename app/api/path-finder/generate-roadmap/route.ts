import { NextRequest } from "next/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";
import type { AIContext } from "@/lib/types";
import { enhanceRoadmapWithResources } from "@/lib/services/roadmap-enhancer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      stream, 
      strengths, 
      studyTolerance, 
      budgetConstraint, 
      studentName, 
      language = 'en',
      traitScores,
      personalityInsights,
      careerVision,
      lifestylePreference,
      geographicPreference,
      entrepreneurshipInterest,
      workLifeBalance
    } = body;

    if (!stream || !strengths) {
      return errorResponse("Stream and strengths are required", 400);
    }

    // Check if AI providers are configured
    const providersConfigured = [
      process.env.OPENAI_API_KEY,
      process.env.CLAUDE_API_KEY,
      process.env.ANTHROPIC_API_KEY,
      process.env.GEMINI_API_KEY,
      process.env.PERPLEXITY_API_KEY,
    ].some(Boolean);

    let roadmapData;

    if (providersConfigured) {
      try {
        // Create detailed roadmap prompt
        const roadmapPrompt = generateRoadmapPrompt({
          stream,
          strengths,
          studyTolerance,
          budgetConstraint,
          studentName,
          language,
          traitScores,
          personalityInsights,
          careerVision,
          lifestylePreference,
          geographicPreference,
          entrepreneurshipInterest,
          workLifeBalance
        });

        // Use AI orchestrator to generate roadmap
        const context: AIContext = {
          task: 'roadmap',
          user_id: 'anonymous',
          metadata: {
            user_tier: 'free',
            language
          }
        };

        const aiResponse = await aiOrchestrator(context, roadmapPrompt);
        
        // Parse AI response (should be JSON)
        try {
          // Try to extract JSON from markdown code blocks if present
          const jsonMatch = aiResponse.content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            roadmapData = JSON.parse(jsonMatch[1]);
          } else {
            roadmapData = JSON.parse(aiResponse.content);
          }
          // Add model info to roadmap data
          roadmapData.model = aiResponse.model;
          roadmapData.tokens_used = aiResponse.tokens_used;
        } catch (parseError) {
          console.error("Failed to parse AI response as JSON:", parseError);
          // If parsing fails, create structured response from text
          roadmapData = {
            title: `Your 2-Year Roadmap for ${stream}`,
            description: aiResponse.content,
            milestones: [],
            monthly_plan: generateFallbackRoadmap(stream, language),
            career_exposure: [],
            exam_timeline: [],
            resources: [],
            model: aiResponse.model,
            tokens_used: aiResponse.tokens_used
          };
        }
        
        // Ensure all required fields exist, even if AI didn't generate them
        if (!roadmapData.milestones) roadmapData.milestones = [];
        if (!roadmapData.career_exposure) roadmapData.career_exposure = [];
        if (!roadmapData.exam_timeline) roadmapData.exam_timeline = [];
        if (!roadmapData.monthly_plan) roadmapData.monthly_plan = generateFallbackRoadmap(stream, language);
      } catch (aiError: any) {
        console.error("AI generation failed, using fallback:", aiError);
        // Fall through to fallback roadmap
        roadmapData = null;
      }
    }

    // Use fallback roadmap if AI is not configured or failed
    if (!roadmapData) {
      roadmapData = {
        title: `Your 2-Year Roadmap for ${stream}`,
        description: `A personalized roadmap based on your strengths: ${strengths.join(', ')}. This is a template roadmap. For AI-generated detailed roadmaps, configure AI API keys.`,
        milestones: [],
        monthly_plan: generateFallbackRoadmap(stream, language),
        career_exposure: [],
        exam_timeline: [],
        resources: [],
        success_tips: [
          'Stay consistent with your study schedule',
          'Review and revise regularly',
          'Take breaks to avoid burnout',
          'Seek help when needed'
        ]
      };
    }
    
    // Enhance roadmap with resources from multiple APIs (including ScrapingBee)
    let enhancedRoadmap = roadmapData;
    try {
      enhancedRoadmap = await enhanceRoadmapWithResources(
        roadmapData,
        stream,
        language,
        budgetConstraint,
        geographicPreference
      );
    } catch (enhanceError) {
      console.error("Roadmap enhancement error (continuing with base roadmap):", enhanceError);
      // Continue with base roadmap if enhancement fails
    }
    
    // Ensure all required fields exist after enhancement
    if (!enhancedRoadmap.milestones) enhancedRoadmap.milestones = [];
    if (!enhancedRoadmap.career_exposure) enhancedRoadmap.career_exposure = [];
    if (!enhancedRoadmap.exam_timeline) enhancedRoadmap.exam_timeline = [];
    if (!enhancedRoadmap.resources) enhancedRoadmap.resources = [];

    return successResponse({
      roadmap: enhancedRoadmap,
      model: enhancedRoadmap.model || roadmapData.model || 'fallback',
      tokens_used: enhancedRoadmap.tokens_used || roadmapData.tokens_used || 0
    });

  } catch (error: any) {
    console.error("Roadmap generation error:", error);
    return errorResponse(
      error.message || "Failed to generate roadmap",
      500
    );
  }
}

function generateRoadmapPrompt({
  stream,
  strengths,
  studyTolerance,
  budgetConstraint,
  studentName,
  language,
  traitScores,
  personalityInsights,
  careerVision,
  lifestylePreference,
  geographicPreference,
  entrepreneurshipInterest,
  workLifeBalance
}: {
  stream: string;
  strengths: string[];
  studyTolerance: number;
  budgetConstraint: boolean;
  studentName?: string;
  language: string;
  traitScores?: any;
  personalityInsights?: any;
  careerVision?: string;
  lifestylePreference?: string;
  geographicPreference?: string[];
  entrepreneurshipInterest?: number;
  workLifeBalance?: number;
}): string {
  const lang = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English';
  const nameGreeting = studentName ? `Hi ${studentName}! ` : '';
  
  const translations = {
    en: {
      title: `${nameGreeting}Generate a detailed 2-year roadmap for a Class 10 student`,
      context: `The student has been assessed and shows these characteristics:`,
      stream: `Best-fit Stream: ${stream}`,
      strengths: `Dominant Strengths: ${strengths.join(', ')}`,
      study: `Study Tolerance: ${studyTolerance}/10`,
      budget: budgetConstraint ? 'Budget Constraint: Needs affordable options/scholarships' : 'Budget: Family can support fees',
      requirement: `Create a comprehensive, month-by-month roadmap that shows their future path. Make it detailed, inspiring, and practical.`,
      format: `Return a JSON object with this structure:`
    },
    hi: {
      title: `${nameGreeting}कक्षा 10 के छात्र के लिए विस्तृत 2-वर्षीय रोडमैप तैयार करें`,
      context: `छात्र का मूल्यांकन किया गया है और ये विशेषताएँ दिखाई देती हैं:`,
      stream: `सबसे उपयुक्त स्ट्रीम: ${stream}`,
      strengths: `प्रमुख शक्तियाँ: ${strengths.join(', ')}`,
      study: `अध्ययन सहनशीलता: ${studyTolerance}/10`,
      budget: budgetConstraint ? 'बजट बाधा: सस्ते विकल्प/छात्रवृत्ति की आवश्यकता' : 'बजट: परिवार शुल्क का समर्थन कर सकता है',
      requirement: `एक व्यापक, महीने-दर-महीने रोडमैप बनाएं जो उनके भविष्य के मार्ग को दिखाता है। इसे विस्तृत, प्रेरणादायक और व्यावहारिक बनाएं।`,
      format: `इस संरचना के साथ JSON ऑब्जेक्ट लौटाएं:`
    },
    mr: {
      title: `${nameGreeting}इयत्ता 10 च्या विद्यार्थ्यासाठी तपशीलवार 2-वर्षीय रोडमॅप तयार करा`,
      context: `विद्यार्थ्याचे मूल्यांकन केले गेले आहे आणि ही वैशिष्ट्ये दिसतात:`,
      stream: `सर्वात योग्य स्ट्रीम: ${stream}`,
      strengths: `प्रमुख शक्ती: ${strengths.join(', ')}`,
      study: `अभ्यास सहनशीलता: ${studyTolerance}/10`,
      budget: budgetConstraint ? 'अंदाजपत्रक बाधा: स्वस्त पर्याय/शिष्यवृत्तीची गरज' : 'अंदाजपत्रक: कुटुंब शुल्काचा समर्थन करू शकते',
      requirement: `एक व्यापक, महिना-दर-महिना रोडमॅप तयार करा जो त्यांच्या भविष्यातील मार्ग दर्शवतो. ते तपशीलवार, प्रेरणादायक आणि व्यावहारिक बनवा.`,
      format: `या संरचनेसह JSON ऑब्जेक्ट परत करा:`
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Build enhanced context
  let enhancedContext = `${t.context}
- ${t.stream}
- ${t.strengths}
- ${t.study}
- ${t.budget}`;

  if (personalityInsights) {
    enhancedContext += `\n- Personality Type: ${personalityInsights.type || 'Not specified'}`;
    enhancedContext += `\n- Key Strengths: ${personalityInsights.strengths?.join(', ') || 'Not specified'}`;
  }

  if (careerVision) {
    enhancedContext += `\n- 10-Year Vision: ${careerVision}`;
  }

  if (lifestylePreference) {
    enhancedContext += `\n- Lifestyle Preference: ${lifestylePreference}`;
  }

  if (geographicPreference && geographicPreference.length > 0) {
    enhancedContext += `\n- Preferred Locations: ${geographicPreference.join(', ')}`;
  }

  if (entrepreneurshipInterest !== undefined) {
    enhancedContext += `\n- Entrepreneurship Interest: ${entrepreneurshipInterest}/10`;
  }

  if (workLifeBalance !== undefined) {
    enhancedContext += `\n- Work-Life Balance Importance: ${workLifeBalance}/10`;
  }

  return `${t.title}

${enhancedContext}

${t.requirement}

IMPORTANT: Create a detailed, month-by-month roadmap that shows their COMPLETE FUTURE PATH. Include:
1. Specific subjects/chapters to focus on each month
2. Real exam dates and preparation timelines (JEE, NEET, CUET, etc. if applicable)
3. Skill-building activities with concrete examples
4. Resource recommendations (books, online courses, YouTube channels)
5. Career milestones and when to explore them
6. Budget-friendly options if budget constraint is true
7. Monthly checkpoints and self-assessment criteria

${t.format}
{
  "title": "Inspiring, personalized title mentioning their strengths",
  "description": "3-4 sentence overview showing their complete journey from Class 10 to their future career",
  "milestones": [
    {
      "month_range": "Month 0-3 (Class 10 → 11 Transition)",
      "title": "Specific milestone title (e.g., 'Master Foundation Concepts in Physics')",
      "description": "Detailed 3-4 sentence description of what they'll achieve, why it matters, and how it connects to their future",
      "actions": [
        "Specific action 1 (e.g., 'Complete NCERT Physics Chapter 1-3 with daily practice problems')",
        "Specific action 2 (e.g., 'Join online study group for Mechanics concepts')",
        "Specific action 3 (e.g., 'Take weekly self-assessment tests on Khan Academy')"
      ],
      "resources": [
        "Specific resource (e.g., 'NCERT Physics Class 11 Textbook')",
        "Online resource (e.g., 'PhysicsWallah YouTube Channel - Mechanics Playlist')"
      ],
      "skills_to_build": [
        "Specific skill (e.g., 'Problem-solving in Kinematics')",
        "Another skill (e.g., 'Time management for long study sessions')"
      ],
      "exam_prep": "If applicable, mention specific exam preparation (e.g., 'Start JEE Main foundation - focus on Mechanics')",
      "career_connection": "How this milestone connects to their future career path"
    }
  ],
  "monthly_plan": {
    "year_1": {
      "months_0_3": [
        "Specific focus: Subject/topic name with action (e.g., 'Physics: Master Mechanics basics - 2 hours daily')",
        "Another focus: 'Maths: Strengthen Algebra foundation - solve 20 problems daily'"
      ],
      "months_4_6": ["Focus area with specific actions"],
      "months_7_9": ["Focus area with specific actions"],
      "months_10_12": ["Focus area with specific actions"]
    },
    "year_2": {
      "months_13_15": ["Focus area with specific actions"],
      "months_16_18": ["Focus area with specific actions"],
      "months_19_21": ["Focus area with specific actions"],
      "months_22_24": ["Focus area with specific actions"]
    }
  },
  "career_exposure": [
    "Specific career path 1 with why it fits (e.g., 'Computer Science Engineering - Builds on your logical thinking and problem-solving skills')",
    "Specific career path 2 with why it fits",
    "Specific career path 3 with why it fits"
  ],
  "success_tips": [
    "Personalized tip based on their strengths (e.g., 'Use your logical thinking strength to break complex problems into smaller steps')",
    "Another personalized tip",
    "Budget-friendly tip if budget constraint is true"
  ],
  "exam_timeline": [
    "Month X: Exam name (e.g., 'Month 18: JEE Main - Start intensive preparation')",
    "Month Y: Another exam or milestone"
  ],
  "budget_friendly_options": ${budgetConstraint ? `[
    "Scholarship opportunities to explore",
    "Free online resources",
    "Affordable coaching options"
  ]` : 'null'}
}

Make it EXTREMELY DETAILED, PERSONAL, and show them their COMPLETE FUTURE PATH. Include specific dates, resources, and actionable steps. Use ${lang} language for the response.`;
}

function generateFallbackRoadmap(stream: string, language: string): string[] {
  // Fallback roadmap if AI fails
  const roadmaps: Record<string, Record<string, string[]>> = {
    'Science (PCM)': {
      en: [
        'Month 0-3: Build solid foundations in Maths & Physics basics',
        'Month 4-12: Divide the year into weekly blocks focusing on Mechanics → EM → Magnetism → Optics',
        'Month 13-18: Practice 2 chapter-wise tests per month',
        'Month 19-24: Full syllabus test every 14 days, exam-ready routine'
      ],
      hi: [
        'महीना 0-3: गणित और भौतिकी की मूल बातें में ठोस नींव बनाएं',
        'महीना 4-12: सप्ताहिक ब्लॉक में वर्ष को विभाजित करें',
        'महीना 13-18: प्रति माह 2 अध्याय-वार परीक्षण करें',
        'महीना 19-24: हर 14 दिन में पूर्ण पाठ्यक्रम परीक्षण'
      ],
      mr: [
        'महिना 0-3: गणित आणि भौतिकशास्त्र मूलभूत गोष्टींमध्ये घन पाया तयार करा',
        'महिना 4-12: साप्ताहिक ब्लॉकमध्ये वर्ष विभाजित करा',
        'महिना 13-18: दर महिन्याला 2 अध्याय-वार चाचण्या करा',
        'महिना 19-24: दर 14 दिवसांनी पूर्ण अभ्यासक्रम चाचणी'
      ]
    }
  };

  const streamRoadmaps = roadmaps[stream] || roadmaps['Science (PCM)'];
  return streamRoadmaps[language] || streamRoadmaps.en;
}

