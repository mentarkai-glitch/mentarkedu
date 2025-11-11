import { NextRequest } from "next/server";
import { env } from "process";
import { createClient } from "@/lib/supabase/server";
import {
  errorResponse,
  handleApiError,
  successResponse,
  validateRequiredFields,
} from "@/lib/utils/api-helpers";
import {
  generateStudentARKPrompt,
  generateTemplateCustomizationPrompt,
} from "@/lib/ai/prompts/student-ark-generator";
import { generateARKWithNavigation } from "@/lib/ai/ark-orchestrator";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIContext, ARKCategory, ARKDuration, StudentProfile } from "@/lib/types";
import { safeParseJSON } from "@/lib/utils/json-repair";
import { getCategoryById } from "@/lib/data/student-categories";
import { getRecommendedMilestoneCount } from "@/lib/data/student-timeframes";
import { generateTimelineFromMilestones } from "@/lib/utils/timeline-generator";
import { extractKeywordContext, gatherComprehensiveResources } from "@/lib/ai/orchestration/api-router";

const FALLBACK_MODEL = env.OPENAI_FALLBACK_MODEL || "gpt-4o-mini";

const providersConfigured = [
  env.OPENAI_API_KEY,
  env.CLAUDE_API_KEY,
  env.ANTHROPIC_API_KEY,
  env.GEMINI_API_KEY,
  env.PERPLEXITY_API_KEY,
  env.COHERE_API_KEY,
  env.MISTRAL_API_KEY,
].some(Boolean);

/**
 * Calculate complexity score for ARK generation
 * Higher complexity = better model selection
 */
function getComplexityScore(category: string, goal: string, psychologyProfile: any): number {
  let score = 5; // Base complexity
  
  // Category-based complexity
  const complexCategories = ['stem', 'engineering', 'medicine', 'research', 'advanced'];
  if (complexCategories.some(cat => category.toLowerCase().includes(cat))) {
    score += 3;
  }
  
  // Goal-based complexity
  const complexGoals = ['career', 'advanced', 'professional', 'research', 'competitive'];
  if (complexGoals.some(g => goal.toLowerCase().includes(g))) {
    score += 2;
  }
  
  // Psychology profile complexity
  if (psychologyProfile?.stress_level > 7) score += 1;
  if (psychologyProfile?.confidence_level < 4) score += 1;
  if (psychologyProfile?.motivation_level < 5) score += 1;
  
  return Math.min(10, Math.max(1, score));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!providersConfigured) {
      console.error("ARK generation attempted without any AI provider keys configured.");
      return errorResponse(
        "ARK generation is temporarily unavailable because no AI providers are configured. Please update your environment variables for OpenAI, Anthropic, Gemini, or Perplexity.",
        503
      );
    }

    // Validate required fields
    const validation = validateRequiredFields(body, ["category", "goal"]);
    if (!validation.valid) {
      return errorResponse(`Missing required fields: ${validation.missing?.join(", ")}`, 400);
    }

    const { 
      category, 
      duration, 
      goal, 
      interests, 
      student_name, 
      student_id,
      student_profile,
      timeframe,
      timeframeId,
      timeframeDurationWeeks,
      psychologyProfile,
      specificFocus,
      useTemplate,
      templateId,
      deepDiveAnswers
    } = body;

    const supabase = await createClient();
    
    // Get authenticated user
    let authenticatedUserId: string | undefined;
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.warn('Auth error (continuing with provided student_id):', authError);
      } else {
        authenticatedUserId = user?.id;
      }
    } catch (authErr) {
      console.warn('Auth check failed (continuing with provided student_id):', authErr);
    }
    
    // Use authenticated user ID if available, otherwise use provided student_id
    const finalStudentId = authenticatedUserId || student_id;
    
    // If no student_id available, return error
    if (!finalStudentId) {
      return errorResponse("Not authenticated. Please login to create an ARK.", 401);
    }
    
    // Fetch student profile if not provided
    let completeStudentProfile = student_profile;
    if (!completeStudentProfile && finalStudentId) {
      try {
        const { data: studentData } = await supabase
          .from('students')
          .select('onboarding_profile')
          .eq('user_id', finalStudentId)
          .single();
        
        if (studentData?.onboarding_profile) {
          completeStudentProfile = studentData.onboarding_profile as any;
        }
      } catch (profileErr) {
        console.warn('Could not fetch student profile:', profileErr);
      }
    }
    
    // Handle template-based ARK creation
    if (useTemplate && templateId) {
      try {
        const { data: template, error: templateError } = await supabase
          .from('ark_templates')
          .select('*')
          .eq('id', templateId)
          .single();

        if (templateError) throw templateError;

        // Customize template for student
        const customizationPrompt = generateTemplateCustomizationPrompt(
          template,
          student_profile,
          goal
        );

        const context: AIContext = {
          task: "roadmap",
          user_id: finalStudentId,
          metadata: {
            category,
            goal,
            useTemplate: true,
            templateId
          },
        };

        const aiResponse = await aiOrchestrator(context, customizationPrompt);

        // Parse and return customized ARK
        let arkData;
        try {
          const jsonMatch = aiResponse.content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
          const jsonString = jsonMatch ? jsonMatch[1] : aiResponse.content;
          arkData = JSON.parse(jsonString);
        } catch (parseError) {
          return errorResponse("Failed to parse ARK data from AI response", 500);
        }

        return successResponse({
          ark: {
            ...arkData,
            based_on_template: true,
            template_id: templateId
          },
          model: aiResponse.model,
          tokens_used: aiResponse.tokens_used,
        });
      } catch (error) {
        console.error('Template customization failed, falling back to custom generation:', error);
        // Fall through to custom generation
      }
    }

    // Generate custom student ARK
    const categoryData = getCategoryById(category);
    
    // Map frontend category ID to database category value
    const categoryMapping: Record<string, 'academic' | 'personal' | 'career' | 'emotional' | 'health'> = {
      'academic_excellence': 'academic',
      'career_preparation': 'career',
      'personal_development': 'personal',
      'emotional_wellbeing': 'emotional',
      'life_skills': 'health',
      'social_relationships': 'personal'
    };
    
    const dbCategory = categoryMapping[category] || 'personal';
    
    // Map duration/timeframe to database duration value ('short', 'mid', 'long')
    // Based on weeks: short (1-8 weeks), mid (9-24 weeks), long (25+ weeks)
    const getDbDuration = (timeframeWeeks: number | undefined, timeframeId: string | undefined, durationStr: string | undefined): 'short' | 'mid' | 'long' => {
      if (timeframeWeeks) {
        if (timeframeWeeks <= 8) return 'short';
        if (timeframeWeeks <= 24) return 'mid';
        return 'long';
      }
      
      // Try to extract weeks from timeframe ID or duration string
      const timeframeStr = timeframeId || durationStr || '';
      const weeksMatch = timeframeStr.match(/(\d+)\s*(?:weeks?|months?)/i) || timeframeStr.match(/(\d+)/);
      if (weeksMatch) {
        const weeks = parseInt(weeksMatch[1]);
        if (weeks <= 8) return 'short';
        if (weeks <= 24) return 'mid';
        return 'long';
      }
      
      // Default based on duration string keywords
      if (durationStr) {
        const lower = durationStr.toLowerCase();
        if (lower.includes('quick') || lower.includes('short') || lower.includes('1-3')) return 'short';
        if (lower.includes('long') || lower.includes('6+') || lower.includes('extended')) return 'long';
        return 'mid';
      }
      
      // Default to mid
      return 'mid';
    };
    
    const studentARKPrompt = generateStudentARKPrompt({
      categoryId: category,
      categoryName: categoryData?.title || category,
      goalStatement: goal,
      timeframe: timeframe || {
        id: duration,
        name: duration,
        duration: '3-6 months',
        durationWeeks: 18
      },
      studentProfile: {
        grade: completeStudentProfile?.grade || '10',
        learning_style: completeStudentProfile?.learning_style || 'Mixed',
        study_hours: completeStudentProfile?.study_hours || '10-15 hours',
        interests: interests || completeStudentProfile?.interests || [],
        goals: completeStudentProfile?.goals || [],
        biggest_challenges: completeStudentProfile?.biggest_challenges || []
      },
      psychologyProfile: psychologyProfile || {
        motivation: completeStudentProfile?.motivation_level || 7,
        stress: completeStudentProfile?.stress_level || 5,
        confidence: completeStudentProfile?.confidence_level || 6
      },
      onboardingProfile: completeStudentProfile,
      specificFocus: specificFocus,
      deepDiveAnswers: deepDiveAnswers || {}
    });

    // Build AI context with enhanced metadata for better orchestration
    const context: AIContext = {
      task: "roadmap",
      user_id: finalStudentId,
      metadata: {
        category,
        goal,
        is_student_ark: true,
        user_tier: completeStudentProfile?.user_tier || 'free',
        complexity: getComplexityScore(category, goal, psychologyProfile),
        ark_type: 'student_generated',
        requires_research: true,
        requires_reasoning: true
      },
    };

    // Use enhanced ARK orchestration system
    const arkRequest = {
      category,
      goal,
      studentProfile: student_profile,
      psychologyProfile,
      userTier: completeStudentProfile?.user_tier || 'free',
      specificFocus,
      timeframe: timeframe || duration
    };

    let orchestratedResponse;
    try {
      orchestratedResponse = await generateARKWithNavigation(arkRequest, studentARKPrompt);
    } catch (orchestrationError: any) {
      console.error('ARK orchestration error:', orchestrationError);
      return errorResponse(`Failed to generate ARK: ${orchestrationError?.message || 'Unknown error'}`, 500);
    }

    if (!orchestratedResponse || !orchestratedResponse.ark) {
      console.error('Invalid orchestration response:', orchestratedResponse);
      return errorResponse("Invalid response from AI orchestrator", 500);
    }

    // Parse ARK JSON from response
    let arkData;
    let parsedArkContent: any;
    
    console.log('📋 Starting ARK JSON parsing...');
    console.log('Raw response type:', typeof orchestratedResponse.ark);
    console.log('Raw response length:', typeof orchestratedResponse.ark === 'string' ? orchestratedResponse.ark.length : 'N/A');
    console.log('Raw response preview (first 500 chars):', typeof orchestratedResponse.ark === 'string' ? orchestratedResponse.ark.substring(0, 500) : 'Not a string');
    
    try {
      // Handle if ark is already an object
      if (typeof orchestratedResponse.ark === 'object') {
        arkData = orchestratedResponse.ark;
        parsedArkContent = arkData;
        console.log('✅ ARK is already an object, using directly');
      } else if (typeof orchestratedResponse.ark === 'string') {
        let jsonString = orchestratedResponse.ark.trim();
        
        // Extract JSON from markdown code blocks using robust regex (same as navigation suggestions)
        const jsonMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          jsonString = jsonMatch[1];
          console.log('✅ Extracted JSON from markdown code block');
        } else if (jsonString.startsWith('```')) {
          // Fallback: try to remove code blocks manually
          jsonString = jsonString.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
          console.log('⚠️ Fallback: manually removed code blocks');
        }
        
        console.log('Extracted JSON string length:', jsonString.length);
        console.log('Extracted JSON preview (first 300 chars):', jsonString.substring(0, 300));
        console.log('Extracted JSON preview (last 300 chars):', jsonString.substring(Math.max(0, jsonString.length - 300)));
        
        // Check if milestones exist in raw string
        const hasMilestonesInRaw = jsonString.includes('"milestones"') || jsonString.includes("'milestones'");
        console.log('Raw string contains "milestones":', hasMilestonesInRaw);
        if (hasMilestonesInRaw) {
          // Try to find where milestones array starts
          const milestonesMatch = jsonString.match(/"milestones"\s*:\s*\[/);
          if (milestonesMatch) {
            const milestonesStart = milestonesMatch.index || 0;
            console.log('Found milestones array at position:', milestonesStart);
            console.log('Milestones preview (next 500 chars):', jsonString.substring(milestonesStart, milestonesStart + 500));
          }
        }
        
        // Try parsing with repair attempts
        try {
          arkData = safeParseJSON(jsonString, null);
          if (!arkData) {
            throw new Error('Failed to parse JSON even after repair');
          }
          parsedArkContent = JSON.stringify(arkData);
          console.log('✅ Successfully parsed JSON using safeParseJSON');
          console.log('Parsed data milestones count:', arkData.milestones?.length || 0);
          
          // If milestones are missing but were in raw string, the JSON was truncated
          if (hasMilestonesInRaw && (!arkData.milestones || arkData.milestones.length === 0)) {
            console.error('⚠️ WARNING: Milestones exist in raw JSON but are missing after parsing!');
            console.error('This suggests the JSON was truncated during repair.');
            console.error('Raw JSON length:', jsonString.length);
            console.error('Parsed JSON length:', JSON.stringify(arkData).length);
            console.error('Attempting manual milestone extraction...');
            
            // Try manual extraction as a last resort
            try {
              const milestonesMatch = jsonString.match(/"milestones"\s*:\s*\[([\s\S]*?)(?:\]|$)/);
              if (milestonesMatch) {
                // Try to extract at least the first milestone
                const milestonePattern = /\{\s*"order"\s*:\s*\d+[\s\S]*?"title"\s*:\s*"([^"]+)"[\s\S]*?\}/;
                const firstMilestone = milestonePattern.exec(milestonesMatch[1]);
                if (firstMilestone) {
                  console.log('Found at least one milestone in raw string:', firstMilestone[1]);
                  // Don't throw error yet - let the validation below handle it
                }
              }
            } catch (e) {
              console.error('Manual milestone extraction failed:', e);
            }
          }
        } catch (parseErr: any) {
          console.warn('⚠️ safeParseJSON failed, trying alternative extraction:', parseErr.message);
          // Last resort: try to extract just the first complete JSON object
          const jsonMatch = jsonString.match(/\{[\s\S]*?\}(?=\s*[,}\]]|$)/);
          if (jsonMatch) {
            try {
              arkData = safeParseJSON(jsonMatch[0], null);
              if (arkData) {
                parsedArkContent = JSON.stringify(arkData);
                console.log('✅ Successfully parsed JSON using alternative extraction');
              } else {
                throw new Error('Failed to parse extracted JSON');
              }
            } catch (extractErr) {
              console.error('❌ All JSON parsing attempts failed:', extractErr);
              throw new Error(`Failed to parse ARK JSON: ${parseErr?.message || 'Invalid JSON format'}`);
            }
          } else {
            throw new Error(`Failed to parse ARK JSON: ${parseErr?.message || 'Invalid JSON format'}`);
          }
        }
      } else {
        throw new Error('Unexpected ARK response format');
      }
    } catch (parseError: any) {
      console.error('ARK parsing error:', parseError);
      console.error('Raw ARK response (first 500 chars):', orchestratedResponse.ark?.substring(0, 500));
      
      // Check if the response is a refusal message
      const responseStr = typeof orchestratedResponse.ark === 'string' ? orchestratedResponse.ark : JSON.stringify(orchestratedResponse.ark);
      const refusalPatterns = [
        /I'm sorry,? I (can't|cannot)/i,
        /I (can't|cannot) assist/i,
        /I'm not able to/i,
        /I cannot (help|generate|create|provide)/i
      ];
      
      const isRefusal = refusalPatterns.some(pattern => pattern.test(responseStr));
      
      if (isRefusal) {
        return errorResponse(
          `AI model refused to generate the ARK. This might be due to content restrictions. Please try again or contact support.`, 
          500
        );
      }
      
      return errorResponse(
        `Failed to parse ARK data: ${parseError?.message || 'Invalid JSON format'}. The AI response may not be in the expected format.`, 
        500
      );
    }
    
    // Validate parsed data
    if (!arkData || !arkData.title) {
      console.error('❌ Invalid ARK structure:', arkData);
      return errorResponse("ARK data is missing required fields (title)", 500);
    }
    
    console.log('📊 Parsed ARK structure:');
    console.log('  - Title:', arkData.title);
    console.log('  - Has milestones:', !!arkData.milestones);
    console.log('  - Milestones count:', arkData.milestones?.length || 0);
    console.log('  - Has dailyTimeline:', !!arkData.dailyTimeline);
    console.log('  - DailyTimeline count:', arkData.dailyTimeline?.length || 0);
    
    // Validate milestones exist - CRITICAL: Don't accept empty ARKs
    if (!arkData.milestones || !Array.isArray(arkData.milestones)) {
      console.error('❌ ARK missing milestones array!');
      console.error('Full arkData structure:', JSON.stringify(arkData, null, 2).substring(0, 1000));
      return errorResponse("ARK generation failed: No milestones were generated. The AI response may be incomplete. Please try again.", 500);
    }
    
    if (arkData.milestones.length === 0) {
      console.error('❌ ARK has empty milestones array!');
      console.error('Full arkData structure:', JSON.stringify(arkData, null, 2).substring(0, 1000));
      return errorResponse("ARK generation failed: Milestones array is empty. The AI response may be incomplete. Please try again.", 500);
    }
    
    // Calculate duration from available sources (now that we have arkData)
    const durationWeeks = timeframe?.durationWeeks || 
                          timeframeDurationWeeks || 
                          arkData?.estimatedCompletionWeeks || 
                          (timeframe?.duration && parseInt(timeframe.duration.match(/\d+/)?.[0] || '12'));
    
    // Validate milestone count - check if we got fewer than expected
    const expectedMilestoneCount = getRecommendedMilestoneCount(durationWeeks);
    if (arkData.milestones.length < expectedMilestoneCount) {
      console.warn(`⚠️ ARK has ${arkData.milestones.length} milestones, expected ${expectedMilestoneCount}. AI response may be incomplete.`);
      console.warn('This might indicate the JSON was truncated. ARK will be saved with available milestones.');
      // Don't fail - save what we have, but log the warning
    }
    
    console.log(`✅ Validated ${arkData.milestones.length} milestones (expected: ${expectedMilestoneCount})`);
    
    // Log milestone details
    arkData.milestones.forEach((m: any, idx: number) => {
      console.log(`  Milestone ${idx + 1}: "${m.title}" - Resources: ${m.resources?.length || 0}`);
    });
    
    const dbDuration = getDbDuration(
      durationWeeks,
      timeframe?.id || timeframeId,
      duration || timeframe?.duration
    );

    // Store ARK in database
    const { data: ark, error: arkError } = await supabase.from('arks').insert({
      student_id: finalStudentId,
      title: arkData.title,
      description: arkData.description,
      category: dbCategory, // Use mapped category value
      duration: dbDuration, // Use mapped duration value ('short', 'mid', 'long')
      status: 'active',
      progress: 0,
      created_at: new Date().toISOString()
    }).select().single();

    if (arkError) {
      console.error('❌ ARK storage error:', arkError);
      return errorResponse("Failed to save ARK to database", 500);
    }
    
    console.log(`✅ ARK saved successfully with ID: ${ark.id}`);
    
    // Insert enhanced milestones with full detail
    // Note: We already validated milestones exist above, so this should always execute
    if (arkData.milestones && arkData.milestones.length > 0) {
      console.log(`📝 Preparing to save ${arkData.milestones.length} milestones...`);
      const milestones = arkData.milestones.map((m: any, idx: number) => ({
        ark_id: ark.id,
        title: m.title,
        description: m.description,
        order_index: idx,
        estimated_duration: m.estimatedWeeks ? `${m.estimatedWeeks} weeks` : m.estimated_duration,
        status: 'pending',
        target_date: null, // Will be calculated based on start date + estimated weeks
        difficulty: m.difficulty || 'medium',
        required_hours: m.estimatedHours || null,
        skills_to_gain: m.skillsGained || [],
        checkpoint_questions: m.checkpointQuestions || [],
        celebration_message: m.celebrationMessage || '',
        metadata: {
          tasks: m.tasks || [],
          weekly_schedule: arkData.weeklySchedule || {}
        },
        created_at: new Date().toISOString()
      }));

      const { data: insertedMilestones, error: milestoneError } = await supabase
        .from('ark_milestones')
        .insert(milestones)
        .select();

      if (milestoneError) {
        console.error('❌ Milestone storage error:', milestoneError);
        console.error('Milestone data sample:', JSON.stringify(milestones.slice(0, 1), null, 2));
        console.error('ARK ID:', ark.id);
        console.error('Total milestones to save:', milestones.length);
        return errorResponse(`Failed to save milestones: ${milestoneError.message}`, 500);
      } else {
        console.log(`✅ Successfully saved ${insertedMilestones?.length || 0} milestones for ARK ${ark.id}`);
        
        // Track resource saving statistics
        let totalResourcesSaved = 0;
        let resourcesWithErrors = 0;
        
        // Insert resources for each milestone - ENHANCED with multi-API gathering
        for (const [idx, milestone] of arkData.milestones.entries()) {
          const milestoneResources = milestone.resources || [];
          console.log(`📦 Milestone ${idx + 1} ("${milestone.title}"): ${milestoneResources.length} AI-generated resources`);
          
          // Gather comprehensive resources using multiple APIs
          let comprehensiveResources: any[] = [];
          try {
            const keywordContext = extractKeywordContext(
              `${goal} ${milestone.title} ${milestone.description || ''}`,
              category,
              goal
            );
            
            console.log(`🔍 Gathering comprehensive resources for milestone "${milestone.title}"...`);
            const apiResources = await gatherComprehensiveResources(
              keywordContext,
              milestone.title,
              milestone.description || ''
            );
            
            console.log(`✅ Gathered ${apiResources.length} resources from APIs`);
            
            // Merge AI-generated and API-gathered resources
            const mergedResources = [
              ...milestoneResources.map((r: any) => ({
                ...r,
                source: 'ai-generated' as const
              })),
              ...apiResources.map(r => ({
                type: r.type,
                title: r.title,
                url: r.url,
                provider: r.provider,
                description: r.description,
                author: r.author,
                estimatedDurationMinutes: r.duration_minutes,
                isFree: r.is_free !== false,
                cost: r.is_free ? 'Free' : 'Paid',
                source: 'api-gathered' as const,
                quality_score: r.quality_score
              }))
            ];
            
            // Deduplicate by URL and sort by quality
            const uniqueResources = Array.from(
              new Map(mergedResources.map(r => [r.url, r])).values()
            ).sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
            
            comprehensiveResources = uniqueResources.slice(0, 8); // Top 8 resources
            console.log(`🎯 Using ${comprehensiveResources.length} unique resources (${milestoneResources.length} AI + ${apiResources.length} API)`);
          } catch (apiError) {
            console.warn(`⚠️ API resource gathering failed for milestone ${idx + 1}, using AI-generated only:`, apiError);
            comprehensiveResources = milestoneResources; // Fallback to AI-generated
          }
          
          if (comprehensiveResources.length > 0 && insertedMilestones && insertedMilestones[idx]) {
            const resources = comprehensiveResources.map((r: any, resIdx: number) => ({
              ark_id: ark.id,
              type: r.type || 'article',
              title: r.title,
              url: r.url || `Search: ${r.provider || 'Google'} ${r.title}`,
              provider: r.provider || '',
              thumbnail_url: r.thumbnail_url || null,
              metadata: {
                description: r.description || '',
                author: r.author || '',
                duration_minutes: r.estimatedDurationMinutes || r.duration_minutes || null,
                is_free: r.isFree !== false && r.cost !== 'Free' ? false : (r.isFree !== false),
                cost: r.cost || (r.isFree ? 'Free' : 'Paid'),
                difficulty: r.difficulty || 'intermediate',
                learning_outcomes: r.learningOutcomes || [],
                source: r.source || 'ai-generated',
                quality_score: r.quality_score || 0.8
              }
            }));

            const { data: insertedResources, error: resourceError } = await supabase
              .from('ark_resources')
              .insert(resources)
              .select();

            if (resourceError) {
              console.error(`❌ Resource storage error for milestone ${idx + 1} ("${milestone.title}"):`, resourceError);
              resourcesWithErrors++;
              console.error('Resource data sample:', JSON.stringify(resources.slice(0, 1), null, 2));
            } else if (insertedResources && insertedMilestones && insertedMilestones[idx]) {
              totalResourcesSaved += insertedResources.length;
              console.log(`✅ Saved ${insertedResources.length} resources for milestone ${idx + 1} ("${milestone.title}")`);
              
              // Link resources to milestones
              const milestoneResourceLinks = insertedResources.map((res: any, resIdx: number) => {
                // Check if the original milestone resource has isRequired property
                const originalResource = milestone.resources?.[resIdx];
                const isRequired = originalResource?.isRequired !== false && originalResource?.isRequired !== undefined 
                  ? originalResource.isRequired 
                  : true; // Default to required if not specified
                
                return {
                  milestone_id: insertedMilestones[idx].id,
                  resource_id: res.id,
                  is_required: isRequired,
                  order_index: resIdx
                };
              });

              const { error: linkError } = await supabase.from('milestone_resources').insert(milestoneResourceLinks);
              if (linkError) {
                console.error(`❌ Error linking resources to milestone ${idx + 1}:`, linkError);
              } else {
                console.log(`✅ Linked ${milestoneResourceLinks.length} resources to milestone ${idx + 1}`);
              }
            } else {
              console.warn(`⚠️ Could not save resources for milestone ${idx + 1}:`, {
                hasResources: !!insertedResources,
                hasMilestones: !!insertedMilestones,
                milestoneIdx: idx,
                milestoneTitle: milestone.title,
                resourcesCount: milestoneResources.length
              });
              if (milestoneResources.length > 0) {
                resourcesWithErrors++;
              }
            }
          } else {
            if (milestoneResources.length === 0) {
              console.warn(`⚠️ Milestone ${idx + 1} ("${milestone.title}") has no resources defined`);
            } else if (!insertedMilestones || !insertedMilestones[idx]) {
              console.error(`❌ Cannot save resources: Milestone ${idx + 1} was not saved successfully`);
              resourcesWithErrors++;
            }
          }
        }
        
        console.log(`📊 Resource saving summary: ${totalResourcesSaved} saved, ${resourcesWithErrors} milestones with errors`);
        if (resourcesWithErrors > 0) {
          console.warn(`⚠️ Some resources failed to save, but ARK creation will continue`);
        }

        // Insert timeline - generate programmatically if AI didn't provide it
        let timelineEntries: any[] = [];
        
        if (arkData.dailyTimeline && arkData.dailyTimeline.length > 0) {
          console.log(`📅 Preparing to save ${arkData.dailyTimeline.length} timeline days from AI...`);
          timelineEntries = arkData.dailyTimeline.flatMap((day: any) => {
            // Parse the date if provided, otherwise use start_date + week/day calculation
            let taskDate: Date;
            if (day.date) {
              taskDate = new Date(day.date);
            } else {
              // Calculate date based on week and day
              const startDate = ark.start_date ? new Date(ark.start_date) : new Date();
              const weekOffset = (day.weekNumber - 1) * 7;
              const dayOffset = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day.dayOfWeek);
              taskDate = new Date(startDate);
              taskDate.setDate(taskDate.getDate() + weekOffset + dayOffset);
            }

            return day.tasks.map((task: any) => ({
              ark_id: ark.id,
              milestone_id: task.milestoneOrder && insertedMilestones ? 
                insertedMilestones.find((m: any) => m.order_index === task.milestoneOrder - 1)?.id : null,
              task_date: taskDate.toISOString().split('T')[0],
              task_title: task.title,
              task_description: task.description || '',
              task_type: task.type || 'learning',
              estimated_hours: task.estimatedHours || 1,
              priority: task.priority || 'medium',
              auto_generated: true
            }));
          });
        } else {
          // Generate timeline programmatically from milestones
          console.log(`📅 No timeline from AI - generating programmatically from ${insertedMilestones?.length || 0} milestones...`);
          
          if (insertedMilestones && insertedMilestones.length > 0) {
            const startDate = ark.start_date ? new Date(ark.start_date) : new Date();
            const totalWeeks = durationWeeks || 12;
            
            const generatedTasks = generateTimelineFromMilestones(
              arkData.milestones,
              startDate,
              totalWeeks
            );
            
            timelineEntries = generatedTasks.map(task => ({
              ark_id: ark.id,
              milestone_id: task.milestone_order && insertedMilestones ? 
                insertedMilestones[task.milestone_order - 1]?.id : null,
              task_date: task.task_date,
              task_title: task.task_title,
              task_description: task.task_description || '',
              task_type: task.task_type,
              estimated_hours: task.estimated_hours,
              priority: task.priority,
              auto_generated: true
            }));
            
            console.log(`✅ Generated ${timelineEntries.length} timeline tasks programmatically`);
          }
        }

        if (timelineEntries.length > 0) {
          console.log(`📅 Saving ${timelineEntries.length} timeline tasks...`);
          const { data: insertedTimeline, error: timelineError } = await supabase.from('ark_timeline').insert(timelineEntries).select();
          if (timelineError) {
            console.error('❌ Timeline storage error:', timelineError);
            console.warn('⚠️ Timeline tasks failed to save, but ARK creation will continue');
          } else {
            console.log(`✅ Successfully saved ${timelineEntries.length} timeline tasks`);
            
            // Schedule reminders for high-value tasks
            if (insertedTimeline && insertedTimeline.length > 0) {
              try {
                // Dynamically import reminder scheduler (optional - won't block if Firebase isn't available)
                let scheduleTaskReminders: any = null;
                try {
                  const remindersModule = await import('@/lib/services/ark-reminders');
                  scheduleTaskReminders = remindersModule.scheduleTaskReminders;
                } catch (error) {
                  console.warn('⚠️ Reminder system not available (non-critical):', error);
                  scheduleTaskReminders = null;
                }
                
                // Fetch user details
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  const { data: userData } = await supabase
                    .from('users')
                    .select('email, phone_number')
                    .eq('id', user.id)
                    .single();
                  
                  // Schedule reminders for critical and high-priority tasks (if available)
                  if (scheduleTaskReminders) {
                    const highValueTasks = insertedTimeline.filter((task: any) => 
                      task.priority === 'critical' || task.priority === 'high'
                    );
                    
                    for (const task of highValueTasks.slice(0, 10)) { // Limit to first 10 to avoid overload
                      const milestone = insertedMilestones?.find((m: any) => m.id === task.milestone_id);
                      try {
                        await scheduleTaskReminders({
                          id: task.id,
                          ark_id: ark.id,
                          milestone_id: task.milestone_id,
                          task_id: task.id,
                          title: task.task_title,
                          description: task.task_description,
                          task_date: task.task_date,
                          priority: task.priority,
                          estimated_hours: task.estimated_hours,
                          milestone_order: milestone?.order_index || 1,
                          total_milestones: insertedMilestones?.length || 1,
                          user_id: user.id,
                          user_email: userData?.email,
                          user_phone: userData?.phone_number
                        });
                      } catch (taskError) {
                        console.warn(`⚠️ Failed to schedule reminder for task ${task.id}:`, taskError);
                      }
                    }
                    
                    console.log(`✅ Scheduled reminders for ${highValueTasks.length} high-value tasks`);
                  }
                }
              } catch (reminderError) {
                console.warn('⚠️ Failed to schedule reminders (non-critical):', reminderError);
              }
            }
          }
        } else {
          console.warn('⚠️ No timeline entries to save');
        }
      }
    } else {
      // This should never happen because we validate milestones above
      console.error('❌ CRITICAL: No milestones to save - this should not happen after validation!');
      return errorResponse("Failed to save milestones: No milestones data", 500);
    }
    
    console.log('🎉 ARK creation completed successfully!');

    return successResponse({
      ark: {
        ...arkData,
        id: ark.id,
        stored: true
      },
      model: orchestratedResponse.model,
      tokens_used: orchestratedResponse.tokens_used,
      orchestration_metadata: orchestratedResponse.orchestration_metadata,
      navigation_suggestions: orchestratedResponse.navigation_suggestions
    });
  } catch (error) {
    return handleApiError(error);
  }
}

