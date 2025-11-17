import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse, handleApiError } from '@/lib/utils/api-helpers';
import { 
  createCard, 
  calculateNextReview, 
  getDueCards, 
  getCardsByMastery,
  generateFlashcards,
  type Card 
} from '@/lib/services/spaced-repetition';
import { aiOrchestrator } from '@/lib/ai/orchestrator';
import type { AIContext } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const dueOnly = searchParams.get('dueOnly') === 'true';

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    // Get flashcards from database (would need a flashcards table)
    // For now, return empty or generate from topic
    if (topic) {
      // Generate flashcards for topic
      const cards = await generateFlashcardsFromTopic(topic, user.id);
      
      if (dueOnly) {
        const due = getDueCards(cards);
        return successResponse({ cards: due, total: cards.length, due: due.length });
      }
      
      const mastery = getCardsByMastery(cards);
      return successResponse({ cards, mastery, total: cards.length });
    }

    return successResponse({ cards: [], total: 0 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { action, cardId, quality, topic, content } = body;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    if (action === 'review' && cardId && quality !== undefined) {
      // Review a card
      // In production, would fetch card from database
      const card: Card = {
        id: cardId,
        front: 'Question',
        back: 'Answer',
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
        nextReview: new Date(),
        quality: 0
      };
      
      const result = calculateNextReview(card, quality);
      
      // Save review result to database (would need flashcards table)
      // await supabase.from('flashcards').update({ ...result.card }).eq('id', cardId);
      
      return successResponse({ review: result });
    }

    if (action === 'generate' && topic && content) {
      // Generate flashcards from content
      const cards = await generateFlashcardsFromContent(content, topic, user.id);
      return successResponse({ cards, count: cards.length });
    }

    return errorResponse('Invalid action', 400);
  } catch (error) {
    return handleApiError(error);
  }
}

async function generateFlashcardsFromTopic(topic: string, userId: string): Promise<Card[]> {
  try {
    const prompt = `Generate 10 high-quality flashcards for the topic: "${topic}"

Each flashcard should have:
- Front: A clear question or prompt
- Back: A concise, accurate answer

Return as JSON array:
[
  {
    "front": "Question here",
    "back": "Answer here"
  },
  ...
]`;

    const context: AIContext = {
      task: 'mentor_chat',
      user_id: userId,
      metadata: { user_tier: 'free' }
    };

    const response = await aiOrchestrator(context, prompt);
    
    // Parse JSON
    const jsonMatch = response.content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const flashcards = JSON.parse(jsonMatch[0]);
      return flashcards.map((fc: any, idx: number) => 
        createCard(`card-${topic}-${idx}`, fc.front, fc.back)
      );
    }
    
    return [];
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return [];
  }
}

async function generateFlashcardsFromContent(content: string, topic: string, userId: string): Promise<Card[]> {
  try {
    const prompt = `Generate flashcards from this content about "${topic}":

${content.substring(0, 2000)}

Create 8-12 flashcards covering key concepts. Return as JSON array:
[
  {
    "front": "Question",
    "back": "Answer"
  },
  ...
]`;

    const context: AIContext = {
      task: 'mentor_chat',
      user_id: userId,
      metadata: { user_tier: 'free' }
    };

    const response = await aiOrchestrator(context, prompt);
    
    const jsonMatch = response.content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const flashcards = JSON.parse(jsonMatch[0]);
      return flashcards.map((fc: any, idx: number) => 
        createCard(`card-${topic}-${idx}`, fc.front, fc.back)
      );
    }
    
    return [];
  } catch (error) {
    console.error('Error generating flashcards from content:', error);
    return [];
  }
}


