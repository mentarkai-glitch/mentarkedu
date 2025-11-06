/**
 * Semantic Scholar Integration
 * Academic paper search and citation
 */

import axios from "axios";

const SEMANTIC_SCHOLAR_API_BASE = "https://api.semanticscholar.org/graph/v1";

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
      const response = await axios.get(`${SEMANTIC_SCHOLAR_API_BASE}/paper/search`, {
        params: {
          query,
          limit,
          fields: fields.join(","),
          year: options?.yearMin || options?.yearMax
            ? `${options.yearMin || ""}-${options.yearMax || ""}`
            : undefined,
          sort: sortBy,
        },
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
      const response = await axios.get(
        `${SEMANTIC_SCHOLAR_API_BASE}/paper/${paperId}`,
        {
          params: {
            fields: "title,abstract,year,authors,url,citationCount,influentialCitationCount,venue",
          },
        }
      );

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
      const response = await axios.get(
        `${SEMANTIC_SCHOLAR_API_BASE}/paper/${paperId}/citations`,
        {
          params: {
            limit,
            fields: "title,abstract,year,authors,url,citationCount",
          },
        }
      );

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
      const response = await axios.get(
        `${SEMANTIC_SCHOLAR_API_BASE}/paper/${paperId}/references`,
        {
          params: {
            limit,
            fields: "title,abstract,year,authors,url,citationCount",
          },
        }
      );

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

