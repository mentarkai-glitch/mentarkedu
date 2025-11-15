export type Language = 'en' | 'hi' | 'mr';

export interface PathFinderQuestion {
  id: string;
  question: Record<Language, string>;
  type: 'single_choice' | 'slider' | 'multi_select';
  options?: Record<Language, string[]>;
  min?: number;
  max?: number;
  category: string;
}

export const pathFinderQuestions: PathFinderQuestion[] = [
  {
    id: 'q1',
    question: {
      en: 'What do you enjoy doing most?',
      hi: 'आपको सबसे ज्यादा क्या करना पसंद है?',
      mr: 'तुम्हाला सर्वात जास्त काय करायला आवडते?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Solving puzzles & problems',
        'Building things',
        'Creating art/design',
        'Helping people',
        'Organising & leading',
        'Playing sports'
      ],
      hi: [
        'पहेलियाँ और समस्याएँ हल करना',
        'चीजें बनाना',
        'कला/डिज़ाइन बनाना',
        'लोगों की मदद करना',
        'संगठन और नेतृत्व',
        'खेल खेलना'
      ],
      mr: [
        'कोडे आणि समस्या सोडवणे',
        'गोष्टी बनवणे',
        'कला/डिझाइन तयार करणे',
        'लोकांना मदत करणे',
        'संघटना आणि नेतृत्व',
        'खेळ खेळणे'
      ]
    },
    category: 'interests'
  },
  {
    id: 'q2',
    question: {
      en: 'Which class activity excites you?',
      hi: 'कौन सी कक्षा गतिविधि आपको उत्साहित करती है?',
      mr: 'कोणती वर्ग क्रियाकलाप तुम्हाला उत्साहित करते?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Experiments & practicals',
        'Maths problems',
        'Debates & discussions',
        'Drawing & designing',
        'Business projects',
        'None of these'
      ],
      hi: [
        'प्रयोग और व्यावहारिक',
        'गणित की समस्याएँ',
        'बहस और चर्चा',
        'ड्राइंग और डिज़ाइनिंग',
        'व्यापार परियोजनाएँ',
        'इनमें से कोई नहीं'
      ],
      mr: [
        'प्रयोग आणि व्यावहारिक',
        'गणित समस्या',
        'वादविवाद आणि चर्चा',
        'रेखांकन आणि डिझाइनिंग',
        'व्यवसाय प्रकल्प',
        'यापैकी काहीही नाही'
      ]
    },
    category: 'interests'
  },
  {
    id: 'q3',
    question: {
      en: 'How do you prefer to learn?',
      hi: 'आप कैसे सीखना पसंद करते हैं?',
      mr: 'तुम्ही कसे शिकायला पसंद करता?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Step-by-step explanations',
        'By doing (hands-on)',
        'Visual & diagrams',
        'Reading & research',
        'Group discussions'
      ],
      hi: [
        'चरणबद्ध स्पष्टीकरण',
        'करके सीखना (हाथों से)',
        'दृश्य और आरेख',
        'पढ़ना और शोध',
        'समूह चर्चा'
      ],
      mr: [
        'चरण-दर-चरण स्पष्टीकरण',
        'करून शिकणे (हाताने)',
        'दृश्य आणि आकृत्या',
        'वाचन आणि संशोधन',
        'गट चर्चा'
      ]
    },
    category: 'learning'
  },
  {
    id: 'q4',
    question: {
      en: 'How comfortable are you with long study sessions?',
      hi: 'लंबे अध्ययन सत्रों के साथ आप कितने सहज हैं?',
      mr: 'लांब अभ्यास सत्रांसाठी तुम्ही किती आरामदायक आहात?'
    },
    type: 'slider',
    min: 0,
    max: 10,
    category: 'study_habits'
  },
  {
    id: 'q5',
    question: {
      en: 'Do you prefer structured tasks or creative freedom?',
      hi: 'क्या आप संरचित कार्य या रचनात्मक स्वतंत्रता पसंद करते हैं?',
      mr: 'तुम्ही संरचित कार्ये किंवा सर्जनशील स्वातंत्र्य पसंद करता?'
    },
    type: 'single_choice',
    options: {
      en: ['Structured tasks', 'Creative freedom', 'Mix of both'],
      hi: ['संरचित कार्य', 'रचनात्मक स्वतंत्रता', 'दोनों का मिश्रण'],
      mr: ['संरचित कार्ये', 'सर्जनशील स्वातंत्र्य', 'दोन्हीचे मिश्रण']
    },
    category: 'personality'
  },
  {
    id: 'q6',
    question: {
      en: 'Which feels more rewarding?',
      hi: 'कौन सा अधिक फायदेमंद लगता है?',
      mr: 'कोणते अधिक फायदेशीर वाटते?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Solving a hard problem',
        'Creating something new',
        'Seeing people benefit from my work',
        'Leading a team'
      ],
      hi: [
        'एक कठिन समस्या हल करना',
        'कुछ नया बनाना',
        'लोगों को मेरे काम से लाभ होते देखना',
        'एक टीम का नेतृत्व करना'
      ],
      mr: [
        'एक कठीण समस्या सोडवणे',
        'काहीतरी नवीन तयार करणे',
        'लोकांना माझ्या कामाचा फायदा होताना पाहणे',
        'एक संघाचे नेतृत्व करणे'
      ]
    },
    category: 'motivation'
  },
  {
    id: 'q7',
    question: {
      en: 'Budget & location preference?',
      hi: 'बजट और स्थान वरीयता?',
      mr: 'अंदाजपत्रक आणि स्थान प्राधान्य?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Stay in city / family supports fees',
        'Need affordable options / scholarship',
        'Open to relocation for the right college'
      ],
      hi: [
        'शहर में रहें / परिवार शुल्क का समर्थन करता है',
        'सस्ते विकल्प / छात्रवृत्ति की आवश्यकता',
        'सही कॉलेज के लिए स्थानांतरण के लिए खुले'
      ],
      mr: [
        'शहरात राहा / कुटुंब शुल्काचा समर्थन करते',
        'स्वस्त पर्याय / शिष्यवृत्तीची गरज',
        'योग्य महाविद्यालयासाठी स्थलांतरासाठी खुले'
      ]
    },
    category: 'resources'
  },
  {
    id: 'q8',
    question: {
      en: 'Which subjects do you enjoy most? (Select top 3)',
      hi: 'आपको कौन से विषय सबसे ज्यादा पसंद हैं? (शीर्ष 3 चुनें)',
      mr: 'तुम्हाला कोणते विषय सर्वात जास्त आवडतात? (शीर्ष 3 निवडा)'
    },
    type: 'multi_select',
    options: {
      en: [
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'English/Literature',
        'History',
        'Geography',
        'Economics',
        'Computer Science',
        'Art/Design'
      ],
      hi: [
        'गणित',
        'भौतिकी',
        'रसायन विज्ञान',
        'जीव विज्ञान',
        'अंग्रेजी/साहित्य',
        'इतिहास',
        'भूगोल',
        'अर्थशास्त्र',
        'कंप्यूटर विज्ञान',
        'कला/डिज़ाइन'
      ],
      mr: [
        'गणित',
        'भौतिकशास्त्र',
        'रसायनशास्त्र',
        'जीवशास्त्र',
        'इंग्रजी/साहित्य',
        'इतिहास',
        'भूगोल',
        'अर्थशास्त्र',
        'संगणक विज्ञान',
        'कला/डिझाइन'
      ]
    },
    category: 'subjects'
  },
  {
    id: 'q9',
    question: {
      en: 'What kind of work environment appeals to you?',
      hi: 'किस तरह का कार्य वातावरण आपको आकर्षित करता है?',
      mr: 'तुम्हाला कोणत्या प्रकारचे कामाचे वातावरण आकर्षक वाटते?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Office/Corporate',
        'Research Lab',
        'Creative Studio',
        'Field Work/Outdoor',
        'Healthcare Setting',
        'Teaching/Academic',
        'Entrepreneurship'
      ],
      hi: [
        'कार्यालय/कॉर्पोरेट',
        'अनुसंधान प्रयोगशाला',
        'रचनात्मक स्टूडियो',
        'क्षेत्र कार्य/बाहरी',
        'स्वास्थ्य सेवा सेटिंग',
        'शिक्षण/शैक्षणिक',
        'उद्यमिता'
      ],
      mr: [
        'कार्यालय/कॉर्पोरेट',
        'संशोधन प्रयोगशाला',
        'सर्जनशील स्टुडिओ',
        'क्षेत्र कार्य/बाहेर',
        'आरोग्य सेवा सेटिंग',
        'शिक्षण/शैक्षणिक',
        'उद्योजकता'
      ]
    },
    category: 'career'
  },
  {
    id: 'q10',
    question: {
      en: 'When facing a difficult problem, you usually:',
      hi: 'एक कठिन समस्या का सामना करते समय, आप आमतौर पर:',
      mr: 'एक कठीण समस्येचा सामना करताना, तुम्ही सामान्यत:'
    },
    type: 'single_choice',
    options: {
      en: [
        'Break it into smaller parts',
        'Try different approaches',
        'Ask for help',
        'Research similar problems',
        'Think creatively'
      ],
      hi: [
        'इसे छोटे हिस्सों में तोड़ें',
        'विभिन्न दृष्टिकोण आज़माएं',
        'मदद मांगें',
        'समान समस्याओं पर शोध करें',
        'रचनात्मक रूप से सोचें'
      ],
      mr: [
        'ते लहान भागांमध्ये मोडा',
        'विविध दृष्टिकोण वापरा',
        'मदत मागा',
        'समान समस्यांवर संशोधन करा',
        'सर्जनशीलतेने विचार करा'
      ]
    },
    category: 'problem_solving'
  },
  {
    id: 'q11',
    question: {
      en: 'After completing your education, you want to:',
      hi: 'अपनी शिक्षा पूरी करने के बाद, आप चाहते हैं:',
      mr: 'तुमचे शिक्षण पूर्ण केल्यानंतर, तुम्हाला हवे आहे:'
    },
    type: 'single_choice',
    options: {
      en: [
        'Work for a company',
        'Start your own business',
        'Do research/PhD',
        'Help people directly',
        'Create/build things',
        'Lead teams'
      ],
      hi: [
        'किसी कंपनी के लिए काम करें',
        'अपना व्यवसाय शुरू करें',
        'अनुसंधान/पीएचडी करें',
        'लोगों की सीधे मदद करें',
        'चीजें बनाएं/निर्माण करें',
        'टीमों का नेतृत्व करें'
      ],
      mr: [
        'कंपनीसाठी काम करा',
        'स्वतःचा व्यवसाय सुरू करा',
        'संशोधन/पीएचडी करा',
        'लोकांना थेट मदत करा',
        'गोष्टी तयार करा/बांधा',
        'संघांचे नेतृत्व करा'
      ]
    },
    category: 'future_goals'
  },
  {
    id: 'q12',
    question: {
      en: 'Which type of exam format do you prefer?',
      hi: 'आप किस प्रकार के परीक्षा प्रारूप को पसंद करते हैं?',
      mr: 'तुम्ही कोणत्या प्रकारचा परीक्षा स्वरूप पसंद करता?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Multiple choice (MCQ)',
        'Written/Descriptive',
        'Practical/Projects',
        'Presentations',
        'Mixed format'
      ],
      hi: [
        'बहुविकल्पी (MCQ)',
        'लिखित/वर्णनात्मक',
        'व्यावहारिक/परियोजनाएं',
        'प्रस्तुतियां',
        'मिश्रित प्रारूप'
      ],
      mr: [
        'बहुपर्यायी (MCQ)',
        'लिखित/वर्णनात्मक',
        'व्यावहारिक/प्रकल्प',
        'प्रस्तुती',
        'मिश्रित स्वरूप'
      ]
    },
    category: 'exam_preference'
  }
];

// Trait mapping for scoring
export const traitMapping: Record<string, Record<string, { trait: string; score: number }[]>> = {
  q1: {
    'Solving puzzles & problems': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Building things': [{ trait: 'handsOn', score: 2 }, { trait: 'logical', score: 1 }],
    'Creating art/design': [{ trait: 'creative', score: 2 }],
    'Helping people': [{ trait: 'people', score: 2 }],
    'Organising & leading': [{ trait: 'leader', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Playing sports': [{ trait: 'handsOn', score: 1 }, { trait: 'disciplined', score: 1 }]
  },
  q2: {
    'Experiments & practicals': [{ trait: 'handsOn', score: 2 }, { trait: 'logical', score: 1 }],
    'Maths problems': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Debates & discussions': [{ trait: 'people', score: 1 }, { trait: 'leader', score: 1 }],
    'Drawing & designing': [{ trait: 'creative', score: 2 }],
    'Business projects': [{ trait: 'leader', score: 1 }, { trait: 'logical', score: 1 }],
    'None of these': []
  },
  q3: {
    'Step-by-step explanations': [{ trait: 'disciplined', score: 1 }, { trait: 'logical', score: 1 }],
    'By doing (hands-on)': [{ trait: 'handsOn', score: 2 }],
    'Visual & diagrams': [{ trait: 'creative', score: 1 }],
    'Reading & research': [{ trait: 'logical', score: 1 }, { trait: 'disciplined', score: 1 }],
    'Group discussions': [{ trait: 'people', score: 1 }]
  },
  q5: {
    'Structured tasks': [{ trait: 'disciplined', score: 2 }],
    'Creative freedom': [{ trait: 'creative', score: 2 }],
    'Mix of both': [{ trait: 'creative', score: 1 }, { trait: 'disciplined', score: 1 }]
  },
  q6: {
    'Solving a hard problem': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Creating something new': [{ trait: 'creative', score: 2 }],
    'Seeing people benefit from my work': [{ trait: 'people', score: 2 }],
    'Leading a team': [{ trait: 'leader', score: 2 }]
  },
  q8: {
    'Mathematics': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Physics': [{ trait: 'logical', score: 2 }, { trait: 'handsOn', score: 1 }],
    'Chemistry': [{ trait: 'logical', score: 1 }, { trait: 'handsOn', score: 1 }],
    'Biology': [{ trait: 'people', score: 1 }, { trait: 'logical', score: 1 }],
    'English/Literature': [{ trait: 'creative', score: 2 }],
    'History': [{ trait: 'creative', score: 1 }, { trait: 'people', score: 1 }],
    'Geography': [{ trait: 'logical', score: 1 }, { trait: 'creative', score: 1 }],
    'Economics': [{ trait: 'logical', score: 2 }, { trait: 'leader', score: 1 }],
    'Computer Science': [{ trait: 'logical', score: 2 }, { trait: 'handsOn', score: 1 }],
    'Art/Design': [{ trait: 'creative', score: 2 }]
  },
  q9: {
    'Office/Corporate': [{ trait: 'leader', score: 1 }, { trait: 'disciplined', score: 1 }],
    'Research Lab': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Creative Studio': [{ trait: 'creative', score: 2 }],
    'Field Work/Outdoor': [{ trait: 'handsOn', score: 2 }, { trait: 'people', score: 1 }],
    'Healthcare Setting': [{ trait: 'people', score: 2 }, { trait: 'logical', score: 1 }],
    'Teaching/Academic': [{ trait: 'people', score: 2 }, { trait: 'leader', score: 1 }],
    'Entrepreneurship': [{ trait: 'leader', score: 2 }, { trait: 'creative', score: 1 }]
  },
  q10: {
    'Break it into smaller parts': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Try different approaches': [{ trait: 'creative', score: 2 }],
    'Ask for help': [{ trait: 'people', score: 1 }],
    'Research similar problems': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Think creatively': [{ trait: 'creative', score: 2 }]
  },
  q11: {
    'Work for a company': [{ trait: 'disciplined', score: 1 }],
    'Start your own business': [{ trait: 'leader', score: 2 }, { trait: 'creative', score: 1 }],
    'Do research/PhD': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Help people directly': [{ trait: 'people', score: 2 }],
    'Create/build things': [{ trait: 'handsOn', score: 2 }, { trait: 'creative', score: 1 }],
    'Lead teams': [{ trait: 'leader', score: 2 }]
  },
  q12: {
    'Multiple choice (MCQ)': [{ trait: 'logical', score: 1 }, { trait: 'disciplined', score: 1 }],
    'Written/Descriptive': [{ trait: 'creative', score: 1 }, { trait: 'disciplined', score: 1 }],
    'Practical/Projects': [{ trait: 'handsOn', score: 2 }],
    'Presentations': [{ trait: 'people', score: 1 }, { trait: 'leader', score: 1 }],
    'Mixed format': [{ trait: 'disciplined', score: 1 }]
  }
};

// Stream determination rules
export const streamRules = {
  'Science (PCM)': {
    conditions: [
      { trait: 'logical', min: 3 },
      { studyTolerance: { min: 7 } }
    ],
    confidence: 'high'
  },
  'Science (PCB)': {
    conditions: [
      { trait: 'logical', min: 2 },
      { trait: 'people', min: 1 },
      { studyTolerance: { min: 6 } }
    ],
    confidence: 'high'
  },
  'Commerce': {
    conditions: [
      [
        { trait: 'people', min: 2 },
        { studyTolerance: { max: 5 } },
        { budgetConstraint: true }
      ],
      [
        { trait: 'leader', min: 2 },
        { trait: 'logical', min: 1 }
      ]
    ],
    confidence: 'medium'
  },
  'Arts/Humanities': {
    conditions: [
      { trait: 'creative', min: 3 },
      { prefersCreativeFreedom: true }
    ],
    confidence: 'high'
  },
  'Vocational': {
    conditions: [
      { trait: 'handsOn', min: 3 },
      { studyTolerance: { max: 6 } }
    ],
    confidence: 'medium'
  }
};

