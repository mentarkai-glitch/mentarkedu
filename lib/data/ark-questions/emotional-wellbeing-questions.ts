/**
 * Emotional Wellbeing - Category-Specific Questions
 */

import type { ARKQuestion } from './academic-excellence-questions';

export const wellbeingQuestions = {
  core: [
    {
      id: 'primary_challenge',
      type: 'searchable-select' as const,
      question: 'What is your primary emotional challenge?',
      placeholder: 'Select what you need help with',
      suggestions: 'wellbeing.challenges',
      allowCustom: true,
      required: true,
      unlocks: ['triggers', 'current_coping'],
      helpText: 'Main area you want to improve'
    },
    {
      id: 'intensity',
      type: 'slider' as const,
      question: 'How intense is this challenge? (1-10)',
      min: 1,
      max: 10,
      default: 5,
      required: true,
      helpText: 'Current intensity level'
    },
    {
      id: 'impact',
      type: 'select' as const,
      question: 'How does this affect your daily life?',
      options: [
        'Minimal - Just want to feel better',
        'Moderate - Some days are hard',
        'Significant - Most days are affected',
        'Severe - Difficult to function normally',
        'Crisis - Need immediate help'
      ],
      required: true,
      helpText: 'Assesses impact and urgency'
    }
  ] as ARKQuestion[],
  
  progressive: [
    {
      id: 'triggers',
      type: 'textarea' as const,
      question: 'What situations or things trigger these feelings?',
      placeholder: 'Describe when you feel most stressed/anxious...',
      required: false,
      helpText: 'Identifies patterns and triggers'
    },
    {
      id: 'current_coping',
      type: 'multi-select-chips' as const,
      question: 'What coping mechanisms do you currently use?',
      suggestions: 'wellbeing.techniques',
      allowCustom: true,
      required: false,
      helpText: 'Existing strategies to build upon'
    },
    {
      id: 'support_system',
      type: 'select' as const,
      question: 'Who is in your support system?',
      options: [
        'Family members',
        'Close friends',
        'Teacher/mentor',
        'Therapist/counselor',
        'Online community',
        'No one currently',
        'Multiple people'
      ],
      required: true,
      helpText: 'Available emotional support'
    },
    {
      id: 'preferred_technique',
      type: 'multi-select-chips' as const,
      question: 'Which techniques interest you?',
      suggestions: 'wellbeing.techniques',
      allowCustom: false,
      required: false,
      helpText: 'Approaches you\'re open to trying'
    },
    {
      id: 'barriers',
      type: 'textarea' as const,
      question: 'What prevents you from feeling better?',
      placeholder: 'Any specific obstacles...',
      required: false,
      helpText: 'Identifies barriers to improvement'
    },
    {
      id: 'crisis_plan',
      type: 'select' as const,
      question: 'Do you have a plan for crisis situations?',
      options: [
        'Yes, I know what to do',
        'Somewhat, but could improve',
        'No, need help creating one',
        'Not applicable'
      ],
      required: true,
      helpText: 'Safety and crisis management planning'
    }
  ] as ARKQuestion[]
};

export default wellbeingQuestions;

