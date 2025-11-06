/**
 * Academic Excellence - Category-Specific Questions
 * Progressive question flow for academic goal ARK creation
 */

export interface QuestionCondition {
  field: string;
  operator: 'equals' | 'not_empty' | 'contains' | 'greater_than' | 'less_than';
  value?: any;
}

export interface ARKQuestion {
  id: string;
  type: 'searchable-select' | 'multi-select-chips' | 'text' | 'textarea' | 'date' | 'slider' | 'select';
  question: string;
  placeholder?: string;
  suggestions?: string; // Path to suggestion type (e.g., 'academic.exams')
  allowCustom?: boolean;
  required: boolean;
  unlocks?: string[]; // Other question IDs that should be shown after this
  condition?: QuestionCondition; // When to show this question
  options?: string[]; // For select/radio types
  min?: number; // For slider
  max?: number; // For slider
  default?: any;
  helpText?: string;
}

export const academicQuestions = {
  core: [
    {
      id: 'target_exam',
      type: 'searchable-select' as const,
      question: 'Which exam are you preparing for?',
      placeholder: 'Select or type your exam',
      suggestions: 'academic.exams',
      allowCustom: true,
      required: true,
      unlocks: ['exam_date', 'current_preparation_level'],
      helpText: 'This helps us understand your exact goal and timeline'
    },
    {
      id: 'target_subjects',
      type: 'multi-select-chips' as const,
      question: 'Which subjects do you want to focus on?',
      placeholder: 'Select 1-3 subjects',
      suggestions: 'academic.subjects',
      allowCustom: false,
      required: true,
      helpText: 'Select the subjects you need to improve most'
    },
    {
      id: 'current_score',
      type: 'text' as const,
      question: 'What is your current score or percentile?',
      placeholder: 'e.g., 85%, 92 percentile, 750/1000',
      required: false,
      helpText: 'Current performance helps us identify gap'
    }
  ] as ARKQuestion[],
  
  progressive: [
    {
      id: 'exam_date',
      type: 'date' as const,
      question: 'When is your exam?',
      required: true,
      condition: {
        field: 'target_exam',
        operator: 'not_empty'
      },
      helpText: 'Creates targeted timeline for preparation'
    },
    {
      id: 'target_score',
      type: 'text' as const,
      question: 'What score/percentile are you aiming for?',
      placeholder: 'e.g., 99 percentile, 95%, 900/1000',
      required: false,
      condition: {
        field: 'current_score',
        operator: 'not_empty'
      },
      helpText: 'Helps calculate the exact gap to bridge'
    },
    {
      id: 'current_preparation_level',
      type: 'select' as const,
      question: 'How prepared do you feel right now?',
      options: [
        'Just starting - Need basics',
        'Getting started - Some prep done',
        'Moderate prep - Halfway through',
        'Well prepared - Polishing',
        'Very confident - Final revision'
      ],
      required: false,
      helpText: 'Sets realistic expectations for the roadmap'
    },
    {
      id: 'weak_areas',
      type: 'multi-select-chips' as const,
      question: 'What are your weak areas?',
      suggestions: 'academic.commonChallenges',
      allowCustom: true,
      required: false,
      helpText: 'Specific challenges we should address'
    },
    {
      id: 'preparation_hours',
      type: 'slider' as const,
      question: 'How many hours can you dedicate daily?',
      min: 1,
      max: 12,
      default: 4,
      required: true,
      helpText: 'Ensures realistic study plan'
    },
    {
      id: 'has_coaching',
      type: 'select' as const,
      question: 'Do you have coaching support?',
      options: [
        'Yes, regular coaching class',
        'Yes, online coaching',
        'Yes, but irregular',
        'No, self-study only'
      ],
      required: true,
      helpText: 'Adjusts resources and expectations'
    },
    {
      id: 'past_attempts',
      type: 'select' as const,
      question: 'Have you attempted this exam before?',
      options: [
        'No, first attempt',
        'Yes, 1 previous attempt',
        'Yes, 2+ previous attempts',
        'Yes, multiple attempts'
      ],
      required: true,
      condition: {
        field: 'target_exam',
        operator: 'contains',
        value: 'JEE'
      },
      helpText: 'Previous attempts inform preparation strategy'
    },
    {
      id: 'weak_topics',
      type: 'textarea' as const,
      question: 'List specific weak topics or chapters (optional)',
      placeholder: 'e.g., Mechanics, Organic Chemistry, Calculus...',
      required: false,
      helpText: 'Detailed input = more personalized roadmap'
    }
  ] as ARKQuestion[]
};

export default academicQuestions;

