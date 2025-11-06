/**
 * Context Analyzer for AI Orchestration
 * 
 * This module analyzes user prompts and computational context to determine:
 * - Complexity level
 * - Emotional content
 * - Required features
 * - Performance requirements
 */

import type { AIContext } from '@/lib/types';

export interface ContextAnalysis {
  complexity: number; // 0-10
  emotionalContent: number; // 0-10
  lengthEstimate: number; // tokens
  requiresReasoning: boolean;
  requiresCreativity: boolean;
  requiresEmpathy: boolean;
  requiresResearch: boolean;
  requiresPlanning: boolean;
  urgency: 'low' | 'medium' | 'high';
  userTier: 'free' | 'premium' | 'enterprise';
  domain: string; // 'academic', 'career', 'personal', 'technical', 'creative'
  language: string; // detected language
  hasImages: boolean;
  hasCode: boolean;
  hasMath: boolean;
  hasPersonalInfo: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface ModelRequirements {
  maxCost?: number;
  maxLatency?: number;
  minQuality?: number;
  requireMultimodal?: boolean;
  preferredFeatures?: string[];
  excludeModels?: AIModel[];
  userTier?: 'free' | 'premium' | 'enterprise';
}

/**
 * Analyze the context of a user prompt to determine requirements
 */
export function analyzeContext(prompt: string, context: AIContext): ContextAnalysis {
  const analysis: ContextAnalysis = {
    complexity: 0,
    emotionalContent: 0,
    lengthEstimate: 0,
    requiresReasoning: false,
    requiresCreativity: false,
    requiresEmpathy: false,
    requiresResearch: false,
    requiresPlanning: false,
    urgency: 'medium',
    userTier: 'free',
    domain: 'general',
    language: 'en',
    hasImages: false,
    hasCode: false,
    hasMath: false,
    hasPersonalInfo: false,
    sentiment: 'neutral'
  };

  // Estimate token length
  analysis.lengthEstimate = estimateTokens(prompt + (context.metadata?.system_prompt || ''));

  // Analyze complexity
  analysis.complexity = analyzeComplexity(prompt);

  // Analyze emotional content
  analysis.emotionalContent = analyzeEmotionalContent(prompt);

  // Analyze required features
  analysis.requiresReasoning = detectReasoningRequirement(prompt);
  analysis.requiresCreativity = detectCreativityRequirement(prompt);
  analysis.requiresEmpathy = detectEmpathyRequirement(prompt);
  analysis.requiresResearch = detectResearchRequirement(prompt);
  analysis.requiresPlanning = detectPlanningRequirement(prompt);

  // Analyze urgency
  analysis.urgency = analyzeUrgency(prompt, context);

  // Determine user tier
  analysis.userTier = context.metadata?.userTier || 'free';

  // Analyze domain
  analysis.domain = analyzeDomain(prompt);

  // Detect language
  analysis.language = detectLanguage(prompt);

  // Analyze content type
  analysis.hasImages = detectImages(prompt);
  analysis.hasCode = detectCode(prompt);
  analysis.hasMath = detectMath(prompt);
  analysis.hasPersonalInfo = detectPersonalInfo(prompt);

  // Analyze sentiment
  analysis.sentiment = analyzeSentiment(prompt);

  return analysis;
}

/**
 * Analyze complexity based on prompt content
 */
function analyzeComplexity(prompt: string): number {
  let complexity = 0;
  const text = prompt.toLowerCase();

  // Word count factor (0-3 points)
  const wordCount = prompt.split(' ').length;
  if (wordCount > 200) complexity += 3;
  else if (wordCount > 100) complexity += 2;
  else if (wordCount > 50) complexity += 1;

  // Complex keywords (0-4 points)
  const complexKeywords = [
    'strategy', 'plan', 'analyze', 'predict', 'calculate', 'solve', 'design',
    'implement', 'optimize', 'evaluate', 'compare', 'contrast', 'synthesize',
    'integrate', 'develop', 'create', 'build', 'construct', 'formulate'
  ];
  
  const complexMatches = complexKeywords.filter(keyword => text.includes(keyword));
  complexity += Math.min(4, complexMatches.length);

  // Question complexity (0-3 points)
  const questionWords = ['why', 'how', 'what', 'when', 'where', 'which'];
  const questionCount = questionWords.filter(word => text.includes(word)).length;
  complexity += Math.min(3, questionCount);

  return Math.min(10, complexity);
}

/**
 * Analyze emotional content in the prompt
 */
function analyzeEmotionalContent(prompt: string): number {
  let emotionalScore = 0;
  const text = prompt.toLowerCase();

  // Emotional keywords (0-6 points)
  const emotionalKeywords = [
    'feel', 'emotion', 'stress', 'anxiety', 'happy', 'sad', 'worried', 'excited',
    'scared', 'afraid', 'frustrated', 'angry', 'depressed', 'lonely', 'confused',
    'overwhelmed', 'motivated', 'inspired', 'hopeful', 'disappointed', 'proud'
  ];
  
  const emotionalMatches = emotionalKeywords.filter(keyword => text.includes(keyword));
  emotionalScore += Math.min(6, emotionalMatches.length);

  // Personal pronouns (0-2 points)
  const personalPronouns = ['i', 'me', 'my', 'myself', 'we', 'us', 'our'];
  const pronounCount = personalPronouns.filter(pronoun => text.includes(pronoun)).length;
  emotionalScore += Math.min(2, pronounCount);

  // Exclamation marks and question marks (0-2 points)
  const exclamationCount = (prompt.match(/!/g) || []).length;
  const questionCount = (prompt.match(/\?/g) || []).length;
  emotionalScore += Math.min(2, exclamationCount + questionCount);

  return Math.min(10, emotionalScore);
}

/**
 * Detect if the prompt requires reasoning
 */
function detectReasoningRequirement(prompt: string): boolean {
  const text = prompt.toLowerCase();
  const reasoningKeywords = [
    'why', 'how', 'explain', 'because', 'reason', 'logic', 'cause', 'effect',
    'analyze', 'evaluate', 'compare', 'contrast', 'deduce', 'infer', 'conclude'
  ];
  
  return reasoningKeywords.some(keyword => text.includes(keyword));
}

/**
 * Detect if the prompt requires creativity
 */
function detectCreativityRequirement(prompt: string): boolean {
  const text = prompt.toLowerCase();
  const creativityKeywords = [
    'create', 'design', 'imagine', 'generate', 'build', 'make', 'develop',
    'innovate', 'invent', 'brainstorm', 'creative', 'artistic', 'original',
    'unique', 'novel', 'story', 'write', 'compose', 'draw', 'paint'
  ];
  
  return creativityKeywords.some(keyword => text.includes(keyword));
}

/**
 * Detect if the prompt requires empathy
 */
function detectEmpathyRequirement(prompt: string): boolean {
  const text = prompt.toLowerCase();
  const empathyKeywords = [
    'help', 'support', 'understand', 'listen', 'care', 'feel', 'emotion',
    'advice', 'guidance', 'comfort', 'encourage', 'motivate', 'inspire',
    'relationship', 'friendship', 'family', 'love', 'trust', 'empathy'
  ];
  
  return empathyKeywords.some(keyword => text.includes(keyword));
}

/**
 * Detect if the prompt requires research
 */
function detectResearchRequirement(prompt: string): boolean {
  const text = prompt.toLowerCase();
  const researchKeywords = [
    'research', 'find', 'search', 'investigate', 'explore', 'discover',
    'information', 'data', 'facts', 'evidence', 'study', 'survey',
    'latest', 'current', 'recent', 'news', 'trends', 'statistics'
  ];
  
  return researchKeywords.some(keyword => text.includes(keyword));
}

/**
 * Detect if the prompt requires planning
 */
function detectPlanningRequirement(prompt: string): boolean {
  const text = prompt.toLowerCase();
  const planningKeywords = [
    'plan', 'strategy', 'roadmap', 'timeline', 'schedule', 'organize',
    'structure', 'framework', 'approach', 'method', 'process', 'steps',
    'goals', 'objectives', 'milestones', 'deadline', 'project'
  ];
  
  return planningKeywords.some(keyword => text.includes(keyword));
}

/**
 * Analyze urgency based on prompt and context
 */
function analyzeUrgency(prompt: string, context: AIContext): 'low' | 'medium' | 'high' {
  const text = prompt.toLowerCase();
  
  // High urgency keywords
  const urgentKeywords = ['urgent', 'asap', 'immediately', 'emergency', 'crisis', 'deadline'];
  if (urgentKeywords.some(keyword => text.includes(keyword))) {
    return 'high';
  }
  
  // Medium urgency keywords
  const mediumKeywords = ['soon', 'quickly', 'fast', 'important', 'priority'];
  if (mediumKeywords.some(keyword => text.includes(keyword))) {
    return 'medium';
  }
  
  // Check context metadata
  if (context.metadata?.urgent) {
    return 'high';
  }
  
  return 'medium';
}

/**
 * Analyze the domain of the prompt
 */
function analyzeDomain(prompt: string): string {
  const text = prompt.toLowerCase();
  
  // Academic domain
  const academicKeywords = ['study', 'learn', 'education', 'school', 'college', 'university', 'course', 'exam', 'test', 'homework', 'assignment'];
  if (academicKeywords.some(keyword => text.includes(keyword))) {
    return 'academic';
  }
  
  // Career domain
  const careerKeywords = ['job', 'career', 'work', 'interview', 'resume', 'skills', 'professional', 'industry', 'company', 'business'];
  if (careerKeywords.some(keyword => text.includes(keyword))) {
    return 'career';
  }
  
  // Technical domain
  const technicalKeywords = ['code', 'programming', 'software', 'technology', 'computer', 'algorithm', 'database', 'api', 'development'];
  if (technicalKeywords.some(keyword => text.includes(keyword))) {
    return 'technical';
  }
  
  // Creative domain
  const creativeKeywords = ['art', 'design', 'creative', 'music', 'writing', 'story', 'poetry', 'painting', 'drawing', 'photography'];
  if (creativeKeywords.some(keyword => text.includes(keyword))) {
    return 'creative';
  }
  
  // Personal domain
  const personalKeywords = ['personal', 'relationship', 'family', 'health', 'fitness', 'hobby', 'interest', 'lifestyle'];
  if (personalKeywords.some(keyword => text.includes(keyword))) {
    return 'personal';
  }
  
  return 'general';
}

/**
 * Detect language of the prompt
 */
function detectLanguage(prompt: string): string {
  // Simple language detection based on common words
  const text = prompt.toLowerCase();
  
  // English indicators
  const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const englishCount = englishWords.filter(word => text.includes(word)).length;
  
  if (englishCount >= 3) {
    return 'en';
  }
  
  // Add more language detection logic here
  return 'en'; // Default to English
}

/**
 * Detect if prompt contains image references
 */
function detectImages(prompt: string): boolean {
  const text = prompt.toLowerCase();
  const imageKeywords = ['image', 'picture', 'photo', 'screenshot', 'visual', 'see', 'look', 'show', 'display'];
  
  return imageKeywords.some(keyword => text.includes(keyword));
}

/**
 * Detect if prompt contains code
 */
function detectCode(prompt: string): boolean {
  const text = prompt.toLowerCase();
  const codeKeywords = ['code', 'function', 'variable', 'class', 'method', 'api', 'sql', 'javascript', 'python', 'java'];
  
  return codeKeywords.some(keyword => text.includes(keyword)) || 
         /[{}();=<>]/.test(prompt) || // Common code symbols
         /^[a-zA-Z_][a-zA-Z0-9_]*\s*[=<>]/.test(prompt); // Variable assignments
}

/**
 * Detect if prompt contains math
 */
function detectMath(prompt: string): boolean {
  const mathKeywords = ['calculate', 'equation', 'formula', 'solve', 'math', 'algebra', 'geometry', 'statistics', 'probability'];
  
  return mathKeywords.some(keyword => prompt.toLowerCase().includes(keyword)) ||
         /[+\-*/=<>(){}[\]]/.test(prompt) || // Math symbols
         /\d+\s*[+\-*/]\s*\d+/.test(prompt); // Basic math expressions
}

/**
 * Detect if prompt contains personal information
 */
function detectPersonalInfo(prompt: string): boolean {
  const text = prompt.toLowerCase();
  const personalKeywords = ['my name', 'i am', 'i live', 'my age', 'my phone', 'my email', 'my address', 'personal', 'private'];
  
  return personalKeywords.some(keyword => text.includes(keyword));
}

/**
 * Analyze sentiment of the prompt
 */
function analyzeSentiment(prompt: string): 'positive' | 'neutral' | 'negative' {
  const text = prompt.toLowerCase();
  
  // Positive keywords
  const positiveKeywords = ['happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic', 'love', 'like', 'enjoy', 'excited'];
  const positiveCount = positiveKeywords.filter(keyword => text.includes(keyword)).length;
  
  // Negative keywords
  const negativeKeywords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'frustrated', 'disappointed', 'worried', 'scared'];
  const negativeCount = negativeKeywords.filter(keyword => text.includes(keyword)).length;
  
  if (positiveCount > negativeCount) {
    return 'positive';
  } else if (negativeCount > positiveCount) {
    return 'negative';
  }
  
  return 'neutral';
}

/**
 * Determine model requirements based on context analysis
 */
export function determineRequirements(analysis: ContextAnalysis): ModelRequirements {
  const requirements: ModelRequirements = {
    userTier: analysis.userTier
  };
  
  // High complexity needs high quality
  if (analysis.complexity > 7) {
    requirements.minQuality = 90;
  } else if (analysis.complexity > 4) {
    requirements.minQuality = 80;
  } else {
    requirements.minQuality = 70;
  }
  
  // Emotional content needs empathy specialist
  if (analysis.emotionalContent > 6) {
    requirements.preferredFeatures = ['empathy'];
  }
  
  // Reasoning tasks need reasoning models
  if (analysis.requiresReasoning) {
    requirements.preferredFeatures = requirements.preferredFeatures || [];
    requirements.preferredFeatures.push('reasoning');
  }
  
  // Creative tasks need creativity
  if (analysis.requiresCreativity) {
    requirements.preferredFeatures = requirements.preferredFeatures || [];
    requirements.preferredFeatures.push('creativity');
  }
  
  // Research tasks need research capabilities
  if (analysis.requiresResearch) {
    requirements.preferredFeatures = requirements.preferredFeatures || [];
    requirements.preferredFeatures.push('research');
  }
  
  // Planning tasks need planning capabilities
  if (analysis.requiresPlanning) {
    requirements.preferredFeatures = requirements.preferredFeatures || [];
    requirements.preferredFeatures.push('planning');
  }
  
  // Free tier gets cost-optimized
  if (analysis.userTier === 'free') {
    requirements.maxCost = 0.000005; // Use cheaper models
  } else if (analysis.userTier === 'premium') {
    requirements.maxCost = 0.000015; // Balanced cost and quality
  }
  // Enterprise tier has no cost limit
  
  // Urgent requests need speed
  if (analysis.urgency === 'high') {
    requirements.maxLatency = 2000; // 2 seconds max
  } else if (analysis.urgency === 'medium') {
    requirements.maxLatency = 5000; // 5 seconds max
  }
  
  // Multimodal requirements
  if (analysis.hasImages) {
    requirements.requireMultimodal = true;
  }
  
  return requirements;
}

/**
 * Estimate token count for a given text
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token for English text
  // This is a simplified estimation - in production, you'd use a proper tokenizer
  return Math.ceil(text.length / 4);
}

/**
 * Get a summary of the context analysis for logging
 */
export function getAnalysisSummary(analysis: ContextAnalysis): string {
  const features = [];
  if (analysis.requiresReasoning) features.push('reasoning');
  if (analysis.requiresCreativity) features.push('creativity');
  if (analysis.requiresEmpathy) features.push('empathy');
  if (analysis.requiresResearch) features.push('research');
  if (analysis.requiresPlanning) features.push('planning');
  
  return `Complexity: ${analysis.complexity}/10, Emotional: ${analysis.emotionalContent}/10, Domain: ${analysis.domain}, Features: [${features.join(', ')}], Urgency: ${analysis.urgency}`;
}
