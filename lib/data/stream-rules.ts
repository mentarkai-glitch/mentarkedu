/**
 * Demo Path Finder - Stream Determination Rules
 * Deterministic logic to map traits and answers to best-fit stream
 */

export type Stream = 'Science (PCM)' | 'Science (PCB)' | 'Commerce' | 'Arts' | 'Vocational' | 'Design';

export type Trait = 'logical' | 'creative' | 'people' | 'hands-on' | 'leader' | 'disciplined';

export interface StreamResult {
  stream: Stream;
  confidence: 'High' | 'Medium' | 'Low';
  reasoning: string;
}

export interface TraitScores {
  logical: number;
  creative: number;
  people: number;
  'hands-on': number;
  leader: number;
  disciplined: number;
}

/**
 * Determine best-fit stream based on trait scores and other factors
 */
export function determineStream(
  traitScores: TraitScores,
  studyTolerance: number,
  financialConstraint: boolean
): StreamResult {
  const { logical, creative, people, 'hands-on': handsOn, leader, disciplined } = traitScores;
  
  // Calculate dominant traits (top 2)
  const traitEntries = Object.entries(traitScores) as [Trait, number][];
  const sortedTraits = traitEntries.sort((a, b) => b[1] - a[1]);
  const topTraits = sortedTraits.slice(0, 2).map(([trait]) => trait);
  
  // Rule 1: Science (PCM) - Logical + High study tolerance
  if (logical >= 3 && studyTolerance >= 7 && disciplined >= 2) {
    return {
      stream: 'Science (PCM)',
      confidence: logical >= 4 && studyTolerance >= 8 ? 'High' : 'Medium',
      reasoning: "Because you enjoy solving problems and can handle long study sessions."
    };
  }
  
  // Rule 2: Science (PCB) - Logical + People-oriented + High study tolerance
  if (logical >= 2 && people >= 2 && studyTolerance >= 6) {
    return {
      stream: 'Science (PCB)',
      confidence: logical >= 3 && people >= 3 ? 'High' : 'Medium',
      reasoning: "Because you combine logical thinking with helping people, perfect for medical and life sciences."
    };
  }
  
  // Rule 3: Commerce - People + Leader + Financial constraint consideration
  if ((people >= 2 || leader >= 2) && (financialConstraint || logical >= 2)) {
    return {
      stream: 'Commerce',
      confidence: (people >= 3 || leader >= 3) ? 'High' : 'Medium',
      reasoning: "Because you enjoy business, organizing, and working with people."
    };
  }
  
  // Rule 4: Design/Arts - Creative + Prefers creative freedom
  if (creative >= 3) {
    return {
      stream: 'Design',
      confidence: creative >= 4 ? 'High' : 'Medium',
      reasoning: "Because you prefer creative freedom and enjoy creating art and design."
    };
  }
  
  // Rule 5: Arts - Creative + People-oriented
  if (creative >= 2 && people >= 2) {
    return {
      stream: 'Arts',
      confidence: creative >= 3 && people >= 3 ? 'High' : 'Medium',
      reasoning: "Because you combine creativity with helping and connecting with people."
    };
  }
  
  // Rule 6: Vocational - Hands-on + Lower study tolerance + Financial constraint
  if (handsOn >= 3 && studyTolerance <= 5 && financialConstraint) {
    return {
      stream: 'Vocational',
      confidence: handsOn >= 4 ? 'High' : 'Medium',
      reasoning: "Because you prefer hands-on learning and practical skills."
    };
  }
  
  // Default fallback based on top trait
  const topTrait = topTraits[0];
  if (topTrait === 'logical' && studyTolerance >= 6) {
    return {
      stream: 'Science (PCM)',
      confidence: 'Medium',
      reasoning: "Based on your logical thinking preference."
    };
  }
  
  if (topTrait === 'creative') {
    return {
      stream: 'Design',
      confidence: 'Medium',
      reasoning: "Based on your creative strengths."
    };
  }
  
  if (topTrait === 'people' || topTrait === 'leader') {
    return {
      stream: 'Commerce',
      confidence: 'Medium',
      reasoning: "Based on your people and leadership skills."
    };
  }
  
  // Final fallback
  return {
    stream: 'Commerce',
    confidence: 'Low',
    reasoning: "A versatile stream that offers multiple career paths."
  };
}

/**
 * Get dominant strengths (top 2 traits)
 */
export function getDominantStrengths(traitScores: TraitScores): Trait[] {
  const traitEntries = Object.entries(traitScores) as [Trait, number][];
  const sorted = traitEntries
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([trait]) => trait);
  
  return sorted.length > 0 ? sorted : ['logical', 'disciplined'];
}

/**
 * Format trait name for display
 */
export function formatTraitName(trait: Trait): string {
  const mapping: Record<Trait, string> = {
    'logical': 'Logical thinker',
    'creative': 'Creative',
    'people': 'People-oriented',
    'hands-on': 'Hands-on learner',
    'leader': 'Natural leader',
    'disciplined': 'Disciplined'
  };
  return mapping[trait] || trait;
}
