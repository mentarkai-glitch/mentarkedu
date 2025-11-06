import axios from "axios";

export interface JobSearchOptions {
  query: string;
  location?: string;
  datePosted?: "all" | "today" | "3days" | "week" | "month";
  employmentTypes?: string;
  jobRequirements?: string;
  remoteOnly?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  page?: number;
  numPages?: number;
  country?: string;
  experienceLevel?: "internship" | "entry_level" | "associate" | "mid_senior" | "director" | "executive";
}

export interface JobResult {
  job_id: string;
  job_title: string;
  job_description: string;
  company_name: string;
  company_logo?: string;
  job_apply_link: string;
  apply_options?: Array<{
    publisher: string;
    apply_link: string;
  }>;
  required_skills?: string[];
  job_country: string;
  job_city?: string;
  job_state?: string;
  job_posted_at_datetime_utc: string;
  job_posted_at_timestamp?: number;
  job_max_salary?: number;
  job_min_salary?: number;
  job_salary_currency?: string;
  job_is_remote?: boolean;
  job_employment_type: string;
  experience_level?: string;
  benefits?: string[];
  job_publisher?: string;
}

export interface JobSearchResult {
  success: boolean;
  jobs?: JobResult[];
  total_jobs?: number;
  page?: number;
  error?: string;
}

/**
 * JSearch API Integration (via RapidAPI)
 * Provides LinkedIn job search across multiple countries
 */
export class JSearchService {
  private apiKey: string;
  private baseUrl = "https://jsearch.p.rapidapi.com";
  private headers: Record<string, string>;

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || "";
    this.headers = {
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
      "x-rapidapi-key": this.apiKey,
    };
  }

  /**
   * Search for jobs
   */
  async searchJobs(options: JobSearchOptions): Promise<JobSearchResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: "RapidAPI key not configured",
        };
      }

      const params: Record<string, any> = {
        query: options.query,
        page: options.page || 1,
        num_pages: options.numPages || 1,
      };

      if (options.location) {
        params.job_location = options.location;
      }

      if (options.datePosted && options.datePosted !== "all") {
        params.date_posted = options.datePosted;
      }

      if (options.country) {
        params.country = options.country;
      }

      if (options.employmentTypes) {
        params.employment_types = options.employmentTypes;
      }

      if (options.remoteOnly) {
        params.remote_only = true;
      }

      if (options.experienceLevel) {
        params.experience_level = options.experienceLevel;
      }

      const response = await axios.get(`${this.baseUrl}/search`, {
        params,
        headers: this.headers,
        timeout: 10000,
      });

      return {
        success: true,
        jobs: this.transformJobs(response.data.data || []),
        total_jobs: response.data.total_results || 0,
        page: options.page || 1,
      };
    } catch (error: any) {
      console.error("JSearch error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Search jobs by skills
   */
  async searchJobsBySkills(
    skills: string[],
    options?: {
      location?: string;
      datePosted?: "all" | "today" | "3days" | "week" | "month";
      remoteOnly?: boolean;
    }
  ): Promise<JobSearchResult> {
    const query = skills.join(" ");
    return this.searchJobs({
      query,
      ...options,
    });
  }

  /**
   * Get job details by ID
   */
  async getJobDetails(jobId: string): Promise<{
    success: boolean;
    job?: JobResult;
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: "RapidAPI key not configured",
        };
      }

      const response = await axios.get(`${this.baseUrl}/job-details`, {
        params: { job_id: jobId },
        headers: this.headers,
      });

      return {
        success: true,
        job: this.transformJob(response.data.data?.[0]),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Search salary estimates
   */
  async searchSalary(query: string): Promise<{
    success: boolean;
    salary_data?: any;
    error?: string;
  }> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: "RapidAPI key not configured",
        };
      }

      const response = await axios.get(`${this.baseUrl}/search-filters`, {
        params: { query },
        headers: this.headers,
      });

      return {
        success: true,
        salary_data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Transform API response to our format
   */
  private transformJobs(jobs: any[]): JobResult[] {
    return jobs.map((job) => this.transformJob(job));
  }

  /**
   * Transform single job
   */
  private transformJob(job: any): JobResult {
    return {
      job_id: job.job_id,
      job_title: job.job_title,
      job_description: job.job_description || "",
      company_name: job.employer_name || "",
      company_logo: job.employer_logo,
      job_apply_link: job.job_apply_link,
      apply_options: job.apply_options,
      required_skills: job.job_required_skills,
      job_country: job.job_country || "IN",
      job_city: job.job_city,
      job_state: job.job_state,
      job_posted_at_datetime_utc: job.job_posted_at_datetime_utc || new Date().toISOString(),
      job_posted_at_timestamp: job.job_posted_at_timestamp,
      job_max_salary: job.job_max_salary,
      job_min_salary: job.job_min_salary,
      job_salary_currency: job.job_salary_currency || "INR",
      job_is_remote: job.job_is_remote || false,
      job_employment_type: job.job_employment_type || "FULLTIME",
      experience_level: job.job_experience_level,
      benefits: job.job_benefits,
      job_publisher: job.job_publisher,
    };
  }

  /**
   * Check if service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }
}

// Singleton instance
export const jSearchService = new JSearchService();

/**
 * Convenience function for job search
 */
export async function searchJobs(options: JobSearchOptions): Promise<JobSearchResult> {
  return jSearchService.searchJobs(options);
}

/**
 * Search jobs by skills
 */
export async function searchJobsBySkills(
  skills: string[],
  options?: {
    location?: string;
    datePosted?: "all" | "today" | "3days" | "week" | "month";
    remoteOnly?: boolean;
  }
): Promise<JobSearchResult> {
  return jSearchService.searchJobsBySkills(skills, options);
}

/**
 * Get job details
 */
export async function getJobDetails(jobId: string): Promise<{
  success: boolean;
  job?: JobResult;
  error?: string;
}> {
  return jSearchService.getJobDetails(jobId);
}


