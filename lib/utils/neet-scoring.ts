import { neetQuestions, type NEETQuestion, getNEETQuestionById } from '@/lib/data/neet-questions';

export interface NEETAnswer {
  question_id: string;
  answer: string; // Selected option text
  timestamp?: number;
}

export interface SubjectScores {
  physics: number;
  chemistry: number;
  biology: number;
  accuracy: number;
  stamina: number;
  mindset: number;
}

export interface NEETMetrics {
  neetProbability: number; // 0-100%
  alliedHealthFit: number; // 0-100%
  subjectScores: SubjectScores;
  careerTags: string[];
  anxietyLevel: 'High' | 'Medium' | 'Low';
  gritLevel: 'High' | 'Medium' | 'Low';
}

export interface AlternativeCareer {
  name: string;
  fitScore: number; // 0-100
  why: string;
  careerTags: string[];
  description: string;
}

export interface RankImprovement {
  currentScore: number;
  potentialWithAccuracy: number;
  potentialWithSubjectFix: number;
  targetScore: number;
  actionableSteps: Array<{
    action: string;
    timeline: string;
    priority: 'High' | 'Medium' | 'Low';
  }>;
}

export interface ChapterWiseAnalysis {
  physics: {
    strongest: string[];
    weakest: string[];
    priority: Array<{ chapter: string; priority: 'High' | 'Medium' | 'Low'; reason: string }>;
  };
  chemistry: {
    strongest: string[];
    weakest: string[];
    priority: Array<{ topic: string; priority: 'High' | 'Medium' | 'Low'; reason: string }>;
  };
  biology: {
    strongest: string[];
    weakest: string[];
    priority: Array<{ section: string; priority: 'High' | 'Medium' | 'Low'; reason: string }>;
  };
}

export interface TimeManagementAnalysis {
  currentAllocation: {
    physics: number; // minutes
    chemistry: number;
    biology: number;
  };
  recommendedAllocation: {
    physics: number;
    chemistry: number;
    biology: number;
  };
  efficiency: 'Optimal' | 'Good' | 'Needs Adjustment' | 'Poor';
  recommendations: string[];
}

export interface NCERTPYQAnalysis {
  ncertConfidence: number; // 0-100
  pyqCompletion: number; // 0-100
  gap: 'NCERT Strong' | 'PYQ Strong' | 'Balanced' | 'Both Need Work';
  recommendations: string[];
}

export interface MockTestTrend {
  frequency: 'High' | 'Medium' | 'Low' | 'Very Low';
  trend: 'Improving' | 'Stable' | 'Fluctuating' | 'Declining' | 'Unknown';
  projectedScore: number; // Based on trend
  recommendations: string[];
}

export interface ExtendedAnalytics {
  chapterWise?: ChapterWiseAnalysis;
  timeManagement?: TimeManagementAnalysis;
  ncertPYQ?: NCERTPYQAnalysis;
  mockTestTrend?: MockTestTrend;
  revisionStrategy?: {
    current: string;
    recommended: string;
    priority: 'High' | 'Medium' | 'Low';
  };
}

export interface NEETResult {
  metrics: NEETMetrics;
  alternativeCareers: AlternativeCareer[];
  rankImprovement: RankImprovement;
  insights: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  extendedAnalytics?: ExtendedAnalytics;
}

// Calculate NEET Probability (Plan A)
function calculateNEETProbability(answers: NEETAnswer[]): number {
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  // Base score from mock test (Q1)
  const q1Answer = answers.find(a => a.question_id === 'q1');
  if (q1Answer) {
    const question = getNEETQuestionById('q1');
    const option = question?.options.find(o => o.text.en === q1Answer.answer || o.text.hi === q1Answer.answer || o.text.mr === q1Answer.answer);
    if (option) {
      totalScore += option.neetScore * 2; // Weight mock score heavily
      maxPossibleScore += 90 * 2;
    }
  }
  
  // Other weighted factors
  const weightMap: Record<string, number> = {
    'q2': 0.8,  // Subject weakness
    'q3': 1.2,  // Syllabus completion
    'q4': 1.0,  // Accuracy
    'q12': 1.5, // Grit (very important)
    'q15': 1.2, // Physics confidence
    'q18': 1.0, // Motivation source
    'q21': 0.8, // Stress handling
    'q23': 1.0, // Study hours
    'q25': 0.8, // Alternative interest
  };
  
  answers.forEach(({ question_id, answer }) => {
    const question = getNEETQuestionById(question_id);
    if (!question) return;
    
    const option = question.options.find(
      o => o.text.en === answer || o.text.hi === answer || o.text.mr === answer
    );
    
    if (option) {
      const weight = weightMap[question_id] || 0.5;
      // Normalize score contribution (positive scores add, negative subtract)
      totalScore += option.neetScore * weight;
      maxPossibleScore += Math.abs(option.neetScore) * weight * 1.5;
    }
  });
  
  // Calculate percentage (0-100)
  const percentage = Math.max(0, Math.min(100, 50 + (totalScore / maxPossibleScore) * 50));
  return Math.round(percentage);
}

// Calculate Allied Health Fit (Plan B)
function calculateAlliedHealthFit(answers: NEETAnswer[]): number {
  let fitScore = 50; // Base score
  
  // Q5: Blood test - if can't handle gore, suggest non-clinical paths
  const q5Answer = answers.find(a => a.question_id === 'q5');
  if (q5Answer?.answer.includes("can't handle gore") || q5Answer?.answer.includes('close my eyes')) {
    fitScore += 20; // Higher fit for non-clinical allied health
  } else if (q5Answer?.answer.includes('Fascinated')) {
    fitScore -= 10; // Prefers clinical, lower allied health fit
  }
  
  // Q6: Empathy - high empathy = good for psychology/allied health
  const q6Answer = answers.find(a => a.question_id === 'q6');
  if (q6Answer?.answer.includes('comfort them emotionally')) {
    fitScore += 15;
  } else if (q6Answer?.answer.includes('Call a senior')) {
    fitScore += 10; // Prefers research/lab work
  }
  
  // Q8: Favorite chapter - biotech/genetics = high fit
  const q8Answer = answers.find(a => a.question_id === 'q8');
  if (q8Answer?.answer.includes('Genetics') || q8Answer?.answer.includes('DNA') || q8Answer?.answer.includes('Biotech')) {
    fitScore += 15;
  } else if (q8Answer?.answer.includes('Anatomy') || q8Answer?.answer.includes('Physiology')) {
    fitScore += 10;
  }
  
  // Q10: Communication style - people vs data
  const q10Answer = answers.find(a => a.question_id === 'q10');
  if (q10Answer?.answer.includes('People')) {
    fitScore += 10; // Good for psychology, nursing
  } else if (q10Answer?.answer.includes('Data')) {
    fitScore += 8; // Good for research, lab tech
  }
  
  // Q25: Alternative interest - if interested in research/psychology
  const q25Answer = answers.find(a => a.question_id === 'q25');
  if (q25Answer?.answer.includes('Research Scientist') || q25Answer?.answer.includes('Psychologist')) {
    fitScore += 12;
  }
  
  // Normalize to 0-100
  return Math.max(0, Math.min(100, fitScore));
}

// Calculate Subject Vital Signs (6-axis radar)
function calculateSubjectScores(answers: NEETAnswer[]): SubjectScores {
  const scores: SubjectScores = {
    physics: 50,
    chemistry: 50,
    biology: 50,
    accuracy: 50,
    stamina: 50,
    mindset: 50
  };
  
  // Aggregate metrics from all answers
  const metricCounts: Record<keyof SubjectScores, { sum: number; count: number }> = {
    physics: { sum: 0, count: 0 },
    chemistry: { sum: 0, count: 0 },
    biology: { sum: 0, count: 0 },
    accuracy: { sum: 0, count: 0 },
    stamina: { sum: 0, count: 0 },
    mindset: { sum: 0, count: 0 }
  };
  
  answers.forEach(({ question_id, answer }) => {
    const question = getNEETQuestionById(question_id);
    if (!question) return;
    
    const option = question.options.find(
      o => o.text.en === answer || o.text.hi === answer || o.text.mr === answer
    );
    
    if (option?.metrics) {
      Object.entries(option.metrics).forEach(([key, value]) => {
        const metricKey = key as keyof SubjectScores;
        if (metricKey in metricCounts) {
          metricCounts[metricKey].sum += value;
          metricCounts[metricKey].count += 1;
        }
      });
    }
  });
  
  // Calculate averages
  Object.keys(metricCounts).forEach((key) => {
    const metricKey = key as keyof SubjectScores;
    const { sum, count } = metricCounts[metricKey];
    if (count > 0) {
      scores[metricKey] = Math.max(0, Math.min(100, sum / count));
    }
  });
  
  return scores;
}

// Collect all career tags from answers
function collectCareerTags(answers: NEETAnswer[]): string[] {
  const tags = new Set<string>();
  
  answers.forEach(({ question_id, answer }) => {
    const question = getNEETQuestionById(question_id);
    if (!question) return;
    
    const option = question.options.find(
      o => o.text.en === answer || o.text.hi === answer || o.text.mr === answer
    );
    
    if (option?.careerTags) {
      option.careerTags.forEach(tag => tags.add(tag));
    }
  });
  
  return Array.from(tags);
}

// Determine anxiety level
function determineAnxietyLevel(answers: NEETAnswer[]): 'High' | 'Medium' | 'Low' {
  const q21Answer = answers.find(a => a.question_id === 'q21');
  
  if (q21Answer?.answer.includes('Often')) {
    return 'High';
  } else if (q21Answer?.answer.includes('Sometimes')) {
    return 'Medium';
  }
  return 'Low';
}

// Determine grit level
function determineGritLevel(answers: NEETAnswer[]): 'High' | 'Medium' | 'Low' {
  const q12Answer = answers.find(a => a.question_id === 'q12');
  const q14Answer = answers.find(a => a.question_id === 'q14');
  
  if (q12Answer?.answer.includes('analyze my mistakes') || q14Answer?.answer.includes('another room')) {
    return 'High';
  } else if (q12Answer?.answer.includes('feel sad for 2 days') || q14Answer?.answer.includes('Every hour')) {
    return 'Medium';
  }
  return 'Low';
}

// Recommend alternative careers based on answers
function recommendAlternativeCareers(answers: NEETAnswer[], careerTags: string[]): AlternativeCareer[] {
  const careers: AlternativeCareer[] = [];
  
  // Tech-Bio Path (Biology interest but avoid clinical)
  if (careerTags.includes('Avoid_Clinical_Med') && careerTags.includes('Biotech_Genetics')) {
    careers.push({
      name: 'Biotechnology / Bioinformatics',
      fitScore: 85,
      why: 'You love Genetics but prefer lab work over patient interaction.',
      careerTags: ['Biotech_Genetics', 'Research_Lab_Fit'],
      description: 'Research-focused careers combining biology with technology, perfect for those who love science but prefer controlled environments.'
    });
    
    careers.push({
      name: 'Clinical Research / Lab Technology',
      fitScore: 80,
      why: 'You enjoy biology but feel uncomfortable with clinical procedures.',
      careerTags: ['Research_Lab_Fit'],
      description: 'Work in research labs, pharmaceutical companies, or diagnostic centers analyzing samples and contributing to medical breakthroughs.'
    });
  }
  
  // Healer Path (High empathy, low Physics)
  if (careerTags.includes('Nursing_Psych_Fit') || careerTags.includes('Allied_Health_Fit')) {
    careers.push({
      name: 'Psychology / Clinical Psychology',
      fitScore: 85,
      why: 'You have high empathy and enjoy helping people emotionally.',
      careerTags: ['Psychology', 'Nursing_Psych_Fit'],
      description: 'Help people overcome mental health challenges, work in hospitals, private practice, or research settings.'
    });
    
    careers.push({
      name: 'Nursing / Physiotherapy',
      fitScore: 80,
      why: 'You want to help people but don\'t need the intensity of medical school.',
      careerTags: ['Nursing_Psych_Fit', 'Physiotherapy_Nursing'],
      description: 'Direct patient care roles that are essential in healthcare, with shorter degree programs and good job prospects.'
    });
  }
  
  // Research Path (Prefer data over people)
  if (careerTags.includes('Research_Lab_Fit') || careerTags.includes('Research')) {
    careers.push({
      name: 'Medical Research / Forensics',
      fitScore: 82,
      why: 'You prefer working with data and samples in a lab setting.',
      careerTags: ['Research', 'Forensics'],
      description: 'Conduct medical research, analyze forensic evidence, or work in diagnostic laboratories contributing to medical science.'
    });
  }
  
  // Engineering Path (Physics interest)
  if (careerTags.includes('Biomed_Engineering')) {
    careers.push({
      name: 'Biomedical Engineering',
      fitScore: 75,
      why: 'You enjoy Physics and Biology, combining them in engineering applications.',
      careerTags: ['Biomed_Engineering'],
      description: 'Design medical devices, imaging equipment, and healthcare technology at the intersection of engineering and medicine.'
    });
  }
  
  // Pharmacy Path (Chemistry interest)
  if (careerTags.includes('Pharma_Chemistry')) {
    careers.push({
      name: 'Pharmacy / Pharmaceutical Sciences',
      fitScore: 78,
      why: 'You enjoy Chemistry and want a healthcare career with less patient interaction.',
      careerTags: ['Pharma_Chemistry'],
      description: 'Work in pharmaceutical companies, hospitals, or research developing medications and ensuring drug safety.'
    });
  }
  
  // Sort by fit score
  return careers.sort((a, b) => b.fitScore - a.fitScore);
}

// Calculate rank improvement potential
function calculateRankImprovement(answers: NEETAnswer[], subjectScores: SubjectScores): RankImprovement {
  // Get current mock score
  const q1Answer = answers.find(a => a.question_id === 'q1');
  let currentScore = 450; // Default
  
  if (q1Answer) {
    const question = getNEETQuestionById('q1');
    const option = question?.options.find(
      o => o.text.en === q1Answer.answer || o.text.hi === q1Answer.answer || o.text.mr === q1Answer.answer
    );
    
    // Extract score range midpoint
    if (q1Answer.answer.includes('< 300')) currentScore = 250;
    else if (q1Answer.answer.includes('300 - 450')) currentScore = 375;
    else if (q1Answer.answer.includes('450 - 550')) currentScore = 500;
    else if (q1Answer.answer.includes('550 - 620')) currentScore = 585;
    else if (q1Answer.answer.includes('620+')) currentScore = 650;
  }
  
  // Potential with reduced silly mistakes (Q4)
  const q4Answer = answers.find(a => a.question_id === 'q4');
  let accuracyImprovement = 0;
  if (q4Answer?.answer.includes('15-25') || q4Answer?.answer.includes('25+')) {
    accuracyImprovement = 30; // Can gain 30 marks by fixing accuracy
  } else if (q4Answer?.answer.includes('5-15')) {
    accuracyImprovement = 15;
  }
  
  const potentialWithAccuracy = Math.min(720, currentScore + accuracyImprovement);
  
  // Potential with weakest subject fixed (Q2)
  const weakestSubject = Object.entries(subjectScores).slice(0, 3).reduce((min, [key, value]) => 
    value < subjectScores[min as keyof typeof subjectScores] ? key : min, 'physics' as keyof typeof subjectScores
  );
  
  let subjectImprovement = 0;
  if (subjectScores[weakestSubject] < 60) {
    subjectImprovement = 40; // Can gain 40 marks by fixing weakest subject
  } else if (subjectScores[weakestSubject] < 70) {
    subjectImprovement = 25;
  }
  
  const potentialWithSubjectFix = Math.min(720, potentialWithAccuracy + subjectImprovement);
  
  // Target score (aim for 600+ for good chances)
  const targetScore = Math.min(720, Math.max(600, potentialWithSubjectFix));
  
  // Generate actionable steps
  const actionableSteps: RankImprovement['actionableSteps'] = [];
  
  if (subjectScores.accuracy < 70) {
    actionableSteps.push({
      action: `Fix Negative Marking: Attempt 5 fewer risky questions in next mock test. Focus on questions you're 80%+ sure about.`,
      timeline: '2 weeks',
      priority: 'High'
    });
  }
  
  if (subjectScores[weakestSubject] < 60) {
    const subjectName = weakestSubject.charAt(0).toUpperCase() + weakestSubject.slice(1);
    actionableSteps.push({
      action: `Strengthen ${subjectName}: Solve 30 ${weakestSubject} problems daily for 3 weeks. Focus on NCERT and previous year questions.`,
      timeline: '3 weeks',
      priority: 'High'
    });
  }
  
  if (subjectScores.stamina < 60) {
    actionableSteps.push({
      action: `Build Exam Stamina: Take 2 full-length tests weekly under timed conditions. Gradually increase study session duration.`,
      timeline: '4 weeks',
      priority: 'Medium'
    });
  }
  
  if (actionableSteps.length === 0) {
    actionableSteps.push({
      action: 'Maintain consistency: Keep your current study schedule and focus on revision of weak topics.',
      timeline: 'Ongoing',
      priority: 'Medium'
    });
  }
  
  return {
    currentScore,
    potentialWithAccuracy,
    potentialWithSubjectFix,
    targetScore,
    actionableSteps
  };
}

// Generate insights
function generateInsights(
  metrics: NEETMetrics,
  subjectScores: SubjectScores,
  answers: NEETAnswer[]
): NEETResult['insights'] {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  
  // Identify strengths
  if (subjectScores.biology > 75) {
    strengths.push('Strong Biology foundation - Doctor material');
  }
  if (subjectScores.accuracy > 75) {
    strengths.push('High accuracy in answering - minimal silly mistakes');
  }
  if (metrics.gritLevel === 'High') {
    strengths.push('Strong resilience and grit - can handle setbacks well');
  }
  if (metrics.neetProbability > 70) {
    strengths.push('Good NEET preparation trajectory');
  }
  
  // Identify weaknesses
  if (subjectScores.physics < 60) {
    weaknesses.push('Physics needs improvement - dragging your score down');
  }
  if (subjectScores.accuracy < 60) {
    weaknesses.push('Too many careless mistakes - focus on accuracy over speed');
  }
  if (subjectScores.stamina < 60) {
    weaknesses.push('Low exam stamina - practice more full-length tests');
  }
  if (metrics.anxietyLevel === 'High') {
    weaknesses.push('High exam anxiety - consider stress management techniques');
  }
  
  // Generate recommendations
  if (metrics.neetProbability < 50) {
    recommendations.push('Consider exploring Plan B career options while continuing NEET preparation');
  }
  
  if (metrics.alliedHealthFit > 80) {
    recommendations.push('You have a strong fit for allied health careers - excellent backup options');
  }
  
  if (subjectScores.accuracy < 65) {
    recommendations.push('Focus on reducing silly mistakes - this alone can improve your score by 20-30 marks');
  }
  
  if (metrics.gritLevel === 'Low') {
    recommendations.push('Build resilience through consistent daily practice and positive mindset exercises');
  }
  
  return {
    strengths: strengths.length > 0 ? strengths : ['Keep working hard - every day counts!'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['No major weaknesses identified'],
    recommendations: recommendations.length > 0 ? recommendations : ['Continue your current preparation strategy']
  };
}

// Extract chapter-wise analysis from extended questions
function analyzeChapterWise(answers: NEETAnswer[]): ChapterWiseAnalysis | undefined {
  const q26Answer = answers.find(a => a.question_id === 'q26'); // Physics strongest
  const q27Answer = answers.find(a => a.question_id === 'q27'); // Physics weakest
  const q28Answer = answers.find(a => a.question_id === 'q28'); // Chemistry strongest
  const q29Answer = answers.find(a => a.question_id === 'q29'); // Biology strongest
  
  if (!q26Answer || !q27Answer || !q28Answer || !q29Answer) {
    return undefined;
  }

  // Extract Physics chapters
  const physicsStrongest: string[] = [];
  const physicsWeakest: string[] = [];
  
  if (q26Answer.answer) {
    // Parse answer to extract chapter names
    if (q26Answer.answer.includes('Mechanics')) physicsStrongest.push('Mechanics');
    if (q26Answer.answer.includes('Thermodynamics')) physicsStrongest.push('Thermodynamics');
    if (q26Answer.answer.includes('Electrostatics')) physicsStrongest.push('Electrostatics & Current Electricity');
    if (q26Answer.answer.includes('Optics')) physicsStrongest.push('Optics');
    if (q26Answer.answer.includes('Modern Physics')) physicsStrongest.push('Modern Physics');
    if (q26Answer.answer.includes('Waves')) physicsStrongest.push('Waves & Oscillations');
  }
  
  if (q27Answer.answer) {
    if (q27Answer.answer.includes('Rotation')) physicsWeakest.push('Rotation & Angular Motion');
    if (q27Answer.answer.includes('Electromagnetic')) physicsWeakest.push('Electromagnetic Induction & AC');
    if (q27Answer.answer.includes('Semiconductors')) physicsWeakest.push('Semiconductors & Electronics');
    if (q27Answer.answer.includes('Gravitation')) physicsWeakest.push('Gravitation');
  }

  // Extract Chemistry topics
  const chemistryStrongest: string[] = [];
  const chemistryWeakest: string[] = [];
  
  if (q28Answer.answer) {
    if (q28Answer.answer.includes('Organic')) chemistryStrongest.push('Organic Chemistry');
    if (q28Answer.answer.includes('Physical')) chemistryStrongest.push('Physical Chemistry');
    if (q28Answer.answer.includes('Inorganic')) chemistryStrongest.push('Inorganic Chemistry');
    if (q28Answer.answer.includes('Biomolecules')) chemistryStrongest.push('Biomolecules & Polymers');
  }

  // Extract Biology sections
  const biologyStrongest: string[] = [];
  const biologyWeakest: string[] = [];
  
  if (q29Answer.answer) {
    if (q29Answer.answer.includes('Botany')) biologyStrongest.push('Botany');
    if (q29Answer.answer.includes('Zoology')) biologyStrongest.push('Zoology');
    if (q29Answer.answer.includes('Cell Biology') || q29Answer.answer.includes('Genetics')) biologyStrongest.push('Cell Biology & Genetics');
    if (q29Answer.answer.includes('Ecology')) biologyStrongest.push('Ecology & Environment');
  }

  // Generate priority recommendations
  const physicsPriority = physicsWeakest.map(chapter => ({
    chapter,
    priority: 'High' as const,
    reason: 'This is your weakest area - focus here for maximum impact'
  }));

  const chemistryPriority = chemistryWeakest.length > 0 ? chemistryWeakest.map(topic => ({
    topic,
    priority: 'High' as const,
    reason: 'This topic needs more attention'
  })) : [{
    topic: 'Focus on balanced preparation',
    priority: 'Medium' as const,
    reason: 'You are balanced - maintain consistency'
  }];

  const biologyPriority = biologyWeakest.length > 0 ? biologyWeakest.map(section => ({
    section,
    priority: 'High' as const,
    reason: 'This section needs improvement'
  })) : [{
    section: 'Maintain strong performance',
    priority: 'Low' as const,
    reason: 'You are strong across biology - focus on maintaining'
  }];

  return {
    physics: {
      strongest: physicsStrongest,
      weakest: physicsWeakest,
      priority: physicsPriority
    },
    chemistry: {
      strongest: chemistryStrongest,
      weakest: chemistryWeakest,
      priority: chemistryPriority
    },
    biology: {
      strongest: biologyStrongest,
      weakest: biologyWeakest,
      priority: biologyPriority
    }
  };
}

// Analyze time management from Q30
function analyzeTimeManagement(answers: NEETAnswer[]): TimeManagementAnalysis | undefined {
  const q30Answer = answers.find(a => a.question_id === 'q30');
  if (!q30Answer) return undefined;

  let currentAllocation = { physics: 60, chemistry: 60, biology: 60 };
  let efficiency: TimeManagementAnalysis['efficiency'] = 'Good';

  if (q30Answer.answer.includes('90min') || q30Answer.answer.includes('75min')) {
    // Parse time allocation from answer
    if (q30Answer.answer.includes('Physics: 90')) {
      currentAllocation = { physics: 90, chemistry: 60, biology: 30 };
      efficiency = 'Needs Adjustment';
    } else if (q30Answer.answer.includes('Physics: 75')) {
      currentAllocation = { physics: 75, chemistry: 60, biology: 45 };
      efficiency = 'Good';
    } else if (q30Answer.answer.includes('60min, Chemistry: 60min, Biology: 60min')) {
      currentAllocation = { physics: 60, chemistry: 60, biology: 60 };
      efficiency = 'Optimal';
    }
  } else if (q30Answer.answer.includes('don\'t track')) {
    efficiency = 'Poor';
  }

  const recommendedAllocation = { physics: 60, chemistry: 60, biology: 60 };
  const recommendations: string[] = [];

  if (efficiency !== 'Optimal') {
    recommendations.push(`Recommended: ${recommendedAllocation.physics} min Physics, ${recommendedAllocation.chemistry} min Chemistry, ${recommendedAllocation.biology} min Biology`);
    if (currentAllocation.physics > 70) {
      recommendations.push('Reduce Physics time - Biology has more weightage');
    }
  }

  return {
    currentAllocation,
    recommendedAllocation,
    efficiency,
    recommendations: recommendations.length > 0 ? recommendations : ['Your time allocation is optimal!']
  };
}

// Analyze NCERT vs PYQ from Q31 and Q32
function analyzeNCERTPYQ(answers: NEETAnswer[]): NCERTPYQAnalysis | undefined {
  const q31Answer = answers.find(a => a.question_id === 'q31');
  const q32Answer = answers.find(a => a.question_id === 'q32');
  
  if (!q31Answer || !q32Answer) return undefined;

  let ncertConfidence = 60;
  let pyqCompletion = 50;

  // Extract NCERT confidence
  if (q31Answer.answer.includes('Very confident (80%+')) {
    ncertConfidence = 85;
  } else if (q31Answer.answer.includes('Somewhat confident (50-80%')) {
    ncertConfidence = 65;
  } else if (q31Answer.answer.includes('Need work (<50%')) {
    ncertConfidence = 35;
  } else if (q31Answer.answer.includes('rely more on reference')) {
    ncertConfidence = 45;
  }

  // Extract PYQ completion
  if (q32Answer.answer.includes('All PYQs (2016-2024')) {
    pyqCompletion = 95;
  } else if (q32Answer.answer.includes('Most PYQs (2020-2024')) {
    pyqCompletion = 70;
  } else if (q32Answer.answer.includes('Some PYQs (2022-2024')) {
    pyqCompletion = 50;
  } else if (q32Answer.answer.includes('Very few or none')) {
    pyqCompletion = 15;
  }

  let gap: NCERTPYQAnalysis['gap'] = 'Balanced';
  const recommendations: string[] = [];

  if (ncertConfidence >= 75 && pyqCompletion < 60) {
    gap = 'NCERT Strong';
    recommendations.push('Focus on solving more PYQs - your NCERT foundation is strong');
  } else if (ncertConfidence < 60 && pyqCompletion >= 70) {
    gap = 'PYQ Strong';
    recommendations.push('Strengthen NCERT concepts - PYQ practice alone is not enough');
  } else if (ncertConfidence < 60 && pyqCompletion < 60) {
    gap = 'Both Need Work';
    recommendations.push('Build NCERT foundation first, then practice PYQs');
  } else {
    gap = 'Balanced';
    recommendations.push('Maintain balanced preparation - both NCERT and PYQs are important');
  }

  return {
    ncertConfidence,
    pyqCompletion,
    gap,
    recommendations
  };
}

// Analyze mock test trend from Q33 and Q34
function analyzeMockTestTrend(answers: NEETAnswer[]): MockTestTrend | undefined {
  const q33Answer = answers.find(a => a.question_id === 'q33');
  const q34Answer = answers.find(a => a.question_id === 'q34');
  
  if (!q33Answer || !q34Answer) return undefined;

  let frequency: MockTestTrend['frequency'] = 'Medium';
  let trend: MockTestTrend['trend'] = 'Stable';

  // Extract frequency
  if (q33Answer.answer.includes('4+ tests')) {
    frequency = 'High';
  } else if (q33Answer.answer.includes('2-3 tests')) {
    frequency = 'Medium';
  } else if (q33Answer.answer.includes('1 test per month')) {
    frequency = 'Low';
  } else if (q33Answer.answer.includes('<1 test')) {
    frequency = 'Very Low';
  }

  // Extract trend
  if (q34Answer.answer.includes('Improving consistently')) {
    trend = 'Improving';
  } else if (q34Answer.answer.includes('Improving gradually')) {
    trend = 'Improving';
  } else if (q34Answer.answer.includes('Fluctuating')) {
    trend = 'Fluctuating';
  } else if (q34Answer.answer.includes('Stagnant')) {
    trend = 'Stable';
  } else if (q34Answer.answer.includes('Declining')) {
    trend = 'Declining';
  }

  // Get current score for projection
  const q1Answer = answers.find(a => a.question_id === 'q1');
  let currentScore = 450;
  if (q1Answer?.answer.includes('300 - 450')) currentScore = 375;
  else if (q1Answer?.answer.includes('450 - 550')) currentScore = 500;
  else if (q1Answer?.answer.includes('550 - 620')) currentScore = 585;
  else if (q1Answer?.answer.includes('620+')) currentScore = 650;

  let projectedScore = currentScore;
  if (trend === 'Improving') {
    projectedScore = Math.min(720, currentScore + 60); // +60 marks projection
  } else if (trend === 'Declining') {
    projectedScore = Math.max(300, currentScore - 30); // -30 marks projection
  }

  const recommendations: string[] = [];
  if (frequency === 'Very Low') {
    recommendations.push('Increase mock test frequency to at least 2-3 per month');
  }
  if (trend === 'Declining') {
    recommendations.push('Identify reasons for declining scores - analyze mistake patterns');
  } else if (trend === 'Stable') {
    recommendations.push('Implement targeted improvement strategies to break the plateau');
  }

  return {
    frequency,
    trend,
    projectedScore,
    recommendations: recommendations.length > 0 ? recommendations : ['Maintain current mock test strategy']
  };
}

// Analyze revision strategy from Q35
function analyzeRevisionStrategy(answers: NEETAnswer[]): ExtendedAnalytics['revisionStrategy'] | undefined {
  const q35Answer = answers.find(a => a.question_id === 'q35');
  if (!q35Answer) return undefined;

  let current = 'No systematic revision';
  let recommended = 'Regular weekly revision cycle';
  let priority: 'High' | 'Medium' | 'Low' = 'High';

  if (q35Answer.answer.includes('Regular weekly revision')) {
    current = 'Weekly revision cycle';
    recommended = 'Maintain weekly cycle - excellent strategy';
    priority = 'Low';
  } else if (q35Answer.answer.includes('Monthly revision')) {
    current = 'Monthly revision';
    recommended = 'Increase to bi-weekly revision for better retention';
    priority = 'Medium';
  } else if (q35Answer.answer.includes('Only before mock tests')) {
    current = 'Revision only before tests';
    recommended = 'Implement regular weekly revision cycle';
    priority = 'High';
  } else if (q35Answer.answer.includes('No systematic revision')) {
    current = 'No systematic revision';
    recommended = 'Start with monthly revision, gradually move to weekly';
    priority = 'High';
  }

  return {
    current,
    recommended,
    priority
  };
}

// Main function to calculate complete NEET result
export function calculateNEETResult(answers: NEETAnswer[]): NEETResult {
  const neetProbability = calculateNEETProbability(answers);
  const alliedHealthFit = calculateAlliedHealthFit(answers);
  const subjectScores = calculateSubjectScores(answers);
  const careerTags = collectCareerTags(answers);
  const anxietyLevel = determineAnxietyLevel(answers);
  const gritLevel = determineGritLevel(answers);
  
  const metrics: NEETMetrics = {
    neetProbability,
    alliedHealthFit,
    subjectScores,
    careerTags,
    anxietyLevel,
    gritLevel
  };
  
  const alternativeCareers = recommendAlternativeCareers(answers, careerTags);
  const rankImprovement = calculateRankImprovement(answers, subjectScores);
  const insights = generateInsights(metrics, subjectScores, answers);

  // Extended analytics (if extended questions are answered)
  const extendedAnalytics: ExtendedAnalytics = {};
  const chapterWise = analyzeChapterWise(answers);
  const timeManagement = analyzeTimeManagement(answers);
  const ncertPYQ = analyzeNCERTPYQ(answers);
  const mockTestTrend = analyzeMockTestTrend(answers);
  const revisionStrategy = analyzeRevisionStrategy(answers);

  if (chapterWise) extendedAnalytics.chapterWise = chapterWise;
  if (timeManagement) extendedAnalytics.timeManagement = timeManagement;
  if (ncertPYQ) extendedAnalytics.ncertPYQ = ncertPYQ;
  if (mockTestTrend) extendedAnalytics.mockTestTrend = mockTestTrend;
  if (revisionStrategy) extendedAnalytics.revisionStrategy = revisionStrategy;
  
  return {
    metrics,
    alternativeCareers,
    rankImprovement,
    insights,
    extendedAnalytics: Object.keys(extendedAnalytics).length > 0 ? extendedAnalytics : undefined
  };
}


