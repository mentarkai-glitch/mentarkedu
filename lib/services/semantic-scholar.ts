/**
 * Semantic Scholar Integration
 * Academic paper search and citation
 */

import axios, { AxiosInstance } from "axios";

const SEMANTIC_SCHOLAR_API_BASE = "https://api.semanticscholar.org/graph/v1";
const SEMANTIC_SCHOLAR_API_KEY = process.env.SEMANTIC_SCHOLAR_API_KEY;
const RATE_LIMIT_MS = 1000; // 1 request per second as per Semantic Scholar quota

export interface SemanticScholarPaper {
  paperId: string;
  title: string;
  abstract: string;
  year?: number;
  authors: Array<{
    authorId: string;
    name: string;
  }>;
  url: string;
  citationCount: number;
  influence: number;
  venue?: string;
}

export interface SemanticScholarResult {
  papers: SemanticScholarPaper[];
  total: number;
}

export class SemanticScholarService {
  private readonly client: AxiosInstance;
  private lastRequestTime = 0;

  constructor() {
    this.client = axios.create({
      baseURL: SEMANTIC_SCHOLAR_API_BASE,
      headers: SEMANTIC_SCHOLAR_API_KEY
        ? { "x-api-key": SEMANTIC_SCHOLAR_API_KEY }
        : undefined,
    });

    if (!SEMANTIC_SCHOLAR_API_KEY) {
      console.warn(
        "⚠️ Semantic Scholar API key missing. Set SEMANTIC_SCHOLAR_API_KEY to enable academic search."
      );
    }
  }

  private async throttleRequests() {
    const now = Date.now();
    const timeSinceLast = now - this.lastRequestTime;

    if (timeSinceLast < RATE_LIMIT_MS) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS - timeSinceLast));
    }

    this.lastRequestTime = Date.now();
  }

  private async get<T = any>(path: string, params?: Record<string, unknown>) {
    await this.throttleRequests();
    return this.client.get<T>(path, { params });
  }

  /**
   * Search for academic papers
   */
  async searchPapers(
    query: string,
    options?: {
      limit?: number;
      fields?: string[];
      yearMin?: number;
      yearMax?: number;
      sortBy?: "relevance" | "citationCount" | "year";
    }
  ): Promise<SemanticScholarResult> {
    const limit = options?.limit || 10;
    const fields = options?.fields || ["title", "abstract", "year", "authors", "url", "citationCount"];
    const sortBy = options?.sortBy || "relevance";

    try {
      const response = await this.get("/paper/search", {
        query,
        limit,
        fields: fields.join(","),
        year:
          options?.yearMin || options?.yearMax
            ? `${options.yearMin || ""}-${options.yearMax || ""}`
            : undefined,
        sort: sortBy,
      });

      const papers = response.data.data || [];
      const total = response.data.total || 0;

      return {
        papers: papers.map((paper: any) => ({
          paperId: paper.paperId,
          title: paper.title,
          abstract: paper.abstract || "",
          year: paper.year,
          authors: paper.authors || [],
          url: paper.url,
          citationCount: paper.citationCount || 0,
          influence: paper.citationCount || 0, // Simple influence metric
          venue: paper.venue,
        })),
        total,
      };
    } catch (error: any) {
      console.error("Semantic Scholar API error:", error);
      return { papers: [], total: 0 };
    }
  }

  /**
   * Get paper details by ID
   */
  async getPaper(paperId: string): Promise<SemanticScholarPaper | null> {
    try {
      const response = await this.get(`/paper/${paperId}`, {
        fields:
          "title,abstract,year,authors,url,citationCount,influentialCitationCount,venue",
      });

      const paper = response.data;
      return {
        paperId: paper.paperId,
        title: paper.title,
        abstract: paper.abstract || "",
        year: paper.year,
        authors: paper.authors || [],
        url: paper.url,
        citationCount: paper.citationCount || 0,
        influence: paper.influentialCitationCount || paper.citationCount || 0,
        venue: paper.venue,
      };
    } catch (error) {
      console.error("Semantic Scholar paper fetch error:", error);
      return null;
    }
  }

  /**
   * Get citations for a paper
   */
  async getCitations(paperId: string, limit: number = 20): Promise<SemanticScholarPaper[]> {
    try {
      const response = await this.get(`/paper/${paperId}/citations`, {
        limit,
        fields: "title,abstract,year,authors,url,citationCount",
      });

      const citations = response.data.data || [];
      return citations.map((citation: any) => ({
        paperId: citation.citingPaper.paperId,
        title: citation.citingPaper.title,
        abstract: citation.citingPaper.abstract || "",
        year: citation.citingPaper.year,
        authors: citation.citingPaper.authors || [],
        url: citation.citingPaper.url,
        citationCount: citation.citingPaper.citationCount || 0,
        influence: citation.citingPaper.citationCount || 0,
      }));
    } catch (error) {
      console.error("Semantic Scholar citations error:", error);
      return [];
    }
  }

  /**
   * Get references for a paper
   */
  async getReferences(paperId: string, limit: number = 20): Promise<SemanticScholarPaper[]> {
    try {
      const response = await this.get(`/paper/${paperId}/references`, {
        limit,
        fields: "title,abstract,year,authors,url,citationCount",
      });

      const references = response.data.data || [];
      return references.map((ref: any) => ({
        paperId: ref.paper.paperId,
        title: ref.paper.title,
        abstract: ref.paper.abstract || "",
        year: ref.paper.year,
        authors: ref.paper.authors || [],
        url: ref.paper.url,
        citationCount: ref.paper.citationCount || 0,
        influence: ref.paper.citationCount || 0,
      }));
    } catch (error) {
      console.error("Semantic Scholar references error:", error);
      return [];
    }
  }
}

export const semanticScholarService = new SemanticScholarService();

