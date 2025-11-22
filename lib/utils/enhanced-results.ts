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
  // Q21 is now the Subject Interest multi-select question (was Q8 in old structure)
  const q21Answer = answers.find(a => a.question_id === 'q21')?.answer;
  
  // Ensure it's an array - handle all edge cases
  let selectedSubjects: string[] = [];
  if (Array.isArray(q21Answer)) {
    selectedSubjects = q21Answer.filter((s): s is string => typeof s === 'string');
  } else if (typeof q21Answer === 'string') {
    // Handle case where it might be a single string
    selectedSubjects = [q21Answer];
  } else if (q21Answer != null) {
    // Try to convert to array if it's some other type
    try {
      selectedSubjects = Array.from(q21Answer as any).filter((s): s is string => typeof s === 'string');
    } catch {
      selectedSubjects = [];
    }
  }
  
  // Debug log (remove in production if needed)
  if (process.env.NODE_ENV === 'development') {
    console.log('Q21 Answer:', q21Answer, 'Selected Subjects:', selectedSubjects, 'Is Array:', Array.isArray(selectedSubjects));
  }
  
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
    },
    'History': {
      en: { name: 'History', reason: 'Develops critical thinking and understanding of human patterns' },
      hi: { name: 'इतिहास', reason: 'आलोचनात्मक सोच और मानवीय पैटर्न की समझ विकसित करता है' },
      mr: { name: 'इतिहास', reason: 'आलोचनात्मक विचार आणि मानवीय पॅटर्नची समज विकसित करते' }
    },
    'Geography': {
      en: { name: 'Geography', reason: 'Builds spatial awareness and environmental understanding' },
      hi: { name: 'भूगोल', reason: 'स्थानिक जागरूकता और पर्यावरणीय समझ बनाता है' },
      mr: { name: 'भूगोल', reason: 'स्थानिक जागरूकता आणि पर्यावरणीय समज तयार करते' }
    },
    'English': {
      en: { name: 'English', reason: 'Essential for communication and expression' },
      hi: { name: 'अंग्रेजी', reason: 'संचार और अभिव्यक्ति के लिए आवश्यक' },
      mr: { name: 'इंग्रजी', reason: 'संचार आणि अभिव्यक्तीसाठी आवश्यक' }
    },
    'Computer Science': {
      en: { name: 'Computer Science', reason: 'Builds logical thinking and technical skills' },
      hi: { name: 'कंप्यूटर विज्ञान', reason: 'तार्किक सोच और तकनीकी कौशल बनाता है' },
      mr: { name: 'संगणक विज्ञान', reason: 'तार्किक विचार आणि तांत्रिक कौशल्ये तयार करते' }
    },
    'Economics': {
      en: { name: 'Economics', reason: 'Develops analytical thinking about systems and markets' },
      hi: { name: 'अर्थशास्त्र', reason: 'सिस्टम और बाजारों के बारे में विश्लेषणात्मक सोच विकसित करता है' },
      mr: { name: 'अर्थशास्त्र', reason: 'सिस्टम आणि बाजारांबद्दल विश्लेषणात्मक विचार विकसित करते' }
    },
    'Art': {
      en: { name: 'Art', reason: 'Fosters creativity and visual expression' },
      hi: { name: 'कला', reason: 'रचनात्मकता और दृश्य अभिव्यक्ति को बढ़ावा देता है' },
      mr: { name: 'कला', reason: 'सर्जनशीलता आणि दृश्य अभिव्यक्तीला प्रोत्साहन देते' }
    },
    'Physical Education': {
      en: { name: 'Physical Education', reason: 'Promotes physical health and discipline' },
      hi: { name: 'शारीरिक शिक्षा', reason: 'शारीरिक स्वास्थ्य और अनुशासन को बढ़ावा देता है' },
      mr: { name: 'शारीरिक शिक्षण', reason: 'शारीरिक आरोग्य आणि शिस्तला प्रोत्साहन देते' }
    }
  };

  // Get top 3 selected subjects (or all if less than 3)
  // Double-check it's an array before using slice
  const topSubjects: string[] = Array.isArray(selectedSubjects) ? selectedSubjects.slice(0, 3) : [];
  
  // If no subjects selected, return default recommendations based on stream
  if (!Array.isArray(topSubjects) || topSubjects.length === 0) {
    const defaultSubjects: Record<string, string[]> = {
      'Science (PCM)': ['Mathematics', 'Physics', 'Chemistry'],
      'Science (PCB)': ['Biology', 'Chemistry', 'Physics'],
      'Commerce': ['Economics', 'Mathematics', 'English'],
      'Arts/Humanities': ['History', 'English', 'Geography'],
      'Vocational': ['Computer Science', 'Art', 'Physical Education']
    };
    const streamDefaults = defaultSubjects[stream] || ['Mathematics', 'English', 'Computer Science'];
    return streamDefaults.map((subject, idx) => {
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
  
  // Final safety check before mapping
  if (!Array.isArray(topSubjects)) {
    // Fallback to stream defaults
    const defaultSubjects: Record<string, string[]> = {
      'Science (PCM)': ['Mathematics', 'Physics', 'Chemistry'],
      'Science (PCB)': ['Biology', 'Chemistry', 'Physics'],
      'Commerce': ['Economics', 'Mathematics', 'English'],
      'Arts/Humanities': ['History', 'English', 'Geography'],
      'Vocational': ['Computer Science', 'Art', 'Physical Education']
    };
    const streamDefaults = defaultSubjects[stream] || ['Mathematics', 'English', 'Computer Science'];
    return streamDefaults.map((subject, idx) => {
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
  
  return topSubjects.map((subject, idx) => {
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
  // New question structure - Q13, Q14, Q15 are now single choice
  // Ensure all answers are strings, not arrays
  const q13AnswerRaw = answers.find(a => a.question_id === 'q13')?.answer;
  const q13Answer = Array.isArray(q13AnswerRaw) ? q13AnswerRaw[0] || '' : (q13AnswerRaw as string || '');
  
  const q14AnswerRaw = answers.find(a => a.question_id === 'q14')?.answer;
  const q14Answer = Array.isArray(q14AnswerRaw) ? q14AnswerRaw[0] || '' : (q14AnswerRaw as string || '');
  
  const q15AnswerRaw = answers.find(a => a.question_id === 'q15')?.answer;
  const q15Answer = Array.isArray(q15AnswerRaw) ? q15AnswerRaw[0] || '' : (q15AnswerRaw as string || '');
  
  const q16AnswerRaw = answers.find(a => a.question_id === 'q16')?.answer;
  const q16Answer = Array.isArray(q16AnswerRaw) ? q16AnswerRaw[0] || '' : (q16AnswerRaw as string || '');
  
  const q5AnswerRaw = answers.find(a => a.question_id === 'q5')?.answer;
  const q5Answer = Array.isArray(q5AnswerRaw) ? q5AnswerRaw[0] || '' : (q5AnswerRaw as string || ''); // Flow State
  
  const q1AnswerRaw = answers.find(a => a.question_id === 'q1')?.answer;
  const q1Answer = Array.isArray(q1AnswerRaw) ? q1AnswerRaw[0] || '' : (q1AnswerRaw as string || ''); // Scroll Test
  
  const q2AnswerRaw = answers.find(a => a.question_id === 'q2')?.answer;
  const q2Answer = Array.isArray(q2AnswerRaw) ? q2AnswerRaw[0] || '' : (q2AnswerRaw as string || ''); // School Fest
  
  // Derive passions from Q13 (Entrepreneurship Meter) and trait scores
  const passions: string[] = [];
  if (q13Answer.includes('Build a product') || q13Answer.includes('prototype')) {
    passions.push(language === 'hi' ? 'नवाचार' : language === 'mr' ? 'नवकल्पना' : 'Innovation');
  }
  if (q13Answer.includes('Buy and resell') || q13Answer.includes('profit')) {
    passions.push(language === 'hi' ? 'व्यापार' : language === 'mr' ? 'व्यवसाय' : 'Business');
  }
  if (q13Answer.includes('content channel') || q13Answer.includes('film') || q13Answer.includes('portfolio')) {
    passions.push(language === 'hi' ? 'रचनात्मकता' : language === 'mr' ? 'सर्जनशीलता' : 'Creativity');
  }
  if (traitScores.logical > 3) {
    passions.push(language === 'hi' ? 'समस्या-समाधान' : language === 'mr' ? 'समस्या-निराकरण' : 'Problem Solving');
  }
  if (traitScores.people > 3) {
    passions.push(language === 'hi' ? 'लोगों की मदद' : language === 'mr' ? 'लोकांना मदत' : 'Helping Others');
  }
  
  // Derive natural abilities from Q14 (Why Driver) and Q2 (School Fest)
  const naturalAbilities: string[] = [];
  if (q14Answer.includes('build') || q14Answer.includes('invent')) {
    naturalAbilities.push(language === 'hi' ? 'निर्माण' : language === 'mr' ? 'निर्माण' : 'Building');
  }
  if (q14Answer.includes('understand') || q14Answer.includes('world')) {
    naturalAbilities.push(language === 'hi' ? 'विश्लेषण' : language === 'mr' ? 'विश्लेषण' : 'Analysis');
  }
  if (q14Answer.includes('organize') || q14Answer.includes('money')) {
    naturalAbilities.push(language === 'hi' ? 'संगठन' : language === 'mr' ? 'संघटना' : 'Organization');
  }
  if (q14Answer.includes('express') || q14Answer.includes('creatively')) {
    naturalAbilities.push(language === 'hi' ? 'अभिव्यक्ति' : language === 'mr' ? 'अभिव्यक्ती' : 'Expression');
  }
  if (q2Answer.includes('Designing') || q2Answer.includes('poster')) {
    naturalAbilities.push(language === 'hi' ? 'डिज़ाइन' : language === 'mr' ? 'डिझाइन' : 'Design');
  }
  
  // Derive flow activities from Q5 (Flow State)
  const flowActivities: string[] = [];
  if (q5Answer.includes('Math') || q5Answer.includes('coding')) {
    flowActivities.push(language === 'hi' ? 'गणित/कोडिंग' : language === 'mr' ? 'गणित/कोडिंग' : 'Math/Coding');
  }
  if (q5Answer.includes('Reading') || q5Answer.includes('story') || q5Answer.includes('history')) {
    flowActivities.push(language === 'hi' ? 'पढ़ना' : language === 'mr' ? 'वाचन' : 'Reading');
  }
  if (q5Answer.includes('Drawing') || q5Answer.includes('editing') || q5Answer.includes('music')) {
    flowActivities.push(language === 'hi' ? 'कला/संगीत' : language === 'mr' ? 'कला/संगीत' : 'Art/Music');
  }
  if (q5Answer.includes('biological') || q5Answer.includes('chemical')) {
    flowActivities.push(language === 'hi' ? 'विज्ञान' : language === 'mr' ? 'विज्ञान' : 'Science');
  }
  
  // Get top strengths from trait scores
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

  // Build summary based on new question structure
  const entrepreneurshipStyle = q13Answer.includes('Build') ? 'building and creating'
    : q13Answer.includes('Buy and resell') ? 'business and profit'
    : q13Answer.includes('content') ? 'creating content'
    : 'taking calculated risks';
    
  const whyDriver = q14Answer.includes('build') ? 'building and inventing'
    : q14Answer.includes('understand') ? 'understanding how things work'
    : q14Answer.includes('organize') ? 'organizing systems'
    : q14Answer.includes('express') ? 'expressing yourself creatively'
    : 'pursuing your goals';
    
  const flowState = q5Answer.includes('Math') ? 'solving problems'
    : q5Answer.includes('Reading') ? 'reading and learning'
    : q5Answer.includes('Drawing') ? 'creating art'
    : q5Answer.includes('biological') ? 'exploring science'
    : 'doing what you love';

  const translations = {
    en: {
      summary: `You are someone who ${entrepreneurshipStyle !== 'taking calculated risks' ? `thinks about ${entrepreneurshipStyle}` : 'has diverse interests'}. Your drive comes from ${whyDriver}, and you lose track of time when ${flowState}.`
    },
    hi: {
      summary: `आप किसी ऐसे व्यक्ति हैं जो ${entrepreneurshipStyle !== 'taking calculated risks' ? `${entrepreneurshipStyle} के बारे में सोचते हैं` : 'विविध रुचियां रखते हैं'}. आपकी प्रेरणा ${whyDriver} से आती है, और आप समय का हिसाब भूल जाते हैं जब ${flowState}.`
    },
    mr: {
      summary: `तुम असे व्यक्ती आहात जे ${entrepreneurshipStyle !== 'taking calculated risks' ? `${entrepreneurshipStyle} बद्दल विचार करता` : 'विविध स्वारस्ये आहेत'}. तुमची प्रेरणा ${whyDriver} पासून येते, आणि तुम्ही वेळेचा हिशोब विसरता जेव्हा ${flowState}.`
    }
  };

  // Get interests from Q1 (Scroll Test)
  const interests: string[] = [];
  if (q1Answer.includes('Tech') || q1Answer.includes('coding')) {
    interests.push(language === 'hi' ? 'तकनीक' : language === 'mr' ? 'तंत्रज्ञान' : 'Technology');
  }
  if (q1Answer.includes('Finance') || q1Answer.includes('business')) {
    interests.push(language === 'hi' ? 'वित्त' : language === 'mr' ? 'वित्त' : 'Finance');
  }
  if (q1Answer.includes('Art') || q1Answer.includes('music')) {
    interests.push(language === 'hi' ? 'कला' : language === 'mr' ? 'कला' : 'Arts');
  }
  if (q1Answer.includes('Psychology') || q1Answer.includes('social')) {
    interests.push(language === 'hi' ? 'मनोविज्ञान' : language === 'mr' ? 'मानसशास्त्र' : 'Psychology');
  }

  return {
    passions: passions.slice(0, 5),
    naturalAbilities: naturalAbilities.slice(0, 5),
    flowActivities: flowActivities.slice(0, 5),
    values: q16Answer ? [q16Answer] : [],
    currentStrengths: topStrengths,
    interests: interests.slice(0, 5),
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
 * Generate expanded career opportunities including niche, international, and government roles
 */
export interface ExpandedCareerOpportunity {
  category: 'niche' | 'international' | 'government';
  title: string;
  description: string;
  countries?: string[];
  salaryRange: string;
  requirements: string[];
  growthPotential: 'High' | 'Medium' | 'Emerging';
  whyConsider: string;
}

export function generateExpandedCareerOpportunities(
  stream: string,
  traitScores: TraitScores,
  language: Language = 'en'
): ExpandedCareerOpportunity[] {
  const opportunities: Record<string, Record<Language, ExpandedCareerOpportunity[]>> = {
    'Science (PCM)': {
      en: [
        // Niche Roles
        {
          category: 'niche',
          title: 'Quantum Computing Engineer',
          description: 'Work on cutting-edge quantum algorithms and hardware. This emerging field combines physics, computer science, and mathematics.',
          salaryRange: '$80K-150K (International) / ₹15-40 LPA (India)',
          requirements: ['Strong Physics & Math background', 'Programming skills', 'Research mindset'],
          growthPotential: 'Emerging',
          whyConsider: 'Quantum computing is the future - early entry means massive opportunities'
        },
        {
          category: 'niche',
          title: 'Robotics & Autonomous Systems Engineer',
          description: 'Design and build robots, drones, and autonomous vehicles. Combines mechanical, electrical, and software engineering.',
          salaryRange: '$70K-130K (International) / ₹12-35 LPA (India)',
          requirements: ['Mechanical/Electrical Engineering', 'Programming', 'Systems thinking'],
          growthPotential: 'High',
          whyConsider: 'Robotics is transforming every industry - from healthcare to agriculture'
        },
        {
          category: 'niche',
          title: 'Space Systems Engineer',
          description: 'Work on satellites, space missions, and aerospace technology. ISRO, NASA, SpaceX, and private space companies need talent.',
          salaryRange: '$75K-140K (International) / ₹10-30 LPA (India - ISRO)',
          requirements: ['Aerospace/Mechanical Engineering', 'Physics', 'Problem-solving'],
          growthPotential: 'High',
          whyConsider: 'Space industry is booming - India is a global leader in cost-effective space missions'
        },
        {
          category: 'niche',
          title: 'Blockchain Developer',
          description: 'Build decentralized applications, smart contracts, and cryptocurrency systems. High demand in fintech and Web3.',
          salaryRange: '$90K-180K (International) / ₹18-50 LPA (India)',
          requirements: ['Strong Programming', 'Cryptography basics', 'Distributed systems'],
          growthPotential: 'High',
          whyConsider: 'Blockchain is revolutionizing finance, supply chain, and digital identity'
        },
        {
          category: 'niche',
          title: 'Climate Tech Engineer',
          description: 'Develop solutions for climate change - renewable energy, carbon capture, sustainable technology.',
          salaryRange: '$65K-120K (International) / ₹12-30 LPA (India)',
          requirements: ['Engineering background', 'Environmental awareness', 'Innovation mindset'],
          growthPotential: 'High',
          whyConsider: 'Climate tech is critical and growing - make impact while building career'
        },
        // International Opportunities
        {
          category: 'international',
          title: 'Software Engineer (Silicon Valley)',
          description: 'Work at top tech companies like Google, Apple, Meta. High salaries, cutting-edge projects, global exposure.',
          countries: ['USA', 'Canada'],
          salaryRange: '$120K-250K+ (USD)',
          requirements: ['Top-tier coding skills', 'Strong CS fundamentals', 'H1B visa eligibility'],
          growthPotential: 'High',
          whyConsider: 'Silicon Valley offers unparalleled learning, networking, and career growth'
        },
        {
          category: 'international',
          title: 'Research Scientist (Europe)',
          description: 'Work at universities and research institutes in Germany, Switzerland, UK. Focus on AI, quantum, or biotech.',
          countries: ['Germany', 'Switzerland', 'UK', 'Netherlands'],
          salaryRange: '€50K-90K (EUR)',
          requirements: ['Research experience', 'PhD preferred', 'Publication record'],
          growthPotential: 'High',
          whyConsider: 'Europe offers excellent work-life balance and world-class research facilities'
        },
        {
          category: 'international',
          title: 'Tech Consultant (Middle East)',
          description: 'Help governments and companies digitize. UAE, Saudi Arabia offer tax-free salaries and modern infrastructure.',
          countries: ['UAE', 'Saudi Arabia', 'Qatar'],
          salaryRange: '$60K-120K (USD, tax-free)',
          requirements: ['Consulting skills', 'Tech expertise', 'Cultural adaptability'],
          growthPotential: 'Medium',
          whyConsider: 'Tax-free income, modern cities, and growing tech ecosystems'
        },
        {
          category: 'international',
          title: 'Data Scientist (Singapore)',
          description: 'Singapore is Asia\'s tech hub. Work on fintech, AI, and smart city projects.',
          countries: ['Singapore'],
          salaryRange: 'S$70K-140K (SGD)',
          requirements: ['Data science skills', 'ML/AI knowledge', 'Business acumen'],
          growthPotential: 'High',
          whyConsider: 'Singapore bridges East and West - perfect for global career'
        },
        // Government Roles
        {
          category: 'government',
          title: 'Scientist/Engineer (ISRO)',
          description: 'Work on India\'s space missions, satellites, and rocket technology. Job security, pension, and national pride.',
          salaryRange: '₹10-25 LPA (Plus benefits)',
          requirements: ['GATE/ISRO exam', 'Engineering degree', 'Strong technical skills'],
          growthPotential: 'High',
          whyConsider: 'ISRO is world-renowned for cost-effective space missions - be part of history'
        },
        {
          category: 'government',
          title: 'Scientist (DRDO)',
          description: 'Defense Research and Development Organization. Work on missiles, radar, cybersecurity for national defense.',
          salaryRange: '₹10-28 LPA (Plus benefits)',
          requirements: ['GATE/DRDO exam', 'Engineering/Physics', 'Security clearance'],
          growthPotential: 'High',
          whyConsider: 'Contribute to national security while working on cutting-edge defense tech'
        },
        {
          category: 'government',
          title: 'Engineer (BHEL/NTPC)',
          description: 'Public sector power and heavy engineering. Job security, good benefits, and impact on national infrastructure.',
          salaryRange: '₹8-20 LPA (Plus benefits)',
          requirements: ['GATE exam', 'Engineering degree', 'Technical knowledge'],
          growthPotential: 'Medium',
          whyConsider: 'Stable career with pension, work on national infrastructure projects'
        },
        {
          category: 'government',
          title: 'Scientist (BARC)',
          description: 'Bhabha Atomic Research Centre. Work on nuclear energy, medical isotopes, and advanced research.',
          salaryRange: '₹12-30 LPA (Plus benefits)',
          requirements: ['GATE/BARC exam', 'Physics/Chemistry/Engineering', 'Research aptitude'],
          growthPotential: 'High',
          whyConsider: 'Work on critical national projects in nuclear science and technology'
        },
        {
          category: 'government',
          title: 'IAS/IFS Officer (Tech Background)',
          description: 'Use your technical background in policy-making. Manage tech initiatives, digital governance, innovation.',
          salaryRange: '₹15-40 LPA (Plus benefits)',
          requirements: ['UPSC exam', 'Engineering degree', 'Leadership skills'],
          growthPotential: 'High',
          whyConsider: 'Combine technical expertise with public service - shape India\'s future'
        }
      ],
      hi: [
        {
          category: 'niche',
          title: 'क्वांटम कंप्यूटिंग इंजीनियर',
          description: 'अत्याधुनिक क्वांटम एल्गोरिदम और हार्डवेयर पर काम करें। यह उभरता हुआ क्षेत्र भौतिकी, कंप्यूटर विज्ञान और गणित को जोड़ता है।',
          salaryRange: '$80K-150K (अंतर्राष्ट्रीय) / ₹15-40 LPA (भारत)',
          requirements: ['मजबूत भौतिकी और गणित पृष्ठभूमि', 'प्रोग्रामिंग कौशल', 'अनुसंधान मानसिकता'],
          growthPotential: 'Emerging',
          whyConsider: 'क्वांटम कंप्यूटिंग भविष्य है - शीघ्र प्रवेश का मतलब है बड़े अवसर'
        },
        {
          category: 'government',
          title: 'वैज्ञानिक/अभियंता (इसरो)',
          description: 'भारत के अंतरिक्ष मिशन, उपग्रह और रॉकेट प्रौद्योगिकी पर काम करें। नौकरी की सुरक्षा, पेंशन और राष्ट्रीय गौरव।',
          salaryRange: '₹10-25 LPA (प्लस लाभ)',
          requirements: ['GATE/ISRO परीक्षा', 'इंजीनियरिंग डिग्री', 'मजबूत तकनीकी कौशल'],
          growthPotential: 'High',
          whyConsider: 'इसरो लागत-प्रभावी अंतरिक्ष मिशनों के लिए विश्व-प्रसिद्ध है - इतिहास का हिस्सा बनें'
        }
      ],
      mr: [
        {
          category: 'niche',
          title: 'क्वांटम कंप्यूटिंग अभियंता',
          description: 'अत्याधुनिक क्वांटम अल्गोरिदम आणि हार्डवेअरवर काम करा। हे उदयोन्मुख क्षेत्र भौतिकशास्त्र, संगणक विज्ञान आणि गणित एकत्र करते।',
          salaryRange: '$80K-150K (आंतरराष्ट्रीय) / ₹15-40 LPA (भारत)',
          requirements: ['मजबूत भौतिकशास्त्र आणि गणित पार्श्वभूमी', 'प्रोग्रामिंग कौशल्ये', 'संशोधन मानसिकता'],
          growthPotential: 'Emerging',
          whyConsider: 'क्वांटम कंप्यूटिंग भविष्य आहे - लवकर प्रवेश म्हणजे मोठ्या संधी'
        },
        {
          category: 'government',
          title: 'वैज्ञानिक/अभियंता (इसरो)',
          description: 'भारताच्या अंतराळ मिशन, उपग्रह आणि रॉकेट तंत्रज्ञानावर काम करा। नोकरीची सुरक्षा, पेन्शन आणि राष्ट्रीय अभिमान।',
          salaryRange: '₹10-25 LPA (प्लस फायदे)',
          requirements: ['GATE/ISRO परीक्षा', 'अभियांत्रिकी पदवी', 'मजबूत तांत्रिक कौशल्ये'],
          growthPotential: 'High',
          whyConsider: 'इसरो खर्च-प्रभावी अंतराळ मिशनसाठी जागतिक-प्रसिद्ध आहे - इतिहासाचा भाग व्हा'
        }
      ]
    },
    'Commerce': {
      en: [
        {
          category: 'niche',
          title: 'Fintech Product Manager',
          description: 'Build financial technology products - digital payments, blockchain banking, crypto platforms.',
          salaryRange: '$85K-160K (International) / ₹18-45 LPA (India)',
          requirements: ['Finance + Tech knowledge', 'Product thinking', 'User experience'],
          growthPotential: 'High',
          whyConsider: 'Fintech is revolutionizing banking - huge growth potential'
        },
        {
          category: 'international',
          title: 'Investment Banker (Wall Street)',
          description: 'Work at Goldman Sachs, JPMorgan, Morgan Stanley. High-stakes finance, global deals, high compensation.',
          countries: ['USA', 'UK', 'Singapore'],
          salaryRange: '$100K-300K+ (USD)',
          requirements: ['Top MBA/CFA', 'Analytical skills', 'Networking'],
          growthPotential: 'High',
          whyConsider: 'Wall Street offers highest finance salaries and global exposure'
        },
        {
          category: 'government',
          title: 'RBI Grade B Officer',
          description: 'Reserve Bank of India. Monetary policy, banking regulation, financial stability of India.',
          salaryRange: '₹15-35 LPA (Plus benefits)',
          requirements: ['RBI Grade B exam', 'Economics/Finance background', 'Analytical skills'],
          growthPotential: 'High',
          whyConsider: 'Shape India\'s monetary policy - prestigious and impactful role'
        }
      ],
      hi: [],
      mr: []
    },
    'Science (PCB)': {
      en: [
        {
          category: 'niche',
          title: 'Biotech Research Scientist',
          description: 'Work on gene therapy, personalized medicine, CRISPR technology. Future of healthcare.',
          salaryRange: '$70K-140K (International) / ₹12-35 LPA (India)',
          requirements: ['Biology/Chemistry background', 'Research experience', 'Lab skills'],
          growthPotential: 'High',
          whyConsider: 'Biotech is transforming medicine - be at the forefront'
        },
        {
          category: 'international',
          title: 'Medical Researcher (USA/Europe)',
          description: 'Work at top medical institutions. Research new treatments, clinical trials, medical breakthroughs.',
          countries: ['USA', 'UK', 'Germany', 'Switzerland'],
          salaryRange: '$80K-150K (USD/EUR)',
          requirements: ['MD/PhD', 'Research publications', 'Clinical experience'],
          growthPotential: 'High',
          whyConsider: 'Work on cutting-edge medical research at world\'s best institutions'
        },
        {
          category: 'government',
          title: 'Scientist (ICMR)',
          description: 'Indian Council of Medical Research. Public health research, disease control, medical policy.',
          salaryRange: '₹12-28 LPA (Plus benefits)',
          requirements: ['Medical/Research background', 'ICMR exam', 'Research aptitude'],
          growthPotential: 'High',
          whyConsider: 'Contribute to India\'s public health and medical research'
        }
      ],
      hi: [],
      mr: []
    },
    'Humanities': {
      en: [
        {
          category: 'niche',
          title: 'UX Researcher (Tech)',
          description: 'Study user behavior, design better products. Tech companies need human-centered design.',
          salaryRange: '$70K-130K (International) / ₹12-30 LPA (India)',
          requirements: ['Psychology/Sociology background', 'Research skills', 'Design thinking'],
          growthPotential: 'High',
          whyConsider: 'Combine human insights with tech - growing field'
        },
        {
          category: 'international',
          title: 'Policy Analyst (Think Tanks)',
          description: 'Work at international organizations - UN, World Bank, policy institutes. Shape global policy.',
          countries: ['USA', 'Switzerland', 'Belgium'],
          salaryRange: '$60K-120K (USD)',
          requirements: ['Policy/Economics background', 'Research skills', 'International perspective'],
          growthPotential: 'Medium',
          whyConsider: 'Work on global challenges - climate, development, peace'
        },
        {
          category: 'government',
          title: 'IAS Officer (Social Services)',
          description: 'Use your humanities background in public administration. Education, health, rural development.',
          salaryRange: '₹15-40 LPA (Plus benefits)',
          requirements: ['UPSC exam', 'Any degree', 'Leadership skills'],
          growthPotential: 'High',
          whyConsider: 'Shape India\'s social policies - maximum impact on people\'s lives'
        }
      ],
      hi: [],
      mr: []
    }
  };

  const streamOpportunities = opportunities[stream] || opportunities['Science (PCM)'];
  return streamOpportunities[language] || streamOpportunities.en;
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
  // Location-based college mapping with cultural context
  const locationColleges: Record<string, any[]> = {
    'Metro city': [
      { name: 'IIT Delhi', location: 'New Delhi', region: 'North', culture: 'Cosmopolitan, diverse, English-friendly', localLanguage: 'Hindi/English', food: 'North Indian, International', lifestyle: 'Fast-paced, modern' },
      { name: 'IIT Bombay', location: 'Mumbai', region: 'West', culture: 'Metropolitan, business-oriented, Marathi influence', localLanguage: 'Marathi/English', food: 'Maharashtrian, Street food', lifestyle: 'Dynamic, competitive' },
      { name: 'IIT Madras', location: 'Chennai', region: 'South', culture: 'Traditional yet modern, Tamil culture', localLanguage: 'Tamil/English', food: 'South Indian, Vegetarian-friendly', lifestyle: 'Balanced, academic focus' },
      { name: 'IIT Kharagpur', location: 'Kharagpur', region: 'East', culture: 'Academic hub, Bengali influence', localLanguage: 'Bengali/English', food: 'Bengali, Vegetarian options', lifestyle: 'Campus-focused, traditional' },
      { name: 'BITS Pilani', location: 'Pilani', region: 'North', culture: 'Elite private, English-medium', localLanguage: 'Hindi/English', food: 'North Indian, Vegetarian', lifestyle: 'Campus-based, modern' },
      { name: 'NIT Warangal', location: 'Warangal', region: 'South', culture: 'Telugu culture, tech-focused', localLanguage: 'Telugu/English', food: 'Telugu, Spicy cuisine', lifestyle: 'Tech-oriented, growing city' }
    ],
    'Tier 2 city': [
      { name: 'NIT Trichy', location: 'Tiruchirappalli', region: 'South', culture: 'Tamil culture, temple city', localLanguage: 'Tamil/English', food: 'South Indian, Traditional', lifestyle: 'Peaceful, affordable' },
      { name: 'NIT Surathkal', location: 'Mangalore', region: 'South', culture: 'Coastal Karnataka, multilingual', localLanguage: 'Kannada/Tulu/English', food: 'Coastal, Seafood', lifestyle: 'Coastal, relaxed' },
      { name: 'NIT Calicut', location: 'Calicut', region: 'South', culture: 'Kerala culture, progressive', localLanguage: 'Malayalam/English', food: 'Kerala, Vegetarian-friendly', lifestyle: 'Educational hub, moderate pace' },
      { name: 'NIT Rourkela', location: 'Rourkela', region: 'East', culture: 'Industrial city, Odia culture', localLanguage: 'Odia/English', food: 'Odia, Traditional', lifestyle: 'Industrial, affordable' },
      { name: 'IIIT Hyderabad', location: 'Hyderabad', region: 'South', culture: 'Tech hub, Hyderabadi culture', localLanguage: 'Telugu/Urdu/English', food: 'Hyderabadi, Biryani famous', lifestyle: 'Tech city, growing' },
      { name: 'VIT Vellore', location: 'Vellore', region: 'South', culture: 'Private, modern, diverse', localLanguage: 'Tamil/English', food: 'South Indian, Multi-cuisine', lifestyle: 'Modern campus, international' }
    ],
    'Small city/Town': [
      { name: 'NIT Hamirpur', location: 'Hamirpur', region: 'North', culture: 'Himachali culture, hilly', localLanguage: 'Hindi/Pahari/English', food: 'Himachali, Simple', lifestyle: 'Mountain town, peaceful' },
      { name: 'NIT Jalandhar', location: 'Jalandhar', region: 'North', culture: 'Punjabi culture, vibrant', localLanguage: 'Punjabi/English', food: 'Punjabi, Rich cuisine', lifestyle: 'Cultural, friendly' },
      { name: 'NIT Patna', location: 'Patna', region: 'East', culture: 'Bihari culture, historical', localLanguage: 'Hindi/Bhojpuri/English', food: 'Bihari, Traditional', lifestyle: 'Historical city, affordable' },
      { name: 'NIT Raipur', location: 'Raipur', region: 'Central', culture: 'Chhattisgarhi culture, emerging', localLanguage: 'Hindi/Chhattisgarhi/English', food: 'Chhattisgarhi, Tribal influence', lifestyle: 'Emerging city, growing' },
      { name: 'NIT Durgapur', location: 'Durgapur', region: 'East', culture: 'Bengali culture, industrial', localLanguage: 'Bengali/English', food: 'Bengali, Sweet culture', lifestyle: 'Industrial town, affordable' }
    ],
    'Village/Rural': [
      { name: 'NIT Silchar', location: 'Silchar', region: 'Northeast', culture: 'Assamese culture, diverse', localLanguage: 'Assamese/Bengali/English', food: 'Assamese, Unique cuisine', lifestyle: 'Northeast, peaceful' },
      { name: 'NIT Meghalaya', location: 'Shillong', region: 'Northeast', culture: 'Khasi culture, hill station', localLanguage: 'Khasi/English', food: 'Northeast, Tribal', lifestyle: 'Hill station, scenic' },
      { name: 'NIT Agartala', location: 'Agartala', region: 'Northeast', culture: 'Tripuri culture, border city', localLanguage: 'Bengali/Kokborok/English', food: 'Northeast, Bengali influence', lifestyle: 'Border city, unique' }
    ]
  };

  const colleges: Record<string, Record<Language, CollegeRecommendation[]>> = {
    'Science (PCM)': {
      en: [
        // Metro Cities - Premium Options
        {
          name: 'IIT Delhi',
          location: 'New Delhi',
          stream: 'Engineering',
          rank: 2,
          rating: 4.8,
          fees: '₹2-3 Lakhs/year',
          admissionRequirements: ['JEE Advanced', 'Class 12: 75%+', 'Physics, Chemistry, Math'],
          highlights: ['Top NIRF Rank', 'Excellent Placements', 'World-class Faculty', 'Metro location', 'Diverse culture'],
          placementStats: {
            averagePackage: '₹20-25 LPA',
            topRecruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs']
          },
          whyFit: 'Perfect for logical thinkers with high study tolerance',
          url: 'https://home.iitd.ac.in/',
          culturalContext: {
            region: 'North India',
            localLanguage: 'Hindi/English',
            foodCulture: 'North Indian, International options available',
            lifestyle: 'Fast-paced, cosmopolitan, diverse student community',
            culturalFit: 'Easy adaptation for most Indian students, English-friendly environment'
          }
        },
        {
          name: 'IIT Bombay',
          location: 'Mumbai',
          stream: 'Engineering',
          rank: 1,
          rating: 4.9,
          fees: '₹2-3 Lakhs/year',
          admissionRequirements: ['JEE Advanced', 'Class 12: 75%+', 'Physics, Chemistry, Math'],
          highlights: ['#1 NIRF Rank', 'Highest Placements', 'Financial capital', 'Marathi culture'],
          placementStats: {
            averagePackage: '₹22-28 LPA',
            topRecruiters: ['Google', 'Microsoft', 'Goldman Sachs', 'JP Morgan']
          },
          whyFit: 'Best for ambitious students seeking top-tier opportunities',
          url: 'https://www.iitb.ac.in/',
          culturalContext: {
            region: 'West India',
            localLanguage: 'Marathi/English',
            foodCulture: 'Maharashtrian, Street food paradise, Vada Pav, Pav Bhaji',
            lifestyle: 'Dynamic, competitive, business-oriented, 24/7 city',
            culturalFit: 'Fast-paced environment, Marathi culture with English professional setting'
          }
        },
        {
          name: 'IIT Madras',
          location: 'Chennai',
          stream: 'Engineering',
          rank: 3,
          rating: 4.8,
          fees: '₹2-3 Lakhs/year',
          admissionRequirements: ['JEE Advanced', 'Class 12: 75%+', 'Physics, Chemistry, Math'],
          highlights: ['Top 3 NIRF', 'Strong research', 'Tamil culture', 'Coastal city'],
          placementStats: {
            averagePackage: '₹18-24 LPA',
            topRecruiters: ['Microsoft', 'Amazon', 'Intel', 'Qualcomm']
          },
          whyFit: 'Ideal for research-oriented students',
          url: 'https://www.iitm.ac.in/',
          culturalContext: {
            region: 'South India',
            localLanguage: 'Tamil/English',
            foodCulture: 'South Indian, Idli-Dosa, Filter Coffee, Vegetarian-friendly',
            lifestyle: 'Balanced, academic focus, traditional values with modern education',
            culturalFit: 'Tamil culture prominent, but English-medium education, welcoming to all'
          }
        },
        // Tier 2 Cities - Balanced Options
        {
          name: 'NIT Trichy',
          location: 'Tiruchirappalli',
          stream: 'Engineering',
          rank: 9,
          rating: 4.6,
          fees: '₹1.5-2 Lakhs/year',
          admissionRequirements: ['JEE Main', 'Class 12: 75%+', 'Physics, Chemistry, Math'],
          highlights: ['Top NIT', 'Strong Industry Connections', 'Affordable', 'Temple city'],
          placementStats: {
            averagePackage: '₹12-18 LPA',
            topRecruiters: ['TCS', 'Infosys', 'Wipro', 'Cognizant']
          },
          whyFit: 'Great balance of quality education and affordability',
          url: 'https://www.nitt.edu/',
          culturalContext: {
            region: 'South India',
            localLanguage: 'Tamil/English',
            foodCulture: 'South Indian, Traditional Tamil cuisine, Vegetarian options',
            lifestyle: 'Peaceful, affordable, temple city atmosphere, moderate pace',
            culturalFit: 'Tamil culture, but diverse student body, English-medium'
          }
        },
        {
          name: 'NIT Surathkal',
          location: 'Mangalore',
          stream: 'Engineering',
          rank: 12,
          rating: 4.5,
          fees: '₹1.5-2 Lakhs/year',
          admissionRequirements: ['JEE Main', 'Class 12: 75%+', 'Physics, Chemistry, Math'],
          highlights: ['Coastal location', 'Good placements', 'Affordable', 'Beautiful campus'],
          placementStats: {
            averagePackage: '₹10-16 LPA',
            topRecruiters: ['Infosys', 'Wipro', 'TCS', 'L&T']
          },
          whyFit: 'Excellent for students who prefer coastal, relaxed environment',
          url: 'https://www.nitk.ac.in/',
          culturalContext: {
            region: 'South India (Coastal Karnataka)',
            localLanguage: 'Kannada/Tulu/English',
            foodCulture: 'Coastal Karnataka, Seafood, Mangalorean cuisine, Spicy',
            lifestyle: 'Coastal, relaxed, moderate pace, beautiful beaches nearby',
            culturalFit: 'Multilingual (Kannada, Tulu, Konkani), English-medium, welcoming'
          }
        },
        {
          name: 'IIIT Hyderabad',
          location: 'Hyderabad',
          stream: 'Engineering',
          rank: 15,
          rating: 4.7,
          fees: '₹2-3 Lakhs/year',
          admissionRequirements: ['JEE Main', 'Class 12: 75%+', 'Physics, Chemistry, Math'],
          highlights: ['Tech-focused', 'Strong CS program', 'Hyderabad tech hub', 'Good placements'],
          placementStats: {
            averagePackage: '₹15-22 LPA',
            topRecruiters: ['Microsoft', 'Google', 'Amazon', 'Adobe']
          },
          whyFit: 'Perfect for tech enthusiasts',
          url: 'https://www.iiit.ac.in/',
          culturalContext: {
            region: 'South India (Telangana)',
            localLanguage: 'Telugu/Urdu/English',
            foodCulture: 'Hyderabadi, Famous Biryani, Spicy cuisine, Multi-cultural',
            lifestyle: 'Tech city, growing, modern infrastructure, IT hub',
            culturalFit: 'Hyderabadi culture (mix of Telugu and Urdu), very welcoming, English-friendly'
          }
        },
        // Small Cities - Budget-Friendly
        {
          name: 'NIT Hamirpur',
          location: 'Hamirpur',
          stream: 'Engineering',
          rank: 35,
          rating: 4.2,
          fees: '₹1-1.5 Lakhs/year',
          admissionRequirements: ['JEE Main', 'Class 12: 75%+', 'Physics, Chemistry, Math'],
          highlights: ['Budget-friendly', 'Hilly location', 'Peaceful', 'Good quality'],
          placementStats: {
            averagePackage: '₹8-12 LPA',
            topRecruiters: ['TCS', 'Infosys', 'Wipro', 'Tech Mahindra']
          },
          whyFit: 'Great for budget-conscious students who prefer peaceful environment',
          url: 'https://www.nith.ac.in/',
          culturalContext: {
            region: 'North India (Himachal Pradesh)',
            localLanguage: 'Hindi/Pahari/English',
            foodCulture: 'Himachali, Simple, Traditional, Vegetarian-friendly',
            lifestyle: 'Mountain town, peaceful, scenic, moderate pace',
            culturalFit: 'Himachali culture, Hindi-speaking, very friendly, English-medium education'
          }
        },
        {
          name: 'NIT Patna',
          location: 'Patna',
          stream: 'Engineering',
          rank: 40,
          rating: 4.1,
          fees: '₹1-1.5 Lakhs/year',
          admissionRequirements: ['JEE Main', 'Class 12: 75%+', 'Physics, Chemistry, Math'],
          highlights: ['Historical city', 'Affordable', 'Growing', 'Good placements'],
          placementStats: {
            averagePackage: '₹7-11 LPA',
            topRecruiters: ['TCS', 'Infosys', 'Wipro', 'Capgemini']
          },
          whyFit: 'Ideal for students from Eastern India or budget-conscious families',
          url: 'https://www.nitp.ac.in/',
          culturalContext: {
            region: 'East India (Bihar)',
            localLanguage: 'Hindi/Bhojpuri/English',
            foodCulture: 'Bihari, Traditional, Litti-Chokha, Vegetarian options',
            lifestyle: 'Historical city, affordable, moderate pace, cultural heritage',
            culturalFit: 'Bihari culture, Hindi/Bhojpuri speaking, very welcoming, English-medium'
          }
        },
        // Northeast - Unique Options
        {
          name: 'NIT Silchar',
          location: 'Silchar',
          stream: 'Engineering',
          rank: 45,
          rating: 4.0,
          fees: '₹1-1.5 Lakhs/year',
          admissionRequirements: ['JEE Main', 'Class 12: 75%+', 'Physics, Chemistry, Math'],
          highlights: ['Northeast location', 'Diverse culture', 'Affordable', 'Unique experience'],
          placementStats: {
            averagePackage: '₹6-10 LPA',
            topRecruiters: ['TCS', 'Infosys', 'Wipro', 'Tech Mahindra']
          },
          whyFit: 'Great for students interested in Northeast culture and affordable education',
          url: 'https://www.nits.ac.in/',
          culturalContext: {
            region: 'Northeast India (Assam)',
            localLanguage: 'Assamese/Bengali/English',
            foodCulture: 'Assamese, Unique Northeast cuisine, Non-vegetarian options, Tea culture',
            lifestyle: 'Northeast culture, peaceful, scenic, moderate pace, unique experience',
            culturalFit: 'Assamese culture, multilingual, very welcoming, English-medium, diverse student body'
          }
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
  let recommendations = streamColleges[language] || streamColleges.en;
  
  // Filter colleges based on geographic preference
  if (geographicPreference && geographicPreference.length > 0) {
    const locationMap: Record<string, string[]> = {
      'Metro city': ['New Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad', 'Pune'],
      'Tier 2 city': ['Tiruchirappalli', 'Mangalore', 'Calicut', 'Vellore', 'Warangal', 'Surat', 'Indore'],
      'Small city/Town': ['Hamirpur', 'Jalandhar', 'Patna', 'Raipur', 'Durgapur', 'Rourkela'],
      'Village/Rural': ['Silchar', 'Shillong', 'Agartala', 'Meghalaya']
    };
    
    // Get preferred locations
    const preferredLocations: string[] = [];
    geographicPreference.forEach(pref => {
      if (locationMap[pref]) {
        preferredLocations.push(...locationMap[pref]);
      }
    });
    
    // Filter and prioritize colleges in preferred locations
    if (preferredLocations.length > 0) {
      const preferred = recommendations.filter(college => 
        preferredLocations.some(loc => college.location.includes(loc) || loc.includes(college.location))
      );
      const others = recommendations.filter(college => 
        !preferredLocations.some(loc => college.location.includes(loc) || loc.includes(college.location))
      );
      recommendations = [...preferred, ...others].slice(0, 8); // Limit to 8 recommendations
    }
  }
  
  // Filter by budget if constraint exists
  if (budgetConstraint) {
    recommendations = recommendations
      .filter(college => {
        const feesMatch = college.fees.match(/₹(\d+)/);
        if (feesMatch) {
          const fee = parseInt(feesMatch[1]);
          return fee <= 2; // Prefer colleges with fees <= 2 lakhs
        }
        return true;
      })
      .sort((a, b) => {
        const feeA = a.fees.match(/₹(\d+)/)?.[1] || '999';
        const feeB = b.fees.match(/₹(\d+)/)?.[1] || '999';
        return parseInt(feeA) - parseInt(feeB);
      });
  }
  
  return recommendations.slice(0, 8); // Return top 8 recommendations
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

