/**
 * Demo Path Finder - Career Paths Mapping
 * Maps streams to 3 suggested career paths with descriptions
 */

import type { Stream } from './stream-rules';

export interface CareerPath {
  name: string;
  description: string;
  confidence: 'High' | 'Medium' | 'Low';
}

const CAREER_PATHS_BY_STREAM: Record<Stream, CareerPath[]> = {
  'Science (PCM)': [
    {
      name: 'Computer Science',
      description: 'Builds on your logical strength and problem-solving skills. High demand in tech industry.',
      confidence: 'High'
    },
    {
      name: 'Engineering',
      description: 'Combines logical thinking with hands-on application. Multiple specializations available.',
      confidence: 'High'
    },
    {
      name: 'Data Science',
      description: 'Combines math, logic, and impact. Growing field with excellent career prospects.',
      confidence: 'Medium'
    }
  ],
  'Science (PCB)': [
    {
      name: 'Medicine',
      description: 'Perfect for helping people while using scientific knowledge. Long-term rewarding career.',
      confidence: 'High'
    },
    {
      name: 'Biotechnology',
      description: 'Combines life sciences with innovation. Growing research and industry opportunities.',
      confidence: 'High'
    },
    {
      name: 'Pharmacy',
      description: 'Healthcare-focused career with good work-life balance and stable opportunities.',
      confidence: 'Medium'
    }
  ],
  'Commerce': [
    {
      name: 'Chartered Accountancy (CA)',
      description: 'Respected profession with excellent earning potential. Requires discipline and logical thinking.',
      confidence: 'High'
    },
    {
      name: 'Business Management',
      description: 'Leverages your leadership and people skills. Opens doors to entrepreneurship.',
      confidence: 'High'
    },
    {
      name: 'Finance & Banking',
      description: 'Stable career with good growth. Combines analytical skills with people interaction.',
      confidence: 'Medium'
    }
  ],
  'Arts': [
    {
      name: 'Psychology',
      description: 'Combines understanding people with helping them. Growing field with diverse applications.',
      confidence: 'High'
    },
    {
      name: 'Journalism & Media',
      description: 'Creative route that connects with people. Dynamic field with storytelling opportunities.',
      confidence: 'High'
    },
    {
      name: 'Social Work',
      description: 'Direct impact on helping people and communities. Fulfilling career path.',
      confidence: 'Medium'
    }
  ],
  'Design': [
    {
      name: 'Graphic Design',
      description: 'Creative route that combines art with technology. High demand in digital media.',
      confidence: 'High'
    },
    {
      name: 'Product Design',
      description: 'Builds on creative strength with problem-solving. Growing field in tech companies.',
      confidence: 'High'
    },
    {
      name: 'Animation & VFX',
      description: 'Creative field with excellent opportunities in entertainment and advertising.',
      confidence: 'Medium'
    }
  ],
  'Vocational': [
    {
      name: 'Technical Skills (ITI/Diploma)',
      description: 'Hands-on technical training leading to immediate employment. Practical and focused.',
      confidence: 'High'
    },
    {
      name: 'Skilled Trades',
      description: 'High-demand practical skills. Good earning potential with less formal education required.',
      confidence: 'High'
    },
    {
      name: 'Entrepreneurship',
      description: 'Start your own business with practical skills. Requires discipline and hands-on approach.',
      confidence: 'Medium'
    }
  ]
};

/**
 * Get career paths for a given stream
 */
export function getCareerPathsForStream(stream: Stream): CareerPath[] {
  return CAREER_PATHS_BY_STREAM[stream] || CAREER_PATHS_BY_STREAM['Commerce'];
}
