import axios from "axios";

export interface YouTubeSearchOptions {
  query: string;
  maxResults?: number;
  type?: "video" | "channel" | "playlist";
  order?: "relevance" | "date" | "rating" | "viewCount";
  videoDuration?: "any" | "short" | "medium" | "long";
  topicId?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  channel_title: string;
  channel_id: string;
  published_at: string;
  duration: string;
  view_count: number;
  like_count?: number;
  url: string;
  tags?: string[];
}

export interface YouTubeSearchResult {
  success: boolean;
  videos: YouTubeVideo[];
  total_results: number;
  error?: string;
}

/**
 * YouTube Data API v3 Integration
 * Search for educational videos, channels, and playlists
 */
export class YouTubeService {
  private apiKey: string;
  private baseUrl = "https://www.googleapis.com/youtube/v3";

  constructor() {
    this.apiKey = process.env.YOUTUBE_DATA_API_KEY || process.env.YOUTUBE_API_KEY || "";
  }

  /**
   * Search for videos
   */
  async searchVideos(options: YouTubeSearchOptions): Promise<YouTubeSearchResult> {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          videos: [],
          total_results: 0,
          error: "YouTube Data API key not configured",
        };
      }

      const params: Record<string, any> = {
        key: this.apiKey,
        part: "snippet,contentDetails,statistics",
        q: options.query,
        maxResults: options.maxResults || 10,
        order: options.order || "relevance",
        type: options.type || "video",
        videoEmbeddable: "true",
      };

      if (options.videoDuration && options.videoDuration !== "any") {
        params.videoDuration = options.videoDuration;
      }

      if (options.topicId) {
        params.topicId = options.topicId;
      }

      const response = await axios.get(`${this.baseUrl}/search`, { params });

      if (response.data.error) {
        return {
          success: false,
          videos: [],
          total_results: 0,
          error: response.data.error.message,
        };
      }

      // Get video details for each result
      const videoIds = response.data.items
        ?.map((item: any) => item.id.videoId)
        .filter((id: string) => id);

      if (!videoIds || videoIds.length === 0) {
        return {
          success: true,
          videos: [],
          total_results: 0,
        };
      }

      // Fetch detailed video information
      const videoDetails = await this.getVideoDetails(videoIds);

      return {
        success: true,
        videos: videoDetails,
        total_results: response.data.pageInfo?.totalResults || 0,
      };
    } catch (error: any) {
      console.error("YouTube search error:", error.response?.data || error.message);
      return {
        success: false,
        videos: [],
        total_results: 0,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Get detailed video information
   */
  async getVideoDetails(videoIds: string[]): Promise<YouTubeVideo[]> {
    if (!this.apiKey || videoIds.length === 0) {
      return [];
    }

    try {
      const response = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          key: this.apiKey,
          part: "snippet,contentDetails,statistics",
          id: videoIds.join(","),
        },
      });

      return response.data.items?.map((video: any) => this.transformVideo(video)) || [];
    } catch (error: any) {
      console.error("YouTube video details error:", error.response?.data || error.message);
      return [];
    }
  }

  /**
   * Search for educational channels
   */
  async searchChannels(options: {
    query: string;
    maxResults?: number;
  }): Promise<{ success: boolean; channels: any[]; error?: string }> {
    if (!this.apiKey) {
      return {
        success: false,
        channels: [],
        error: "YouTube Data API key not configured",
      };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          key: this.apiKey,
          part: "snippet",
          q: options.query,
          type: "channel",
          maxResults: options.maxResults || 10,
          order: "relevance",
        },
      });

      const channels = response.data.items?.map((item: any) => ({
        id: item.id.channelId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail_url: item.snippet.thumbnails.medium.url,
        subscriber_count: item.snippet.localized?.subscriberCount || 0,
      }));

      return {
        success: true,
        channels: channels || [],
      };
    } catch (error: any) {
      return {
        success: false,
        channels: [],
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * Search for course-specific content
   */
  async searchCourseContent(
    topic: string,
    gradeLevel?: string,
    language: string = "en"
  ): Promise<YouTubeSearchResult> {
    let query = `learn ${topic}`;

    // Add grade-specific terms
    if (gradeLevel) {
      query = `${gradeLevel} ${query}`;
    }

    return this.searchVideos({
      query,
      maxResults: 10,
      type: "video",
      order: "relevance",
      videoDuration: "medium", // Prefer medium-length educational content
    });
  }

  /**
   * Transform YouTube API video to our format
   */
  private transformVideo(video: any): YouTubeVideo {
    const duration = this.parseDuration(video.contentDetails?.duration);

    return {
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      thumbnail_url: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
      channel_title: video.snippet.channelTitle,
      channel_id: video.snippet.channelId,
      published_at: video.snippet.publishedAt,
      duration,
      view_count: parseInt(video.statistics?.viewCount || "0"),
      like_count: parseInt(video.statistics?.likeCount || "0"),
      url: `https://www.youtube.com/watch?v=${video.id}`,
      tags: video.snippet.tags?.slice(0, 5), // Limit tags
    };
  }

  /**
   * Parse ISO 8601 duration to readable format
   */
  private parseDuration(duration: string): string {
    if (!duration) return "Unknown";

    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return "Unknown";

    const hours = match[1] ? parseInt(match[1].replace("H", "")) : 0;
    const minutes = match[2] ? parseInt(match[2].replace("M", "")) : 0;
    const seconds = match[3] ? parseInt(match[3].replace("S", "")) : 0;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(" ") || "0s";
  }
}

// Singleton instance
export const youtubeService = new YouTubeService();

/**
 * Convenience function for video search
 */
export async function searchYouTubeVideos(
  query: string,
  options?: Partial<YouTubeSearchOptions>
): Promise<YouTubeSearchResult> {
  return youtubeService.searchVideos({
    query,
    ...options,
  });
}

/**
 * Search for educational course content
 */
export async function searchCourseVideos(
  topic: string,
  gradeLevel?: string
): Promise<YouTubeSearchResult> {
  return youtubeService.searchCourseContent(topic, gradeLevel);
}

