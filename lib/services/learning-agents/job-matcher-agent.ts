/**
 * Job Matcher Agent
 * Finds relevant jobs based on student skills, ARK progress, and career goals
 */

import { BaseAgent, type AgentContext, type AgentResult, type LearningAgent } from "./agent-framework";
import { jSearchService } from "../jobs/jsearch";
import type { JobResult } from "../jobs/jsearch";
import { createClient } from "@/lib/supabase/server";
import { aiOrchestrator } from "@/lib/ai/orchestrator";
import type { AIContext } from "@/lib/types";

export class JobMatcherAgent extends BaseAgent {
  constructor() {
    super();
  }

  getType(): "job_matcher" {
    return "job_matcher";
  }

  /**
   * Find relevant jobs for a student based on their ARK progress
   */
  async execute(context: AgentContext): Promise<AgentResult> {
    const supabase = await createClient();

    try {
      // Get student profile and ARK data
      const { data: ark, error: arkError } = await supabase
        .from("arks")
        .select("*, ark_milestones(*, skills_to_gain)")
        .eq("id", context.arkId)
        .single();

      if (arkError || !ark) {
        return {
          success: false,
          actions: [],
          error: "ARK not found",
        };
      }

      // Get student profile
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("onboarding_profile, ai_identity_profile")
        .eq("user_id", context.studentId)
        .single();

      if (studentError) {
        return {
          success: false,
          actions: [],
          error: "Student not found",
        };
      }

      // Extract skills from ARK milestones
      const skills = this.extractSkillsFromARK(ark);
      const interests = this.extractInterestsFromProfile(student);

      // Generate intelligent job search query using AI
      const searchQuery = await this.generateJobSearchQuery(skills, interests, ark);

      // Search for jobs
      if (!jSearchService.isAvailable()) {
        return {
          success: false,
          actions: [],
          error: "Job search API not configured",
        };
      }

      const jobResults = await jSearchService.searchJobs({
        query: searchQuery,
        location: context.metadata?.location || "India",
        datePosted: "week", // Recent jobs only
        numPages: 3, // Get multiple pages
        remoteOnly: false,
      });

      if (!jobResults.success || !jobResults.jobs || jobResults.jobs.length === 0) {
        return {
          success: false,
          actions: [],
          error: "No jobs found matching criteria",
        };
      }

      // Filter and rank jobs using AI
      const rankedJobs = await this.rankJobsByRelevance(
        jobResults.jobs,
        skills,
        ark,
        context.studentId
      );

      // Save top 5 jobs as recommendations
      const topJobs = rankedJobs.slice(0, 5);

      // Store job recommendations in database
      const recommendations = topJobs.map((job, index) => ({
        ark_id: context.arkId,
        student_id: context.studentId,
        job_data: job,
        relevance_score: index + 1, // Top 5
        recommended_at: new Date().toISOString(),
      }));

      // TODO: Create job_recommendations table or store in metadata
      // await supabase.from('job_recommendations').insert(recommendations);

      const actions = [
        `Searched for ${jobResults.total_jobs} jobs`,
        `Found ${jobResults.jobs.length} matching jobs`,
        `Ranked jobs by relevance`,
        `Recommended top ${topJobs.length} jobs`,
      ];

      return {
        success: true,
        actions,
        data: {
          total_jobs_found: jobResults.total_jobs || 0,
          recommended_jobs: topJobs,
          search_query: searchQuery,
          skills_matched: skills,
        },
        metadata: {
          execution_time: Date.now(),
          platform: "jsearch",
        },
      };
    } catch (error: any) {
      console.error("Job Matcher Agent error:", error);
      return {
        success: false,
        actions: [],
        error: error.message,
      };
    }
  }

  /**
   * Extract skills from ARK milestones
   */
  private extractSkillsFromARK(ark: any): string[] {
    const skills = new Set<string>();

    if (ark.ark_milestones) {
      ark.ark_milestones.forEach((milestone: any) => {
        if (milestone.skills_to_gain && Array.isArray(milestone.skills_to_gain)) {
          milestone.skills_to_gain.forEach((skill: string) => skills.add(skill));
        }
      });
    }

    // Add category-based skills
    const categorySkills = this.getSkillsFromCategory(ark.category_id);
    categorySkills.forEach((skill) => skills.add(skill));

    return Array.from(skills);
  }

  /**
   * Extract interests from student profile
   */
  private extractInterestsFromProfile(student: any): string[] {
    const interests: string[] = [];

    if (student?.onboarding_profile?.interests) {
      interests.push(...student.onboarding_profile.interests);
    }

    if (student?.ai_identity_profile?.career_interest) {
      interests.push(student.ai_identity_profile.career_interest);
    }

    return interests;
  }

  /**
   * Generate intelligent job search query using AI
   */
  private async generateJobSearchQuery(
    skills: string[],
    interests: string[],
    ark: any
  ): Promise<string> {
    const skillsText = skills.slice(0, 5).join(", ");
    const interestsText = interests.slice(0, 3).join(", ");

    const prompt = `Based on the following information, create a concise job search query (max 100 characters):
    
Skills: ${skillsText}
Interests: ${interestsText}
ARK Category: ${ark.category_id}
ARK Title: ${ark.title}

Generate a single, specific job search query that would find relevant positions. Return ONLY the query text, nothing else.`;

    try {
      const aiContext: AIContext = {
        task: "mentor_chat",
        user_id: "system",
        session_id: "job_matcher",
        metadata: {
          system_prompt: "You are a job search assistant.",
          user_tier: "pro",
        },
      };

      const response = await aiOrchestrator(aiContext, prompt);

      if (response.content) {
        return response.content.trim().slice(0, 100);
      }
    } catch (error) {
      console.error("Error generating job query with AI:", error);
    }

    // Fallback: Create query from skills and category
    return `${ark.category_id} ${skills.slice(0, 2).join(" ")} jobs`;
  }

  /**
   * Rank jobs by relevance to student's skills and ARK
   */
  private async rankJobsByRelevance(
    jobs: JobResult[],
    skills: string[],
    ark: any,
    studentId: string
  ): Promise<JobResult[]> {
    // Simple relevance scoring based on skills match
    const scoredJobs = jobs.map((job) => {
      let score = 0;

      // Check for skills match in title or description
      const jobText = `${job.job_title} ${job.job_description}`.toLowerCase();

      skills.forEach((skill) => {
        if (jobText.includes(skill.toLowerCase())) {
          score += 10;
        }
      });

      // Boost for remote jobs
      if (job.job_is_remote) {
        score += 5;
      }

      // Boost for recent postings (within last 7 days)
      if (job.job_posted_at_datetime_utc) {
        const postedDate = new Date(job.job_posted_at_datetime_utc);
        const daysDiff = (Date.now() - postedDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff <= 7) {
          score += 5;
        }
      }

      // Boost for well-known companies (has logo)
      if (job.company_logo) {
        score += 3;
      }

      return { job, score };
    });

    // Sort by score and return jobs
    return scoredJobs
      .sort((a, b) => b.score - a.score)
      .map((item) => item.job);
  }

  /**
   * Get skills based on ARK category
   */
  private getSkillsFromCategory(categoryId: string): string[] {
    const categorySkills: Record<string, string[]> = {
      "academic-excellence": ["mathematics", "science", "analytics", "research"],
      "career-preparation": ["professional", "business", "industry", "networking"],
      "personal-development": ["soft skills", "leadership", "communication"],
      "emotional-wellbeing": ["mental health", "mindfulness", "counseling"],
      "social-relationships": ["interpersonal skills", "teamwork", "social work"],
      "life-skills": ["finance", "management", "entrepreneurship", "problem-solving"],
    };

    return categorySkills[categoryId] || [];
  }
}


