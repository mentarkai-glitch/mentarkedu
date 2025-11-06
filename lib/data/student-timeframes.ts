/**
 * Academic Calendar-Based Timeframes for Student ARK Creation
 * Category-specific timeframe options aligned with school schedules
 */

export interface TimeframeOption {
  id: string;
  name: string;
  duration: string;
  description: string;
  durationWeeks: number;
  emoji?: string;
  gradient?: string;
}

// Academic Excellence timeframes - aligned with school calendar
const academicTimeframes: TimeframeOption[] = [
  { 
    id: 'before_test', 
    name: 'Before Next Test', 
    duration: '2-4 weeks', 
    durationWeeks: 3,
    description: 'Quick focused prep for upcoming test',
    emoji: '📝',
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    id: 'this_quarter', 
    name: 'This Quarter', 
    duration: '2-3 months', 
    durationWeeks: 10,
    description: 'Improve performance this quarter',
    emoji: '📊',
    gradient: 'from-blue-500 to-indigo-500'
  },
  { 
    id: 'before_midterms', 
    name: 'Before Midterms', 
    duration: '1-2 months', 
    durationWeeks: 6,
    description: 'Prepare for midterm exams',
    emoji: '📚',
    gradient: 'from-purple-500 to-blue-500'
  },
  { 
    id: 'before_finals', 
    name: 'Before Finals', 
    duration: '3-4 months', 
    durationWeeks: 14,
    description: 'Comprehensive final exam preparation',
    emoji: '🎯',
    gradient: 'from-orange-500 to-red-500'
  },
  { 
    id: 'this_semester', 
    name: 'This Semester', 
    duration: '4-6 months', 
    durationWeeks: 20,
    description: 'Full semester mastery plan',
    emoji: '📖',
    gradient: 'from-green-500 to-emerald-500'
  },
  { 
    id: 'before_boards', 
    name: 'Before Board Exams', 
    duration: '6-12 months', 
    durationWeeks: 36,
    description: 'Long-term board exam preparation',
    emoji: '🏆',
    gradient: 'from-yellow-500 to-orange-500'
  },
  { 
    id: 'before_competitive', 
    name: 'Before Competitive Exam', 
    duration: '12-24 months', 
    durationWeeks: 72,
    description: 'JEE/NEET/other competitive exam prep',
    emoji: '🚀',
    gradient: 'from-red-500 to-pink-500'
  }
];

// Career Preparation timeframes - long-term planning
const careerTimeframes: TimeframeOption[] = [
  { 
    id: 'short_explore', 
    name: 'Quick Exploration', 
    duration: '1-2 months', 
    durationWeeks: 6,
    description: 'Explore career options and interests',
    emoji: '🔍',
    gradient: 'from-purple-500 to-pink-500'
  },
  { 
    id: 'skill_building', 
    name: 'Skill Building Phase', 
    duration: '3-6 months', 
    durationWeeks: 18,
    description: 'Develop specific career skills',
    emoji: '🛠️',
    gradient: 'from-blue-500 to-purple-500'
  },
  { 
    id: 'college_prep', 
    name: 'College Preparation', 
    duration: '6-12 months', 
    durationWeeks: 36,
    description: 'Prepare for college applications and entrance',
    emoji: '🎓',
    gradient: 'from-green-500 to-blue-500'
  },
  { 
    id: 'long_career', 
    name: 'Long-term Career Path', 
    duration: '12-24 months', 
    durationWeeks: 72,
    description: 'Build comprehensive career foundation',
    emoji: '🌟',
    gradient: 'from-yellow-500 to-orange-500'
  },
  { 
    id: 'internship_ready', 
    name: 'Internship Ready', 
    duration: '3-6 months', 
    durationWeeks: 18,
    description: 'Get ready for internships and work experience',
    emoji: '💼',
    gradient: 'from-indigo-500 to-purple-500'
  }
];

// Personal Development / Life Skills / Social timeframes - flexible
const flexibleTimeframes: TimeframeOption[] = [
  { 
    id: 'quick_habit', 
    name: 'Quick Habit Build', 
    duration: '21-30 days', 
    durationWeeks: 4,
    description: 'Form a new habit or routine',
    emoji: '⚡',
    gradient: 'from-orange-500 to-yellow-500'
  },
  { 
    id: 'short_term', 
    name: 'Short Term', 
    duration: '1-3 months', 
    durationWeeks: 8,
    description: 'Quick personal growth project',
    emoji: '🌱',
    gradient: 'from-green-500 to-emerald-500'
  },
  { 
    id: 'mid_term', 
    name: 'Mid Term', 
    duration: '3-6 months', 
    durationWeeks: 18,
    description: 'Sustained personal development',
    emoji: '🌿',
    gradient: 'from-teal-500 to-green-500'
  },
  { 
    id: 'long_term', 
    name: 'Long Term', 
    duration: '6-12 months', 
    durationWeeks: 36,
    description: 'Major life transformation',
    emoji: '🌳',
    gradient: 'from-blue-500 to-teal-500'
  },
  { 
    id: 'ongoing', 
    name: 'Ongoing Practice', 
    duration: '3-6 months', 
    durationWeeks: 18,
    description: 'Continuous improvement journey',
    emoji: '♾️',
    gradient: 'from-purple-500 to-pink-500'
  }
];

// Emotional Wellbeing timeframes - shorter, gentler timelines
const wellbeingTimeframes: TimeframeOption[] = [
  { 
    id: 'immediate', 
    name: 'Immediate Relief', 
    duration: '1-4 weeks', 
    durationWeeks: 2,
    description: 'Quick stress management and coping',
    emoji: '🧘',
    gradient: 'from-green-500 to-emerald-500'
  },
  { 
    id: 'short_wellness', 
    name: 'Build Resilience', 
    duration: '1-2 months', 
    durationWeeks: 6,
    description: 'Develop emotional strength and coping skills',
    emoji: '💚',
    gradient: 'from-teal-500 to-green-500'
  },
  { 
    id: 'sustained', 
    name: 'Sustained Growth', 
    duration: '3-6 months', 
    durationWeeks: 18,
    description: 'Long-term emotional health improvement',
    emoji: '🌈',
    gradient: 'from-blue-500 to-purple-500'
  },
  { 
    id: 'exam_stress', 
    name: 'Exam Season Support', 
    duration: '1-3 months', 
    durationWeeks: 8,
    description: 'Manage exam-related stress and anxiety',
    emoji: '🎯',
    gradient: 'from-orange-500 to-red-500'
  }
];

// Social & Relationships timeframes
const socialTimeframes: TimeframeOption[] = [
  { 
    id: 'quick_social', 
    name: 'Quick Start', 
    duration: '2-4 weeks', 
    durationWeeks: 3,
    description: 'Immediate social skill improvement',
    emoji: '🤝',
    gradient: 'from-pink-500 to-rose-500'
  },
  { 
    id: 'build_connections', 
    name: 'Build Connections', 
    duration: '1-3 months', 
    durationWeeks: 8,
    description: 'Form meaningful friendships',
    emoji: '👥',
    gradient: 'from-purple-500 to-pink-500'
  },
  { 
    id: 'communication_mastery', 
    name: 'Communication Mastery', 
    duration: '3-6 months', 
    durationWeeks: 18,
    description: 'Develop strong communication skills',
    emoji: '💬',
    gradient: 'from-blue-500 to-purple-500'
  },
  { 
    id: 'leadership', 
    name: 'Leadership Skills', 
    duration: '6-12 months', 
    durationWeeks: 36,
    description: 'Build leadership and influence',
    emoji: '👑',
    gradient: 'from-yellow-500 to-orange-500'
  }
];

/**
 * Get timeframe options based on category
 */
export function getTimeframesForCategory(categoryId: string): TimeframeOption[] {
  const categoryMap: Record<string, TimeframeOption[]> = {
    'academic_excellence': academicTimeframes,
    'career_preparation': careerTimeframes,
    'personal_development': flexibleTimeframes,
    'emotional_wellbeing': wellbeingTimeframes,
    'social_relationships': socialTimeframes,
    'life_skills': flexibleTimeframes
  };

  return categoryMap[categoryId] || flexibleTimeframes;
}

/**
 * Get timeframe by ID
 */
export function getTimeframeById(timeframeId: string): TimeframeOption | undefined {
  const allTimeframes = [
    ...academicTimeframes,
    ...careerTimeframes,
    ...flexibleTimeframes,
    ...wellbeingTimeframes,
    ...socialTimeframes
  ];
  
  return allTimeframes.find(t => t.id === timeframeId);
}

/**
 * Get recommended milestone count based on timeframe duration
 */
export function getRecommendedMilestoneCount(durationWeeks: number): number {
  if (durationWeeks <= 4) return 3; // 1 month or less
  if (durationWeeks <= 12) return 4; // 3 months
  if (durationWeeks <= 24) return 5; // 6 months
  if (durationWeeks <= 36) return 6; // 9 months
  return 8; // 12+ months
}

/**
 * Get all timeframes (for reference)
 */
export const allTimeframes = {
  academic: academicTimeframes,
  career: careerTimeframes,
  flexible: flexibleTimeframes,
  wellbeing: wellbeingTimeframes,
  social: socialTimeframes
};

