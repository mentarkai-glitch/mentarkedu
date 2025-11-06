/**
 * Career Preparation - Category-Specific Questions
 */

import type { ARKQuestion } from './academic-excellence-questions';

export const careerQuestions = {
  core: [
    {
      id: 'target_field',
      type: 'searchable-select' as const,
      question: 'Which field interests you most?',
      placeholder: 'Select or type your field',
      suggestions: 'career.fields',
      allowCustom: true,
      required: true,
      unlocks: ['target_role', 'skill_focus'],
      helpText: 'Helps narrow down career path'
    },
    {
      id: 'current_education_level',
      type: 'select' as const,
      question: 'What is your current education level?',
      options: [
        'Class 10',
        'Class 11-12',
        'Graduating Soon',
        'Recent Graduate',
        'Some Work Experience'
      ],
      required: true,
      helpText: 'Tailors advice to your stage'
    },
    {
      id: 'career_clarity',
      type: 'select' as const,
      question: 'How clear are you about this career choice?',
      options: [
        'Very clear - I know what I want',
        'Somewhat clear - Exploring options',
        'Not sure - Need guidance',
        'Completely confused - Help me choose'
      ],
      required: true,
      helpText: 'Adjusts how we present information'
    }
  ] as ARKQuestion[],
  
  progressive: [
    {
      id: 'target_role',
      type: 'text' as const,
      question: 'What specific role are you aiming for?',
      placeholder: 'e.g., Software Developer, Data Scientist, Doctor...',
      required: false,
      helpText: 'Specificity helps create focused roadmap'
    },
    {
      id: 'skill_focus',
      type: 'multi-select-chips' as const,
      question: 'Which skills do you want to build?',
      suggestions: 'career.skills',
      allowCustom: true,
      required: false,
      helpText: 'Key competencies for your career'
    },
    {
      id: 'certification_interests',
      type: 'multi-select-chips' as const,
      question: 'Any specific certifications you want?',
      suggestions: 'career.certifications',
      allowCustom: true,
      required: false,
      helpText: 'Valued credentials in your field'
    },
    {
      id: 'timeline',
      type: 'select' as const,
      question: 'When do you want to be job-ready?',
      options: [
        'Within 3 months',
        '3-6 months',
        '6-12 months',
        '1-2 years',
        'Flexible'
      ],
      required: true,
      helpText: 'Sets pace for skill building'
    },
    {
      id: 'target_companies',
      type: 'textarea' as const,
      question: 'Target companies or organizations (optional)',
      placeholder: 'e.g., Google, Microsoft, Local startups...',
      required: false,
      helpText: 'Helps prepare for specific requirements'
    },
    {
      id: 'interim_goals',
      type: 'multi-select-chips' as const,
      question: 'What are your immediate goals?',
      suggestions: 'career.commonGoals',
      allowCustom: true,
      required: false,
      helpText: 'Interim milestones before main goal'
    }
  ] as ARKQuestion[]
};

export default careerQuestions;

