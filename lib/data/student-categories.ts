/**
 * Student Categories with Icons and Descriptions
 * Used in onboarding to understand student's primary focus area
 */

export interface StudentCategory {
  id: string;
  title: string;
  emoji: string;
  description: string;
  color: string;
  gradient: string;
  examples: string[];
}

export const studentCategories: StudentCategory[] = [
  {
    id: 'academic_excellence',
    title: 'Academic Excellence',
    emoji: '📚',
    description: 'Master your subjects, ace exams, and achieve top grades',
    color: 'blue',
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    examples: ['Improve exam scores', 'Master difficult subjects', 'Competitive exam prep']
  },
  {
    id: 'career_preparation',
    title: 'Career Preparation',
    emoji: '🎯',
    description: 'Plan your future career and build the right skills',
    color: 'purple',
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    examples: ['Career exploration', 'Skill development', 'College prep']
  },
  {
    id: 'personal_development',
    title: 'Personal Development',
    emoji: '🌟',
    description: 'Build confidence, discipline, and personal growth',
    color: 'orange',
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    examples: ['Build good habits', 'Time management', 'Self-improvement']
  },
  {
    id: 'emotional_wellbeing',
    title: 'Emotional Wellbeing',
    emoji: '💚',
    description: 'Manage stress, anxiety, and emotional health',
    color: 'green',
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    examples: ['Reduce stress', 'Handle pressure', 'Stay motivated']
  },
  {
    id: 'social_relationships',
    title: 'Social & Relationships',
    emoji: '🤝',
    description: 'Improve communication, friendships, and social skills',
    color: 'pink',
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    examples: ['Make friends', 'Communication skills', 'Family relationships']
  },
  {
    id: 'life_skills',
    title: 'Life Skills',
    emoji: '🛠️',
    description: 'Learn practical skills for independence and real life',
    color: 'indigo',
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    examples: ['Money management', 'Problem solving', 'Decision making']
  }
];

export function getCategoryById(id: string): StudentCategory | undefined {
  return studentCategories.find(cat => cat.id === id);
}

export function getCategoryColor(categoryId: string): string {
  const category = getCategoryById(categoryId);
  return category ? category.color : 'gray';
}

export function getCategoryGradient(categoryId: string): string {
  const category = getCategoryById(categoryId);
  return category ? category.gradient : 'from-gray-500 to-slate-500';
}
