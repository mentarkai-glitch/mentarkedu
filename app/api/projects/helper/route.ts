import { NextRequest } from "next/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";
import { createClient } from "@/lib/supabase/server";
import { getSubjectById } from "@/lib/data/project-subjects";
import type { AIContext } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      subject_id, 
      project_type, 
      description, 
      requirements, 
      deadline,
      grade_level,
      word_limit,
      format,
      specific_questions
    } = body;

    if (!subject_id || !description) {
      return errorResponse("Subject and project description are required", 400);
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Get subject information
    const subject = getSubjectById(subject_id);
    if (!subject) {
      return errorResponse("Invalid subject", 400);
    }

    // Build comprehensive AI prompt
    const prompt = buildProjectHelperPrompt({
      subject,
      project_type: project_type || 'General',
      description,
      requirements: requirements || '',
      deadline: deadline || '',
      grade_level: grade_level || '',
      word_limit: word_limit || '',
      format: format || '',
      specific_questions: specific_questions || []
    });

    // Create AI context
    const context: AIContext = {
      task: "roadmap", // Using roadmap task for project planning
      user_id: user.id,
      session_id: `project_helper_${Date.now()}`,
      metadata: {
        subject_id,
        project_type,
        grade_level,
        user_tier: 'free',
        complexity: calculateComplexity(description, requirements, project_type)
      }
    };

    // Get AI response
    const aiResponse = await aiOrchestrator(context, prompt);

    // Parse AI response (expecting JSON)
    let projectHelp;
    try {
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        projectHelp = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: treat entire response as text if JSON parsing fails
        projectHelp = {
          overview: aiResponse.content,
          steps: [],
          resources: [],
          timeline: {},
          tips: []
        };
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Return structured response even if JSON parsing fails
      projectHelp = {
        overview: aiResponse.content,
        steps: extractStepsFromText(aiResponse.content),
        resources: subject.resources,
        timeline: generateDefaultTimeline(deadline),
        tips: []
      };
    }

    // Enhance with subject-specific data
    const enhancedHelp = {
      ...projectHelp,
      subject: {
        id: subject.id,
        name: subject.name,
        icon: subject.icon,
        category: subject.category
      },
      suggestedProjectTypes: subject.commonProjectTypes,
      assessmentMethods: subject.assessmentMethods,
      typicalFormats: subject.typicalFormats,
      keySkills: subject.keySkills,
      resources: {
        websites: subject.resources.websites,
        tools: subject.resources.tools,
        platforms: subject.resources.platforms,
        ...(projectHelp.resources || {})
      },
      templates: subject.projectTemplates.filter(t => 
        !project_type || t.type.toLowerCase().includes(project_type.toLowerCase())
      )
    };

    return successResponse({
      project_help: enhancedHelp,
      model_used: aiResponse.model,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    return handleApiError(error);
  }
}

function buildProjectHelperPrompt(data: {
  subject: any;
  project_type: string;
  description: string;
  requirements: string;
  deadline: string;
  grade_level: string;
  word_limit: string;
  format: string;
  specific_questions: string[];
}): string {
  const { subject, project_type, description, requirements, deadline, grade_level, word_limit, format, specific_questions } = data;

  return `You are an expert academic assistant helping a student with a ${subject.name} project. Generate comprehensive, detailed assistance for their assignment.

**Subject:** ${subject.name} (${subject.category})
**Project Type:** ${project_type}
**Grade Level:** ${grade_level || 'Not specified'}
**Deadline:** ${deadline || 'Not specified'}
**Word Limit:** ${word_limit || 'Not specified'}
**Format:** ${format || 'Not specified'}

**Project Description:**
${description}

**Requirements:**
${requirements || 'No specific requirements provided'}

**Student's Specific Questions:**
${specific_questions.length > 0 ? specific_questions.map((q, i) => `${i + 1}. ${q}`).join('\n') : 'None provided'}

**Subject Context:**
- Common Project Types: ${subject.commonProjectTypes.join(', ')}
- Assessment Methods: ${subject.assessmentMethods.join(', ')}
- Key Skills Needed: ${subject.keySkills.join(', ')}
- Available Resources: ${subject.resources.websites.join(', ')}

**Your Task:**
Provide a comprehensive, detailed response in JSON format with the following structure:

{
  "overview": "A clear 2-3 paragraph overview of the project, what it entails, and its objectives",
  "breakdown": {
    "key_components": ["List of 5-8 key components/parts of this project"],
    "difficulty_assessment": "low|medium|high",
    "estimated_time": "X hours/days/weeks",
    "prerequisites": ["What the student should know/understand before starting"]
  },
  "step_by_step_plan": [
    {
      "step_number": 1,
      "title": "Step title",
      "description": "Detailed description of what to do",
      "estimated_time": "X hours",
      "resources_needed": ["list of resources"],
      "tips": ["helpful tips for this step"],
      "deliverables": "What should be completed by end of this step"
    }
    // Continue for all steps
  ],
  "detailed_resources": {
    "websites": [
      {
        "name": "Resource name",
        "url": "https://example.com",
        "description": "How this resource helps",
        "when_to_use": "At which step or for what purpose"
      }
    ],
    "tools": [
      {
        "name": "Tool name",
        "description": "How to use it",
        "alternatives": ["alternative tools if unavailable"]
      }
    ],
    "books_or_articles": [
      {
        "title": "Title",
        "author": "Author",
        "relevance": "Why it's useful for this project"
      }
    ],
    "video_tutorials": [
      {
        "title": "Tutorial title",
        "platform": "YouTube/Khan Academy/etc",
        "topic": "What it covers",
        "duration": "Length"
      }
    ]
  },
  "timeline": {
    "total_duration": "X days/weeks",
    "phases": [
      {
        "phase": "Phase name (e.g., Research, Planning, Execution)",
        "duration": "X days",
        "milestones": ["Key milestones in this phase"],
        "tasks": ["Specific tasks to complete"]
      }
    ],
    "daily_schedule": [
      {
        "day": 1,
        "tasks": ["What to do on day 1"],
        "time_required": "X hours"
      }
    ]
  },
  "evaluation_criteria": {
    "what_teachers_look_for": ["List of 5-7 things"],
    "common_mistakes_to_avoid": ["List of mistakes"],
    "tips_for_high_scores": ["List of tips"]
  },
  "answer_specific_questions": [
    {
      "question": "Student's question",
      "answer": "Detailed, helpful answer"
    }
  ],
  "sample_structure": {
    "sections": [
      {
        "section_name": "Section name",
        "purpose": "Why this section is important",
        "content_guidance": "What to include",
        "length_guidance": "Approximate length/word count",
        "example_outline": "Example of what this section could contain"
      }
    ]
  },
  "troubleshooting": {
    "common_challenges": [
      {
        "challenge": "Common problem students face",
        "solution": "How to solve it",
        "prevention": "How to avoid it"
      }
    ],
    "when_stuck": "What to do when you're stuck or don't understand something"
  },
  "additional_tips": [
    "Additional helpful tips specific to this ${subject.name} project"
  ]
}

**Important Guidelines:**
1. Be extremely detailed and specific - the student should feel guided at every step
2. Tailor advice to the ${subject.name} subject area
3. Consider the grade level: ${grade_level || 'general'}
4. Make steps actionable and clear
5. Include time estimates for realistic planning
6. Suggest real, accessible resources (websites, tools, platforms)
7. Address any specific questions the student asked
8. Provide subject-appropriate methodologies and approaches
9. Include quality criteria so student knows what excellence looks like
10. Make it encouraging and supportive while being thorough

Return ONLY the JSON object, no additional text before or after.`;
}

function calculateComplexity(description: string, requirements: string, projectType: string): number {
  let complexity = 5; // Base complexity
  
  // Length indicators
  if (description.length > 500) complexity += 2;
  if (requirements && requirements.length > 300) complexity += 2;
  
  // Project type complexity
  const complexTypes = ['research', 'thesis', 'dissertation', 'investigation', 'analysis'];
  if (complexTypes.some(type => projectType.toLowerCase().includes(type))) {
    complexity += 3;
  }
  
  return Math.min(10, Math.max(1, complexity));
}

function extractStepsFromText(text: string): any[] {
  // Simple extraction of steps if JSON parsing fails
  const stepMatches = text.match(/(?:Step|Phase)\s*\d+[:\-]?\s*(.+?)(?=(?:Step|Phase)\s*\d+|$)/gi);
  if (!stepMatches) return [];
  
  return stepMatches.map((match, index) => ({
    step_number: index + 1,
    title: match.split(/[:\-]/)[0]?.trim() || `Step ${index + 1}`,
    description: match.trim(),
    estimated_time: "Varies",
    resources_needed: [],
    tips: [],
    deliverables: ""
  }));
}

function generateDefaultTimeline(deadline?: string): any {
  const defaultTimeline = {
    total_duration: deadline || "2-3 weeks",
    phases: [
      {
        phase: "Research & Planning",
        duration: "3-5 days",
        milestones: ["Research complete", "Outline ready"],
        tasks: ["Research topic", "Create outline", "Gather resources"]
      },
      {
        phase: "Execution",
        duration: "1-2 weeks",
        milestones: ["First draft", "Revisions"],
        tasks: ["Write/create content", "Gather data", "Build/design"]
      },
      {
        phase: "Review & Polish",
        duration: "2-3 days",
        milestones: ["Final review", "Submission ready"],
        tasks: ["Review and edit", "Finalize format", "Check requirements"]
      }
    ]
  };
  
  return defaultTimeline;
}
