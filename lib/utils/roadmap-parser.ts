/**
 * Robust roadmap parser utility
 * Ensures roadmap data is always a properly structured object, never a string
 */

export interface ParsedRoadmap {
  title?: string;
  description?: string;
  milestones?: any[];
  monthly_plan?: any;
  career_exposure?: string[];
  exam_timeline?: string[];
  resources?: any[];
  career_news?: any[];
  resource_summary?: any;
  scholarships?: any[];
  college_recommendations?: any[];
  exam_schedules?: any[];
  success_tips?: string[];
  budget_friendly_options?: string[];
  [key: string]: any;
}

/**
 * Parse roadmap data - handles strings, objects, and malformed JSON
 */
export function parseRoadmapData(data: any): ParsedRoadmap {
  // If already an object and properly structured, return it
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return normalizeRoadmapStructure(data);
  }

  // If it's a string, try to parse it
  if (typeof data === 'string') {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = data.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        return normalizeRoadmapStructure(parsed);
      }
      
      // Try direct JSON parse
      const parsed = JSON.parse(data);
      return normalizeRoadmapStructure(parsed);
    } catch (error) {
      console.error('Failed to parse roadmap string:', error);
      // Return empty structure if parsing fails
      return createEmptyRoadmap();
    }
  }

  // If it's an array or other type, return empty structure
  return createEmptyRoadmap();
}

/**
 * Normalize roadmap structure to ensure all required fields exist
 */
function normalizeRoadmapStructure(roadmap: any): ParsedRoadmap {
  if (!roadmap || typeof roadmap !== 'object') {
    return createEmptyRoadmap();
  }

  return {
    title: typeof roadmap.title === 'string' ? roadmap.title : undefined,
    description: typeof roadmap.description === 'string' ? roadmap.description : undefined,
    milestones: Array.isArray(roadmap.milestones) ? roadmap.milestones : [],
    monthly_plan: roadmap.monthly_plan || null,
    career_exposure: Array.isArray(roadmap.career_exposure) ? roadmap.career_exposure : [],
    exam_timeline: Array.isArray(roadmap.exam_timeline) ? roadmap.exam_timeline : [],
    resources: Array.isArray(roadmap.resources) ? roadmap.resources : [],
    career_news: Array.isArray(roadmap.career_news) ? roadmap.career_news : [],
    resource_summary: roadmap.resource_summary || null,
    scholarships: Array.isArray(roadmap.scholarships) ? roadmap.scholarships : [],
    college_recommendations: Array.isArray(roadmap.college_recommendations) ? roadmap.college_recommendations : [],
    exam_schedules: Array.isArray(roadmap.exam_schedules) ? roadmap.exam_schedules : [],
    success_tips: Array.isArray(roadmap.success_tips) ? roadmap.success_tips : [],
    budget_friendly_options: Array.isArray(roadmap.budget_friendly_options) ? roadmap.budget_friendly_options : [],
    // Preserve any other fields
    ...Object.fromEntries(
      Object.entries(roadmap).filter(([key]) => 
        !['title', 'description', 'milestones', 'monthly_plan', 'career_exposure', 
          'exam_timeline', 'resources', 'career_news', 'resource_summary', 
          'scholarships', 'college_recommendations', 'exam_schedules', 
          'success_tips', 'budget_friendly_options'].includes(key)
      )
    )
  };
}

/**
 * Create an empty roadmap structure
 */
function createEmptyRoadmap(): ParsedRoadmap {
  return {
    title: undefined,
    description: undefined,
    milestones: [],
    monthly_plan: null,
    career_exposure: [],
    exam_timeline: [],
    resources: [],
    career_news: [],
    resource_summary: null,
    scholarships: [],
    college_recommendations: [],
    exam_schedules: [],
    success_tips: [],
    budget_friendly_options: []
  };
}

/**
 * Validate roadmap structure
 */
export function validateRoadmap(roadmap: ParsedRoadmap): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!roadmap) {
    errors.push('Roadmap is null or undefined');
    return { valid: false, errors };
  }

  if (typeof roadmap !== 'object') {
    errors.push('Roadmap is not an object');
    return { valid: false, errors };
  }

  // Check for required arrays
  if (!Array.isArray(roadmap.milestones)) {
    errors.push('Milestones must be an array');
  }

  if (!Array.isArray(roadmap.career_exposure)) {
    errors.push('Career exposure must be an array');
  }

  if (!Array.isArray(roadmap.exam_timeline)) {
    errors.push('Exam timeline must be an array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

