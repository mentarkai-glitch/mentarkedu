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
  CareerInsights
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

