/**
 * Resource Catalog Service
 * Manages the global educational resource catalog with verification and quality metrics
 */

import { createClient } from "@/lib/supabase/server";

export interface ResourceSearchParams {
  subject?: string;
  gradeLevel?: string;
  type?: 'video' | 'article' | 'course' | 'book' | 'podcast' | 'tool' | 'website' | 'platform' | 'app';
  isFree?: boolean;
  provider?: string;
  tags?: string[];
  minimumRating?: number;
  limit?: number;
}

export interface ResourceRecommendationParams {
  arkCategory: string;
  milestoneTitle: string;
  studentGrade: string;
  learningStyle: string;
  preferredProviders?: string[];
  isFree?: boolean;
}

/**
 * Search global resources
 */
export async function searchResources(params: ResourceSearchParams) {
  const supabase = await createClient();
  
  let query = supabase
    .from('global_resources')
    .select('*')
    .eq('is_active', true);

  if (params.subject) {
    query = query.contains('categories', [params.subject]);
  }
  
  if (params.gradeLevel) {
    query = query.contains('grade_level', [params.gradeLevel]);
  }
  
  if (params.type) {
    query = query.eq('type', params.type);
  }
  
  if (params.isFree !== undefined) {
    query = query.eq('is_free', params.isFree);
  }
  
  if (params.provider) {
    query = query.eq('provider', params.provider);
  }
  
  if (params.tags && params.tags.length > 0) {
    query = query.overlaps('tags', params.tags);
  }
  
  if (params.minimumRating) {
    query = query.gte('quality_score', params.minimumRating);
  }
  
  // Order by quality and recent
  query = query
    .order('quality_score', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(params.limit || 20);

  const { data, error } = await query;

  return { data, error };
}

/**
 * Get AI-recommended resources for a milestone
 */
export async function getRecommendedResources(params: ResourceRecommendationParams) {
  const supabase = await createClient();
  
  // Build search query based on ARK context
  let query = supabase
    .from('global_resources')
    .select('*')
    .eq('is_active', true);

  // Filter by grade level
  if (params.studentGrade) {
    query = query.contains('grade_level', [params.studentGrade]);
  }

  // Filter by provider preference
  if (params.preferredProviders && params.preferredProviders.length > 0) {
    query = query.in('provider', params.preferredProviders);
  }

  // Filter by free resources if requested
  if (params.isFree !== undefined) {
    query = query.eq('is_free', params.isFree);
  }

  // Smart search based on milestone title and category
  const searchTerms = [
    params.milestoneTitle.toLowerCase(),
    params.arkCategory.toLowerCase()
  ];

  // Use full-text search or tag matching
  query = query.or(
    `title.ilike.%${params.milestoneTitle}%, description.ilike.%${params.milestoneTitle}%`
  );

  // Order by quality
  query = query
    .order('quality_score', { ascending: false })
    .order('average_rating', { ascending: false })
    .limit(10);

  const { data, error } = await query;

  return { data, error };
}

/**
 * Get resource by ID with detailed metadata
 */
export async function getResourceById(resourceId: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('global_resources')
    .select(`
      *,
      partner:educational_partners(
        name,
        display_name,
        logo_url,
        metadata
      )
    `)
    .eq('id', resourceId)
    .single();

  return { data, error };
}

/**
 * Add resource access tracking
 */
export async function trackResourceAccess(resourceId: string) {
  const supabase = await createClient();
  
  // Increment access count
  const { error } = await supabase.rpc('increment_resource_access', {
    resource_id: resourceId
  });

  return { error };
}

/**
 * Get popular resources by category
 */
export async function getPopularResources(category?: string, limit = 10) {
  const supabase = await createClient();
  
  let query = supabase
    .from('global_resources')
    .select('*')
    .eq('is_active', true);

  if (category) {
    query = query.contains('categories', [category]);
  }

  const { data, error } = await query
    .order('access_count', { ascending: false })
    .order('quality_score', { ascending: false })
    .limit(limit);

  return { data, error };
}

/**
 * Rate and review a resource
 */
export async function rateResource(
  resourceId: string,
  studentId: string,
  rating: number,
  reviewText?: string,
  completionStatus?: string
) {
  const supabase = await createClient();

  // Insert or update rating
  const { data, error } = await supabase
    .from('resource_ratings')
    .upsert({
      resource_id: resourceId,
      student_id: studentId,
      rating,
      review_text: reviewText,
      completion_status: completionStatus as any
    }, {
      onConflict: 'resource_id,student_id'
    })
    .select()
    .single();

  if (!error && data) {
    // Update resource average rating
    await supabase.rpc('update_resource_average_rating', {
      resource_id: resourceId
    });
  }

  return { data, error };
}

/**
 * Get all educational partners
 */
export async function getEducationalPartners() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('educational_partners')
    .select('*')
    .eq('is_active', true)
    .order('quality_rating', { ascending: false });

  return { data, error };
}

