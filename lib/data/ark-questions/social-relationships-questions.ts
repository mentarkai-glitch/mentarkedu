/**
 * Social & Relationships - Category-Specific Questions
 */

import type { ARKQuestion } from './academic-excellence-questions';

export const socialQuestions = {
  core: [
    {
      id: 'communication_goal',
      type: 'searchable-select' as const,
      question: 'What is your social goal?',
      placeholder: 'Select or describe your goal',
      suggestions: 'social.communicationGoals',
      allowCustom: true,
      required: true,
      unlocks: ['comfort_level', 'target_situations'],
      helpText: 'Main area of social growth'
    },
    {
      id: 'comfort_level',
      type: 'slider' as const,
      question: 'How comfortable are you currently? (1-10)',
      min: 1,
      max: 10,
      default: 5,
      required: true,
      helpText: 'Current social comfort level'
    },
    {
      id: 'context',
      type: 'select' as const,
      question: 'What social context matters most?',
      options: [
        'Making friends at school',
        'Family relationships',
        'Professional networking',
        'Dating and romantic',
        'Public speaking',
        'All of the above',
        'Other'
      ],
      required: true,
      helpText: 'Main social setting'
    }
  ] as ARKQuestion[],
  
  progressive: [
    {
      id: 'target_situations',
      type: 'multi-select-chips' as const,
      question: 'Which situations do you want to improve?',
      suggestions: 'social.situations',
      allowCustom: true,
      required: false,
      helpText: 'Specific scenarios to practice'
    },
    {
      id: 'group_preference',
      type: 'select' as const,
      question: 'What group size are you working towards?',
      options: [
        'One-on-one conversations',
        'Small groups (3-5 people)',
        'Medium groups (6-15 people)',
        'Large groups (15+ people)',
        'Public speaking (50+ people)',
        'All sizes'
      ],
      required: true,
      helpText: 'Preferred social setting'
    },
    {
      id: 'current_challenges',
      type: 'multi-select-chips' as const,
      question: 'What are your main social challenges?',
      suggestions: 'social.commonChallenges',
      allowCustom: true,
      required: false,
      helpText: 'Specific difficulties to address'
    },
    {
      id: 'past_experiences',
      type: 'textarea' as const,
      question: 'Any past negative experiences affecting you?',
      placeholder: 'Optional: Share if comfortable...',
      required: false,
      helpText: 'Context for social development'
    },
    {
      id: 'desired_outcome',
      type: 'textarea' as const,
      question: 'What does success look like?',
      placeholder: 'Describe your ideal social situation...',
      required: false,
      helpText: 'Vision for success'
    },
    {
      id: 'practice_opportunities',
      type: 'select' as const,
      question: 'How often can you practice?',
      options: [
        'Daily',
        '3-4 times per week',
        'Weekly',
        'Monthly',
        'Irregular',
        'As opportunities arise'
      ],
      required: true,
      helpText: 'Practice frequency'
    }
  ] as ARKQuestion[]
};

export default socialQuestions;

