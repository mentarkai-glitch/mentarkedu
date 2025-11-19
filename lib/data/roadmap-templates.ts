/**
 * Demo Path Finder - Roadmap Templates
 * Pre-written 2-year roadmap teasers for each stream
 */

import type { Stream } from './stream-rules';

export interface RoadmapStep {
  period: string;
  focus: string;
}

const ROADMAP_TEMPLATES: Record<Stream, RoadmapStep[]> = {
  'Science (PCM)': [
    { period: 'Months 1-3', focus: 'Focus on Mathematics and Physics fundamentals. Build strong problem-solving foundation.' },
    { period: 'Months 4-6', focus: 'Deep dive into Chemistry. Start practicing competitive exam questions (JEE/NEET).' },
    { period: 'Months 7-9', focus: 'Join coaching or self-study program. Take mock tests regularly. Identify weak areas.' },
    { period: 'Months 10-12', focus: 'Intensive revision. Focus on time management. Take full-length practice tests.' },
    { period: 'Year 2, Months 1-6', focus: 'Continue exam preparation. Explore career options (Engineering/Research).' },
    { period: 'Year 2, Months 7-12', focus: 'Appear for entrance exams. Apply to colleges. Plan backup options.' }
  ],
  'Science (PCB)': [
    { period: 'Months 1-3', focus: 'Strengthen Biology and Chemistry basics. Start building study routine.' },
    { period: 'Months 4-6', focus: 'Focus on Physics fundamentals. Begin NEET/MBBS preparation if interested in medicine.' },
    { period: 'Months 7-9', focus: 'Join coaching for competitive exams. Regular practice and mock tests.' },
    { period: 'Months 10-12', focus: 'Intensive revision cycle. Focus on diagram practice and concept clarity.' },
    { period: 'Year 2, Months 1-6', focus: 'Continue exam prep. Explore medical, biotech, and research options.' },
    { period: 'Year 2, Months 7-12', focus: 'Appear for entrance exams. Apply to medical/biology colleges.' }
  ],
  'Commerce': [
    { period: 'Months 1-3', focus: 'Build strong foundation in Accountancy and Business Studies. Practice calculations daily.' },
    { period: 'Months 4-6', focus: 'Focus on Economics concepts. Start exploring CA/CS/CMA career paths.' },
    { period: 'Months 7-9', focus: 'Join commerce coaching if needed. Practice case studies and problem-solving.' },
    { period: 'Months 10-12', focus: 'Revision and mock exams. Focus on time management for board exams.' },
    { period: 'Year 2, Months 1-6', focus: 'Decide on specialization (CA/BBA/Finance). Start entrance exam prep.' },
    { period: 'Year 2, Months 7-12', focus: 'Apply to commerce colleges. Consider professional courses alongside degree.' }
  ],
  'Arts': [
    { period: 'Months 1-3', focus: 'Explore different subjects (History, Psychology, Literature). Find your interests.' },
    { period: 'Months 4-6', focus: 'Focus on chosen subjects. Develop critical thinking and writing skills.' },
    { period: 'Months 7-9', focus: 'Join debate clubs or writing workshops. Build portfolio of work.' },
    { period: 'Months 10-12', focus: 'Prepare for board exams. Focus on essay writing and analysis skills.' },
    { period: 'Year 2, Months 1-6', focus: 'Explore career paths (Journalism/Psychology/Social Work). Build skills.' },
    { period: 'Year 2, Months 7-12', focus: 'Apply to arts colleges. Consider internships or volunteer work.' }
  ],
  'Design': [
    { period: 'Months 1-3', focus: 'Build portfolio with sketches and designs. Learn basic design software (Canva/Photoshop).' },
    { period: 'Months 4-6', focus: 'Take online design courses. Practice daily. Join design communities.' },
    { period: 'Months 7-9', focus: 'Focus on specialization (Graphic/Product/Animation). Build project portfolio.' },
    { period: 'Months 10-12', focus: 'Prepare for design entrance exams (NID/NIFT). Create strong portfolio.' },
    { period: 'Year 2, Months 1-6', focus: 'Continue skill building. Take freelance projects. Network with designers.' },
    { period: 'Year 2, Months 7-12', focus: 'Apply to design colleges. Showcase portfolio. Plan career path.' }
  ],
  'Vocational': [
    { period: 'Months 1-3', focus: 'Identify practical skills interest (ITI/Diploma courses). Research options.' },
    { period: 'Months 4-6', focus: 'Enroll in skill-based training program. Focus on hands-on learning.' },
    { period: 'Months 7-9', focus: 'Complete basic certification. Start building practical experience.' },
    { period: 'Months 10-12', focus: 'Take advanced courses. Get industry certifications. Build portfolio.' },
    { period: 'Year 2, Months 1-6', focus: 'Gain work experience through internships. Network in your field.' },
    { period: 'Year 2, Months 7-12', focus: 'Apply for jobs or start business. Continue skill development.' }
  ]
};

/**
 * Get roadmap template for a given stream
 */
export function getRoadmapForStream(stream: Stream): RoadmapStep[] {
  return ROADMAP_TEMPLATES[stream] || ROADMAP_TEMPLATES['Commerce'];
}
