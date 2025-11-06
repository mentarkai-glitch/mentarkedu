/**
 * Personal Development - Category-Specific Questions
 */

import type { ARKQuestion } from './academic-excellence-questions';

export const personalQuestions = {
  core: [
    {
      id: 'main_habit',
      type: 'searchable-select' as const,
      question: 'What habit or skill do you want to build?',
      placeholder: 'Select or type your goal',
      suggestions: 'personal.habits',
      allowCustom: true,
      required: true,
      unlocks: ['current_routine'],
      helpText: 'Specific habit or personal skill to develop'
    },
    {
      id: 'why_important',
      type: 'textarea' as const,
      question: 'Why is this important to you?',
      placeholder: 'Tell us what motivates you...',
      required: true,
      helpText: 'Understanding your "why" helps maintain motivation'
    },
    {
      id: 'current_routine',
      type: 'textarea' as const,
      question: 'What is your current routine in this area?',
      placeholder: 'Describe how you handle this now...',
      required: false,
      helpText: 'Baseline to build from'
    }
  ] as ARKQuestion[],
  
  progressive: [
    {
      id: 'daily_time',
      type: 'slider' as const,
      question: 'How many minutes per day can you commit?',
      min: 5,
      max: 120,
      default: 30,
      required: true,
      helpText: 'Realistic time commitment'
    },
    {
      id: 'obstacles',
      type: 'multi-select-chips' as const,
      question: 'What obstacles do you face?',
      suggestions: 'personal.commonChallenges',
      allowCustom: true,
      required: false,
      helpText: 'Anticipate and plan for challenges'
    },
    {
      id: 'tracking_method',
      type: 'select' as const,
      question: 'How do you want to track progress?',
      options: [
        'Daily check-in',
        'Weekly review',
        'Log/journal',
        'App reminders',
        'None needed'
      ],
      required: true,
      helpText: 'Chosen tracking method'
    },
    {
      id: 'accountability',
      type: 'select' as const,
      question: 'Who will hold you accountable?',
      options: [
        'Just myself',
        'Friend or family',
        'Mentark AI',
        'Teacher/mentor',
        'Peer group',
        'No accountability needed'
      ],
      required: true,
      helpText: 'Accountability increases success rate'
    },
    {
      id: 'success_definition',
      type: 'textarea' as const,
      question: 'How will you know you succeeded?',
      placeholder: 'Define what success looks like...',
      required: false,
      helpText: 'Clear success criteria'
    },
    {
      id: 'start_date',
      type: 'date' as const,
      question: 'When do you want to start?',
      required: false,
      helpText: 'Target start date'
    }
  ] as ARKQuestion[]
};

export default personalQuestions;

