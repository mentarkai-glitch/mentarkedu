/**
 * Adaptive Learning System
 * Adjusts learning paths based on performance, learning style, and mastery
 */

import { aiOrchestrator } from '@/lib/ai/orchestrator';
import type { AIContext } from '@/lib/types';

export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading' | 'mixed';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface LearningNode {
  id: string;
  topic: string;
  description: string;
  difficulty: DifficultyLevel;
  prerequisites: string[]; // Node IDs
  estimatedTime: number; // Minutes
  resources: {
    videos?: string[];
    articles?: string[];
    exercises?: string[];
    interactive?: string[];
  };
  masteryThreshold: number; // 0-100, required to proceed
}

export interface PerformanceData {
  nodeId: string;
  attempts: number;
  correctAnswers: number;
  timeSpent: number; // Minutes
  lastAttempt?: Date;
  masteryLevel: number; // 0-100
}

export interface AdaptivePath {
  nodes: LearningNode[];
  currentIndex: number;
  recommendedNext: string[]; // Node IDs
  estimatedCompletion: Date;
  difficultyAdjustment: number; // -1 to 1, adjusts difficulty
}

/**
 * Analyze learning style from behavior
 */
export function analyzeLearningStyle(
  performanceData: PerformanceData[],
  resourceUsage: { videos: number; articles: number; exercises: number; interactive: number }
): LearningStyle {
  // Count resource type usage
  const total = resourceUsage.videos + resourceUsage.articles + resourceUsage.exercises + resourceUsage.interactive;
  
  if (total === 0) return 'mixed';
  
  const videoRatio = resourceUsage.videos / total;
  const articleRatio = resourceUsage.articles / total;
  const exerciseRatio = resourceUsage.exercises / total;
  const interactiveRatio = resourceUsage.interactive / total;
  
  // Determine dominant style
  if (videoRatio > 0.4) return 'visual';
  if (articleRatio > 0.4) return 'reading';
  if (exerciseRatio > 0.4) return 'kinesthetic';
  if (interactiveRatio > 0.4) return 'visual';
  
  return 'mixed';
}

/**
 * Adjust difficulty based on performance
 */
export function adjustDifficulty(
  currentDifficulty: DifficultyLevel,
  performance: PerformanceData,
  targetMastery: number = 80
): DifficultyLevel {
  const mastery = performance.masteryLevel;
  const attempts = performance.attempts;
  
  // If mastery is high and attempts are low, increase difficulty
  if (mastery >= targetMastery && attempts <= 2) {
    if (currentDifficulty === 'beginner') return 'intermediate';
    if (currentDifficulty === 'intermediate') return 'advanced';
  }
  
  // If mastery is low after many attempts, decrease difficulty
  if (mastery < targetMastery - 20 && attempts >= 5) {
    if (currentDifficulty === 'advanced') return 'intermediate';
    if (currentDifficulty === 'intermediate') return 'beginner';
  }
  
  return currentDifficulty;
}

/**
 * Generate adaptive learning path using AI
 */
export async function generateAdaptivePath(
  goal: string,
  currentKnowledge: string[],
  learningStyle: LearningStyle,
  performanceHistory: PerformanceData[],
  userId?: string
): Promise<AdaptivePath> {
  try {
    const prompt = `Create an adaptive learning path for a student with the following profile:

Goal: ${goal}
Current Knowledge: ${currentKnowledge.join(', ') || 'None'}
Learning Style: ${learningStyle}
Performance History: ${JSON.stringify(performanceHistory.slice(-10), null, 2)}

Generate a personalized learning path with:
1. 5-8 learning nodes (topics/concepts)
2. Each node should have:
   - Topic name
   - Description
   - Difficulty level (beginner/intermediate/advanced)
   - Prerequisites (which nodes must be completed first)
   - Estimated time in minutes
   - Resource recommendations (videos, articles, exercises, interactive)
   - Mastery threshold (0-100)

Return as JSON array:
[
  {
    "id": "node-1",
    "topic": "Topic Name",
    "description": "Description",
    "difficulty": "beginner",
    "prerequisites": [],
    "estimatedTime": 60,
    "resources": {
      "videos": ["url1", "url2"],
      "articles": ["url1"],
      "exercises": ["url1"],
      "interactive": []
    },
    "masteryThreshold": 80
  },
  ...
]

Ensure prerequisites form a valid DAG (no circular dependencies).`;

    const context: AIContext = {
      task: 'roadmap',
      user_id: userId,
      metadata: { user_tier: 'free' }
    };

    const response = await aiOrchestrator(context, prompt);
    
    // Parse JSON response
    const jsonMatch = response.content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const nodes = JSON.parse(jsonMatch[0]) as LearningNode[];
      
      // Validate and build path
      const path: AdaptivePath = {
        nodes,
        currentIndex: 0,
        recommendedNext: getRecommendedNext(nodes, performanceHistory),
        estimatedCompletion: calculateEstimatedCompletion(nodes, performanceHistory),
        difficultyAdjustment: calculateDifficultyAdjustment(performanceHistory)
      };
      
      return path;
    }
    
    throw new Error('Failed to parse learning path from AI response');
  } catch (error) {
    console.error('Error generating adaptive path:', error);
    throw error;
  }
}

/**
 * Get recommended next nodes based on prerequisites and performance
 */
function getRecommendedNext(
  nodes: LearningNode[],
  performanceHistory: PerformanceData[]
): string[] {
  const completed = new Set(performanceHistory
    .filter(p => p.masteryLevel >= 80)
    .map(p => p.nodeId)
  );
  
  return nodes
    .filter(node => {
      // All prerequisites completed
      return node.prerequisites.every(prereq => completed.has(prereq));
    })
    .filter(node => !completed.has(node.id))
    .map(node => node.id);
}

/**
 * Calculate estimated completion date
 */
function calculateEstimatedCompletion(
  nodes: LearningNode[],
  performanceHistory: PerformanceData[]
): Date {
  const avgTimePerNode = performanceHistory.length > 0
    ? performanceHistory.reduce((sum, p) => sum + p.timeSpent, 0) / performanceHistory.length
    : 60; // Default 60 minutes
  
  const remainingNodes = nodes.length - performanceHistory.length;
  const totalMinutes = remainingNodes * avgTimePerNode;
  
  const completion = new Date();
  completion.setMinutes(completion.getMinutes() + totalMinutes);
  
  return completion;
}

/**
 * Calculate difficulty adjustment factor
 */
function calculateDifficultyAdjustment(performanceHistory: PerformanceData[]): number {
  if (performanceHistory.length === 0) return 0;
  
  const avgMastery = performanceHistory.reduce((sum, p) => sum + p.masteryLevel, 0) / performanceHistory.length;
  
  // If average mastery is high, can increase difficulty (positive adjustment)
  // If average mastery is low, should decrease difficulty (negative adjustment)
  return (avgMastery - 70) / 30; // Normalize to -1 to 1 range
}

/**
 * Recommend content based on learning style
 */
export function recommendContent(
  node: LearningNode,
  learningStyle: LearningStyle
): { type: string; url: string; priority: number }[] {
  const recommendations: { type: string; url: string; priority: number }[] = [];
  
  // Prioritize resources based on learning style
  if (learningStyle === 'visual' || learningStyle === 'mixed') {
    node.resources.videos?.forEach(url => {
      recommendations.push({ type: 'video', url, priority: learningStyle === 'visual' ? 5 : 3 });
    });
    node.resources.interactive?.forEach(url => {
      recommendations.push({ type: 'interactive', url, priority: 4 });
    });
  }
  
  if (learningStyle === 'reading' || learningStyle === 'mixed') {
    node.resources.articles?.forEach(url => {
      recommendations.push({ type: 'article', url, priority: learningStyle === 'reading' ? 5 : 3 });
    });
  }
  
  if (learningStyle === 'kinesthetic' || learningStyle === 'mixed') {
    node.resources.exercises?.forEach(url => {
      recommendations.push({ type: 'exercise', url, priority: learningStyle === 'kinesthetic' ? 5 : 3 });
    });
  }
  
  // Sort by priority
  return recommendations.sort((a, b) => b.priority - a.priority);
}


