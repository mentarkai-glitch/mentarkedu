import { TraitScores, QuizAnswer } from './path-finder-scoring';
import { pathFinderQuestions } from '@/lib/data/path-finder-questions';
import type { Language } from '@/lib/data/path-finder-questions';
import type {
  CompleteTraitProfile,
  PersonalityInsights,
  LearningStyle,
  SubjectRecommendation,
  ExamStrategy,
  AlternativeStream,
  CareerInsights,
  WhoYouAreNow,
  CareerPathWithProgression,
  CollegeRecommendation,
  LifeVisualization
} from './path-finder-scoring';

export function generateCompleteTraitProfile(
  traitScores: TraitScores,
  language: Language = 'en'
): CompleteTraitProfile[] {
  const maxScore = Math.max(...Object.values(traitScores));
  const totalScore = Object.values(traitScores).reduce((sum, score) => sum + score, 0);

  const traitNames: Record<keyof TraitScores, Record<Language, { name: string; description: string }>> = {
    logical: {
      en: { name: 'Logical Thinker', description: 'You excel at analyzing problems and finding systematic solutions' },
      hi: { name: 'तार्किक विचारक', description: 'आप समस्याओं का विश्लेषण करने और व्यवस्थित समाधान खोजने में उत्कृष्ट हैं' },
      mr: { name: 'तार्किक विचारक', description: 'तुम समस्यांचे विश्लेषण करण्यात आणि व्यवस्थित उपाय शोधण्यात उत्कृष्ट आहात' }
    },
    creative: {
      en: { name: 'Creative', description: 'You think outside the box and value innovation' },
      hi: { name: 'रचनात्मक', description: 'आप बॉक्स के बाहर सोचते हैं और नवाचार को महत्व देते हैं' },
      mr: { name: 'सर्जनशील', description: 'तुम बॉक्सच्या बाहेर विचार करता आणि नवाचाराला महत्त्व देतात' }
    },
    people: {
      en: { name: 'People-Oriented', description: 'You enjoy helping others and working in teams' },
      hi: { name: 'लोग-उन्मुख', description: 'आप दूसरों की मदद करना और टीमों में काम करना पसंद करते हैं' },
      mr: { name: 'लोक-उन्मुख', description: 'तुम इतरांना मदत करणे आणि संघांमध्ये काम करणे आवडते' }
    },
    handsOn: {
      en: { name: 'Hands-On Learner', description: 'You learn best by doing and experimenting' },
      hi: { name: 'व्यावहारिक शिक्षार्थी', description: 'आप करके और प्रयोग करके सबसे अच्छा सीखते हैं' },
      mr: { name: 'व्यावहारिक शिक्षार्थी', description: 'तुम करून आणि प्रयोग करून सर्वोत्तम शिकता' }
    },
    leader: {
      en: { name: 'Leader', description: 'You naturally take charge and inspire others' },
      hi: { name: 'नेता', description: 'आप स्वाभाविक रूप से जिम्मेदारी लेते हैं और दूसरों को प्रेरित करते हैं' },
      mr: { name: 'नेता', description: 'तुम स्वाभाविकपणे जबाबदारी घेता आणि इतरांना प्रेरित करता' }
    },
    disciplined: {
      en: { name: 'Disciplined', description: 'You value structure and consistency in your work' },
      hi: { name: 'अनुशासित', description: 'आप अपने काम में संरचना और निरंतरता को महत्व देते हैं' },
      mr: { name: 'शिस्तबद्ध', description: 'तुम तुमच्या कामात संरचना आणि सातत्याला महत्त्व देतात' }
    }
  };

  return (Object.entries(traitScores) as [keyof TraitScores, number][])
    .map(([trait, score]) => {
      const percentage = totalScore > 0 ? Math.round((score / totalScore) * 100) : 0;
      const traitInfo = traitNames[trait][language];
      return {
        trait: traitInfo.name,
        score: Math.round(score * 10) / 10, // Round to 1 decimal
        percentage,
        description: traitInfo.description
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function generatePersonalityInsights(
  traitScores: TraitScores,
  language: Language = 'en'
): PersonalityInsights {
  const topTrait = Object.entries(traitScores)
    .sort(([, a], [, b]) => b - a)[0][0] as keyof TraitScores;
  
  const secondTrait = Object.entries(traitScores)
    .sort(([, a], [, b]) => b - a)[1][0] as keyof TraitScores;

  const personalityTypes: Record<string, Record<Language, { type: string; description: string; strengths: string[]; growthAreas: string[] }>> = {
    'logical_creative': {
      en: {
        type: 'Analytical Innovator',
        description: 'You combine logical thinking with creative problem-solving, making you excellent at finding unique solutions.',
        strengths: ['Problem-solving', 'Innovation', 'Critical thinking'],
        growthAreas: ['Team collaboration', 'Time management']
      },
      hi: {
        type: 'विश्लेषणात्मक नवप्रवर्तक',
        description: 'आप तार्किक सोच को रचनात्मक समस्या-समाधान के साथ जोड़ते हैं, जो आपको अद्वितीय समाधान खोजने में उत्कृष्ट बनाता है।',
        strengths: ['समस्या-समाधान', 'नवाचार', 'आलोचनात्मक सोच'],
        growthAreas: ['टीम सहयोग', 'समय प्रबंधन']
      },
      mr: {
        type: 'विश्लेषणात्मक नवप्रवर्तक',
        description: 'तुम तार्किक विचारास सर्जनशील समस्या-निराकरणासह जोडता, जे तुम्हाला अद्वितीय उपाय शोधण्यात उत्कृष्ट बनवते।',
        strengths: ['समस्या-निराकरण', 'नवाचार', 'आलोचनात्मक विचार'],
        growthAreas: ['संघ सहयोग', 'वेळ व्यवस्थापन']
      }
    },
    'logical_people': {
      en: {
        type: 'Analytical Helper',
        description: 'You use logical thinking to help others, making you great at problem-solving in service-oriented fields.',
        strengths: ['Analysis', 'Empathy', 'Systematic approach'],
        growthAreas: ['Creative expression', 'Risk-taking']
      },
      hi: {
        type: 'विश्लेषणात्मक सहायक',
        description: 'आप दूसरों की मदद करने के लिए तार्किक सोच का उपयोग करते हैं, जो आपको सेवा-उन्मुख क्षेत्रों में समस्या-समाधान में महान बनाता है।',
        strengths: ['विश्लेषण', 'सहानुभूति', 'व्यवस्थित दृष्टिकोण'],
        growthAreas: ['रचनात्मक अभिव्यक्ति', 'जोखिम लेना']
      },
      mr: {
        type: 'विश्लेषणात्मक सहायक',
        description: 'तुम इतरांना मदत करण्यासाठी तार्किक विचार वापरता, जे तुम्हाला सेवा-उन्मुख क्षेत्रांमध्ये समस्या-निराकरणात महान बनवते।',
        strengths: ['विश्लेषण', 'सहानुभूति', 'व्यवस्थित दृष्टिकोण'],
        growthAreas: ['सर्जनशील अभिव्यक्ती', 'धोका घेणे']
      }
    }
  };

  // Determine personality type based on top traits
  const typeKey = `${topTrait}_${secondTrait}`;
  const fallbackType = personalityTypes['logical_creative'] || Object.values(personalityTypes)[0];
  const personalityType = personalityTypes[typeKey] || fallbackType;

  return {
    type: personalityType[language].type,
    description: personalityType[language].description,
    strengths: personalityType[language].strengths,
    growthAreas: personalityType[language].growthAreas
  };
}

export function generateLearningStyle(
  answers: QuizAnswer[],
  language: Language = 'en'
): LearningStyle {
  const q3Answer = answers.find(a => a.question_id === 'q3')?.answer as string || '';
  
  const learningStyleMap: Record<string, { primary: 'Visual' | 'Auditory' | 'Kinesthetic' | 'Reading'; secondary?: string; recommendations: Record<Language, string[]> }> = {
    'Visual & diagrams': {
      primary: 'Visual',
      secondary: 'Reading',
      recommendations: {
        en: ['Use mind maps and diagrams', 'Watch video tutorials', 'Create visual notes'],
        hi: ['माइंड मैप्स और आरेख का उपयोग करें', 'वीडियो ट्यूटोरियल देखें', 'दृश्य नोट्स बनाएं'],
        mr: ['माइंड मॅप्स आणि आकृत्या वापरा', 'व्हिडिओ ट्यूटोरियल पहा', 'दृश्य नोट्स तयार करा']
      }
    },
    'By doing (hands-on)': {
      primary: 'Kinesthetic',
      secondary: 'Visual',
      recommendations: {
        en: ['Practice with real examples', 'Build projects', 'Use physical models'],
        hi: ['वास्तविक उदाहरणों के साथ अभ्यास करें', 'प्रोजेक्ट बनाएं', 'भौतिक मॉडल का उपयोग करें'],
        mr: ['वास्तविक उदाहरणांसह सराव करा', 'प्रकल्प तयार करा', 'भौतिक मॉडेल वापरा']
      }
    },
    'Reading & research': {
      primary: 'Reading',
      secondary: 'Visual',
      recommendations: {
        en: ['Read textbooks thoroughly', 'Take detailed notes', 'Summarize key concepts'],
        hi: ['पाठ्यपुस्तकों को अच्छी तरह से पढ़ें', 'विस्तृत नोट्स लें', 'मुख्य अवधारणाओं को सारांशित करें'],
        mr: ['पाठ्यपुस्तके तपशीलवार वाचा', 'तपशीलवार नोट्स घ्या', 'मुख्य संकल्पनांचा सारांश करा']
      }
    },
    'Group discussions': {
      primary: 'Auditory',
      secondary: 'Reading',
      recommendations: {
        en: ['Join study groups', 'Explain concepts to others', 'Record and listen to lectures'],
        hi: ['अध्ययन समूहों में शामिल हों', 'दूसरों को अवधारणाएं समझाएं', 'व्याख्यान रिकॉर्ड करें और सुनें'],
        mr: ['अभ्यास गटांमध्ये सामील व्हा', 'इतरांना संकल्पना समजावा', 'व्याख्यान रेकॉर्ड करा आणि ऐका']
      }
    }
  };

  const style = learningStyleMap[q3Answer] || learningStyleMap['Reading & research'];
  
  return {
    primary: style.primary,
    secondary: style.secondary,
    recommendations: style.recommendations[language]
  };
}

export function generateSubjectRecommendations(
  answers: QuizAnswer[],
  stream: string,
  language: Language = 'en'
): SubjectRecommendation[] {
  const q8Answer = answers.find(a => a.question_id === 'q8')?.answer as string[] || [];
  
  const subjectMap: Record<string, Record<Language, { name: string; reason: string }>> = {
    'Mathematics': {
      en: { name: 'Mathematics', reason: 'Essential for logical reasoning and problem-solving' },
      hi: { name: 'गणित', reason: 'तार्किक तर्क और समस्या-समाधान के लिए आवश्यक' },
      mr: { name: 'गणित', reason: 'तार्किक तर्क आणि समस्या-निराकरणासाठी आवश्यक' }
    },
    'Physics': {
      en: { name: 'Physics', reason: 'Builds analytical thinking and practical application skills' },
      hi: { name: 'भौतिकी', reason: 'विश्लेषणात्मक सोच और व्यावहारिक अनुप्रयोग कौशल बनाता है' },
      mr: { name: 'भौतिकशास्त्र', reason: 'विश्लेषणात्मक विचार आणि व्यावहारिक उपयोग कौशल्ये तयार करते' }
    },
    'Chemistry': {
      en: { name: 'Chemistry', reason: 'Develops systematic thinking and attention to detail' },
      hi: { name: 'रसायन विज्ञान', reason: 'व्यवस्थित सोच और विवरण पर ध्यान विकसित करता है' },
      mr: { name: 'रसायनशास्त्र', reason: 'व्यवस्थित विचार आणि तपशीलावर लक्ष विकसित करते' }
    },
    'Biology': {
      en: { name: 'Biology', reason: 'Combines logical thinking with understanding living systems' },
      hi: { name: 'जीव विज्ञान', reason: 'तार्किक सोच को जीवित प्रणालियों की समझ के साथ जोड़ता है' },
      mr: { name: 'जीवशास्त्र', reason: 'तार्किक विचारास जिवंत प्रणालींच्या समजुतीसह जोडते' }
    }
  };

  // Get top 3 selected subjects
  const selectedSubjects = q8Answer.slice(0, 3);
  
  return selectedSubjects.map((subject, idx) => {
    const subjectInfo = subjectMap[subject] || {
      en: { name: subject, reason: 'Important for your chosen stream' },
      hi: { name: subject, reason: 'आपके चुने गए स्ट्रीम के लिए महत्वपूर्ण' },
      mr: { name: subject, reason: 'तुमच्या निवडलेल्या स्ट्रीमसाठी महत्त्वाचे' }
    };
    
    return {
      subject: subjectInfo[language].name,
      priority: idx === 0 ? 'High' : idx === 1 ? 'Medium' : 'Low' as 'High' | 'Medium' | 'Low',
      reason: subjectInfo[language].reason
    };
  });
}

export function generateExamStrategy(
  answers: QuizAnswer[],
  language: Language = 'en'
): ExamStrategy {
  const q12Answer = answers.find(a => a.question_id === 'q12')?.answer as string || '';
  const studyTolerance = answers.find(a => a.question_id === 'q4')?.answer as number || 5;

  const strategies: Record<string, Record<Language, { format: string; tips: string[]; timeManagement: string }>> = {
    'Multiple choice (MCQ)': {
      en: {
        format: 'MCQ Format',
        tips: ['Practice elimination technique', 'Focus on keywords', 'Time yourself per question'],
        timeManagement: 'Allocate 1-2 minutes per question'
      },
      hi: {
        format: 'MCQ प्रारूप',
        tips: ['निष्कासन तकनीक का अभ्यास करें', 'कीवर्ड पर ध्यान दें', 'प्रति प्रश्न अपना समय निर्धारित करें'],
        timeManagement: 'प्रति प्रश्न 1-2 मिनट आवंटित करें'
      },
      mr: {
        format: 'MCQ स्वरूप',
        tips: ['निष्कासन तंत्राचा सराव करा', 'कीवर्डवर लक्ष केंद्रित करा', 'प्रति प्रश्न स्वतःला वेळ द्या'],
        timeManagement: 'प्रति प्रश्न 1-2 मिनिटे वाटप करा'
      }
    },
    'Written/Descriptive': {
      en: {
        format: 'Written Format',
        tips: ['Practice essay writing', 'Structure your answers', 'Use examples'],
        timeManagement: 'Spend 5-10 minutes planning before writing'
      },
      hi: {
        format: 'लिखित प्रारूप',
        tips: ['निबंध लेखन का अभ्यास करें', 'अपने उत्तरों को संरचित करें', 'उदाहरणों का उपयोग करें'],
        timeManagement: 'लिखने से पहले 5-10 मिनट योजना बनाने में बिताएं'
      },
      mr: {
        format: 'लिखित स्वरूप',
        tips: ['निबंध लेखनाचा सराव करा', 'तुमच्या उत्तरांना संरचित करा', 'उदाहरणे वापरा'],
        timeManagement: 'लेखन करण्यापूर्वी 5-10 मिनिटे नियोजन करण्यात घालवा'
      }
    },
    'Practical/Projects': {
      en: {
        format: 'Practical Format',
        tips: ['Practice hands-on skills', 'Document your process', 'Focus on accuracy'],
        timeManagement: 'Allocate time for setup, execution, and review'
      },
      hi: {
        format: 'व्यावहारिक प्रारूप',
        tips: ['व्यावहारिक कौशल का अभ्यास करें', 'अपनी प्रक्रिया को दस्तावेज करें', 'सटीकता पर ध्यान दें'],
        timeManagement: 'सेटअप, निष्पादन और समीक्षा के लिए समय आवंटित करें'
      },
      mr: {
        format: 'व्यावहारिक स्वरूप',
        tips: ['व्यावहारिक कौशल्यांचा सराव करा', 'तुमची प्रक्रिया दस्तऐवज करा', 'अचूकतेवर लक्ष केंद्रित करा'],
        timeManagement: 'सेटअप, अंमलबजावणी आणि समीक्षेसाठी वेळ वाटप करा'
      }
    }
  };

  const strategy = strategies[q12Answer] || strategies['Multiple choice (MCQ)'];
  const studyHours = studyTolerance >= 7 ? '6-8 hours daily' : studyTolerance >= 5 ? '4-6 hours daily' : '2-4 hours daily';
  
  return {
    preferredFormat: strategy[language].format,
    preparationTips: strategy[language].tips,
    timeManagement: `${strategy[language].timeManagement}. Study schedule: ${studyHours}`
  };
}

export function generateAlternativeStreams(
  traitScores: TraitScores,
  currentStream: string,
  language: Language = 'en'
): AlternativeStream[] {
  const streamMatchScores: Array<{ stream: string; score: number; why: Record<Language, string> }> = [
    {
      stream: 'Science (PCM)',
      score: traitScores.logical * 2 + traitScores.disciplined,
      why: {
        en: 'Strong logical thinking and discipline',
        hi: 'मजबूत तार्किक सोच और अनुशासन',
        mr: 'मजबूत तार्किक विचार आणि शिस्त'
      }
    },
    {
      stream: 'Science (PCB)',
      score: traitScores.logical + traitScores.people * 2,
      why: {
        en: 'Logical thinking with people orientation',
        hi: 'लोग-उन्मुखता के साथ तार्किक सोच',
        mr: 'लोक-उन्मुखतेसह तार्किक विचार'
      }
    },
    {
      stream: 'Commerce',
      score: traitScores.leader * 2 + traitScores.logical,
      why: {
        en: 'Leadership and analytical skills',
        hi: 'नेतृत्व और विश्लेषणात्मक कौशल',
        mr: 'नेतृत्व आणि विश्लेषणात्मक कौशल्ये'
      }
    },
    {
      stream: 'Arts/Humanities',
      score: traitScores.creative * 2 + traitScores.people,
      why: {
        en: 'Creative expression and people skills',
        hi: 'रचनात्मक अभिव्यक्ति और लोगों के कौशल',
        mr: 'सर्जनशील अभिव्यक्ती आणि लोकांची कौशल्ये'
      }
    },
    {
      stream: 'Vocational',
      score: traitScores.handsOn * 2 + traitScores.creative,
      why: {
        en: 'Hands-on skills and practical creativity',
        hi: 'व्यावहारिक कौशल और व्यावहारिक रचनात्मकता',
        mr: 'व्यावहारिक कौशल्ये आणि व्यावहारिक सर्जनशीलता'
      }
    }
  ];

  return streamMatchScores
    .filter(s => s.stream !== currentStream)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
    .map(s => ({
      stream: s.stream,
      matchScore: Math.round((s.score / 20) * 100), // Convert to percentage
      why: s.why[language]
    }));
}

export function generateCareerInsights(
  stream: string,
  traitScores: TraitScores,
  language: Language = 'en'
): CareerInsights {
  const insights: Record<string, Record<Language, CareerInsights>> = {
    'Science (PCM)': {
      en: {
        growthPotential: 'High',
        salaryRange: '₹6-25 LPA (entry to senior)',
        jobMarket: 'Growing',
        opportunities: ['IT sector', 'Engineering', 'Data Science', 'Research']
      },
      hi: {
        growthPotential: 'High' as const,
        salaryRange: '₹6-25 LPA (प्रवेश से वरिष्ठ)',
        jobMarket: 'Growing' as const,
        opportunities: ['आईटी क्षेत्र', 'इंजीनियरिंग', 'डेटा साइंस', 'अनुसंधान']
      },
      mr: {
        growthPotential: 'High' as const,
        salaryRange: '₹6-25 LPA (प्रवेश ते वरिष्ठ)',
        jobMarket: 'Growing' as const,
        opportunities: ['आयटी क्षेत्र', 'अभियांत्रिकी', 'डेटा विज्ञान', 'संशोधन']
      }
    },
    'Science (PCB)': {
      en: {
        growthPotential: 'High',
        salaryRange: '₹5-30 LPA (entry to senior)',
        jobMarket: 'Stable',
        opportunities: ['Healthcare', 'Pharmaceuticals', 'Biotechnology', 'Research']
      },
      hi: {
        growthPotential: 'High' as const,
        salaryRange: '₹5-30 LPA (प्रवेश से वरिष्ठ)',
        jobMarket: 'Stable' as const,
        opportunities: ['स्वास्थ्य सेवा', 'फार्मास्युटिकल्स', 'बायोटेक्नोलॉजी', 'अनुसंधान']
      },
      mr: {
        growthPotential: 'High' as const,
        salaryRange: '₹5-30 LPA (प्रवेश ते वरिष्ठ)',
        jobMarket: 'Stable' as const,
        opportunities: ['आरोग्य सेवा', 'फार्मास्युटिकल्स', 'जैवतंत्रज्ञान', 'संशोधन']
      }
    },
    'Commerce': {
      en: {
        growthPotential: 'High',
        salaryRange: '₹4-20 LPA (entry to senior)',
        jobMarket: 'Stable',
        opportunities: ['Finance', 'Accounting', 'Business Management', 'Consulting']
      },
      hi: {
        growthPotential: 'High' as const,
        salaryRange: '₹4-20 LPA (प्रवेश से वरिष्ठ)',
        jobMarket: 'Stable' as const,
        opportunities: ['वित्त', 'लेखांकन', 'व्यवसाय प्रबंधन', 'परामर्श']
      },
      mr: {
        growthPotential: 'High' as const,
        salaryRange: '₹4-20 LPA (प्रवेश ते वरिष्ठ)',
        jobMarket: 'Stable' as const,
        opportunities: ['वित्त', 'लेखांकन', 'व्यवसाय व्यवस्थापन', 'सल्लागार']
      }
    },
    'Arts/Humanities': {
      en: {
        growthPotential: 'Medium',
        salaryRange: '₹3-15 LPA (entry to senior)',
        jobMarket: 'Competitive',
        opportunities: ['Media', 'Design', 'Education', 'Content Creation']
      },
      hi: {
        growthPotential: 'Medium' as const,
        salaryRange: '₹3-15 LPA (प्रवेश से वरिष्ठ)',
        jobMarket: 'Competitive' as const,
        opportunities: ['मीडिया', 'डिज़ाइन', 'शिक्षा', 'सामग्री निर्माण']
      },
      mr: {
        growthPotential: 'Medium' as const,
        salaryRange: '₹3-15 LPA (प्रवेश ते वरिष्ठ)',
        jobMarket: 'Competitive' as const,
        opportunities: ['मीडिया', 'डिझाइन', 'शिक्षण', 'सामग्री निर्माण']
      }
    },
    'Vocational': {
      en: {
        growthPotential: 'Medium',
        salaryRange: '₹3-12 LPA (entry to senior)',
        jobMarket: 'Growing',
        opportunities: ['IT Services', 'Hospitality', 'Retail', 'Skilled Trades']
      },
      hi: {
        growthPotential: 'Medium' as const,
        salaryRange: '₹3-12 LPA (प्रवेश से वरिष्ठ)',
        jobMarket: 'Growing' as const,
        opportunities: ['आईटी सेवाएं', 'आतिथ्य', 'खुदरा', 'कुशल व्यापार']
      },
      mr: {
        growthPotential: 'Medium' as const,
        salaryRange: '₹3-12 LPA (प्रवेश ते वरिष्ठ)',
        jobMarket: 'Growing' as const,
        opportunities: ['आयटी सेवा', 'आतिथ्य', 'खुदरा', 'कुशल व्यापार']
      }
    }
  };

  return insights[stream]?.[language] || insights['Commerce'][language];
}

/**
 * Generate "Who You Are Now" profile from quiz answers
 */
export function generateWhoYouAreNow(
  answers: QuizAnswer[],
  traitScores: TraitScores,
  language: Language = 'en'
): WhoYouAreNow {
  const q13Answer = answers.find(a => a.question_id === 'q13')?.answer as string[] || [];
  const q14Answer = answers.find(a => a.question_id === 'q14')?.answer as string[] || [];
  const q15Answer = answers.find(a => a.question_id === 'q15')?.answer as string[] || [];
  const q16Answer = answers.find(a => a.question_id === 'q16')?.answer as string || '';
  const q8Answer = answers.find(a => a.question_id === 'q8')?.answer as string[] || [];
  
  const topStrengths = Object.entries(traitScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([trait]) => {
      const names: Record<string, Record<Language, string>> = {
        logical: { en: 'Logical Thinking', hi: 'तार्किक सोच', mr: 'तार्किक विचार' },
        creative: { en: 'Creativity', hi: 'रचनात्मकता', mr: 'सर्जनशीलता' },
        people: { en: 'People Skills', hi: 'लोगों के कौशल', mr: 'लोक कौशल्ये' },
        handsOn: { en: 'Practical Skills', hi: 'व्यावहारिक कौशल', mr: 'व्यावहारिक कौशल्ये' },
        leader: { en: 'Leadership', hi: 'नेतृत्व', mr: 'नेतृत्व' },
        disciplined: { en: 'Discipline', hi: 'अनुशासन', mr: 'शिस्त' }
      };
      return names[trait]?.[language] || trait;
    });

  const translations = {
    en: {
      summary: `You are someone who ${q13Answer.length > 0 ? `feels most alive when ${q13Answer.slice(0, 2).join(' and ')}` : 'has diverse interests'}. Your natural abilities include ${q14Answer.slice(0, 2).join(' and ') || 'multiple talents'}, and you lose track of time when ${q15Answer.slice(0, 1)[0] || 'engaged in activities you love'}.`
    },
    hi: {
      summary: `आप किसी ऐसे व्यक्ति हैं जो ${q13Answer.length > 0 ? `सबसे ज्यादा जीवंत महसूस करते हैं जब ${q13Answer.slice(0, 2).join(' और ')}` : 'विविध रुचियां रखते हैं'}. आपकी प्राकृतिक क्षमताओं में ${q14Answer.slice(0, 2).join(' और ') || 'कई प्रतिभाएं'} शामिल हैं, और आप समय का हिसाब भूल जाते हैं जब ${q15Answer.slice(0, 1)[0] || 'आप उन गतिविधियों में लगे होते हैं जिनसे आप प्यार करते हैं'}.`
    },
    mr: {
      summary: `तुम असे व्यक्ती आहात जे ${q13Answer.length > 0 ? `सर्वात जास्त जिवंत वाटते जेव्हा ${q13Answer.slice(0, 2).join(' आणि ')}` : 'विविध स्वारस्ये आहेत'}. तुमच्या नैसर्गिक क्षमतांमध्ये ${q14Answer.slice(0, 2).join(' आणि ') || 'अनेक प्रतिभा'} समाविष्ट आहेत, आणि तुम्ही वेळेचा हिशोब विसरता जेव्हा ${q15Answer.slice(0, 1)[0] || 'तुम्ही त्या क्रियाकलापांमध्ये गुंतलेले असता ज्यांचे तुम्ही प्रेम करता'}.`
    }
  };

  return {
    passions: q13Answer.slice(0, 5),
    naturalAbilities: q14Answer.slice(0, 5),
    flowActivities: q15Answer.slice(0, 5),
    values: q16Answer ? [q16Answer] : [],
    currentStrengths: topStrengths,
    interests: q8Answer.slice(0, 5),
    summary: translations[language].summary
  };
}

/**
 * Generate career paths with life progression
 */
export function generateCareerPathsWithProgression(
  stream: string,
  traitScores: TraitScores,
  answers: QuizAnswer[],
  language: Language = 'en'
): CareerPathWithProgression[] {
  const q17Answer = answers.find(a => a.question_id === 'q17')?.answer as string || '';
  const q18Answer = answers.find(a => a.question_id === 'q18')?.answer as string || '';
  const q20Answer = answers.find(a => a.question_id === 'q20')?.answer as number || 5;
  
  const careerTemplates: Record<string, Record<Language, CareerPathWithProgression[]>> = {
    'Science (PCM)': {
      en: [
        {
          careerName: 'Software Engineer',
          description: 'Build innovative software solutions and applications',
          fitScore: 95,
          progression: [
            {
              stage: 'Year 1-2',
              role: 'Junior Developer',
              responsibilities: ['Write code', 'Debug applications', 'Learn frameworks'],
              skills: ['Programming', 'Problem-solving', 'Teamwork'],
              salary: '₹4-8 LPA',
              lifestyle: 'Balanced work-life, learning-focused'
            },
            {
              stage: 'Year 3-5',
              role: 'Senior Developer',
              responsibilities: ['Lead projects', 'Mentor juniors', 'Architecture decisions'],
              skills: ['System Design', 'Leadership', 'Advanced Programming'],
              salary: '₹12-25 LPA',
              lifestyle: 'More responsibility, higher impact'
            },
            {
              stage: 'Year 5-10',
              role: 'Tech Lead / Engineering Manager',
              responsibilities: ['Team management', 'Strategic planning', 'Technical vision'],
              skills: ['Management', 'Strategy', 'Technical Leadership'],
              salary: '₹30-60 LPA',
              lifestyle: 'Leadership role, significant impact'
            }
          ],
          milestones: [
            { year: 1, milestone: 'First job in tech', description: 'Start your career as a developer' },
            { year: 3, milestone: 'Promotion to Senior', description: 'Take on more responsibility' },
            { year: 5, milestone: 'Tech Lead role', description: 'Lead a team of developers' },
            { year: 10, milestone: 'Engineering Manager', description: 'Manage multiple teams' }
          ]
        }
      ],
      hi: [
        {
          careerName: 'सॉफ्टवेयर इंजीनियर',
          description: 'नवाचारी सॉफ्टवेयर समाधान और अनुप्रयोग बनाएं',
          fitScore: 95,
          progression: [
            {
              stage: 'वर्ष 1-2',
              role: 'जूनियर डेवलपर',
              responsibilities: ['कोड लिखना', 'एप्लिकेशन डीबग करना', 'फ्रेमवर्क सीखना'],
              skills: ['प्रोग्रामिंग', 'समस्या-समाधान', 'टीमवर्क'],
              salary: '₹4-8 LPA',
              lifestyle: 'संतुलित कार्य-जीवन, सीखने पर केंद्रित'
            },
            {
              stage: 'वर्ष 3-5',
              role: 'सीनियर डेवलपर',
              responsibilities: ['प्रोजेक्ट का नेतृत्व', 'जूनियरों को मार्गदर्शन', 'आर्किटेक्चर निर्णय'],
              skills: ['सिस्टम डिज़ाइन', 'नेतृत्व', 'उन्नत प्रोग्रामिंग'],
              salary: '₹12-25 LPA',
              lifestyle: 'अधिक जिम्मेदारी, उच्च प्रभाव'
            },
            {
              stage: 'वर्ष 5-10',
              role: 'टेक लीड / इंजीनियरिंग मैनेजर',
              responsibilities: ['टीम प्रबंधन', 'रणनीतिक योजना', 'तकनीकी दृष्टि'],
              skills: ['प्रबंधन', 'रणनीति', 'तकनीकी नेतृत्व'],
              salary: '₹30-60 LPA',
              lifestyle: 'नेतृत्व की भूमिका, महत्वपूर्ण प्रभाव'
            }
          ],
          milestones: [
            { year: 1, milestone: 'टेक में पहली नौकरी', description: 'डेवलपर के रूप में अपना करियर शुरू करें' },
            { year: 3, milestone: 'सीनियर में पदोन्नति', description: 'अधिक जिम्मेदारी लें' },
            { year: 5, milestone: 'टेक लीड की भूमिका', description: 'डेवलपर्स की टीम का नेतृत्व करें' },
            { year: 10, milestone: 'इंजीनियरिंग मैनेजर', description: 'कई टीमों का प्रबंधन करें' }
          ]
        }
      ],
      mr: [
        {
          careerName: 'सॉफ्टवेअर अभियंता',
          description: 'नवाचारी सॉफ्टवेअर उपाय आणि अनुप्रयोग तयार करा',
          fitScore: 95,
          progression: [
            {
              stage: 'वर्ष 1-2',
              role: 'ज्युनियर डेवलपर',
              responsibilities: ['कोड लिहणे', 'अनुप्रयोग डीबग करणे', 'फ्रेमवर्क शिकणे'],
              skills: ['प्रोग्रामिंग', 'समस्या-निराकरण', 'संघ कार्य'],
              salary: '₹4-8 LPA',
              lifestyle: 'संतुलित काम-जीवन, शिकण्यावर केंद्रित'
            },
            {
              stage: 'वर्ष 3-5',
              role: 'सीनियर डेवलपर',
              responsibilities: ['प्रकल्पांचे नेतृत्व', 'ज्युनियरांना मार्गदर्शन', 'आर्किटेक्चर निर्णय'],
              skills: ['सिस्टम डिझाइन', 'नेतृत्व', 'प्रगत प्रोग्रामिंग'],
              salary: '₹12-25 LPA',
              lifestyle: 'अधिक जबाबदारी, उच्च प्रभाव'
            },
            {
              stage: 'वर्ष 5-10',
              role: 'टेक लीड / अभियांत्रिकी व्यवस्थापक',
              responsibilities: ['संघ व्यवस्थापन', 'रणनीतिक नियोजन', 'तांत्रिक दृष्टी'],
              skills: ['व्यवस्थापन', 'रणनीती', 'तांत्रिक नेतृत्व'],
              salary: '₹30-60 LPA',
              lifestyle: 'नेतृत्वाची भूमिका, महत्त्वपूर्ण प्रभाव'
            }
          ],
          milestones: [
            { year: 1, milestone: 'तंत्रज्ञानात पहिली नोकरी', description: 'डेवलपर म्हणून तुमचे करिअर सुरू करा' },
            { year: 3, milestone: 'सीनियरमध्ये पदोन्नती', description: 'अधिक जबाबदारी घ्या' },
            { year: 5, milestone: 'टेक लीडची भूमिका', description: 'डेवलपर्सच्या संघाचे नेतृत्व करा' },
            { year: 10, milestone: 'अभियांत्रिकी व्यवस्थापक', description: 'अनेक संघांचे व्यवस्थापन करा' }
          ]
        }
      ]
    }
  };

  // Return first career path for now (can be expanded)
  const templates = careerTemplates[stream] || careerTemplates['Science (PCM)'];
  return templates[language] || templates.en;
}

/**
 * Generate college recommendations
 */
export function generateCollegeRecommendations(
  stream: string,
  geographicPreference: string[],
  budgetConstraint: boolean,
  language: Language = 'en'
): CollegeRecommendation[] {
  const colleges: Record<string, Record<Language, CollegeRecommendation[]>> = {
    'Science (PCM)': {
      en: [
        {
          name: 'IIT Delhi',
          location: 'New Delhi',
          stream: 'Engineering',
          rank: 2,
          rating: 4.8,
          fees: '₹2-3 Lakhs/year',
          admissionRequirements: ['JEE Advanced', 'Class 12: 75%+', 'Physics, Chemistry, Math'],
          highlights: ['Top NIRF Rank', 'Excellent Placements', 'World-class Faculty'],
          placementStats: {
            averagePackage: '₹20-25 LPA',
            topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs']
          },
          whyFit: 'Perfect for logical thinkers with high study tolerance',
          url: 'https://home.iitd.ac.in/'
        },
        {
          name: 'NIT Trichy',
          location: 'Tiruchirappalli',
          stream: 'Engineering',
          rank: 9,
          rating: 4.6,
          fees: '₹1.5-2 Lakhs/year',
          admissionRequirements: ['JEE Main', 'Class 12: 75%+', 'Physics, Chemistry, Math'],
          highlights: ['Top NIT', 'Strong Industry Connections', 'Affordable'],
          placementStats: {
            averagePackage: '₹12-18 LPA',
            topRecruiters: ['TCS', 'Infosys', 'Wipro', 'Cognizant']
          },
          whyFit: 'Great balance of quality education and affordability',
          url: 'https://www.nitt.edu/'
        }
      ],
      hi: [
        {
          name: 'आईआईटी दिल्ली',
          location: 'नई दिल्ली',
          stream: 'इंजीनियरिंग',
          rank: 2,
          rating: 4.8,
          fees: '₹2-3 लाख/वर्ष',
          admissionRequirements: ['JEE Advanced', 'कक्षा 12: 75%+', 'भौतिकी, रसायन, गणित'],
          highlights: ['शीर्ष NIRF रैंक', 'उत्कृष्ट प्लेसमेंट', 'विश्व स्तरीय संकाय'],
          placementStats: {
            averagePackage: '₹20-25 LPA',
            topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs']
          },
          whyFit: 'उच्च अध्ययन सहनशीलता वाले तार्किक विचारकों के लिए परफेक्ट',
          url: 'https://home.iitd.ac.in/'
        }
      ],
      mr: [
        {
          name: 'आयआयटी दिल्ली',
          location: 'नवी दिल्ली',
          stream: 'अभियांत्रिकी',
          rank: 2,
          rating: 4.8,
          fees: '₹2-3 लाख/वर्ष',
          admissionRequirements: ['JEE Advanced', 'इयत्ता 12: 75%+', 'भौतिकशास्त्र, रसायनशास्त्र, गणित'],
          highlights: ['शीर्ष NIRF रैंक', 'उत्कृष्ट प्लेसमेंट', 'जागतिक स्तराचे संकाय'],
          placementStats: {
            averagePackage: '₹20-25 LPA',
            topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs']
          },
          whyFit: 'उच्च अभ्यास सहनशीलता असलेल्या तार्किक विचारकांसाठी परफेक्ट',
          url: 'https://home.iitd.ac.in/'
        }
      ]
    }
  };

  const streamColleges = colleges[stream] || colleges['Science (PCM)'];
  return streamColleges[language] || streamColleges.en;
}

/**
 * Generate life visualization
 */
export function generateLifeVisualization(
  stream: string,
  careerVision: string,
  answers: QuizAnswer[],
  language: Language = 'en'
): LifeVisualization {
  const q18Answer = answers.find(a => a.question_id === 'q18')?.answer as string || '';
  const q22Answer = answers.find(a => a.question_id === 'q22')?.answer as string[] || [];
  
  const location = q22Answer.length > 0 ? q22Answer[0] : 'Metro city';
  
  const templates: Record<Language, LifeVisualization> = {
    en: {
      year5: {
        age: 22,
        role: 'Software Engineer / Research Associate / Business Analyst',
        location: location,
        lifestyle: q18Answer.includes('High income') ? 'Fast-paced, high-growth environment' : 'Balanced work-life',
        achievements: [
          'Completed graduation',
          'First job secured',
          'Started building professional network',
          'Gained industry experience'
        ],
        dailyRoutine: [
          'Morning: Work/Study',
          'Afternoon: Projects/Learning',
          'Evening: Networking/Skills',
          'Night: Rest/Recreation'
        ]
      },
      year10: {
        age: 27,
        role: 'Senior Engineer / Team Lead / Manager',
        location: location,
        lifestyle: 'Established professional with work-life balance',
        achievements: [
          'Career progression',
          'Leadership role',
          'Financial stability',
          'Professional recognition'
        ],
        impact: 'Making meaningful contributions to your field and mentoring others'
      },
      vision: careerVision || 'Building a successful career in your chosen field',
      keyMoments: [
        { year: 1, moment: 'Graduation', description: 'Complete your degree' },
        { year: 2, moment: 'First Job', description: 'Start your professional journey' },
        { year: 5, moment: 'Career Growth', description: 'Take on more responsibility' },
        { year: 10, moment: 'Leadership', description: 'Lead teams and make impact' }
      ]
    },
    hi: {
      year5: {
        age: 22,
        role: 'सॉफ्टवेयर इंजीनियर / अनुसंधान सहयोगी / व्यापार विश्लेषक',
        location: location,
        lifestyle: q18Answer.includes('High income') ? 'तेज गति, उच्च वृद्धि वातावरण' : 'संतुलित कार्य-जीवन',
        achievements: [
          'स्नातक पूरा',
          'पहली नौकरी सुरक्षित',
          'पेशेवर नेटवर्क बनाना शुरू',
          'उद्योग अनुभव प्राप्त'
        ],
        dailyRoutine: [
          'सुबह: काम/अध्ययन',
          'दोपहर: परियोजनाएं/सीखना',
          'शाम: नेटवर्किंग/कौशल',
          'रात: आराम/मनोरंजन'
        ]
      },
      year10: {
        age: 27,
        role: 'सीनियर इंजीनियर / टीम लीड / मैनेजर',
        location: location,
        lifestyle: 'कार्य-जीवन संतुलन के साथ स्थापित पेशेवर',
        achievements: [
          'करियर प्रगति',
          'नेतृत्व की भूमिका',
          'वित्तीय स्थिरता',
          'पेशेवर मान्यता'
        ],
        impact: 'अपने क्षेत्र में सार्थक योगदान देना और दूसरों को मार्गदर्शन करना'
      },
      vision: careerVision || 'अपने चुने हुए क्षेत्र में एक सफल करियर बनाना',
      keyMoments: [
        { year: 1, moment: 'स्नातक', description: 'अपनी डिग्री पूरी करें' },
        { year: 2, moment: 'पहली नौकरी', description: 'अपनी पेशेवर यात्रा शुरू करें' },
        { year: 5, moment: 'करियर वृद्धि', description: 'अधिक जिम्मेदारी लें' },
        { year: 10, moment: 'नेतृत्व', description: 'टीमों का नेतृत्व करें और प्रभाव डालें' }
      ]
    },
    mr: {
      year5: {
        age: 22,
        role: 'सॉफ्टवेअर अभियंता / संशोधन सहयोगी / व्यवसाय विश्लेषक',
        location: location,
        lifestyle: q18Answer.includes('High income') ? 'वेगवान, उच्च वाढ वातावरण' : 'संतुलित काम-जीवन',
        achievements: [
          'पदवी पूर्ण',
          'पहिली नोकरी सुरक्षित',
          'व्यावसायिक नेटवर्क तयार करणे सुरू',
          'उद्योग अनुभव प्राप्त'
        ],
        dailyRoutine: [
          'सकाळ: काम/अभ्यास',
          'दुपार: प्रकल्प/शिकणे',
          'संध्याकाळ: नेटवर्किंग/कौशल्ये',
          'रात्र: विश्रांती/मनोरंजन'
        ]
      },
      year10: {
        age: 27,
        role: 'सीनियर अभियंता / संघ लीड / व्यवस्थापक',
        location: location,
        lifestyle: 'काम-जीवन संतुलनासह स्थापित व्यावसायिक',
        achievements: [
          'करिअर प्रगती',
          'नेतृत्वाची भूमिका',
          'आर्थिक स्थिरता',
          'व्यावसायिक मान्यता'
        ],
        impact: 'तुमच्या क्षेत्रात अर्थपूर्ण योगदान देणे आणि इतरांना मार्गदर्शन करणे'
      },
      vision: careerVision || 'तुमच्या निवडलेल्या क्षेत्रात यशस्वी करिअर तयार करणे',
      keyMoments: [
        { year: 1, moment: 'पदवी', description: 'तुमची पदवी पूर्ण करा' },
        { year: 2, moment: 'पहिली नोकरी', description: 'तुमची व्यावसायिक यात्रा सुरू करा' },
        { year: 5, moment: 'करिअर वाढ', description: 'अधिक जबाबदारी घ्या' },
        { year: 10, moment: 'नेतृत्व', description: 'संघांचे नेतृत्व करा आणि प्रभाव टाका' }
      ]
    }
  };

  return templates[language] || templates.en;
}

