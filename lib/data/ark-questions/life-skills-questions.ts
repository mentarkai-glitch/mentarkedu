/**
 * Life Skills - Category-Specific Questions
 */

import type { ARKQuestion } from './academic-excellence-questions';

export const lifeSkillsQuestions = {
  core: [
    {
      id: 'target_skill',
      type: 'searchable-select' as const,
      question: 'Which life skill do you want to develop?',
      placeholder: 'Select or type your skill',
      suggestions: 'lifeSkills.lifeSkills',
      allowCustom: true,
      required: true,
      unlocks: ['current_proficiency', 'application_context'],
      helpText: 'Practical skill to master'
    },
    {
      id: 'current_proficiency',
      type: 'slider' as const,
      question: 'Current proficiency level? (0-5)',
      min: 0,
      max: 5,
      default: 2,
      required: true,
      helpText: 'Where you are starting from'
    },
    {
      id: 'urgency',
      type: 'select' as const,
      question: 'How urgent is learning this skill?',
      options: [
        'Very urgent - Need it now',
        'Important - Within months',
        'Moderate - Sometime this year',
        'Low priority - Nice to have',
        'Exploratory - Just curious'
      ],
      required: true,
      helpText: 'Sets preparation urgency'
    }
  ] as ARKQuestion[],
  
  progressive: [
    {
      id: 'application_context',
      type: 'select' as const,
      question: 'Where will you use this skill?',
      options: [
        'At school/college',
        'At home',
        'For work/part-time job',
        'For independent living',
        'All of the above',
        'Other'
      ],
      required: true,
      helpText: 'Where this skill applies'
    },
    {
      id: 'learning_style',
      type: 'select' as const,
      question: 'How do you prefer to learn?',
      options: [
        'Watching videos/tutorials',
        'Reading guides/books',
        'Hands-on practice',
        'Learning with others',
        'Trial and error',
        'Structured classes',
        'Mix of above'
      ],
      required: true,
      helpText: 'Preferred learning method'
    },
    {
      id: 'practice_frequency',
      type: 'select' as const,
      question: 'How often can you practice?',
      options: [
        'Multiple times per day',
        'Daily',
        '3-4 times per week',
        'Weekly',
        'As needed',
        'When I remember'
      ],
      required: true,
      helpText: 'Realistic practice schedule'
    },
    {
      id: 'measurement',
      type: 'textarea' as const,
      question: 'How will you know you mastered it?',
      placeholder: 'Define success criteria...',
      required: false,
      helpText: 'Clear mastery definition'
    },
    {
      id: 'resources_access',
      type: 'select' as const,
      question: 'What resources do you have access to?',
      options: [
        'Internet and online tutorials',
        'Books and guides',
        'Mentor or teacher',
        'Tools and materials',
        'Limited resources',
        'Full access to everything'
      ],
      required: true,
      helpText: 'Available resources for learning'
    },
    {
      id: 'initial_steps',
      type: 'textarea' as const,
      question: 'Do you know where to start?',
      placeholder: 'First steps you\'ve identified...',
      required: false,
      helpText: 'Existing knowledge of skill'
    }
  ] as ARKQuestion[]
};

export default lifeSkillsQuestions;

