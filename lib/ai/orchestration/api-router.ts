/**
 * Intelligent API Router - Routes requests to specialized APIs based on keywords and context
 * Uses all available APIs (YouTube, GitHub, Perplexity, etc.) for comprehensive resource gathering
 */

import { callPerplexity } from "../models/perplexity";
import { callGemini } from "../models/gemini";
import { callClaude } from "../models/claude";
import { callGPT4o } from "../models/openai";
import { callCohere } from "../models/cohere";
import axios from "axios";

export interface KeywordContext {
  keywords: string[];
  category: string;
  goal: string;
  domain?: string;
  requiresVideo?: boolean;
  requiresCode?: boolean;
  requiresResearch?: boolean;
  requiresRealTime?: boolean;
}

export interface ResourceResult {
  type: 'video' | 'article' | 'course' | 'book' | 'tool' | 'github' | 'reddit' | 'research';
  title: string;
  url: string;
  description?: string;
  provider?: string;
  author?: string;
  duration_minutes?: number;
  is_free?: boolean;
  cost?: string;
  quality_score?: number;
  source: 'youtube' | 'github' | 'perplexity' | 'reddit' | 'web' | 'course';
}

/**
 * Extract keywords and context from user input
 */
export function extractKeywordContext(input: string, category: string, goal: string): KeywordContext {
  const lowerInput = input.toLowerCase();
  const lowerGoal = goal.toLowerCase();
  const lowerCategory = category.toLowerCase();

  // Extract keywords
  const keywords: string[] = [];
  
  // Technical keywords
  const techKeywords = ['react', 'javascript', 'python', 'java', 'c++', 'coding', 'programming', 'web development', 'app development', 'machine learning', 'ai', 'data science', 'database', 'api', 'backend', 'frontend'];
  techKeywords.forEach(kw => {
    if (lowerInput.includes(kw) || lowerGoal.includes(kw)) {
      keywords.push(kw);
    }
  });

  // Video-related keywords
  const videoKeywords = ['tutorial', 'video', 'watch', 'learn', 'course', 'lesson', 'youtube', 'explain'];
  const requiresVideo = videoKeywords.some(kw => lowerInput.includes(kw) || lowerGoal.includes(kw));

  // Code-related keywords
  const codeKeywords = ['code', 'github', 'repository', 'project', 'example', 'demo', 'implementation'];
  const requiresCode = codeKeywords.some(kw => lowerInput.includes(kw) || lowerGoal.includes(kw));

  // Research keywords
  const researchKeywords = ['research', 'study', 'analysis', 'paper', 'article', 'documentation', 'guide'];
  const requiresResearch = researchKeywords.some(kw => lowerInput.includes(kw) || lowerGoal.includes(kw));

  // Real-time keywords
  const realtimeKeywords = ['latest', 'current', 'recent', 'news', 'trending', 'update'];
  const requiresRealTime = realtimeKeywords.some(kw => lowerInput.includes(kw) || lowerGoal.includes(kw));

  // Domain detection
  let domain: string | undefined;
  if (keywords.some(k => ['react', 'javascript', 'web development'].includes(k))) {
    domain = 'web-development';
  } else if (keywords.some(k => ['python', 'machine learning', 'ai', 'data science'].includes(k))) {
    domain = 'data-science';
  } else if (keywords.some(k => ['java', 'c++', 'programming'].includes(k))) {
    domain = 'software-engineering';
  }

  return {
    keywords,
    category: lowerCategory,
    goal: lowerGoal,
    domain,
    requiresVideo,
    requiresCode,
    requiresResearch,
    requiresRealTime
  };
}

/**
 * Search YouTube for video resources
 */
async function searchYouTube(query: string, maxResults: number = 5): Promise<ResourceResult[]> {
  try {
    const apiKey = process.env.YOUTUBE_DATA_API_KEY;
    if (!apiKey) {
      console.warn('YouTube API key not configured');
      return [];
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults,
        key: apiKey,
        order: 'relevance',
        videoDuration: 'medium', // Prefer medium length videos (4-20 min)
        videoDefinition: 'high'
      }
    });

    return (response.data.items || []).map((item: any) => ({
      type: 'video' as const,
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      description: item.snippet.description,
      provider: 'YouTube',
      author: item.snippet.channelTitle,
      source: 'youtube' as const,
      is_free: true,
      quality_score: 0.8 // YouTube videos are generally high quality
    }));
  } catch (error) {
    console.error('YouTube search error:', error);
    return [];
  }
}

/**
 * Search GitHub for code repositories
 */
async function searchGitHub(query: string, maxResults: number = 5): Promise<ResourceResult[]> {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      console.warn('GitHub token not configured');
      return [];
    }

    const response = await axios.get('https://api.github.com/search/repositories', {
      params: {
        q: query,
        sort: 'stars',
        order: 'desc',
        per_page: maxResults
      },
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    return (response.data.items || []).map((repo: any) => ({
      type: 'github' as const,
      title: repo.name,
      url: repo.html_url,
      description: repo.description,
      provider: 'GitHub',
      author: repo.owner.login,
      source: 'github' as const,
      is_free: true,
      quality_score: Math.min(1.0, repo.stargazers_count / 1000) // Score based on stars
    }));
  } catch (error) {
    console.error('GitHub search error:', error);
    return [];
  }
}

/**
 * Use Perplexity for real-time research and current information
 */
async function searchPerplexity(query: string, maxResults: number = 5): Promise<ResourceResult[]> {
  try {
    const response = await callPerplexity(
      `Find the best learning resources, articles, courses, and tools for: ${query}. 
      Return a JSON array with resources including title, url, description, type (article/course/tool), and source.`,
      {
        model: 'sonar-pro',
        max_tokens: 2000,
        temperature: 0.7
      }
    );

    // Parse Perplexity response (may contain JSON)
    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.slice(0, maxResults).map((item: any) => ({
          type: item.type || 'article' as const,
          title: item.title,
          url: item.url,
          description: item.description,
          provider: item.source || 'Perplexity',
          source: 'perplexity' as const,
          is_free: item.cost !== 'paid',
          quality_score: 0.85
        }));
      }
    } catch (parseError) {
      console.warn('Could not parse Perplexity JSON response');
    }

    // Fallback: Extract URLs from text response
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = response.content.match(urlRegex) || [];
    
    return urls.slice(0, maxResults).map((url, idx) => ({
      type: 'article' as const,
      title: `Resource ${idx + 1}`,
      url,
      provider: 'Perplexity',
      source: 'perplexity' as const,
      is_free: true,
      quality_score: 0.8
    }));
  } catch (error) {
    console.error('Perplexity search error:', error);
    return [];
  }
}

/**
 * Search Reddit for community insights and discussions
 */
async function searchReddit(query: string, maxResults: number = 3): Promise<ResourceResult[]> {
  try {
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const userAgent = process.env.REDDIT_USER_AGENT || 'MentarkRoadmapGenerator/1.0';

    if (!clientId || !clientSecret) {
      console.warn('Reddit API credentials not configured');
      return [];
    }

    // Get OAuth token
    const authResponse = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
          'User-Agent': userAgent,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = authResponse.data.access_token;

    // Search Reddit
    const searchResponse = await axios.get(`https://oauth.reddit.com/search.json`, {
      params: {
        q: query,
        sort: 'relevance',
        limit: maxResults,
        type: 'link'
      },
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': userAgent
      }
    });

    return (searchResponse.data.data?.children || []).map((post: any) => ({
      type: 'reddit' as const,
      title: post.data.title,
      url: `https://reddit.com${post.data.permalink}`,
      description: post.data.selftext?.substring(0, 200),
      provider: `r/${post.data.subreddit}`,
      author: post.data.author,
      source: 'reddit' as const,
      is_free: true,
      quality_score: Math.min(1.0, post.data.score / 1000) // Score based on upvotes
    }));
  } catch (error) {
    console.error('Reddit search error:', error);
    return [];
  }
}

/**
 * Use AI models to generate resource recommendations
 */
async function generateAIResources(
  context: KeywordContext,
  milestoneTitle: string,
  milestoneDescription: string
): Promise<ResourceResult[]> {
  try {
    const prompt = `Generate 5-8 learning resources for this milestone:

Title: ${milestoneTitle}
Description: ${milestoneDescription}
Category: ${context.category}
Goal: ${context.goal}
Keywords: ${context.keywords.join(', ')}

Requirements:
- Include a mix of free and paid resources
- Include videos, articles, courses, books, and tools
- Provide real URLs when possible
- Include duration/cost information
- Focus on quality, reputable sources

Return JSON array with: title, url, type, description, provider, author (if known), duration_minutes, is_free, cost, learning_outcomes`;

    // Use Claude for resource generation (better at structured output)
    const response = await callClaude(prompt, {
      model: 'claude-sonnet-4-5-20250929', // Use current model name
      max_tokens: 2000,
      temperature: 0.7
    });

    // Parse JSON response
    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.map((item: any) => ({
          type: (item.type || 'article') as ResourceResult['type'],
          title: item.title,
          url: item.url || `Search: ${item.title}`,
          description: item.description,
          provider: item.provider,
          author: item.author,
          duration_minutes: item.duration_minutes,
          is_free: item.is_free !== false,
          cost: item.cost || (item.is_free ? 'Free' : 'Paid'),
          source: 'web' as const,
          quality_score: 0.9 // AI-generated resources are high quality
        }));
      }
    } catch (parseError) {
      console.warn('Could not parse AI-generated resources JSON');
    }

    return [];
  } catch (error) {
    console.error('AI resource generation error:', error);
    return [];
  }
}

/**
 * Main function: Gather comprehensive resources using multiple APIs
 */
export async function gatherComprehensiveResources(
  context: KeywordContext,
  milestoneTitle: string,
  milestoneDescription: string
): Promise<ResourceResult[]> {
  const allResources: ResourceResult[] = [];
  const searchQuery = `${milestoneTitle} ${context.keywords.join(' ')} ${context.goal}`;

  console.log(`🔍 Gathering resources for: "${milestoneTitle}"`);
  console.log(`   Context:`, context);

  // 1. YouTube videos (if video content is needed)
  if (context.requiresVideo || context.domain === 'web-development') {
    console.log(`   📹 Searching YouTube...`);
    const youtubeResults = await searchYouTube(searchQuery, 3);
    allResources.push(...youtubeResults);
    console.log(`   ✅ Found ${youtubeResults.length} YouTube videos`);
  }

  // 2. GitHub repositories (if code is needed)
  if (context.requiresCode || context.domain) {
    console.log(`   💻 Searching GitHub...`);
    const githubResults = await searchGitHub(searchQuery, 3);
    allResources.push(...githubResults);
    console.log(`   ✅ Found ${githubResults.length} GitHub repos`);
  }

  // 3. Perplexity for real-time research (if needed)
  if (context.requiresRealTime || context.requiresResearch) {
    console.log(`   🔬 Searching Perplexity...`);
    const perplexityResults = await searchPerplexity(searchQuery, 3);
    allResources.push(...perplexityResults);
    console.log(`   ✅ Found ${perplexityResults.length} research resources`);
  }

  // 4. Reddit for community insights (optional, less priority)
  if (context.keywords.length > 0 && context.keywords.some(k => ['programming', 'coding', 'learning'].includes(k))) {
    console.log(`   💬 Searching Reddit...`);
    const redditResults = await searchReddit(searchQuery, 2);
    allResources.push(...redditResults);
    console.log(`   ✅ Found ${redditResults.length} Reddit posts`);
  }

  // 5. AI-generated resources (always include as fallback/enhancement)
  console.log(`   🤖 Generating AI resources...`);
  const aiResults = await generateAIResources(context, milestoneTitle, milestoneDescription);
  allResources.push(...aiResults);
  console.log(`   ✅ Generated ${aiResults.length} AI resources`);

  // Deduplicate by URL
  const uniqueResources = Array.from(
    new Map(allResources.map(r => [r.url, r])).values()
  );

  // Sort by quality score
  uniqueResources.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));

  console.log(`   🎯 Total unique resources: ${uniqueResources.length}`);

  return uniqueResources.slice(0, 8); // Return top 8 resources
}


