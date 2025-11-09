/**
 * ARK Assistant API
 * AI-powered conversational help for ARK creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { aiOrchestrator } from '@/lib/ai/orchestrator';
import type { ChatContext } from '@/lib/stores/ark-chat-store';
import type { AIContext } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context, conversationHistory } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get current user for context
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Build context string for AI
    const contextString = buildContextString(context, conversationHistory);

    // Generate AI response
    const response = await generateAssistantResponse(
      message,
      contextString,
      context,
      conversationHistory || [],
      user?.id
    );

    return NextResponse.json({
      success: true,
      data: {
        response: response.text,
        suggestions: response.suggestions
      }
    });

  } catch (error) {
    console.error('ARK Assistant API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

/**
 * Build context string for AI prompt
 */
function buildContextString(
  context: ChatContext,
  conversationHistory: any[]
): string {
  let contextStr = 'You are Mentark, a helpful AI mentor guiding a student through creating their personalized ARK (Adaptive Roadmap of Knowledge).\n\n';

  if (context.categoryId) {
    const categoryNames: Record<string, string> = {
      academic_excellence: 'Academic Excellence',
      career_preparation: 'Career Preparation',
      personal_development: 'Personal Development',
      emotional_wellbeing: 'Emotional Wellbeing',
      social_relationships: 'Social & Relationships',
      life_skills: 'Life Skills'
    };
    contextStr += `Category: ${categoryNames[context.categoryId] || context.categoryId}\n`;
  }

  if (context.currentStep) {
    contextStr += `Current Step: ${context.currentStep}\n`;
  }

  if (context.studentLocation) {
    contextStr += `Student Location: ${context.studentLocation}\n`;
    contextStr += `Always ground recommendations in Indian context, with examples relevant to ${context.studentLocation}.\n`;
  } else {
    contextStr += "Student Location: India\n";
    contextStr += "Ground recommendations in Indian education realities (state boards, entrance exams, budgets).\n";
  }

  if (context.userAnswers && Object.keys(context.userAnswers).length > 0) {
    contextStr += `\nUser has already provided:\n`;
    Object.entries(context.userAnswers).forEach(([key, value]) => {
      if (value) {
        contextStr += `- ${key}: ${JSON.stringify(value)}\n`;
      }
    });
  }

  if (conversationHistory && conversationHistory.length > 0) {
    contextStr += `\nRecent conversation:\n`;
    conversationHistory.forEach((msg: any) => {
      contextStr += `${msg.role === 'user' ? 'Student' : 'Mentark'}: ${msg.content}\n`;
    });
  }

  contextStr += `\nInstructions:\n`;
  contextStr += `- Be conversational and friendly\n`;
  contextStr += `- Keep responses concise (2-4 sentences)\n`;
  contextStr += `- Suggest specific fields to fill if relevant\n`;
  contextStr += `- Ask clarifying questions if the goal is vague\n`;
  contextStr += `- If the user seems confused, offer examples\n`;
  contextStr += `- Always be encouraging and supportive\n`;

  return contextStr;
}

/**
 * Generate AI assistant response
 */
async function generateAssistantResponse(
  userMessage: string,
  contextString: string,
  context: ChatContext,
  history: any[],
  userId?: string
): Promise<{ text: string; suggestions?: any[] }> {
  try {
    // Use Claude for conversational context
    const prompt = `${contextString}\n\nStudent: ${userMessage}\n\nMentark:`;

    // Call AI orchestrator
    const aiContext: AIContext = {
      task: 'mentor_chat',
      user_id: userId,
      metadata: {
        model: 'claude-sonnet-4-5-20250929',
        temperature: 0.7,
        maxTokens: 200
      }
    };
    const response = await aiOrchestrator(aiContext, prompt);

    // Try to extract suggestions from response
    const suggestions = extractFieldSuggestions(userMessage, context);

    return {
      text: response.content || 'I apologize, but I couldn\'t process that. Could you rephrase?',
      suggestions
    };

  } catch (error) {
    console.error('Error generating assistant response:', error);
    return {
      text: 'I\'m having trouble right now. Let me try asking a different question to help you move forward.'
    };
  }
}

/**
 * Extract field suggestions from user message
 */
function extractFieldSuggestions(
  message: string,
  context: ChatContext
): any[] {
  const suggestions: any[] = [];
  const lowerMessage = message.toLowerCase();

  // Simple keyword matching for now (can be enhanced with AI)
  if (context.categoryId === 'academic_excellence') {
    // Exam mentions
    if (lowerMessage.includes('jee')) {
      suggestions.push({
        fieldId: 'target_exam',
        fieldName: 'Target Exam',
        suggestedValue: 'JEE Main',
        confidence: 0.8
      });
    }
    if (lowerMessage.includes('neet')) {
      suggestions.push({
        fieldId: 'target_exam',
        fieldName: 'Target Exam',
        suggestedValue: 'NEET',
        confidence: 0.8
      });
    }
    // Subject mentions
    ['math', 'physics', 'chemistry', 'biology'].forEach(subject => {
      if (lowerMessage.includes(subject)) {
        suggestions.push({
          fieldId: 'target_subjects',
          fieldName: 'Target Subjects',
          suggestedValue: subject.charAt(0).toUpperCase() + subject.slice(1),
          confidence: 0.7
        });
      }
    });
  }

  return suggestions;
}

