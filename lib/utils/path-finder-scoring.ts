import { pathFinderQuestions, traitMapping, streamRules } from '@/lib/data/path-finder-questions';
import {
  generateCompleteTraitProfile,
  generatePersonalityInsights,
  generateLearningStyle,
  generateSubjectRecommendations,
  generateExamStrategy,
  generateAlternativeStreams,
  generateCareerInsights,
  generateWhoYouAreNow,
  generateCareerPathsWithProgression,
  generateCollegeRecommendations,
  generateLifeVisualization
} from './enhanced-results';

export interface QuizAnswer {
  question_id: string;
  answer: string | number | string[]; // Support multi-select
}

export interface TraitScores {
  logical: number;
  creative: number;
  people: number;
  handsOn: number;
  leader: number;
  disciplined: number;
}

export interface CompleteTraitProfile {
  trait: string;
  score: number;
  percentage: number;
  description: string;
}

export interface PersonalityInsights {
  type: string;
  description: string;
  strengths: string[];
  growthAreas: string[];
}

export interface LearningStyle {
  primary: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Reading';
  secondary?: string;
  recommendations: string[];
}

export interface SubjectRecommendation {
  subject: string;
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
}

export interface ExamStrategy {
  preferredFormat: string;
  preparationTips: string[];
  timeManagement: string;
}

export interface AlternativeStream {
  stream: string;
  matchScore: number;
  why: string;
}

export interface CareerInsights {
  growthPotential: 'High' | 'Medium' | 'Low';
  salaryRange: string;
  jobMarket: 'Growing' | 'Stable' | 'Competitive';
  opportunities: string[];
}

// Enhanced Result Interfaces
export interface WhoYouAreNow {
  passions: string[];
  naturalAbilities: string[];
  flowActivities: string[];
  values: string[];
  currentStrengths: string[];
  interests: string[];
  summary: string;
}

export interface CareerPathWithProgression {
  careerName: string;
  description: string;
  fitScore: number;
  progression: Array<{
    stage: string; // e.g., "Year 1-2", "Year 3-5", "Year 5-10"
    role: string;
    responsibilities: string[];
    skills: string[];
    salary?: string;
    lifestyle: string;
  }>;
  milestones: Array<{
    year: number;
    milestone: string;
    description: string;
  }>;
}

export interface CollegeRecommendation {
  name: string;
  location: string;
  stream: string;
  rank?: number;
  rating: number;
  fees: string;
  admissionRequirements: string[];
  highlights: string[];
  placementStats?: {
    averagePackage: string;
    topRecruiters: string[];
  };
  whyFit: string;
  url?: string;
  culturalContext?: {
    region: string;
    localLanguage: string;
    foodCulture: string;
    lifestyle: string;
    culturalFit: string;
  };
}

export interface LifeVisualization {
  year5: {
    age: number;
    role: string;
    location: string;
    lifestyle: string;
    achievements: string[];
    dailyRoutine: string[];
  };
  year10: {
    age: number;
    role: string;
    location: string;
    lifestyle: string;
    achievements: string[];
    impact: string;
  };
  vision: string;
  keyMoments: Array<{
    year: number;
    moment: string;
    description: string;
  }>;
}

export interface QuizResult {
  strengths: string[];
  stream: string;
  confidence: 'High' | 'Medium' | 'Low';
  paths: Array<{
    name: string;
    why: string;
    fit: 'High' | 'Medium' | 'Low';
  }>;
  traitScores: TraitScores;
  studyTolerance: number;
  budgetConstraint: boolean;
  prefersCreativeFreedom: boolean;
  // Enhanced details
  completeTraitProfile: CompleteTraitProfile[];
  personalityInsights: PersonalityInsights;
  learningStyle: LearningStyle;
  subjectRecommendations: SubjectRecommendation[];
  examStrategy: ExamStrategy;
  alternativeStreams: AlternativeStream[];
  careerInsights: CareerInsights;
  // New enhanced sections
  whoYouAreNow: WhoYouAreNow;
  careerPathsWithProgression: CareerPathWithProgression[];
  collegeRecommendations: CollegeRecommendation[];
  lifeVisualization: LifeVisualization;
}

// Question weights for enhanced scoring - New Psychometric Structure
const questionWeights: Record<string, number> = {
  // Phase 1: Natural Vibe (Q1-Q5) - High weight
  q1: 1.3,  // Scroll Test - very high weight
  q2: 1.2,  // School Fest Scenario - high weight
  q3: 1.2,  // Broken Phone Reaction - high weight
  q4: 1.1,  // Group Project Role - high weight
  q5: 1.1,  // Flow State - high weight
  // Phase 2: Dealbreakers (Q6-Q7) - Medium weight (negative filtering)
  q6: 1.0,  // Ick List - standard (negative filtering handled separately)
  q7: 1.0,  // Workspace Preference - standard
  // Phase 3: Aptitude Reality (Q8-Q11) - High weight
  q8: 1.4,  // Math Reality - very high weight
  q9: 1.2,  // Memory vs Logic - high weight
  q10: 1.1, // Reading Endurance - high weight
  q11: 1.2, // Science Curiosity - high weight
  // Phase 4: Future Vision (Q12-Q15) - High weight
  q12: 1.3, // Success Definition - very high weight
  q13: 1.2, // Entrepreneurship Meter - high weight
  q14: 1.2, // Why Driver - high weight
  q15: 1.1, // Social Interaction Level - high weight
  // Phase 5: Logistics (Q16-Q20) - Medium weight
  q16: 1.3, // Study Tolerance - very high weight (slider)
  q17: 0.9, // Geographic Preference - lower weight
  q18: 1.1, // Budget Constraints - high weight
  q19: 0.8, // Parental Factor - lower weight
  q20: 0.9, // Backup Plan - lower weight
  // Phase 6: Validation (Q21-Q25) - Medium weight
  q21: 1.2, // Subject Interest - high weight (multi-select)
  q22: 1.0, // Tech Proficiency - standard
  q23: 1.0, // Risk Appetite - standard
  q24: 1.0, // Helping Style - standard
  q25: 1.3  // Magic Wand - very high weight
};

export function calculateScores(answers: QuizAnswer[]): TraitScores {
  const scores: TraitScores = {
    logical: 0,
    creative: 0,
    people: 0,
    handsOn: 0,
    leader: 0,
    disciplined: 0
  };

  answers.forEach(({ question_id, answer }) => {
    const question = pathFinderQuestions.find(q => q.id === question_id);
    if (!question) return;

    // Handle slider questions (Q16, Q20, Q21) - stored separately, not in trait scores
    if ((question_id === 'q16' || question_id === 'q20' || question_id === 'q21') && typeof answer === 'number') {
      return; // These are stored separately
    }

    // Handle text question (Q17 - 10-year vision) - no trait mapping
    if (question_id === 'q17' && typeof answer === 'string') {
      return; // Handled in enhanced results generation
    }

    const weight = questionWeights[question_id] || 1.0;

    // Handle multi-select questions (Q6, Q21)
    if (question.type === 'multi_select' && Array.isArray(answer)) {
      answer.forEach((selectedOption: string) => {
        const mapping = traitMapping[question_id];
        if (mapping && mapping[selectedOption]) {
          mapping[selectedOption].forEach(({ trait, score }) => {
            if (trait in scores) {
              scores[trait as keyof TraitScores] += score * weight;
            }
          });
        }
      });
    }
    // Handle single choice questions
    else if (question.type === 'single_choice' && typeof answer === 'string') {
      const mapping = traitMapping[question_id];
      if (mapping && mapping[answer]) {
        mapping[answer].forEach(({ trait, score }) => {
          if (trait in scores) {
            scores[trait as keyof TraitScores] += score * weight;
          }
        });
      }
    }
  });

  return scores;
}

export function determineStream(
  traitScores: TraitScores,
  answers: QuizAnswer[]
): { stream: string; confidence: 'High' | 'Medium' | 'Low' } {
  // Extract additional data from answers - Updated for new question structure
  const studyToleranceAnswer = answers.find(a => a.question_id === 'q16')?.answer;
  let studyTolerance = 5; // Default
  if (typeof studyToleranceAnswer === 'string') {
    // Map Q16 answers to numeric values
    if (studyToleranceAnswer === 'Yes, I am ready to grind for my goal') studyTolerance = 9;
    else if (studyToleranceAnswer === 'Maybe, but I might burn out') studyTolerance = 6;
    else if (studyToleranceAnswer === 'No, I prefer a balanced life with hobbies') studyTolerance = 4;
    else if (studyToleranceAnswer === 'Absolutely not') studyTolerance = 2;
  }
  
  const q14Answer = answers.find(a => a.question_id === 'q14')?.answer as string || '';
  const q18Answer = answers.find(a => a.question_id === 'q18')?.answer as string || '';
  const q6Answers = answers.find(a => a.question_id === 'q6')?.answer as string[] || [];
  
  const prefersCreativeFreedom = q14Answer === 'To express myself creatively';
  const budgetConstraint = q18Answer === '< ₹2 Lakhs (Need Scholarships/Govt Colleges)';
  
  // Negative filtering from Q6 (Ick List)
  const avoidsTech = q6Answers.includes('Sitting in front of a computer coding for 8 hours');
  const avoidsMedical = q6Answers.includes('Dealing with blood, needles, or sick people');
  const avoidsCommerce = q6Answers.includes('Staring at spreadsheets and calculating taxes');
  const avoidsHumanities = q6Answers.includes('Writing long essays or reading ancient literature');
  const avoidsSales = q6Answers.includes('Public speaking or selling things to strangers');

  // Apply negative filtering - reduce trait scores for avoided streams
  if (avoidsTech) {
    traitScores.logical = Math.max(0, traitScores.logical - 2);
    traitScores.handsOn = Math.max(0, traitScores.handsOn - 1);
  }
  if (avoidsMedical) {
    traitScores.people = Math.max(0, traitScores.people - 2);
    traitScores.logical = Math.max(0, traitScores.logical - 1);
  }
  if (avoidsCommerce) {
    traitScores.leader = Math.max(0, traitScores.leader - 1);
    traitScores.logical = Math.max(0, traitScores.logical - 1);
  }
  if (avoidsHumanities) {
    traitScores.creative = Math.max(0, traitScores.creative - 2);
    traitScores.people = Math.max(0, traitScores.people - 1);
  }
  if (avoidsSales) {
    traitScores.people = Math.max(0, traitScores.people - 1);
    traitScores.leader = Math.max(0, traitScores.leader - 1);
  }

  // Check stream rules in priority order
  for (const [streamName, rule] of Object.entries(streamRules)) {
    const conditions = Array.isArray(rule.conditions[0]) ? rule.conditions : [rule.conditions];
    
    for (const conditionSet of conditions) {
      let matches = true;
      
      // Ensure conditionSet is an array
      const conditionArray = Array.isArray(conditionSet) ? conditionSet : [conditionSet];
      
      for (const condition of conditionArray) {
        if ('trait' in condition) {
          const trait = condition.trait as keyof TraitScores;
          const min = condition.min || 0;
          if (traitScores[trait] < min) {
            matches = false;
            break;
          }
        } else if ('studyTolerance' in condition) {
          const tolerance = condition.studyTolerance as { min?: number; max?: number };
          if (tolerance.min !== undefined && studyTolerance < tolerance.min) {
            matches = false;
            break;
          }
          if (tolerance.max !== undefined && studyTolerance > tolerance.max) {
            matches = false;
            break;
          }
        } else if ('budgetConstraint' in condition) {
          if (condition.budgetConstraint !== budgetConstraint) {
            matches = false;
            break;
          }
        } else if ('prefersCreativeFreedom' in condition) {
          if (condition.prefersCreativeFreedom !== prefersCreativeFreedom) {
            matches = false;
            break;
          }
        }
      }
      
      if (matches) {
        return { stream: streamName, confidence: rule.confidence as 'High' | 'Medium' | 'Low' };
      }
    }
  }

  // Default fallback
  return { stream: 'Commerce', confidence: 'Low' };
}

export function getTopStrengths(traitScores: TraitScores, count: number = 2, language: 'en' | 'hi' | 'mr' = 'en'): string[] {
  const entries = Object.entries(traitScores) as [keyof TraitScores, number][];
  entries.sort((a, b) => b[1] - a[1]);
  
  const traitNames: Record<keyof TraitScores, Record<'en' | 'hi' | 'mr', string>> = {
    logical: {
      en: 'Logical thinker',
      hi: 'तार्किक विचारक',
      mr: 'तार्किक विचारक'
    },
    creative: {
      en: 'Creative',
      hi: 'रचनात्मक',
      mr: 'सर्जनशील'
    },
    people: {
      en: 'People-oriented',
      hi: 'लोग-उन्मुख',
      mr: 'लोक-उन्मुख'
    },
    handsOn: {
      en: 'Hands-on learner',
      hi: 'व्यावहारिक शिक्षार्थी',
      mr: 'व्यावहारिक शिक्षार्थी'
    },
    leader: {
      en: 'Leader',
      hi: 'नेता',
      mr: 'नेता'
    },
    disciplined: {
      en: 'Disciplined',
      hi: 'अनुशासित',
      mr: 'शिस्तबद्ध'
    }
  };
  
  return entries.slice(0, count).map(([trait]) => traitNames[trait][language]);
}

export function generateFuturePaths(
  stream: string,
  traitScores: TraitScores,
  language: 'en' | 'hi' | 'mr' = 'en'
): Array<{ name: string; why: string; fit: 'High' | 'Medium' | 'Low' }> {
  const pathTemplates: Record<string, Record<'en' | 'hi' | 'mr', Array<{ name: string; why: string; fit: 'High' | 'Medium' | 'Low' }>>> = {
    'Science (PCM)': {
      en: [
        { name: 'Computer Science', why: 'Builds on your logical strength and problem-solving skills', fit: 'High' },
        { name: 'Data Science', why: 'Combines math and logical thinking with real-world impact', fit: 'High' },
        { name: 'Engineering', why: 'Hands-on application of logical and analytical skills', fit: 'Medium' }
      ],
      hi: [
        { name: 'कंप्यूटर साइंस', why: 'आपकी तार्किक शक्ति और समस्या-समाधान कौशल पर निर्माण करता है', fit: 'High' },
        { name: 'डेटा साइंस', why: 'गणित और तार्किक सोच को वास्तविक दुनिया के प्रभाव के साथ जोड़ता है', fit: 'High' },
        { name: 'इंजीनियरिंग', why: 'तार्किक और विश्लेषणात्मक कौशल का व्यावहारिक अनुप्रयोग', fit: 'Medium' }
      ],
      mr: [
        { name: 'संगणक विज्ञान', why: 'तुमच्या तार्किक शक्ती आणि समस्या-निराकरण कौशल्यांवर बांधते', fit: 'High' },
        { name: 'डेटा विज्ञान', why: 'गणित आणि तार्किक विचारास वास्तविक जगातील प्रभावासह जोडते', fit: 'High' },
        { name: 'अभियांत्रिकी', why: 'तार्किक आणि विश्लेषणात्मक कौशल्यांचा व्यावहारिक उपयोग', fit: 'Medium' }
      ]
    },
    'Science (PCB)': {
      en: [
        { name: 'Medicine (MBBS)', why: 'Combines logical thinking with helping people', fit: 'High' },
        { name: 'Biotechnology', why: 'Research-oriented field combining science and innovation', fit: 'High' },
        { name: 'Pharmacy', why: 'Practical application of chemistry and biology', fit: 'Medium' }
      ],
      hi: [
        { name: 'चिकित्सा (MBBS)', why: 'तार्किक सोच को लोगों की मदद करने के साथ जोड़ता है', fit: 'High' },
        { name: 'बायोटेक्नोलॉजी', why: 'विज्ञान और नवाचार को जोड़ने वाला अनुसंधान-उन्मुख क्षेत्र', fit: 'High' },
        { name: 'फार्मेसी', why: 'रसायन विज्ञान और जीव विज्ञान का व्यावहारिक अनुप्रयोग', fit: 'Medium' }
      ],
      mr: [
        { name: 'वैद्यकीय (MBBS)', why: 'तार्किक विचारास लोकांना मदत करण्यासह जोडते', fit: 'High' },
        { name: 'जैवतंत्रज्ञान', why: 'विज्ञान आणि नवाचार जोडणारे संशोधन-उन्मुख क्षेत्र', fit: 'High' },
        { name: 'फार्मसी', why: 'रसायनशास्त्र आणि जीवशास्त्राचा व्यावहारिक उपयोग', fit: 'Medium' }
      ]
    },
    'Commerce': {
      en: [
        { name: 'Chartered Accountancy (CA)', why: 'Structured path with clear career progression', fit: 'High' },
        { name: 'Business Administration (BBA/MBA)', why: 'Combines leadership and analytical skills', fit: 'High' },
        { name: 'Economics', why: 'Analytical field with diverse career options', fit: 'Medium' }
      ],
      hi: [
        { name: 'चार्टर्ड अकाउंटेंसी (CA)', why: 'स्पष्ट करियर प्रगति के साथ संरचित पथ', fit: 'High' },
        { name: 'व्यवसाय प्रशासन (BBA/MBA)', why: 'नेतृत्व और विश्लेषणात्मक कौशल को जोड़ता है', fit: 'High' },
        { name: 'अर्थशास्त्र', why: 'विविध करियर विकल्पों के साथ विश्लेषणात्मक क्षेत्र', fit: 'Medium' }
      ],
      mr: [
        { name: 'चार्टर्ड अकाउंटन्सी (CA)', why: 'स्पष्ट करिअर प्रगतीसह संरचित मार्ग', fit: 'High' },
        { name: 'व्यवसाय प्रशासन (BBA/MBA)', why: 'नेतृत्व आणि विश्लेषणात्मक कौशल्ये जोडते', fit: 'High' },
        { name: 'अर्थशास्त्र', why: 'विविध करिअर पर्यायांसह विश्लेषणात्मक क्षेत्र', fit: 'Medium' }
      ]
    },
    'Arts/Humanities': {
      en: [
        { name: 'Design', why: 'Creative route that values innovation and expression', fit: 'High' },
        { name: 'Media & Communication', why: 'Combines creativity with people skills', fit: 'High' },
        { name: 'Psychology', why: 'Understanding people and human behavior', fit: 'Medium' }
      ],
      hi: [
        { name: 'डिज़ाइन', why: 'नवाचार और अभिव्यक्ति को महत्व देने वाला रचनात्मक मार्ग', fit: 'High' },
        { name: 'मीडिया और संचार', why: 'रचनात्मकता को लोगों के कौशल के साथ जोड़ता है', fit: 'High' },
        { name: 'मनोविज्ञान', why: 'लोगों और मानव व्यवहार को समझना', fit: 'Medium' }
      ],
      mr: [
        { name: 'डिझाइन', why: 'नवाचार आणि अभिव्यक्तीला महत्त्व देणारा सर्जनशील मार्ग', fit: 'High' },
        { name: 'मीडिया आणि संप्रेषण', why: 'सर्जनशीलतेस लोकांच्या कौशल्यांसह जोडते', fit: 'High' },
        { name: 'मानसशास्त्र', why: 'लोक आणि मानवी वर्तन समजून घेणे', fit: 'Medium' }
      ]
    },
    'Vocational': {
      en: [
        { name: 'IT & Software Development', why: 'Hands-on technical skills with immediate job prospects', fit: 'High' },
        { name: 'Digital Marketing', why: 'Creative and analytical skills in growing field', fit: 'High' },
        { name: 'Hospitality Management', why: 'People-oriented field with practical training', fit: 'Medium' }
      ],
      hi: [
        { name: 'आईटी और सॉफ्टवेयर विकास', why: 'तत्काल नौकरी की संभावनाओं के साथ व्यावहारिक तकनीकी कौशल', fit: 'High' },
        { name: 'डिजिटल मार्केटिंग', why: 'बढ़ते क्षेत्र में रचनात्मक और विश्लेषणात्मक कौशल', fit: 'High' },
        { name: 'आतिथ्य प्रबंधन', why: 'व्यावहारिक प्रशिक्षण के साथ लोग-उन्मुख क्षेत्र', fit: 'Medium' }
      ],
      mr: [
        { name: 'आयटी आणि सॉफ्टवेअर विकास', why: 'तत्काल नोकरीच्या संभावनांसह व्यावहारिक तांत्रिक कौशल्ये', fit: 'High' },
        { name: 'डिजिटल मार्केटिंग', why: 'वाढत्या क्षेत्रात सर्जनशील आणि विश्लेषणात्मक कौशल्ये', fit: 'High' },
        { name: 'आतिथ्य व्यवस्थापन', why: 'व्यावहारिक प्रशिक्षणासह लोक-उन्मुख क्षेत्र', fit: 'Medium' }
      ]
    }
  };

  const streamTemplates = pathTemplates[stream] || pathTemplates['Commerce'];
  return streamTemplates[language] || streamTemplates.en;
}

export function calculateResult(answers: QuizAnswer[], language: 'en' | 'hi' | 'mr' = 'en'): QuizResult {
  const traitScores = calculateScores(answers);
  const { stream, confidence } = determineStream(traitScores, answers);
  const strengths = getTopStrengths(traitScores, 2, language);
  const paths = generateFuturePaths(stream, traitScores, language);
  
  const studyTolerance = answers.find(a => a.question_id === 'q4')?.answer as number || 5;
  const q7Answer = answers.find(a => a.question_id === 'q7')?.answer as string || '';
  const budgetConstraint = q7Answer.includes('affordable') || q7Answer.includes('scholarship') || 
                           q7Answer.includes('सस्ते') || q7Answer.includes('छात्रवृत्ति') ||
                           q7Answer.includes('स्वस्त') || q7Answer.includes('शिष्यवृत्ती');
  const q5Answer = answers.find(a => a.question_id === 'q5')?.answer as string || '';
  const prefersCreativeFreedom = q5Answer.includes('Creative freedom') || q5Answer.includes('Mix of both') ||
                                  q5Answer.includes('रचनात्मक स्वतंत्रता') || q5Answer.includes('दोनों का मिश्रण') ||
                                  q5Answer.includes('सर्जनशील स्वातंत्र्य') || q5Answer.includes('दोन्हीचे मिश्रण');

  // Generate enhanced results
  const completeTraitProfile = generateCompleteTraitProfile(traitScores, language);
  const personalityInsights = generatePersonalityInsights(traitScores, language);
  const learningStyle = generateLearningStyle(answers, language);
  const subjectRecommendations = generateSubjectRecommendations(answers, stream, language);
  const examStrategy = generateExamStrategy(answers, language);
  const alternativeStreams = generateAlternativeStreams(traitScores, stream, language);
  const careerInsights = generateCareerInsights(stream, traitScores, language);
  
  // Generate new enhanced sections
  const whoYouAreNow = generateWhoYouAreNow(answers, traitScores, language);
  const careerPathsWithProgression = generateCareerPathsWithProgression(stream, traitScores, answers, language);
  
  const q22Answer = answers.find(a => a.question_id === 'q22')?.answer as string[] || [];
  const q12Answer = answers.find(a => a.question_id === 'q12')?.answer as string || ''; // Success Definition
  const q17Answer = answers.find(a => a.question_id === 'q17')?.answer as string || ''; // Geographic Preference
  const collegeRecommendations = generateCollegeRecommendations(stream, q17Answer ? [q17Answer] : q22Answer, budgetConstraint, language);
  const lifeVisualization = generateLifeVisualization(stream, q12Answer, answers, language);

  return {
    strengths,
    stream,
    confidence,
    paths,
    traitScores,
    studyTolerance,
    budgetConstraint,
    prefersCreativeFreedom,
    // Enhanced details
    completeTraitProfile,
    personalityInsights,
    learningStyle,
    subjectRecommendations,
    examStrategy,
    alternativeStreams,
    careerInsights,
    // New enhanced sections
    whoYouAreNow,
    careerPathsWithProgression,
    collegeRecommendations,
    lifeVisualization
  };
}

