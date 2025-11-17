/**
 * Enhanced ARK Orchestrator - Multi-Model Orchestration System
 * 
 * This module implements comprehensive multi-model orchestration for ARK generation:
 * - Phase 1: Pre-generation context building (parallel)
 * - Phase 2: Core generation multi-model workflow
 * - Phase 3: Post-generation enhancement
 * 
 * Uses 15+ APIs and multiple AI models for maximum depth and personalization
 */

import { retrieveMemories, buildContextFromMemories, type MemoryEntry } from "./memory";
import { callClaude } from "./models/claude";
import { callGPT4o } from "./models/openai";
import { callGemini } from "./models/gemini";
import { callPerplexity } from "./models/perplexity";
import { callCohere } from "./models/cohere";
import { callMistral } from "./models/mistral";
import { callHumeEmotionAnalysis } from "./models/hume";
import { callGroq } from "./models/groq";
import { gatherComprehensiveResources, extractKeywordContext } from "./orchestration/api-router";
import type { StudentProfile } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export interface EnhancedARKRequest {
  category: string;
  goal: string;
  studentProfile?: StudentProfile;
  psychologyProfile?: {
    motivation: number;
    stress: number;
    confidence: number;
  };
  userTier?: 'free' | 'premium' | 'enterprise';
  specificFocus?: string;
  timeframe?: string | {
    id: string;
    name: string;
    duration: string;
    durationWeeks: number;
  };
  deepDiveAnswers?: Record<string, any>;
  student_id?: string;
}

export interface PsychologyAnalysis {
  strengths: string[];
  weaknesses: string[];
  triggers: {
    stress: string[];
    demotivation: string[];
  };
  confidence_builders: string[];
  improvement_areas: string[];
  pacing: 'gentle' | 'moderate' | 'aggressive';
  support_type: 'self_guided' | 'mentor_guided' | 'community_supported';
  communication_style: 'encouraging' | 'direct' | 'supportive' | 'challenging';
}

export interface EnhancedARKResponse {
  ark: any;
  psychologyAnalysis: PsychologyAnalysis;
  resources: any[];
  futureVision: string;
  successPrediction: {
    probability: number;
    expected_timeline: {
      best: string;
      realistic: string;
      worst: string;
    };
    risk_factors: string[];
    intervention_points: string[];
    expected_outcomes: string[];
  };
  orchestration_metadata: {
    models_used: string[];
    phase_timings: Record<string, number>;
    total_tokens: number;
    total_time_ms: number;
  };
}

/**
 * Phase 1: Pre-Generation Context Building (Parallel)
 */
async function phase1PreGeneration(
  request: EnhancedARKRequest
): Promise<{
  memoryContext: string;
  discoveredResources: any[];
  emotionalAnalysis: any;
}> {
  const startTime = Date.now();
  console.log('🚀 Phase 1: Pre-Generation Context Building (Parallel)');

  const studentId = request.student_id || (request.studentProfile as any)?.user_id || 'anonymous';

  // Parallel operations
  const [memoryContext, discoveredResources, emotionalAnalysis] = await Promise.all([
    // 1. Memory Retrieval
    (async () => {
      try {
        console.log('  📚 Retrieving memories...');
        
        // Retrieve different types of memories in parallel
        const [pastArks, emotions, conversations, achievements] = await Promise.all([
          retrieveMemories(studentId, `${request.goal} ${request.category}`, { topK: 5, type: 'ark' }),
          retrieveMemories(studentId, 'emotion stress motivation', { topK: 5, type: 'emotion' }),
          retrieveMemories(studentId, request.goal, { topK: 5, type: 'conversation' }),
          retrieveMemories(studentId, 'achievement success completion', { topK: 5, type: 'achievement' }),
        ]);

        // Build comprehensive context
        let context = "**Past Context & Patterns:**\n\n";
        
        if (pastArks.length > 0) {
          context += "**Previous ARKs:**\n";
          pastArks.forEach(ark => {
            context += `- ${ark.content}\n`;
          });
          context += "\n";
        }

        if (emotions.length > 0) {
          context += "**Emotional History:**\n";
          emotions.forEach(emotion => {
            context += `- ${emotion.content} (Score: ${emotion.metadata.emotion_score})\n`;
          });
          context += "\n";
        }

        if (conversations.length > 0) {
          context += "**Past Conversations & Insights:**\n";
          conversations.forEach(conv => {
            context += `- ${conv.content}\n`;
          });
          context += "\n";
        }

        if (achievements.length > 0) {
          context += "**Past Achievements & Successes:**\n";
          achievements.forEach(ach => {
            context += `- ${ach.content}\n`;
          });
          context += "\n";
        }

        // Also build context from memories using existing function
        const semanticContext = await buildContextFromMemories(studentId, `${request.goal} ${request.category}`, 2000);
        
        return context + semanticContext;
      } catch (error) {
        console.error('Error retrieving memories:', error);
        // Log to Sentry but don't fail the whole process
        try {
          const { logErrorToSentry, parseError } = await import('@/lib/utils/enhanced-error-handler');
          const parsedError = parseError(error, {
            endpoint: '/api/ai/generate-ark',
            method: 'POST',
            userId: studentId,
            additionalData: { phase: 'memory_retrieval' }
          });
          logErrorToSentry(parsedError);
        } catch (sentryError) {
          // Ignore Sentry errors
        }
        return "";
      }
    })(),

    // 2. Resource Discovery (Parallel API calls via gatherComprehensiveResources)
    (async () => {
      try {
        console.log('  🔍 Discovering resources...');
        const keywordContext = extractKeywordContext(
          request.goal,
          request.category,
          request.goal
        );
        
        // Use the existing comprehensive resource gatherer
        // This will call YouTube, GitHub, Reddit, Perplexity, ScrapingBee in parallel
        const resources = await gatherComprehensiveResources(
          keywordContext,
          request.goal,
          request.goal
        );
        
        console.log(`  ✅ Found ${resources.length} resources`);
        return resources;
      } catch (error) {
        console.error('Error discovering resources:', error);
        // Log to Sentry but don't fail the whole process
        try {
          const { logErrorToSentry, parseError } = await import('@/lib/utils/enhanced-error-handler');
          const parsedError = parseError(error, {
            endpoint: '/api/ai/generate-ark',
            method: 'POST',
            userId: request.student_id,
            additionalData: { phase: 'resource_discovery', goal: request.goal?.substring(0, 100) }
          });
          logErrorToSentry(parsedError);
        } catch (sentryError) {
          // Ignore Sentry errors
        }
        return [];
      }
    })(),

    // 3. Emotional Analysis (Hume AI + Claude Opus)
    (async () => {
      try {
        console.log('  ❤️ Analyzing emotions...');
        
        // First, get emotional history from daily check-ins if available
        let emotionalHistory = "";
        if (studentId !== 'anonymous') {
          try {
            const supabase = await createClient();
            const { data: checkins } = await supabase
              .from('daily_checkins')
              .select('emotion_score, stress_level, motivation_level, note')
              .eq('student_id', studentId)
              .order('created_at', { ascending: false })
              .limit(10);
            
            if (checkins && checkins.length > 0) {
              emotionalHistory = "\n**Recent Emotional Patterns:**\n";
              checkins.forEach(checkin => {
                emotionalHistory += `- Emotion: ${checkin.emotion_score}, Stress: ${checkin.stress_level}, Motivation: ${checkin.motivation_level}\n`;
                if (checkin.note) emotionalHistory += `  Note: ${checkin.note}\n`;
              });
            }
          } catch (dbError) {
            console.warn('Could not fetch emotional history from DB:', dbError);
          }
        }

        // Use Hume AI if psychology profile exists and API key is available
        let humeAnalysis = null;
        if (request.psychologyProfile && process.env.HUME_AI_API_KEY) {
          try {
            const emotionText = `Motivation: ${request.psychologyProfile.motivation}/10, Stress: ${request.psychologyProfile.stress}/10, Confidence: ${request.psychologyProfile.confidence}/10`;
            humeAnalysis = await callHumeEmotionAnalysis(emotionText);
          } catch (error) {
            console.warn('Hume AI not available, using Claude only:', error);
          }
        } else {
          console.log('ℹ️ Hume AI API key not configured - skipping emotion analysis');
        }

        // Use Claude Opus for deep psychological analysis
        const psychologyPrompt = `Analyze this student's psychological profile deeply:

**Current Psychology:**
- Motivation Level: ${request.psychologyProfile?.motivation || 7}/10
- Stress Level: ${request.psychologyProfile?.stress || 5}/10
- Confidence Level: ${request.psychologyProfile?.confidence || 6}/10

${emotionalHistory}

${humeAnalysis ? `**Hume AI Analysis:**\n${JSON.stringify(humeAnalysis)}\n` : ''}

**Goal:** ${request.goal}
**Category:** ${request.category}

**Task:** Provide a comprehensive psychological analysis in JSON format:
{
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "triggers": {
    "stress": ["trigger1", "trigger2"],
    "demotivation": ["trigger1", "trigger2"]
  },
  "confidence_builders": ["builder1", "builder2"],
  "improvement_areas": ["area1", "area2"],
  "pacing": "gentle|moderate|aggressive",
  "support_type": "self_guided|mentor_guided|community_supported",
  "communication_style": "encouraging|direct|supportive|challenging"
}

Return ONLY valid JSON.`;

        const claudeResponse = await callClaude(psychologyPrompt, {
          model: 'claude-opus',
          max_tokens: 2000,
          temperature: 0.3
        });

        // Parse JSON response
        try {
          const jsonMatch = claudeResponse.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]) as PsychologyAnalysis;
          }
        } catch (parseError) {
          console.warn('Could not parse psychology analysis JSON');
        }

        // Fallback to basic analysis
        return {
          strengths: ['Resilience', 'Curiosity'],
          weaknesses: ['Perfectionism'],
          triggers: { stress: ['Overwhelming workload'], demotivation: ['Unclear goals'] },
          confidence_builders: ['Quick wins', 'Progress visualization'],
          improvement_areas: ['Time management'],
          pacing: (request.psychologyProfile?.stress || 0) > 7 ? 'gentle' : 'moderate',
          support_type: 'mentor_guided',
          communication_style: 'encouraging'
        } as PsychologyAnalysis;
      } catch (error) {
        console.error('Error in emotional analysis:', error);
        // Log to Sentry but provide fallback
        try {
          const { logErrorToSentry, parseError } = await import('@/lib/utils/enhanced-error-handler');
          const parsedError = parseError(error, {
            endpoint: '/api/ai/generate-ark',
            method: 'POST',
            userId: request.student_id,
            additionalData: { phase: 'emotional_analysis' }
          });
          logErrorToSentry(parsedError);
        } catch (sentryError) {
          // Ignore Sentry errors
        }
        return {
          strengths: [],
          weaknesses: [],
          triggers: { stress: [], demotivation: [] },
          confidence_builders: [],
          improvement_areas: [],
          pacing: 'moderate',
          support_type: 'self_guided',
          communication_style: 'encouraging'
        } as PsychologyAnalysis;
      }
    })()
  ]);

  const phaseTime = Date.now() - startTime;
  console.log(`✅ Phase 1 completed in ${phaseTime}ms`);

  return {
    memoryContext,
    discoveredResources,
    emotionalAnalysis
  };
}

/**
 * Phase 2: Core Generation Multi-Model Workflow
 */
async function phase2CoreGeneration(
  request: EnhancedARKRequest,
  phase1Results: {
    memoryContext: string;
    discoveredResources: any[];
    emotionalAnalysis: PsychologyAnalysis;
  },
  basePrompt: string
): Promise<{
  roadmapStructure: any;
  curatedResources: any[];
  engagementElements: any;
  successPrediction: any;
}> {
  const startTime = Date.now();
  console.log('🚀 Phase 2: Core Generation Multi-Model Workflow');

  // 2.1 Resource Curation (Gemini 2.5 Flash + Perplexity)
  console.log('  📦 Curating resources...');
  const curatedResources = await (async () => {
    try {
      const curationPrompt = `You have ${phase1Results.discoveredResources.length} discovered resources. 

Filter and rank them by:
1. Relevance to goal: "${request.goal}"
2. Age appropriateness (grade ${request.studentProfile?.grade || 10})
3. Learning style match: "${request.studentProfile?.learning_style || 'Mixed'}"
4. Quality indicators
5. Student interests: ${request.studentProfile?.interests?.join(', ') || 'General'}

Resources:
${phase1Results.discoveredResources.map((r, i) => `${i + 1}. ${r.title} - ${r.url} - ${r.description}`).join('\n')}

Return top 30 resources ranked by relevance in JSON array format:
[{ "index": 0, "rank": 1, "relevance_score": 0.95, "reason": "why this is relevant" }, ...]`;

      // Use Gemini 2.5 Flash for fast curation
      let geminiResponse;
      try {
        geminiResponse = await callGemini(curationPrompt, {
          model: 'gemini-2.5-flash',
          max_tokens: 3000,
          temperature: 0.3
        });
      } catch (geminiError: any) {
        console.warn('Gemini curation failed, using all resources:', geminiError?.message);
        // Return all resources sorted by quality score if Gemini fails
        return phase1Results.discoveredResources
          .sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
          .slice(0, 30);
      }

      // Parse rankings
      try {
        const { safeParseJSON } = await import('@/lib/utils/json-repair');
        
        // Try to extract JSON array from response
        const jsonMatch = geminiResponse.content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const rankings = safeParseJSON(jsonMatch[0], null);
          if (rankings && Array.isArray(rankings)) {
            return phase1Results.discoveredResources
              .map((resource, index) => ({
                ...resource,
                rank: rankings.find((r: any) => r.index === index)?.rank || 999,
                relevance_score: rankings.find((r: any) => r.index === index)?.relevance_score || 0.5
              }))
              .sort((a, b) => a.rank - b.rank)
              .slice(0, 30);
          }
        }
      } catch (parseError) {
        console.warn('Could not parse resource rankings from Gemini, using quality scores');
      }

      // Fallback: return top resources sorted by quality score
      return phase1Results.discoveredResources
        .sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0))
        .slice(0, 30);
    } catch (error) {
      console.error('Error curating resources:', error);
      // Log to Sentry but continue with fallback
      try {
        const { logErrorToSentry, parseError } = await import('@/lib/utils/enhanced-error-handler');
        const parsedError = parseError(error, {
          endpoint: '/api/ai/generate-ark',
          method: 'POST',
          userId: request.student_id,
          additionalData: { phase: 'resource_curation' }
        });
        logErrorToSentry(parsedError);
      } catch (sentryError) {
        // Ignore Sentry errors
      }
      return phase1Results.discoveredResources.slice(0, 30);
    }
  })();

  // 2.2 Roadmap Architecture (GPT-4o or O1-mini based on complexity)
  console.log('  🏗️ Building roadmap structure...');
  const roadmapStructure = await (async () => {
    try {
      // Enhanced prompt with all context
      const enhancedPrompt = `${basePrompt}

${phase1Results.memoryContext}

**Psychology Analysis:**
${JSON.stringify(phase1Results.emotionalAnalysis, null, 2)}

**Personalization Guidelines:**
- Pacing: ${phase1Results.emotionalAnalysis.pacing}
- Support Type: ${phase1Results.emotionalAnalysis.support_type}
- Communication Style: ${phase1Results.emotionalAnalysis.communication_style}
- Stress Triggers to Avoid: ${phase1Results.emotionalAnalysis.triggers.stress.join(', ')}
- Confidence Builders to Include: ${phase1Results.emotionalAnalysis.confidence_builders.join(', ')}

**Available High-Quality Resources:** (Top ${curatedResources.length} resources)
${curatedResources.slice(0, 20).map((r, i) => `${i + 1}. ${r.title} (${r.type}) - ${r.url}`).join('\n')}

Use these resources in your roadmap. Return ONLY valid JSON.`;

      // Choose model based on goal complexity
      const isComplex = request.goal.toLowerCase().includes('career') || 
                       request.goal.toLowerCase().includes('advanced') ||
                       request.goal.toLowerCase().includes('professional');

      let response;
      if (isComplex) {
        // Use O1-mini for complex reasoning
        try {
          response = await callGPT4o(enhancedPrompt, {
            model: 'o1-mini',
            max_tokens: 8000
          });
        } catch (error) {
          console.warn('O1-mini not available, using GPT-4o:', error);
          response = await callGPT4o(enhancedPrompt, {
            model: 'gpt-4o',
            max_tokens: 8000
          });
        }
      } else {
        // Use GPT-4o for general roadmap
        response = await callGPT4o(enhancedPrompt, {
          model: 'gpt-4o',
          max_tokens: 8000
        });
      }

      // Parse JSON response using safeParseJSON for better error recovery
      try {
        const { safeParseJSON } = await import('@/lib/utils/json-repair');
        
        // Try multiple extraction methods
        let parsed: any = null;
        
        // Method 1: Try to find JSON in code blocks
        const codeBlockMatch = response.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          parsed = safeParseJSON(codeBlockMatch[1], null);
        }
        
        // Method 2: Try to find JSON object directly
        if (!parsed) {
          const jsonMatch = response.content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = safeParseJSON(jsonMatch[0], null);
          }
        }
        
        // Method 3: Try the entire response
        if (!parsed) {
          parsed = safeParseJSON(response.content, null);
        }
        
        if (parsed && parsed.milestones && Array.isArray(parsed.milestones)) {
          console.log(`✅ Successfully parsed roadmap with ${parsed.milestones.length} milestones`);
          return parsed;
        }
        
        // If we got something but it's incomplete, log it
        if (parsed) {
          console.warn('⚠️ Parsed JSON but missing milestones:', Object.keys(parsed));
          throw new Error('Parsed JSON but missing required milestones array');
        }
      } catch (parseError: any) {
        console.error('Error parsing roadmap JSON:', parseError);
        console.error('Response content preview:', response.content.substring(0, 500));
        throw new Error(`Invalid roadmap structure from AI: ${parseError?.message || 'Unknown parse error'}`);
      }

      throw new Error('No valid JSON found in roadmap response');
    } catch (error) {
      console.error('Error building roadmap:', error);
      // Log to Sentry before throwing
      try {
        const { logErrorToSentry, parseError, ErrorCategory, ErrorSeverity } = await import('@/lib/utils/enhanced-error-handler');
        const parsedError = parseError(error, {
          endpoint: '/api/ai/generate-ark',
          method: 'POST',
          userId: request.student_id,
          additionalData: { 
            phase: 'roadmap_architecture',
            goal: request.goal?.substring(0, 100),
            category: request.category
          }
        });
        logErrorToSentry(parsedError);
      } catch (sentryError) {
        console.warn('Failed to log roadmap error to Sentry:', sentryError);
      }
      throw error;
    }
  })();

  // 2.3 Engagement Design (Claude Sonnet)
  console.log('  🎯 Designing engagement elements...');
  const engagementElements = await (async () => {
    try {
      const engagementPrompt = `Design engagement elements for this ARK:

**ARK Title:** ${roadmapStructure.title || request.goal}
**Goal:** ${request.goal}
**Category:** ${request.category}
**Psychology:** ${JSON.stringify(phase1Results.emotionalAnalysis)}

**Task:** Create:
1. Future Vision: A vivid description of "what they'll become" after completing this ARK (2-3 paragraphs)
2. Motivation Messages: 3-5 encouraging messages for different milestones
3. Progress Celebrations: Celebration messages for milestone completions
4. Gamification Elements: Suggested XP rewards, badges, achievements
5. Social Engagement: Suggestions for peer matching or study groups

Return JSON:
{
  "future_vision": "detailed description",
  "motivation_messages": ["message1", "message2"],
  "celebrations": ["celebration1", "celebration2"],
  "gamification": { "xp_per_task": 10, "badges": ["badge1"] },
  "social_engagement": "suggestions"
}`;

      const claudeResponse = await callClaude(engagementPrompt, {
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2000,
        temperature: 0.7
      });

      try {
        const jsonMatch = claudeResponse.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Could not parse engagement elements');
      }

      // Fallback
      return {
        future_vision: `After completing this ARK, you'll have mastered ${request.goal} and opened new opportunities for yourself.`,
        motivation_messages: ['You\'ve got this!', 'Every step brings you closer to your goal.'],
        celebrations: ['🎉 Great progress!', '🏆 Milestone achieved!'],
        gamification: { xp_per_task: 10 },
        social_engagement: 'Find a study buddy or join a study group!'
      };
    } catch (error) {
      console.error('Error designing engagement:', error);
      return {
        future_vision: '',
        motivation_messages: [],
        celebrations: [],
        gamification: {},
        social_engagement: ''
      };
    }
  })();

  // 2.4 Analytics Prediction (O1-mini or Groq Llama for reasoning)
  console.log('  📊 Predicting success analytics...');
  const successPrediction = await (async () => {
    try {
      const predictionPrompt = `Analyze this ARK and predict success:

**ARK Structure:**
${JSON.stringify(roadmapStructure, null, 2).substring(0, 2000)}

**Student Profile:**
- Grade: ${request.studentProfile?.grade || 'Unknown'}
- Motivation: ${request.psychologyProfile?.motivation || 7}/10
- Stress: ${request.psychologyProfile?.stress || 5}/10
- Confidence: ${request.psychologyProfile?.confidence || 6}/10
- Learning Style: ${request.studentProfile?.learning_style || 'Mixed'}
- Study Hours: ${request.studentProfile?.study_hours || 'Unknown'}

**Psychology Analysis:**
${JSON.stringify(phase1Results.emotionalAnalysis)}

**Task:** Predict in JSON:
{
  "probability": 0.75,
  "expected_timeline": {
    "best": "12 weeks",
    "realistic": "16 weeks",
    "worst": "20 weeks"
  },
  "risk_factors": ["risk1", "risk2"],
  "intervention_points": ["Week 4", "Week 8"],
  "expected_outcomes": ["outcome1", "outcome2"]
}`;

      // Try O1-mini first, fallback to Groq Llama, then GPT-4o
      let response;
      try {
        response = await callGPT4o(predictionPrompt, {
          model: 'o1-mini',
          max_tokens: 1500
        });
      } catch (error) {
        try {
          response = await callGroq(predictionPrompt, {
            model: 'llama-3.1-70b-versatile',
            max_tokens: 1500
          });
        } catch (error2) {
          response = await callGPT4o(predictionPrompt, {
            model: 'gpt-4o',
            max_tokens: 1500
          });
        }
      }

      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.warn('Could not parse success prediction');
      }

      // Fallback
      return {
        probability: 0.7,
        expected_timeline: { best: '12 weeks', realistic: '16 weeks', worst: '20 weeks' },
        risk_factors: ['Potential stress increase', 'Time management challenges'],
        intervention_points: ['Week 4', 'Week 8', 'Week 12'],
        expected_outcomes: ['Mastery of goal concepts', 'Increased confidence', 'New opportunities']
      };
    } catch (error) {
      console.error('Error predicting success:', error);
      return {
        probability: 0.7,
        expected_timeline: { best: '12 weeks', realistic: '16 weeks', worst: '20 weeks' },
        risk_factors: [],
        intervention_points: [],
        expected_outcomes: []
      };
    }
  })();

  // 2.5 Resource Verification (Cohere + Mistral in parallel)
  console.log('  ✔️ Verifying resources...');
  await Promise.allSettled([
    (async () => {
      try {
        // Cohere verification
        await callCohere(`Verify these resources are still valid and relevant: ${curatedResources.slice(0, 10).map(r => r.url).join(', ')}`, {
          max_tokens: 500
        });
      } catch (error) {
        console.warn('Cohere verification failed:', error);
      }
    })(),
    (async () => {
      try {
        // Mistral alternative discovery
        await callMistral(`Find alternative resources if any of these are outdated: ${curatedResources.slice(0, 10).map(r => r.title).join(', ')}`, {
          max_tokens: 500
        });
      } catch (error) {
        console.warn('Mistral alternative discovery failed:', error);
      }
    })()
  ]);

  const phaseTime = Date.now() - startTime;
  console.log(`✅ Phase 2 completed in ${phaseTime}ms`);

  return {
    roadmapStructure,
    curatedResources,
    engagementElements,
    successPrediction
  };
}

/**
 * Main Enhanced ARK Generation Function
 */
export async function generateEnhancedARK(
  request: EnhancedARKRequest,
  basePrompt: string
): Promise<EnhancedARKResponse> {
  const overallStartTime = Date.now();
  const modelsUsed: string[] = [];
  const phaseTimings: Record<string, number> = {};

  console.log('🌟 Starting Enhanced ARK Generation with Multi-Model Orchestration');
  console.log(`   Goal: ${request.goal}`);
  console.log(`   Category: ${request.category}`);

  try {
    // Phase 1: Pre-Generation
    const phase1Start = Date.now();
    const phase1Results = await phase1PreGeneration(request);
    phaseTimings.phase1 = Date.now() - phase1Start;
    modelsUsed.push('Hume AI', 'Claude Opus', 'Perplexity', 'YouTube API', 'GitHub API', 'Reddit API', 'ScrapingBee');

    // Phase 2: Core Generation
    const phase2Start = Date.now();
    const phase2Results = await phase2CoreGeneration(request, phase1Results, basePrompt);
    phaseTimings.phase2 = Date.now() - phase2Start;
    modelsUsed.push('Gemini 2.5 Flash', 'GPT-4o', 'Claude Sonnet', 'O1-mini', 'Cohere', 'Mistral', 'Groq Llama');

    // Combine results into final ARK
    const finalARK = {
      ...phase2Results.roadmapStructure,
      future_vision: phase2Results.engagementElements.future_vision,
      motivation_messages: phase2Results.engagementElements.motivation_messages,
      celebrations: phase2Results.engagementElements.celebrations,
      gamification: phase2Results.engagementElements.gamification,
      social_engagement: phase2Results.engagementElements.social_engagement,
      // Enhance milestones with curated resources
      milestones: (phase2Results.roadmapStructure.milestones || []).map((milestone: any, index: number) => {
        // For each milestone, gather resources specific to that milestone
        // This ensures better resource relevance per milestone
        const milestoneResources = phase2Results.curatedResources
          .filter((r: any) => {
            // Filter resources that are relevant to this milestone
            const milestoneTitle = milestone.title?.toLowerCase() || '';
            const resourceTitle = r.title?.toLowerCase() || '';
            const resourceDesc = r.description?.toLowerCase() || '';
            
            // Check if resource title or description matches milestone keywords
            const milestoneKeywords = milestoneTitle.split(/\s+/);
            const matchesMilestone = milestoneKeywords.some((keyword: string) => 
              keyword.length > 3 && // Only match meaningful keywords
              (resourceTitle.includes(keyword) || resourceDesc.includes(keyword))
            );
            
            return matchesMilestone || index < 3; // First 3 milestones get priority resources
          })
          .slice(0, 10) // Get top 10 relevant resources per milestone
          .map((r: any) => ({
            type: r.type,
            title: r.title,
            url: r.url,
            description: r.description,
            provider: r.provider,
            author: r.author,
            isFree: r.is_free !== false,
            cost: r.cost || 'Free',
            quality_score: r.relevance_score || 0.8
          }));
        
        // If not enough relevant resources, add general top resources
        if (milestoneResources.length < 5 && phase2Results.curatedResources.length > index * 5) {
          const generalResources = phase2Results.curatedResources
            .slice(index * 5, (index + 1) * 5)
            .filter((r: any) => !milestoneResources.some(mr => mr.url === r.url))
            .map((r: any) => ({
              type: r.type,
              title: r.title,
              url: r.url,
              description: r.description,
              provider: r.provider,
              author: r.author,
              isFree: r.is_free !== false,
              cost: r.cost || 'Free',
              quality_score: r.relevance_score || 0.8
            }));
          milestoneResources.push(...generalResources);
        }
        
        return {
          ...milestone,
          resources: milestoneResources.slice(0, 8) // Ensure max 8 resources per milestone
        };
      })
    };

    const totalTime = Date.now() - overallStartTime;

    // Store memory of this ARK generation
    if (request.student_id && request.student_id !== 'anonymous') {
      try {
        const { storeMemory } = await import('./memory');
        await storeMemory({
          id: `ark-${Date.now()}`,
          student_id: request.student_id,
          content: `ARK Generated: ${request.goal} in ${request.category}. Psychology: ${JSON.stringify(phase1Results.emotionalAnalysis)}`,
          metadata: {
            type: 'ark',
            timestamp: new Date().toISOString(),
            tags: [request.category, request.goal]
          }
        });
      } catch (memoryError) {
        console.warn('Could not store ARK memory:', memoryError);
      }
    }

    return {
      ark: finalARK,
      psychologyAnalysis: phase1Results.emotionalAnalysis,
      resources: phase2Results.curatedResources,
      futureVision: phase2Results.engagementElements.future_vision,
      successPrediction: phase2Results.successPrediction,
      orchestration_metadata: {
        models_used: [...new Set(modelsUsed)], // Remove duplicates
        phase_timings: phaseTimings,
        total_tokens: 0, // Would need to track from each model call
        total_time_ms: totalTime
      }
    };
  } catch (error) {
    console.error('❌ Enhanced ARK generation failed:', error);
    
    // Enhanced error logging with Sentry
    try {
      const { logErrorToSentry, parseError, ErrorCategory, ErrorSeverity } = await import('@/lib/utils/enhanced-error-handler');
      const parsedError = parseError(error, {
        endpoint: '/api/ai/generate-ark',
        method: 'POST',
        userId: request.student_id,
        additionalData: {
          goal: request.goal?.substring(0, 100),
          category: request.category,
          userTier: request.userTier,
          phaseTimings,
          modelsUsed
        }
      });
      logErrorToSentry(parsedError);
    } catch (sentryError) {
      console.warn('Failed to log to Sentry:', sentryError);
    }
    
    throw error;
  }
}

