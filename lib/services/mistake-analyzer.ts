/**
 * Mistake Pattern Analyzer Service
 * Analyzes mistakes to identify patterns and provide insights
 */

import { createClient } from '@/lib/supabase/server';
import type { MistakeType, MistakePattern } from '@/lib/types';

export interface MistakeAnalysis {
  question_text: string;
  attempted_answer: string;
  correct_answer: string;
  topic: string;
  subject?: string;
  mistake_type?: MistakeType;
  time_spent_seconds?: number;
}

/**
 * Detect mistake type from analysis
 */
export function detectMistakeType(analysis: MistakeAnalysis): MistakeType {
  const { question_text, attempted_answer, correct_answer } = analysis;

  // Simple keyword-based detection - can be enhanced with AI
  const questionLower = question_text.toLowerCase();
  const attemptedLower = attempted_answer.toLowerCase();
  const correctLower = correct_answer.toLowerCase();

  // Calculation mistakes: numerical errors, formula errors
  if (
    /\d+/.test(question_text) &&
    /\d+/.test(attempted_answer) &&
    /\d+/.test(correct_answer)
  ) {
    // Check if numbers are different
    const attemptedNumbers = attempted_answer.match(/\d+/g) || [];
    const correctNumbers = correct_answer.match(/\d+/g) || [];
    
    if (attemptedNumbers.length > 0 && correctNumbers.length > 0) {
      return 'calculation';
    }
  }

  // Conceptual mistakes: fundamental misunderstanding
  if (
    questionLower.includes('explain') ||
    questionLower.includes('why') ||
    questionLower.includes('how does') ||
    questionLower.includes('concept')
  ) {
    return 'conceptual';
  }

  // Application mistakes: can't apply knowledge
  if (
    questionLower.includes('apply') ||
    questionLower.includes('use') ||
    questionLower.includes('solve using')
  ) {
    return 'application';
  }

  // Reading comprehension: didn't understand question
  if (
    attempted_answer.length < correct_answer.length * 0.5 ||
    attemptedLower.includes('not sure') ||
    attemptedLower.includes('i don\'t know')
  ) {
    return 'reading_comprehension';
  }

  // Time management: incomplete answer despite knowing concept
  if (analysis.time_spent_seconds && analysis.time_spent_seconds < 30) {
    return 'time_management';
  }

  return 'other';
}

/**
 * Record a mistake pattern
 */
export async function recordMistakePattern(
  studentId: string,
  analysis: MistakeAnalysis
): Promise<MistakePattern | null> {
  try {
    const supabase = await createClient();

    // Detect mistake type if not provided
    const mistakeType = analysis.mistake_type || detectMistakeType(analysis);

    // Check if pattern already exists
    const { data: existing } = await supabase
      .from('mistake_patterns')
      .select('*')
      .eq('student_id', studentId)
      .eq('topic', analysis.topic)
      .eq('mistake_type', mistakeType)
      .single();

    if (existing) {
      // Update frequency
      const { data, error } = await supabase
        .from('mistake_patterns')
        .update({
          frequency: existing.frequency + 1,
          last_occurred_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          pattern_data: {
            ...(existing.pattern_data || {}),
            last_question: analysis.question_text.substring(0, 200),
            last_attempted: analysis.attempted_answer.substring(0, 200),
            last_correct: analysis.correct_answer.substring(0, 200),
          },
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as MistakePattern;
    } else {
      // Create new pattern
      const { data, error } = await supabase
        .from('mistake_patterns')
        .insert({
          student_id: studentId,
          topic: analysis.topic,
          subject: analysis.subject || null,
          mistake_type: mistakeType,
          frequency: 1,
          last_occurred_at: new Date().toISOString(),
          pattern_data: {
            first_question: analysis.question_text.substring(0, 200),
            first_attempted: analysis.attempted_answer.substring(0, 200),
            first_correct: analysis.correct_answer.substring(0, 200),
          },
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as MistakePattern;
    }
  } catch (error) {
    console.error('Error recording mistake pattern:', error);
    return null;
  }
}

/**
 * Get all mistake patterns for a student
 */
export async function getMistakePatterns(
  studentId: string,
  topic?: string,
  subject?: string
): Promise<MistakePattern[]> {
  try {
    const supabase = await createClient();

    let query = supabase
      .from('mistake_patterns')
      .select('*')
      .eq('student_id', studentId)
      .order('frequency', { ascending: false });

    if (topic) {
      query = query.eq('topic', topic);
    }

    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []) as MistakePattern[];
  } catch (error) {
    console.error('Error getting mistake patterns:', error);
    return [];
  }
}

/**
 * Analyze mistake patterns to provide insights
 */
export async function analyzeMistakePatterns(
  studentId: string,
  topic?: string,
  subject?: string
): Promise<{
  patterns: MistakePattern[];
  most_common_type: MistakeType | null;
  most_common_topic: string | null;
  recommendations: string[];
  total_mistakes: number;
}> {
  const patterns = await getMistakePatterns(studentId, topic, subject);

  if (patterns.length === 0) {
    return {
      patterns: [],
      most_common_type: null,
      most_common_topic: null,
      recommendations: ['No mistake patterns detected yet. Keep practicing!'],
      total_mistakes: 0,
    };
  }

  // Find most common mistake type
  const typeFrequency: Record<MistakeType, number> = {} as Record<MistakeType, number>;
  patterns.forEach((pattern) => {
    typeFrequency[pattern.mistake_type] = 
      (typeFrequency[pattern.mistake_type] || 0) + pattern.frequency;
  });

  const mostCommonType = (Object.entries(typeFrequency) as [MistakeType, number][]).reduce(
    (max, [type, freq]) => (freq > (typeFrequency[max] || 0) ? type : max),
    patterns[0].mistake_type
  );

  // Find most common topic
  const topicFrequency: Record<string, number> = {};
  patterns.forEach((pattern) => {
    topicFrequency[pattern.topic] = 
      (topicFrequency[pattern.topic] || 0) + pattern.frequency;
  });

  const mostCommonTopic = Object.entries(topicFrequency).reduce(
    (max, [topic, freq]) => (freq > (topicFrequency[max] || 0) ? topic : max),
    patterns[0].topic
  );

  // Generate recommendations
  const recommendations: string[] = [];

  if (mostCommonType === 'calculation') {
    recommendations.push(
      'Focus on practicing calculations step-by-step. Check your work carefully.',
      'Consider using a calculator for verification on complex problems.'
    );
  } else if (mostCommonType === 'conceptual') {
    recommendations.push(
      'Review fundamental concepts for this topic. Understanding concepts is key.',
      'Try explaining the concept to someone else - teaching helps learning.'
    );
  } else if (mostCommonType === 'time_management') {
    recommendations.push(
      'Take more time to read and understand questions fully.',
      'Practice under timed conditions to improve speed without sacrificing accuracy.'
    );
  } else if (mostCommonType === 'reading_comprehension') {
    recommendations.push(
      'Read questions carefully. Underline key terms and requirements.',
      'Practice identifying what the question is really asking for.'
    );
  } else if (mostCommonType === 'application') {
    recommendations.push(
      'Practice applying concepts to different problem types.',
      'Try solving similar problems with variations to build application skills.'
    );
  }

  if (mostCommonTopic) {
    recommendations.push(
      `Focus extra practice on "${mostCommonTopic}" - this is your most common mistake area.`
    );
  }

  const totalMistakes = patterns.reduce((sum, p) => sum + p.frequency, 0);

  return {
    patterns,
    most_common_type: mostCommonType,
    most_common_topic: mostCommonTopic,
    recommendations,
    total_mistakes: totalMistakes,
  };
}

