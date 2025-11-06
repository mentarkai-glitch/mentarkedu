/**
 * Comprehensive ARK Suggestion Data
 * Static defaults for all categories with database override support
 */

export interface CategorySuggestions {
  exams?: string[];
  subjects?: string[];
  fields?: string[];
  skills?: string[];
  certifications?: string[];
  commonGoals?: string[];
  commonChallenges?: string[];
  habits?: string[];
  challenges?: string[];
  techniques?: string[];
  communicationGoals?: string[];
  situations?: string[];
  lifeSkills?: string[];
  [key: string]: any;
}

// Academic Excellence Suggestions
export const academicSuggestions: CategorySuggestions = {
  exams: [
    'JEE Main',
    'JEE Advanced',
    'NEET',
    'BITSAT',
    'KVPY',
    'NTSE',
    'CAT',
    'GATE',
    'Board Exams (Class 10)',
    'Board Exams (Class 12)',
    'SAT',
    'ACT',
    'GRE',
    'GMAT',
    'CLAT',
    'AILET',
    'JEE Main (Multiple Attempts)'
  ],
  subjects: [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'English',
    'Social Science',
    'Economics',
    'Accountancy',
    'Business Studies',
    'Psychology',
    'History',
    'Geography',
    'Political Science'
  ],
  commonGoals: [
    'Score 95%+ in board exams',
    'Crack JEE in 2 years',
    'NEET preparation and admission',
    'Improve subject grades significantly',
    'Olympiad preparation (NTSE/KVPY)',
    'Clear board exams with distinction',
    'Build strong fundamentals in PCM/PCB',
    'Achieve top percentile in competitive exams',
    'Prepare for multiple entrance exams',
    'Excellence in specific subject topics'
  ],
  commonChallenges: [
    'Concept clarity issues',
    'Time management during exams',
    'Maintaining practice consistency',
    'Revision strategy and retention',
    'Exam anxiety and nervousness',
    'Weak in specific topics',
    'Balancing school + competitive prep',
    'Focus and concentration problems',
    'Speed and accuracy in solving',
    'Study material organization'
  ]
};

// Career Preparation Suggestions
export const careerSuggestions: CategorySuggestions = {
  fields: [
    'Engineering',
    'Medicine',
    'Law',
    'Business & Management',
    'Design & Arts',
    'Science Research',
    'Government Services (UPSC/IAS)',
    'Data Science & Analytics',
    'Artificial Intelligence',
    'Cybersecurity',
    'Finance & Banking',
    'Marketing & Advertising',
    'Education & Teaching',
    'Social Work',
    'Architecture',
    'Media & Journalism'
  ],
  skills: [
    'Coding & Programming',
    'Communication Skills',
    'Leadership',
    'Problem Solving',
    'Creativity & Innovation',
    'Data Analysis',
    'Public Speaking',
    'Project Management',
    'Critical Thinking',
    'Collaboration & Teamwork',
    'Technical Writing',
    'Research Skills'
  ],
  certifications: [
    'Python Programming',
    'Java Programming',
    'Web Development',
    'Data Science',
    'Digital Marketing',
    'UI/UX Design',
    'Advanced Excel',
    'Public Speaking',
    'Project Management (PMP)',
    'Google Analytics',
    'Cloud Computing (AWS/Azure)',
    'Machine Learning'
  ],
  commonGoals: [
    'Explore multiple career options',
    'Build job-ready technical skills',
    'Get admission in dream college',
    'Prepare for campus placements',
    'Create a strong resume & portfolio',
    'Start internship search',
    'Network with professionals',
    'Develop soft skills for workplace',
    'Choose the right specialization',
    'Prepare for interviews'
  ]
};

// Personal Development Suggestions
export const personalSuggestions: CategorySuggestions = {
  habits: [
    'Wake up early (5-6 AM)',
    'Read daily (30 minutes)',
    'Exercise regularly',
    'Practice meditation/mindfulness',
    'Maintain a journal',
    'Time blocking and planning',
    'Reduce screen time',
    'Learn a new language',
    'Practice gratitude daily',
    'Water intake goals',
    'Healthy meal prep',
    'Quality sleep routine'
  ],
  commonGoals: [
    'Build self-discipline',
    'Improve time management',
    'Increase productivity',
    'Develop reading habit',
    'Practice consistency',
    'Overcome procrastination',
    'Build morning routine',
    'Develop leadership qualities',
    'Improve focus and concentration',
    'Achieve work-life balance'
  ],
  commonChallenges: [
    'Procrastination',
    'Lack of motivation',
    'Poor time management',
    'Difficulty staying consistent',
    'Overwhelm and burnout',
    'Setting unrealistic goals',
    'Distractions and focus issues',
    'Starting but not finishing',
    'Lack of accountability',
    'Negative self-talk'
  ]
};

// Emotional Wellbeing Suggestions
export const wellbeingSuggestions: CategorySuggestions = {
  challenges: [
    'Exam stress and anxiety',
    'Low self-confidence',
    'Feeling overwhelmed',
    'Burnout and exhaustion',
    'Facing failures',
    'Peer pressure',
    'Family expectations',
    'Performance anxiety',
    'Social anxiety',
    'Depression and sadness',
    'Lack of motivation',
    'Dealing with rejection'
  ],
  techniques: [
    'Mindfulness meditation',
    'Deep breathing exercises',
    'Progressive muscle relaxation',
    'Journaling thoughts',
    'Physical exercise',
    'Talking to someone trusted',
    'Art therapy / creative expression',
    'Music therapy',
    'Quality sleep routine',
    'Time in nature',
    'Gratitude practice',
    'Setting boundaries'
  ],
  commonGoals: [
    'Manage exam stress better',
    'Build emotional resilience',
    'Overcome anxiety',
    'Improve self-confidence',
    'Cope with pressure effectively',
    'Handle setbacks positively',
    'Develop positive mindset',
    'Better emotional regulation',
    'Maintain mental balance',
    'Feel more motivated'
  ]
};

// Social & Relationships Suggestions
export const socialSuggestions: CategorySuggestions = {
  communicationGoals: [
    'Make new friends',
    'Improve family relationships',
    'Better peer connections',
    'Effective group communication',
    'Public speaking confidence',
    'Assertive communication',
    'Active listening skills',
    'Networking with professionals',
    'Resolve conflicts better',
    'Build deeper friendships'
  ],
  situations: [
    'Starting conversations',
    'Joining group discussions',
    'Presenting in class',
    'Making small talk',
    'Dealing with conflict',
    'Asking for help',
    'Expressing opinions',
    'Giving presentations',
    'Working in teams',
    'Social events and gatherings'
  ],
  commonChallenges: [
    'Shyness and social anxiety',
    'Difficulty starting conversations',
    'Finding common topics',
    'Fear of judgment',
    'Being too quiet in groups',
    'Not knowing how to respond',
    'Struggling with humor',
    'Difficulty networking',
    'Being misunderstood',
    'Want to be more outgoing'
  ]
};

// Life Skills Suggestions
export const lifeSkillsSuggestions: CategorySuggestions = {
  lifeSkills: [
    'Time Management',
    'Money Management & Budgeting',
    'Cooking & Meal Prep',
    'Basic Home Repairs',
    'Digital Literacy & Safety',
    'Critical Thinking',
    'Problem Solving',
    'Decision Making',
    'Communication Skills',
    'Organization & Planning',
    'Basic First Aid',
    'Stress Management',
    'Adaptability',
    'Self-care & Wellness'
  ],
  commonGoals: [
    'Manage time better',
    'Learn to cook healthy meals',
    'Save and budget money wisely',
    'Stay organized',
    'Make informed decisions',
    'Be more independent',
    'Handle emergencies',
    'Develop practical skills',
    'Improve digital skills',
    'Take care of personal needs'
  ]
};

// Master suggestions map
export const categorySuggestionsMap: Record<string, CategorySuggestions> = {
  academic_excellence: academicSuggestions,
  career_preparation: careerSuggestions,
  personal_development: personalSuggestions,
  emotional_wellbeing: wellbeingSuggestions,
  social_relationships: socialSuggestions,
  life_skills: lifeSkillsSuggestions
};

/**
 * Get suggestions for a specific category and type
 */
export function getSuggestions(
  categoryId: string,
  suggestionType: string
): string[] {
  const category = categorySuggestionsMap[categoryId];
  if (!category) return [];
  
  return category[suggestionType] || [];
}

/**
 * Get all suggestion types for a category
 */
export function getAllSuggestions(categoryId: string): CategorySuggestions {
  return categorySuggestionsMap[categoryId] || {};
}

/**
 * Search suggestions with partial match
 */
export function searchSuggestions(
  categoryId: string,
  suggestionType: string,
  query: string
): string[] {
  const suggestions = getSuggestions(categoryId, suggestionType);
  if (!query.trim()) return suggestions;
  
  const lowerQuery = query.toLowerCase();
  return suggestions.filter(s => 
    s.toLowerCase().includes(lowerQuery)
  );
}

