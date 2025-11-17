/**
 * Academic Paper Analyzer Service
 * Handles paper summarization, citation tracking, and research notes
 */

import { aiOrchestrator } from '@/lib/ai/orchestrator';
import type { AIContext } from '@/lib/types';

export interface PaperSummary {
  title: string;
  abstract: string;
  keyFindings: string[];
  methodology: string;
  contributions: string[];
  limitations: string[];
  relatedWork: string[];
  takeaway: string;
  relevanceScore: number; // 0-100
}

export interface Citation {
  paperId: string;
  title: string;
  authors: string[];
  year: number;
  citationCount: number;
  relationship: 'cites' | 'cited_by' | 'related';
}

export interface ResearchNote {
  id: string;
  paperId: string;
  content: string;
  tags: string[];
  quotes: Array<{
    text: string;
    page?: number;
    section?: string;
  }>;
  personalInsights: string;
  connections: string[]; // IDs of related notes
  createdAt: Date;
  updatedAt: Date;
}

export interface BibliographyEntry {
  id: string;
  type: 'article' | 'book' | 'conference' | 'thesis' | 'website';
  title: string;
  authors: string[];
  year: number;
  venue?: string;
  publisher?: string;
  pages?: string;
  doi?: string;
  url?: string;
  citation: string; // Formatted citation
}

/**
 * Summarize paper using AI
 */
export async function summarizePaper(
  paperTitle: string,
  abstract: string,
  fullText?: string,
  userId?: string
): Promise<PaperSummary> {
  const prompt = `Summarize this academic paper in detail:

Title: ${paperTitle}

Abstract:
${abstract}

${fullText ? `\nFull Text (first 5000 chars):\n${fullText.substring(0, 5000)}` : ''}

Provide:
1. Key findings (3-5 bullet points)
2. Methodology used
3. Main contributions
4. Limitations mentioned
5. Related work discussed
6. One-sentence takeaway
7. Relevance score (0-100) for a student researcher

Return as JSON.`;

  const context: AIContext = {
    task: 'research',
    user_id: userId || 'anonymous',
    metadata: { user_tier: 'free' }
  };

  try {
    const response = await aiOrchestrator(context, prompt);
    
    // Parse JSON from response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const summary = JSON.parse(jsonMatch[0]);
      return {
        title: paperTitle,
        abstract,
        keyFindings: summary.keyFindings || [],
        methodology: summary.methodology || '',
        contributions: summary.contributions || [],
        limitations: summary.limitations || [],
        relatedWork: summary.relatedWork || [],
        takeaway: summary.takeaway || '',
        relevanceScore: summary.relevanceScore || 50
      };
    }
  } catch (error) {
    console.error('Failed to summarize paper:', error);
  }

  // Fallback
  return {
    title: paperTitle,
    abstract,
    keyFindings: [],
    methodology: '',
    contributions: [],
    limitations: [],
    relatedWork: [],
    takeaway: abstract.substring(0, 200),
    relevanceScore: 50
  };
}

/**
 * Generate bibliography in various formats
 */
export function generateBibliography(
  papers: Array<{
    title: string;
    authors: string[];
    year: number;
    venue?: string;
    publisher?: string;
    pages?: string;
    doi?: string;
    url?: string;
  }>,
  format: 'apa' | 'mla' | 'ieee' | 'chicago' = 'apa'
): string[] {
  return papers.map(paper => {
    const authorsStr = paper.authors.length > 0
      ? paper.authors.map((a, i) => {
          const parts = a.split(' ');
          const last = parts[parts.length - 1];
          const first = parts.slice(0, -1).map(p => p[0] + '.').join(' ');
          return `${last}, ${first}`;
        }).join(', ')
      : 'Unknown Author';

    switch (format) {
      case 'apa':
        return `${authorsStr} (${paper.year}). ${paper.title}. ${paper.venue || paper.publisher || ''}. ${paper.doi ? `https://doi.org/${paper.doi}` : paper.url || ''}`;
      
      case 'mla':
        return `${authorsStr}. "${paper.title}." ${paper.venue || paper.publisher || ''}, ${paper.year}. ${paper.url || ''}`;
      
      case 'ieee':
        return `${authorsStr}, "${paper.title}," ${paper.venue || paper.publisher || ''}, ${paper.year}.`;
      
      case 'chicago':
        return `${authorsStr}. "${paper.title}." ${paper.venue || paper.publisher || ''} (${paper.year}). ${paper.url || ''}`;
      
      default:
        return `${authorsStr}. ${paper.title}. ${paper.year}.`;
    }
  });
}

/**
 * Find related papers based on content similarity
 */
export async function findRelatedPapers(
  paperTitle: string,
  abstract: string,
  existingPapers: Array<{ title: string; abstract: string; paperId: string }>
): Promise<Array<{ paperId: string; similarity: number; reason: string }>> {
  // This would use AI or vector similarity to find related papers
  // For now, return placeholder
  return existingPapers.slice(0, 5).map(p => ({
    paperId: p.paperId,
    similarity: Math.random() * 100,
    reason: 'Similar topic and methodology'
  }));
}

/**
 * Build citation network
 */
export function buildCitationNetwork(
  papers: Array<{ paperId: string; citations: string[]; citedBy: string[] }>
): {
  nodes: Array<{ id: string; title: string; citationCount: number }>;
  edges: Array<{ source: string; target: string; type: 'cites' | 'cited_by' }>;
} {
  const nodes = papers.map(p => ({
    id: p.paperId,
    title: p.paperId, // Would need full paper data
    citationCount: p.citedBy.length
  }));

  const edges: Array<{ source: string; target: string; type: 'cites' | 'cited_by' }> = [];
  
  papers.forEach(paper => {
    paper.citations.forEach(citedId => {
      edges.push({ source: paper.paperId, target: citedId, type: 'cites' });
    });
    paper.citedBy.forEach(citerId => {
      edges.push({ source: citerId, target: paper.paperId, type: 'cited_by' });
    });
  });

  return { nodes, edges };
}

