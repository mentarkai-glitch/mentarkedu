import { searchYouTubeVideos, searchCourseVideos } from './youtube';
import axios from 'axios';
import { scrapingBeeService } from './scraping/scrapingbee';

/**
 * Enhanced roadmap resource fetcher using multiple APIs
 */

export interface RoadmapResource {
  type: 'video' | 'article' | 'project' | 'paper' | 'news';
  title: string;
  description: string;
  url: string;
  source: string;
  relevance_score?: number;
}

export interface EnhancedResources {
  videos: RoadmapResource[];
  articles: RoadmapResource[];
  projects: RoadmapResource[];
  papers: RoadmapResource[];
  news: RoadmapResource[];
}

/**
 * Fetch YouTube videos for a topic
 */
export async function fetchYouTubeResources(
  topic: string,
  stream: string,
  maxResults: number = 5
): Promise<RoadmapResource[]> {
  try {
    const query = `${stream} ${topic} class 11 12`;
    const result = await searchCourseVideos(query, 'Class 11');
    
    if (!result.success || !result.videos) {
      return [];
    }

    return result.videos.slice(0, maxResults).map((video) => ({
      type: 'video' as const,
      title: video.title,
      description: video.description.substring(0, 150) + '...',
      url: video.url,
      source: `YouTube - ${video.channel_title}`,
      relevance_score: video.view_count > 10000 ? 0.8 : 0.6
    }));
  } catch (error) {
    console.error('YouTube resource fetch error:', error);
    return [];
  }
}

/**
 * Fetch Semantic Scholar papers for academic topics
 */
export async function fetchAcademicPapers(
  topic: string,
  stream: string,
  maxResults: number = 3
): Promise<RoadmapResource[]> {
  try {
    const apiKey = process.env.SEMANTIC_SCHOLAR_API_KEY;
    if (!apiKey) {
      return [];
    }

    const query = `${stream} ${topic} education learning`;
    const response = await axios.get('https://api.semanticscholar.org/graph/v1/paper/search', {
      params: {
        query,
        limit: maxResults,
        fields: 'title,abstract,url,year,authors'
      },
      headers: {
        'x-api-key': apiKey
      }
    });

    if (!response.data?.data) {
      return [];
    }

    return response.data.data.map((paper: any) => ({
      type: 'paper' as const,
      title: paper.title || 'Research Paper',
      description: paper.abstract?.substring(0, 150) + '...' || 'Academic research paper',
      url: paper.url || (paper.paperId ? `https://www.semanticscholar.org/paper/${paper.paperId}` : '#'),
      source: `Semantic Scholar${paper.year ? ` - ${paper.year}` : ''}`,
      relevance_score: 0.7
    }));
  } catch (error) {
    console.error('Semantic Scholar fetch error:', error);
    return [];
  }
}

/**
 * Fetch GitHub projects for coding-related streams
 */
export async function fetchGitHubProjects(
  topic: string,
  stream: string,
  maxResults: number = 3
): Promise<RoadmapResource[]> {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      return [];
    }

    // Only fetch for CS/IT related streams
    if (!stream.toLowerCase().includes('science') && !stream.toLowerCase().includes('computer')) {
      return [];
    }

    const query = `${topic} learning project tutorial`;
    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: `${query} language:python OR language:javascript stars:>10`,
        sort: 'stars',
        order: 'desc',
        per_page: maxResults
      },
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.data?.items) {
      return [];
    }

    return response.data.items.map((repo: any) => ({
      type: 'project' as const,
      title: repo.name,
      description: repo.description || 'Open source project',
      url: repo.html_url,
      source: `GitHub - ${repo.stargazers_count} stars`,
      relevance_score: repo.stargazers_count > 100 ? 0.9 : 0.7
    }));
  } catch (error) {
    console.error('GitHub fetch error:', error);
    return [];
  }
}

/**
 * Fetch career news and trends
 */
export async function fetchCareerNews(
  stream: string,
  maxResults: number = 3
): Promise<RoadmapResource[]> {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      return [];
    }

    const query = `${stream} career opportunities India 2024`;
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: query,
        language: 'en',
        sortBy: 'relevancy',
        pageSize: maxResults,
        apiKey
      }
    });

    if (!response.data?.articles) {
      return [];
    }

    return response.data.articles.map((article: any) => ({
      type: 'news' as const,
      title: article.title,
      description: article.description?.substring(0, 150) + '...' || 'Career news',
      url: article.url,
      source: `News - ${article.source?.name || 'Unknown'}`,
      relevance_score: 0.6
    }));
  } catch (error) {
    console.error('News API fetch error:', error);
    return [];
  }
}

/**
 * Fetch college recommendations using ScrapingBee
 */
export async function fetchCollegeRecommendations(
  stream: string,
  geographicPreference?: string[]
): Promise<RoadmapResource[]> {
  try {
    if (!scrapingBeeService.isAvailable()) {
      console.log('ScrapingBee not available, skipping college recommendations');
      return [];
    }

    const result = await scrapingBeeService.scrapeNIRFRankings(stream);
    
    if (!result.success || result.colleges.length === 0) {
      return [];
    }

    return result.colleges.map(college => ({
      type: 'article' as const,
      title: `${college.name} - Rank ${college.rank}`,
      description: `NIRF ranked college in ${college.city} for ${stream}`,
      url: college.url || '#',
      source: 'NIRF Rankings',
      relevance_score: college.rank <= 10 ? 0.9 : 0.7
    }));
  } catch (error) {
    console.error('College scraping error:', error);
    return [];
  }
}

/**
 * Fetch exam schedules using ScrapingBee
 */
export async function fetchExamSchedules(
  stream: string
): Promise<RoadmapResource[]> {
  try {
    if (!scrapingBeeService.isAvailable()) {
      console.log('ScrapingBee not available, skipping exam schedules');
      return [];
    }

    const examTypes: Array<'JEE' | 'NEET' | 'CUET'> = [];
    
    // Determine which exams are relevant
    if (stream.includes('Science') || stream.includes('PCM')) {
      examTypes.push('JEE');
    }
    if (stream.includes('PCB') || stream.includes('Medical')) {
      examTypes.push('NEET');
    }
    examTypes.push('CUET'); // CUET is common for most streams

    const schedules = await Promise.all(
      examTypes.map(exam => scrapingBeeService.scrapeExamSchedule(exam))
    );

    const allSchedules: RoadmapResource[] = [];
    
    schedules.forEach((result, idx) => {
      if (result.success && result.schedule.length > 0) {
        result.schedule.forEach(schedule => {
          allSchedules.push({
            type: 'article' as const,
            title: `${schedule.exam} Exam Schedule`,
            description: `Exam Date: ${schedule.date}`,
            url: schedule.url || '#',
            source: `${schedule.exam} Official`,
            relevance_score: 0.95
          });
        });
      }
    });

    return allSchedules;
  } catch (error) {
    console.error('Exam schedule scraping error:', error);
    return [];
  }
}

/**
 * Fetch scholarships using ScrapingBee
 */
export async function fetchScholarships(
  stream: string,
  budgetConstraint: boolean
): Promise<RoadmapResource[]> {
  if (!budgetConstraint) return []; // Only fetch if budget is a constraint

  try {
    if (!scrapingBeeService.isAvailable()) {
      console.log('ScrapingBee not available, skipping scholarships');
      return [];
    }

    const result = await scrapingBeeService.scrapeScholarships(stream, budgetConstraint);
    
    if (!result.success || result.scholarships.length === 0) {
      return [];
    }

    return result.scholarships.map(scholarship => ({
      type: 'article' as const,
      title: scholarship.name,
      description: `Amount: ${scholarship.amount} | ${scholarship.eligibility.substring(0, 100)}...`,
      url: scholarship.url || '#',
      source: 'Scholarship Portal',
      relevance_score: 0.8
    }));
  } catch (error) {
    console.error('Scholarship scraping error:', error);
    return [];
  }
}

/**
 * Enhance roadmap with resources from multiple APIs
 */
export async function enhanceRoadmapWithResources(
  roadmap: any,
  stream: string,
  language: string = 'en',
  budgetConstraint: boolean = false,
  geographicPreference?: string[]
): Promise<any> {
  const enhancedRoadmap = { ...roadmap };
  
  // Extract key topics from milestones
  const topics: string[] = [];
  if (roadmap.milestones) {
    roadmap.milestones.forEach((milestone: any) => {
      if (milestone.title) {
        const words = milestone.title.toLowerCase().split(/\s+/);
        topics.push(...words.filter((w: string) => w.length > 4));
      }
    });
  }

  // Get unique topics
  const uniqueTopics = [...new Set(topics)].slice(0, 3);

  // Fetch resources in parallel (including ScrapingBee data)
  const [videos, papers, projects, news, colleges, examSchedules, scholarships] = await Promise.all([
    uniqueTopics.length > 0 
      ? fetchYouTubeResources(uniqueTopics[0], stream, 5)
      : Promise.resolve([]),
    stream.toLowerCase().includes('science') || stream.toLowerCase().includes('research')
      ? fetchAcademicPapers(uniqueTopics[0] || stream, stream, 3)
      : Promise.resolve([]),
    stream.toLowerCase().includes('computer') || stream.toLowerCase().includes('science')
      ? fetchGitHubProjects(uniqueTopics[0] || 'programming', stream, 3)
      : Promise.resolve([]),
    fetchCareerNews(stream, 3),
    fetchCollegeRecommendations(stream, geographicPreference),
    fetchExamSchedules(stream),
    fetchScholarships(stream, budgetConstraint)
  ]);

  // Add resources to milestones
  if (enhancedRoadmap.milestones && enhancedRoadmap.milestones.length > 0) {
    enhancedRoadmap.milestones = enhancedRoadmap.milestones.map((milestone: any, index: number) => {
      const milestoneResources: RoadmapResource[] = [];
      
      // Add 2-3 videos per milestone
      if (videos.length > 0) {
        const startIdx = (index * 2) % videos.length;
        milestoneResources.push(...videos.slice(startIdx, startIdx + 2));
      }

      // Add papers for first milestone if available
      if (index === 0 && papers.length > 0) {
        milestoneResources.push(...papers.slice(0, 1));
      }

      // Add projects for coding streams
      if (projects.length > 0 && index < 2) {
        milestoneResources.push(...projects.slice(index, index + 1));
      }

      return {
        ...milestone,
        resources: [
          ...(milestone.resources || []),
          ...milestoneResources.map(r => ({
            type: r.type,
            title: r.title,
            url: r.url,
            description: r.description,
            source: r.source
          }))
        ]
      };
    });
  }

  // Add career news section
  if (news.length > 0) {
    enhancedRoadmap.career_news = news.map(n => ({
      title: n.title,
      url: n.url,
      description: n.description,
      source: n.source
    }));
  }

  // Add ScrapingBee scraped data
  if (colleges.length > 0) {
    enhancedRoadmap.college_recommendations = colleges;
  }
  
  if (examSchedules.length > 0) {
    enhancedRoadmap.exam_schedules = examSchedules;
    // Also add to exam_timeline if it doesn't exist
    if (!enhancedRoadmap.exam_timeline || enhancedRoadmap.exam_timeline.length === 0) {
      enhancedRoadmap.exam_timeline = examSchedules.map(s => s.title);
    }
  }
  
  if (scholarships.length > 0) {
    enhancedRoadmap.scholarships = scholarships;
  }

  // Add resource summary
  enhancedRoadmap.resource_summary = {
    total_videos: videos.length,
    total_papers: papers.length,
    total_projects: projects.length,
    total_news: news.length,
    total_colleges: colleges.length,
    total_exam_schedules: examSchedules.length,
    total_scholarships: scholarships.length
  };

  return enhancedRoadmap;
}

