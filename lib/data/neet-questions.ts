export type Language = 'en' | 'hi' | 'mr';

export interface NEETQuestionOption {
  text: Record<Language, string>;
  neetScore: number; // Impact on NEET probability (0-100)
  careerTags?: string[]; // e.g., ['Avoid_Engineering', 'Surgeon_Fit']
  metrics?: {
    physics?: number;
    chemistry?: number;
    biology?: number;
    accuracy?: number;
    stamina?: number;
    mindset?: number;
  };
}

export interface NEETQuestion {
  id: string;
  question: Record<Language, string>;
  type: 'single_choice';
  options: NEETQuestionOption[];
  category: string; // 'vitals', 'doctor-dna', 'plan-b', 'grit', 'logistics', 'validation'
  section: string; // Human-readable section name
}

export const neetQuestions: NEETQuestion[] = [
  // Section 1: The "Vitals" (Current Academic Health)
  {
    id: 'q1',
    question: {
      en: 'Be honest. What is your average score in full-syllabus mock tests right now?',
      hi: 'ईमानदार रहें। अभी पूर्ण-पाठ्यक्रम मॉक टेस्ट में आपका औसत स्कोर क्या है?',
      mr: 'प्रामाणिक राहा. आत्ता पूर्ण-अभ्यासक्रम मॉक टेस्टमध्ये तुमचा सरासरी गुण काय आहे?'
    },
    type: 'single_choice',
    category: 'vitals',
    section: 'The "Vitals"',
    options: [
      {
        text: {
          en: '< 300 (Serious Gap)',
          hi: '< 300 (गंभीर अंतर)',
          mr: '< 300 (गंभीर अंतर)'
        },
        neetScore: 15,
        metrics: { mindset: 30 }
      },
      {
        text: {
          en: '300 - 450 (Stuck in Average)',
          hi: '300 - 450 (औसत में फंसे)',
          mr: '300 - 450 (सरासरीत अडकले)'
        },
        neetScore: 40,
        metrics: { mindset: 50 }
      },
      {
        text: {
          en: '450 - 550 (Borderline)',
          hi: '450 - 550 (सीमा रेखा)',
          mr: '450 - 550 (सीमारेषा)'
        },
        neetScore: 60,
        metrics: { mindset: 65 }
      },
      {
        text: {
          en: '550 - 620 (Good, need push)',
          hi: '550 - 620 (अच्छा, धक्का चाहिए)',
          mr: '550 - 620 (चांगले, धक्का हवा)'
        },
        neetScore: 75,
        metrics: { mindset: 75 }
      },
      {
        text: {
          en: '620+ (Topper Zone)',
          hi: '620+ (टॉपर जोन)',
          mr: '620+ (टॉपर झोन)'
        },
        neetScore: 90,
        metrics: { mindset: 90 }
      }
    ]
  },
  {
    id: 'q2',
    question: {
      en: 'Which subject is dragging your score down the most?',
      hi: 'कौन सा विषय आपके स्कोर को सबसे ज्यादा नीचे खींच रहा है?',
      mr: 'कोणता विषय तुमचा गुण सर्वात जास्त खाली ओढतो आहे?'
    },
    type: 'single_choice',
    category: 'vitals',
    section: 'The "Vitals"',
    options: [
      {
        text: {
          en: 'Physics (Calculations/Formulae)',
          hi: 'भौतिकी (गणना/सूत्र)',
          mr: 'भौतिकशास्त्र (गणना/सूत्रे)'
        },
        neetScore: -10,
        careerTags: ['Avoid_Engineering'],
        metrics: { physics: 30 }
      },
      {
        text: {
          en: 'Organic Chemistry (Mechanisms)',
          hi: 'कार्बनिक रसायन विज्ञान (तंत्र)',
          mr: 'कार्बनिक रसायनशास्त्र (यंत्रणा)'
        },
        neetScore: -5,
        metrics: { chemistry: 35 }
      },
      {
        text: {
          en: 'Physical Chemistry (Numericals)',
          hi: 'भौतिक रसायन विज्ञान (संख्यात्मक)',
          mr: 'भौतिक रसायनशास्त्र (संख्यात्मक)'
        },
        neetScore: -8,
        metrics: { chemistry: 40, physics: 45 }
      },
      {
        text: {
          en: 'Botany/Zoology (Memorization)',
          hi: 'वनस्पति विज्ञान/प्राणी विज्ञान (याद करना)',
          mr: 'वनस्पतीशास्त्र/प्राणीशास्त्र (लक्षात ठेवणे)'
        },
        neetScore: -5,
        careerTags: ['Avoid_Pure_Bio'],
        metrics: { biology: 35 }
      },
      {
        text: {
          en: 'None, I am balanced',
          hi: 'कोई नहीं, मैं संतुलित हूं',
          mr: 'काही नाही, मी संतुलित आहे'
        },
        neetScore: 10,
        metrics: { physics: 70, chemistry: 70, biology: 70 }
      }
    ]
  },
  {
    id: 'q3',
    question: {
      en: 'How much of the syllabus have you actually completed (notes + practice)?',
      hi: 'आपने वास्तव में कितना पाठ्यक्रम पूरा किया है (नोट्स + अभ्यास)?',
      mr: 'तुम्ही खरोखर किती अभ्यासक्रम पूर्ण केला आहे (नोट्स + सराव)?'
    },
    type: 'single_choice',
    category: 'vitals',
    section: 'The "Vitals"',
    options: [
      {
        text: {
          en: '< 40% (Panic Mode)',
          hi: '< 40% (घबराहट मोड)',
          mr: '< 40% (घाबरायचा मोड)'
        },
        neetScore: 25,
        metrics: { mindset: 40 }
      },
      {
        text: {
          en: '40-70% (Lagging)',
          hi: '40-70% (पीछे)',
          mr: '40-70% (मागे)'
        },
        neetScore: 50,
        metrics: { mindset: 55 }
      },
      {
        text: {
          en: '70-90% (On Track)',
          hi: '70-90% (ट्रैक पर)',
          mr: '70-90% (ट्रॅकवर)'
        },
        neetScore: 70,
        metrics: { mindset: 70 }
      },
      {
        text: {
          en: '100% Done + Revision Started',
          hi: '100% पूर्ण + संशोधन शुरू',
          mr: '100% पूर्ण + पुनरावलोकन सुरू'
        },
        neetScore: 85,
        metrics: { mindset: 85 }
      }
    ]
  },
  {
    id: 'q4',
    question: {
      en: 'How many questions do you get wrong due to "silly mistakes" or "guessing" per paper?',
      hi: 'प्रति पेपर में आप कितने सवाल "मूर्खतापूर्ण गलतियों" या "अनुमान" के कारण गलत करते हैं?',
      mr: 'प्रति पेपरमध्ये तुम्ही "मूर्ख चुका" किंवा "अंदाज" मुळे किती प्रश्न चुकवता?'
    },
    type: 'single_choice',
    category: 'vitals',
    section: 'The "Vitals"',
    options: [
      {
        text: {
          en: '0-5 (High Accuracy)',
          hi: '0-5 (उच्च सटीकता)',
          mr: '0-5 (उच्च अचूकता)'
        },
        neetScore: 15,
        careerTags: ['Precision_High'],
        metrics: { accuracy: 90 }
      },
      {
        text: {
          en: '5-15 (Normal)',
          hi: '5-15 (सामान्य)',
          mr: '5-15 (सामान्य)'
        },
        neetScore: 0,
        metrics: { accuracy: 65 }
      },
      {
        text: {
          en: '15-25 (Careless)',
          hi: '15-25 (लापरवाह)',
          mr: '15-25 (निष्काळजी)'
        },
        neetScore: -15,
        careerTags: ['Precision_Low'],
        metrics: { accuracy: 40 }
      },
      {
        text: {
          en: '25+ (Gambling habit)',
          hi: '25+ (जुआ की आदत)',
          mr: '25+ (जुगाराची सवय)'
        },
        neetScore: -25,
        metrics: { accuracy: 20 }
      }
    ]
  },
  // Section 2: The "Doctor DNA" (Aptitude Check)
  {
    id: 'q5',
    question: {
      en: 'How do you react to visuals of surgery, deep cuts, or needles?',
      hi: 'सर्जरी, गहरे कट, या सुइयों के दृश्यों पर आप कैसे प्रतिक्रिया करते हैं?',
      mr: 'सर्जरी, खोल कट, किंवा सुईंच्या दृश्यांवर तुम्ही कशी प्रतिक्रिया देतात?'
    },
    type: 'single_choice',
    category: 'doctor-dna',
    section: 'The "Doctor DNA"',
    options: [
      {
        text: {
          en: '"Fascinated. I want to see how it works."',
          hi: '"मोहित। मैं देखना चाहता हूं कि यह कैसे काम करता है।"',
          mr: '"आकर्षित. मला हे कसे काम करते ते पहायचे आहे."'
        },
        neetScore: 15,
        careerTags: ['Surgeon_Fit'],
        metrics: { mindset: 80 }
      },
      {
        text: {
          en: '"Neutral. It\'s just biology."',
          hi: '"तटस्थ। यह सिर्फ जीव विज्ञान है।"',
          mr: '"तटस्थ. हे फक्त जीवशास्त्र आहे."'
        },
        neetScore: 10,
        careerTags: ['General_Med_Fit'],
        metrics: { mindset: 70 }
      },
      {
        text: {
          en: '"I feel slightly dizzy but can handle it."',
          hi: '"मुझे थोड़ा चक्कर आता है लेकिन मैं इसे संभाल सकता हूं।"',
          mr: '"मला थोडे चक्कर येतात पण मी हाताळू शकतो."'
        },
        neetScore: 5,
        careerTags: ['Allied_Health_Fit'],
        metrics: { mindset: 60 }
      },
      {
        text: {
          en: '"I close my eyes. I can\'t handle gore."',
          hi: '"मैं अपनी आंखें बंद कर लेता हूं। मैं रक्तपात को संभाल नहीं सकता।"',
          mr: '"मी माझे डोळे बंद करतो. मी रक्तपात हाताळू शकत नाही."'
        },
        neetScore: -20,
        careerTags: ['Avoid_Clinical_Med'],
        metrics: { mindset: 30 }
      }
    ]
  },
  {
    id: 'q6',
    question: {
      en: 'A patient is crying because their diagnosis is bad. What is your instinct?',
      hi: 'एक मरीज रो रहा है क्योंकि उनका निदान खराब है। आपकी प्रवृत्ति क्या है?',
      mr: 'एखादा रुग्ण रडत आहे कारण त्यांचे निदान वाईट आहे. तुमची प्रवृत्ती काय आहे?'
    },
    type: 'single_choice',
    category: 'doctor-dna',
    section: 'The "Doctor DNA"',
    options: [
      {
        text: {
          en: '"Explain the medical facts to calm them down."',
          hi: '"उन्हें शांत करने के लिए चिकित्सा तथ्यों की व्याख्या करें।"',
          mr: '"त्यांना शांत करण्यासाठी वैद्यकीय तथ्ये स्पष्ट करा."'
        },
        neetScore: 10,
        careerTags: ['Diagnostic_Fit'],
        metrics: { mindset: 75 }
      },
      {
        text: {
          en: '"Hold their hand and comfort them emotionally."',
          hi: '"उनका हाथ पकड़ें और भावनात्मक रूप से उन्हें सांत्वना दें।"',
          mr: '"त्यांचा हात धरा आणि भावनिकरित्या त्यांना सांत्वना द्या."'
        },
        neetScore: 8,
        careerTags: ['Nursing_Psych_Fit'],
        metrics: { mindset: 70 }
      },
      {
        text: {
          en: '"Call a senior/nurse to handle it; I\'d feel awkward."',
          hi: '"इसे संभालने के लिए एक वरिष्ठ/नर्स को बुलाएं; मुझे असहज महसूस होगा।"',
          mr: '"हे हाताळण्यासाठी वरिष्ठ/नर्सला बोलवा; मला असहज वाटेल."'
        },
        neetScore: -5,
        careerTags: ['Research_Lab_Fit'],
        metrics: { mindset: 50 }
      }
    ]
  },
  {
    id: 'q7',
    question: {
      en: 'Doctors often work 24-36 hour shifts. How do you handle sleep deprivation?',
      hi: 'डॉक्टर अक्सर 24-36 घंटे की शिफ्ट में काम करते हैं। आप नींद की कमी को कैसे संभालते हैं?',
      mr: 'डॉक्टर अनेकदा 24-36 तास शिफ्टमध्ये काम करतात. तुम्ही झोपेच्या कमतरतेचे व्यवस्थापन कसे करता?'
    },
    type: 'single_choice',
    category: 'doctor-dna',
    section: 'The "Doctor DNA"',
    options: [
      {
        text: {
          en: '"I can function fine on adrenaline/coffee."',
          hi: '"मैं एड्रेनालाईन/कॉफी पर ठीक से काम कर सकता हूं।"',
          mr: '"मी एड्रेनालाईन/कॉफीवर चांगले काम करू शकतो."'
        },
        neetScore: 10,
        careerTags: ['Clinical_Fit'],
        metrics: { stamina: 85 }
      },
      {
        text: {
          en: '"I get cranky and make mistakes."',
          hi: '"मैं चिड़चिड़ा हो जाता हूं और गलतियां करता हूं।"',
          mr: '"मी चिडचिडा होतो आणि चुका करतो."'
        },
        neetScore: -10,
        careerTags: ['Clinic_Day_Job_Fit'],
        metrics: { stamina: 50 }
      },
      {
        text: {
          en: '"My brain shuts down completely."',
          hi: '"मेरा दिमाग पूरी तरह से बंद हो जाता है।"',
          mr: '"माझा मेंदू पूर्णपणे बंद होतो."'
        },
        neetScore: -20,
        careerTags: ['Corporate_Research_Fit'],
        metrics: { stamina: 25 }
      }
    ]
  },
  // Section 3: The "Plan B" Indicators (Hidden Career Mapping)
  {
    id: 'q8',
    question: {
      en: 'Which specific topic do you secretly enjoy the most?',
      hi: 'आप चुपके से कौन सा विषय सबसे ज्यादा पसंद करते हैं?',
      mr: 'तुम्ही गुप्तपणे कोणता विषय सर्वात जास्त आनंद घेता?'
    },
    type: 'single_choice',
    category: 'plan-b',
    section: 'The "Plan B" Indicators',
    options: [
      {
        text: {
          en: 'Genetics / DNA / Biotech',
          hi: 'आनुवंशिकी / DNA / बायोटेक',
          mr: 'अनुवांशिकता / DNA / जैवतंत्रज्ञान'
        },
        neetScore: 5,
        careerTags: ['Biotech_Genetics'],
        metrics: { biology: 75 }
      },
      {
        text: {
          en: 'Human Anatomy / Physiology',
          hi: 'मानव शरीर रचना / शरीर क्रिया विज्ञान',
          mr: 'मानव शरीररचना / शरीरक्रिया'
        },
        neetScore: 8,
        careerTags: ['Physiotherapy_Nursing'],
        metrics: { biology: 80 }
      },
      {
        text: {
          en: 'Chemical Bonding / Organic Reactions',
          hi: 'रासायनिक बंधन / कार्बनिक प्रतिक्रियाएं',
          mr: 'रासायनिक बंधन / कार्बनिक प्रतिक्रिया'
        },
        neetScore: 5,
        careerTags: ['Pharma_Chemistry'],
        metrics: { chemistry: 75 }
      },
      {
        text: {
          en: 'Physics / Optics / Mechanics',
          hi: 'भौतिकी / प्रकाशिकी / यांत्रिकी',
          mr: 'भौतिकशास्त्र / प्रकाशिकी / यांत्रिकी'
        },
        neetScore: 5,
        careerTags: ['Biomed_Engineering'],
        metrics: { physics: 75 }
      },
      {
        text: {
          en: 'Ecology / Environment',
          hi: 'पारिस्थितिकी / पर्यावरण',
          mr: 'परिस्थितिकी / पर्यावरण'
        },
        neetScore: 3,
        careerTags: ['Environmental_Science'],
        metrics: { biology: 70 }
      }
    ]
  },
  {
    id: 'q9',
    question: {
      en: 'If asked to use a complex machine (like a microscope or MRI software), you...',
      hi: 'यदि आपसे एक जटिल मशीन (जैसे माइक्रोस्कोप या MRI सॉफ्टवेयर) का उपयोग करने को कहा जाए, तो आप...',
      mr: 'जटिल यंत्र (जसे मायक्रोस्कोप किंवा MRI सॉफ्टवेअर) वापरायला सांगितले तर, तुम्ही...'
    },
    type: 'single_choice',
    category: 'plan-b',
    section: 'The "Plan B" Indicators',
    options: [
      {
        text: {
          en: '"Figure it out intuitively."',
          hi: '"सहज रूप से समझ लो।"',
          mr: '"सहजपणे समजून घ्या."'
        },
        neetScore: 5,
        careerTags: ['Radiology_Lab_Tech'],
        metrics: { mindset: 75 }
      },
      {
        text: {
          en: '"Read the manual carefully first."',
          hi: '"पहले मैनुअल को ध्यान से पढ़ें।"',
          mr: '"प्रथम मॅन्युअल काळजीपूर्वक वाचा."'
        },
        neetScore: 3,
        metrics: { mindset: 65 }
      },
      {
        text: {
          en: '"Ask someone else to do it."',
          hi: '"किसी और से इसे करने को कहें।"',
          mr: '"दुसऱ्याला ते करायला सांगा."'
        },
        neetScore: -5,
        metrics: { mindset: 45 }
      }
    ]
  },
  {
    id: 'q10',
    question: {
      en: 'Do you prefer working with people or data?',
      hi: 'क्या आप लोगों या डेटा के साथ काम करना पसंद करते हैं?',
      mr: 'तुम्हाला लोकांसह किंवा डेटासह काम करायला आवडते?'
    },
    type: 'single_choice',
    category: 'plan-b',
    section: 'The "Plan B" Indicators',
    options: [
      {
        text: {
          en: '"People. I love talking and listening."',
          hi: '"लोग। मुझे बात करना और सुनना पसंद है।"',
          mr: '"लोक. मला बोलणे आणि ऐकणे आवडते."'
        },
        neetScore: 5,
        careerTags: ['Psychology_Hospital_Mgmt'],
        metrics: { mindset: 70 }
      },
      {
        text: {
          en: '"Data/Samples. I prefer a quiet lab."',
          hi: '"डेटा/नमूने। मैं एक शांत प्रयोगशाला पसंद करता हूं।"',
          mr: '"डेटा/नमुने. मी शांत प्रयोगशाला पसंत करतो."'
        },
        neetScore: 3,
        careerTags: ['Research_Forensics'],
        metrics: { mindset: 65 }
      },
      {
        text: {
          en: '"Mix of both."',
          hi: '"दोनों का मिश्रण।"',
          mr: '"दोन्हीचे मिश्रण."'
        },
        neetScore: 5,
        metrics: { mindset: 70 }
      }
    ]
  },
  {
    id: 'q11',
    question: {
      en: 'Something breaks in your house. You...',
      hi: 'आपके घर में कुछ टूट जाता है। आप...',
      mr: 'तुमच्या घरात काहीतरी तुटते. तुम्ही...'
    },
    type: 'single_choice',
    category: 'plan-b',
    section: 'The "Plan B" Indicators',
    options: [
      {
        text: {
          en: '"Analyze why it broke."',
          hi: '"विश्लेषण करें कि यह क्यों टूटा।"',
          mr: '"हे का तुटले याचे विश्लेषण करा."'
        },
        neetScore: 3,
        careerTags: ['Research'],
        metrics: { mindset: 70 }
      },
      {
        text: {
          en: '"Try to fix it with tools."',
          hi: '"उपकरणों से इसे ठीक करने की कोशिश करें।"',
          mr: '"साधनांसह ते दुरुस्त करण्याचा प्रयत्न करा."'
        },
        neetScore: 5,
        careerTags: ['Dentistry_Surgery'],
        metrics: { mindset: 75 }
      },
      {
        text: {
          en: '"Buy a new one or call an expert."',
          hi: '"नया खरीदें या विशेषज्ञ को बुलाएं।"',
          mr: '"नवीन खरेदी करा किंवा तज्ञाला बोलवा."'
        },
        neetScore: -3,
        metrics: { mindset: 50 }
      }
    ]
  },
  // Section 4: The "Grit" (Exam Temperament)
  {
    id: 'q12',
    question: {
      en: 'You studied hard but scored low in a mock test. What happens next?',
      hi: 'आपने कड़ी मेहनत की लेकिन मॉक टेस्ट में कम अंक मिले। आगे क्या होता है?',
      mr: 'तुम्ही कठोर अभ्यास केला पण मॉक टेस्टमध्ये कमी गुण मिळाले. पुढे काय होते?'
    },
    type: 'single_choice',
    category: 'grit',
    section: 'The "Grit"',
    options: [
      {
        text: {
          en: '"I analyze my mistakes and study harder."',
          hi: '"मैं अपनी गलतियों का विश्लेषण करता हूं और अधिक मेहनत से पढ़ता हूं।"',
          mr: '"मी माझ्या चुकांचे विश्लेषण करतो आणि अधिक कठोर अभ्यास करतो."'
        },
        neetScore: 15,
        careerTags: ['High_Grit'],
        metrics: { mindset: 85, stamina: 80 }
      },
      {
        text: {
          en: '"I feel sad for 2 days, then restart."',
          hi: '"मैं 2 दिनों तक दुखी रहता हूं, फिर फिर से शुरू करता हूं।"',
          mr: '"मी 2 दिवस दु:खी होतो, मग पुन्हा सुरू करतो."'
        },
        neetScore: 5,
        metrics: { mindset: 60, stamina: 55 }
      },
      {
        text: {
          en: '"I feel like giving up on NEET."',
          hi: '"मुझे NEET छोड़ने का मन करता है।"',
          mr: '"मला NEET सोडण्याची इच्छा होते."'
        },
        neetScore: -25,
        careerTags: ['Low_Grit'],
        metrics: { mindset: 30, stamina: 25 }
      }
    ]
  },
  {
    id: 'q13',
    question: {
      en: 'How do you revise?',
      hi: 'आप कैसे संशोधन करते हैं?',
      mr: 'तुम्ही कसे पुनरावलोकन करता?'
    },
    type: 'single_choice',
    category: 'grit',
    section: 'The "Grit"',
    options: [
      {
        text: {
          en: 'Active Recall (Testing myself)',
          hi: 'सक्रिय याद (खुद को परखना)',
          mr: 'सक्रिय आठवण (स्वतःला चाचणी)'
        },
        neetScore: 10,
        metrics: { accuracy: 75 }
      },
      {
        text: {
          en: 'Re-reading notes/NCERT',
          hi: 'नोट्स/NCERT को फिर से पढ़ना',
          mr: 'नोट्स/NCERT पुन्हा वाचणे'
        },
        neetScore: 3,
        metrics: { accuracy: 55 }
      },
      {
        text: {
          en: 'Watching video lectures again',
          hi: 'वीडियो लेक्चर फिर से देखना',
          mr: 'व्हिडिओ व्याख्यान पुन्हा पाहणे'
        },
        neetScore: -5,
        metrics: { accuracy: 40 }
      }
    ]
  },
  {
    id: 'q14',
    question: {
      en: 'How often do you check your phone while studying?',
      hi: 'पढ़ाई करते समय आप कितनी बार अपना फोन चेक करते हैं?',
      mr: 'अभ्यास करताना तुम्ही किती वेळा तुमचा फोन तपासता?'
    },
    type: 'single_choice',
    category: 'grit',
    section: 'The "Grit"',
    options: [
      {
        text: {
          en: 'Phone is in another room',
          hi: 'फोन दूसरे कमरे में है',
          mr: 'फोन दुसऱ्या खोलीत आहे'
        },
        neetScore: 10,
        metrics: { mindset: 80, stamina: 75 }
      },
      {
        text: {
          en: 'Every hour for 5 mins',
          hi: 'हर घंटे 5 मिनट के लिए',
          mr: 'प्रत्येक तासाला 5 मिनिटे'
        },
        neetScore: 0,
        metrics: { mindset: 60, stamina: 60 }
      },
      {
        text: {
          en: 'Every 10-15 mins',
          hi: 'हर 10-15 मिनट',
          mr: 'प्रत्येक 10-15 मिनिटे'
        },
        neetScore: -15,
        careerTags: ['Focus_Issue'],
        metrics: { mindset: 40, stamina: 40 }
      }
    ]
  },
  {
    id: 'q15',
    question: {
      en: 'When you see a tough Physics rotation question, you...',
      hi: 'जब आप एक कठिन भौतिकी रोटेशन प्रश्न देखते हैं, तो आप...',
      mr: 'कठीण भौतिकशास्त्र रोटेशन प्रश्न पाहताना, तुम्ही...'
    },
    type: 'single_choice',
    category: 'grit',
    section: 'The "Grit"',
    options: [
      {
        text: {
          en: 'Attempt it immediately',
          hi: 'तुरंत प्रयास करें',
          mr: 'तत्क्षण प्रयत्न करा'
        },
        neetScore: 10,
        metrics: { physics: 80, mindset: 80 }
      },
      {
        text: {
          en: 'Mark it for review and come back later',
          hi: 'समीक्षा के लिए चिह्नित करें और बाद में वापस आएं',
          mr: 'पुनरावलोकनासाठी चिन्हांकित करा आणि नंतर परत या'
        },
        neetScore: 5,
        metrics: { physics: 65, mindset: 65 }
      },
      {
        text: {
          en: 'Skip it immediately without reading',
          hi: 'बिना पढ़े तुरंत छोड़ दें',
          mr: 'वाचल्याशिवाय तत्क्षण वगळा'
        },
        neetScore: -15,
        careerTags: ['Confidence_Issue'],
        metrics: { physics: 30, mindset: 35 }
      }
    ]
  },
  // Section 5: Logistics & Pressure
  {
    id: 'q16',
    question: {
      en: 'Are you willing to take a drop year if you don\'t clear NEET this time?',
      hi: 'क्या आप इस बार NEET नहीं क्लीयर करने पर ड्रॉप ईयर लेने को तैयार हैं?',
      mr: 'हे वेळी NEET पास न केल्यास तुम्ही ड्रॉप वर्ष घेण्यास तयार आहात?'
    },
    type: 'single_choice',
    category: 'logistics',
    section: 'Logistics & Pressure',
    options: [
      {
        text: {
          en: '"Yes, until I get a Govt seat."',
          hi: '"हाँ, जब तक मुझे सरकारी सीट नहीं मिल जाती।"',
          mr: '"होय, सरकारी जागा मिळेपर्यंत."'
        },
        neetScore: 10,
        metrics: { mindset: 75 }
      },
      {
        text: {
          en: '"Maximum 1 drop, then I move on."',
          hi: '"अधिकतम 1 ड्रॉप, फिर मैं आगे बढ़ता हूं।"',
          mr: '"जास्तीत जास्त 1 ड्रॉप, मग मी पुढे जातो."'
        },
        neetScore: 5,
        metrics: { mindset: 60 }
      },
      {
        text: {
          en: '"No, I need a college this year."',
          hi: '"नहीं, मुझे इस साल कॉलेज चाहिए।"',
          mr: '"नाही, मला या वर्षी महाविद्यालय हवे आहे."'
        },
        neetScore: -10,
        careerTags: ['Urgent_Plan_B'],
        metrics: { mindset: 50 }
      }
    ]
  },
  {
    id: 'q17',
    question: {
      en: 'If you don\'t get a Govt seat, can your family afford Private Medical (₹50L - ₹1Cr)?',
      hi: 'यदि आपको सरकारी सीट नहीं मिलती है, तो क्या आपका परिवार प्राइवेट मेडिकल (₹50L - ₹1Cr) का खर्च उठा सकता है?',
      mr: 'सरकारी जागा न मिळाल्यास तुमचे कुटुंब खाजगी वैद्यकीय (₹50L - ₹1Cr) परवडू शकेल?'
    },
    type: 'single_choice',
    category: 'logistics',
    section: 'Logistics & Pressure',
    options: [
      {
        text: {
          en: '"Yes, easily."',
          hi: '"हाँ, आसानी से।"',
          mr: '"होय, सहजतेने."'
        },
        neetScore: 5,
        metrics: { mindset: 70 }
      },
      {
        text: {
          en: '"Maybe, with a loan."',
          hi: '"शायद, लोन के साथ।"',
          mr: '"कदाचित, कर्जासह."'
        },
        neetScore: 0,
        metrics: { mindset: 60 }
      },
      {
        text: {
          en: '"No, absolutely not."',
          hi: '"नहीं, बिल्कुल नहीं।"',
          mr: '"नाही, अजिबात नाही."'
        },
        neetScore: -5,
        careerTags: ['High_Stakes'],
        metrics: { mindset: 55 }
      }
    ]
  },
  {
    id: 'q18',
    question: {
      en: 'Is becoming a doctor YOUR dream or your PARENTS\' dream?',
      hi: 'डॉक्टर बनना आपका सपना है या आपके माता-पिता का सपना है?',
      mr: 'डॉक्टर व्हायचे हे तुमचे स्वप्न आहे किंवा तुमच्या पालकांचे स्वप्न आहे?'
    },
    type: 'single_choice',
    category: 'logistics',
    section: 'Logistics & Pressure',
    options: [
      {
        text: {
          en: '"100% Mine."',
          hi: '"100% मेरा।"',
          mr: '"100% माझे."'
        },
        neetScore: 15,
        metrics: { mindset: 85 }
      },
      {
        text: {
          en: '"Mine, but they want it more."',
          hi: '"मेरा, लेकिन वे इसे अधिक चाहते हैं।"',
          mr: '"माझे, पण त्यांना अधिक हवे आहे."'
        },
        neetScore: 5,
        metrics: { mindset: 65 }
      },
      {
        text: {
          en: '"Mostly theirs. I\'d be happy doing something else."',
          hi: '"ज्यादातर उनका। मैं कुछ और करके खुश रहूंगा।"',
          mr: '"मुख्यत्वे त्यांचे. मी काहीतरी वेगळे करून आनंदी राहीन."'
        },
        neetScore: -20,
        careerTags: ['Suggest_Plan_B'],
        metrics: { mindset: 40 }
      }
    ]
  },
  {
    id: 'q19',
    question: {
      en: 'Do you know what a Perfusionist or a Clinical Psychologist does?',
      hi: 'क्या आप जानते हैं कि पर्फ्यूजनिस्ट या क्लिनिकल साइकोलॉजिस्ट क्या करता है?',
      mr: 'पर्फ्यूजनिस्ट किंवा क्लिनिकल सायकोलॉजिस्ट काय करतो हे तुम्हाला माहिती आहे?'
    },
    type: 'single_choice',
    category: 'logistics',
    section: 'Logistics & Pressure',
    options: [
      {
        text: {
          en: '"Yes, and I\'m interested."',
          hi: '"हाँ, और मुझे दिलचस्पी है।"',
          mr: '"होय, आणि मला स्वारस्य आहे."'
        },
        neetScore: 5,
        careerTags: ['Allied_Health_Aware'],
        metrics: { mindset: 70 }
      },
      {
        text: {
          en: '"No idea."',
          hi: '"कोई जानकारी नहीं।"',
          mr: '"कल्पना नाही."'
        },
        neetScore: 0,
        metrics: { mindset: 60 }
      },
      {
        text: {
          en: '"I only want MBBS."',
          hi: '"मुझे सिर्फ MBBS चाहिए।"',
          mr: '"मला फक्त MBBS हवे आहे."'
        },
        neetScore: 0,
        metrics: { mindset: 65 }
      }
    ]
  },
  {
    id: 'q20',
    question: {
      en: 'Are you willing to go abroad (Russia/Philippines/etc.) for MBBS?',
      hi: 'क्या आप MBBS के लिए विदेश (रूस/फिलीपींस/आदि) जाने को तैयार हैं?',
      mr: 'MBBS साठी परदेशात (रशिया/फिलिपिन्स/इ.) जाण्यास तुम्ही तयार आहात?'
    },
    type: 'single_choice',
    category: 'logistics',
    section: 'Logistics & Pressure',
    options: [
      {
        text: {
          en: '"Yes."',
          hi: '"हाँ।"',
          mr: '"होय."'
        },
        neetScore: 5,
        metrics: { mindset: 70 }
      },
      {
        text: {
          en: '"No."',
          hi: '"नहीं।"',
          mr: '"नाही."'
        },
        neetScore: 0,
        metrics: { mindset: 65 }
      }
    ]
  },
  // Section 6: Final Validations
  {
    id: 'q21',
    question: {
      en: 'Does exam stress make you physically sick (headaches/nausea)?',
      hi: 'क्या परीक्षा का तनाव आपको शारीरिक रूप से बीमार कर देता है (सिरदर्द/मतली)?',
      mr: 'परीक्षा तणाव तुम्हाला शारीरिक आजारी करते का (डोकेदुखी/मळमळ)?'
    },
    type: 'single_choice',
    category: 'validation',
    section: 'Final Validations',
    options: [
      {
        text: {
          en: 'Often',
          hi: 'अक्सर',
          mr: 'अनेकदा'
        },
        neetScore: -15,
        careerTags: ['High_Anxiety'],
        metrics: { mindset: 40, stamina: 45 }
      },
      {
        text: {
          en: 'Sometimes',
          hi: 'कभी-कभी',
          mr: 'कधीकधी'
        },
        neetScore: 0,
        metrics: { mindset: 60, stamina: 60 }
      },
      {
        text: {
          en: 'Rarely',
          hi: 'शायद ही कभी',
          mr: 'दुर्मिळ'
        },
        neetScore: 10,
        careerTags: ['High_Resilience'],
        metrics: { mindset: 80, stamina: 80 }
      }
    ]
  },
  {
    id: 'q22',
    question: {
      en: 'Can you remember the examples in Biology Morphology easily?',
      hi: 'क्या आप जीव विज्ञान आकृति विज्ञान के उदाहरण आसानी से याद रख सकते हैं?',
      mr: 'जीवशास्त्र आकारशास्त्रातील उदाहरणे तुम्ही सहज लक्षात ठेवू शकता?'
    },
    type: 'single_choice',
    category: 'validation',
    section: 'Final Validations',
    options: [
      {
        text: {
          en: 'Yes, easy',
          hi: 'हाँ, आसान',
          mr: 'होय, सोपे'
        },
        neetScore: 10,
        metrics: { biology: 80 }
      },
      {
        text: {
          en: 'I struggle but manage',
          hi: 'मैं संघर्ष करता हूं लेकिन प्रबंधन करता हूं',
          mr: 'मी संघर्ष करतो पण व्यवस्थापन करतो'
        },
        neetScore: 3,
        metrics: { biology: 60 }
      },
      {
        text: {
          en: 'No, I hate rote learning',
          hi: 'नहीं, मुझे रट्टा लगाने से नफरत है',
          mr: 'नाही, मला रट्टामारण्याची तिरस्कार आहे'
        },
        neetScore: -10,
        metrics: { biology: 40 }
      }
    ]
  },
  {
    id: 'q23',
    question: {
      en: 'How many hours of self-study (excluding coaching) do you do daily?',
      hi: 'आप रोजाना कितने घंटे स्व-अध्ययन (कोचिंग को छोड़कर) करते हैं?',
      mr: 'दररोज किती तास स्व-अभ्यास (कोचिंग वगळता) करता?'
    },
    type: 'single_choice',
    category: 'validation',
    section: 'Final Validations',
    options: [
      {
        text: {
          en: '8+ hours',
          hi: '8+ घंटे',
          mr: '8+ तास'
        },
        neetScore: 15,
        metrics: { stamina: 85 }
      },
      {
        text: {
          en: '4-6 hours',
          hi: '4-6 घंटे',
          mr: '4-6 तास'
        },
        neetScore: 5,
        metrics: { stamina: 65 }
      },
      {
        text: {
          en: '< 3 hours',
          hi: '< 3 घंटे',
          mr: '< 3 तास'
        },
        neetScore: -15,
        metrics: { stamina: 40 }
      }
    ]
  },
  {
    id: 'q24',
    question: {
      en: 'What drives you?',
      hi: 'आपको क्या प्रेरित करता है?',
      mr: 'तुम्हाला काय प्रेरित करते?'
    },
    type: 'single_choice',
    category: 'validation',
    section: 'Final Validations',
    options: [
      {
        text: {
          en: 'Saving lives/Helping people',
          hi: 'जान बचाना/लोगों की मदद करना',
          mr: 'जीवन वाचवणे/लोकांना मदत करणे'
        },
        neetScore: 10,
        careerTags: ['Medical_Motivation'],
        metrics: { mindset: 80 }
      },
      {
        text: {
          en: 'The "Dr." title and respect',
          hi: '"डॉक्टर" उपाधि और सम्मान',
          mr: '"डॉक्टर" पदवी आणि आदर'
        },
        neetScore: 5,
        metrics: { mindset: 65 }
      },
      {
        text: {
          en: 'Financial security',
          hi: 'आर्थिक सुरक्षा',
          mr: 'आर्थिक सुरक्षा'
        },
        neetScore: 3,
        metrics: { mindset: 60 }
      },
      {
        text: {
          en: 'Interest in Biology/Science',
          hi: 'जीव विज्ञान/विज्ञान में रुचि',
          mr: 'जीवशास्त्र/विज्ञानात स्वारस्य'
        },
        neetScore: 8,
        metrics: { biology: 75, mindset: 70 }
      }
    ]
  },
  {
    id: 'q25',
    question: {
      en: 'If you could press a button and be successful in a field other than Medicine, what would it be?',
      hi: 'यदि आप एक बटन दबा सकते हैं और चिकित्सा के अलावा किसी अन्य क्षेत्र में सफल हो सकते हैं, तो यह क्या होगा?',
      mr: 'वैद्यकीय व्यतिरिक्त इतर क्षेत्रात यशस्वी होण्यासाठी बटण दाबू शकत असताना, ते काय असेल?'
    },
    type: 'single_choice',
    category: 'validation',
    section: 'Final Validations',
    options: [
      {
        text: {
          en: 'Research Scientist',
          hi: 'अनुसंधान वैज्ञानिक',
          mr: 'संशोधन वैज्ञानिक'
        },
        neetScore: 3,
        careerTags: ['Research_Path'],
        metrics: { mindset: 70 }
      },
      {
        text: {
          en: 'Hospital CEO/Manager',
          hi: 'अस्पताल सीईओ/प्रबंधक',
          mr: 'रुग्णालय सीईओ/व्यवस्थापक'
        },
        neetScore: 5,
        careerTags: ['Hospital_Mgmt'],
        metrics: { mindset: 65 }
      },
      {
        text: {
          en: 'Forensic Expert/Detective',
          hi: 'फोरेंसिक विशेषज्ञ/जासूस',
          mr: 'फोरेंसिक तज्ञ/गुप्तचर'
        },
        neetScore: 3,
        careerTags: ['Forensics'],
        metrics: { mindset: 65 }
      },
      {
        text: {
          en: 'Psychologist/Therapist',
          hi: 'मनोवैज्ञानिक/चिकित्सक',
          mr: 'मानसशास्त्रज्ञ/चिकित्सक'
        },
        neetScore: 5,
        careerTags: ['Psychology'],
        metrics: { mindset: 70 }
      },
      {
        text: {
          en: 'None. Only Doctor.',
          hi: 'कोई नहीं। सिर्फ डॉक्टर।',
          mr: 'काही नाही. फक्त डॉक्टर.'
        },
        neetScore: 10,
        metrics: { mindset: 80 }
      }
    ]
  },
  // Section 7: Extended Deep Dive Questions (Q26-Q35)
  {
    id: 'q26',
    question: {
      en: 'Which Physics chapters are you STRONGEST in? (Select top 3)',
      hi: 'भौतिकी के कौन से अध्याय आपके सबसे मजबूत हैं? (शीर्ष 3 चुनें)',
      mr: 'भौतिकशास्त्रातील कोणते अध्याय तुम्हाला सर्वात मजबूत आहेत? (शीर्ष 3 निवडा)'
    },
    type: 'single_choice',
    category: 'extended',
    section: 'Extended Deep Dive',
    options: [
      {
        text: {
          en: 'Mechanics (Motion, Force, Energy)',
          hi: 'यांत्रिकी (गति, बल, ऊर्जा)',
          mr: 'यंत्रशास्त्र (गती, बल, ऊर्जा)'
        },
        neetScore: 3,
        metrics: { physics: 70 },
        careerTags: ['Physics_Strong']
      },
      {
        text: {
          en: 'Thermodynamics & Kinetic Theory',
          hi: 'ऊष्मागतिकी और गतिज सिद्धांत',
          mr: 'ऊष्मागतिकी आणि गतिज सिद्धांत'
        },
        neetScore: 3,
        metrics: { physics: 65 },
        careerTags: ['Physics_Strong']
      },
      {
        text: {
          en: 'Electrostatics & Current Electricity',
          hi: 'विद्युतस्थैतिकी और विद्युत धारा',
          mr: 'इलेक्ट्रोस्टॅटिक्स आणि वर्तमान विद्युत'
        },
        neetScore: 4,
        metrics: { physics: 75 },
        careerTags: ['Physics_Strong']
      },
      {
        text: {
          en: 'Optics (Ray & Wave)',
          hi: 'प्रकाशिकी (किरण और तरंग)',
          mr: 'प्रकाशिकी (किरण आणि लहर)'
        },
        neetScore: 3,
        metrics: { physics: 70 },
        careerTags: ['Physics_Strong']
      },
      {
        text: {
          en: 'Modern Physics (Atoms, Nuclei, Dual Nature)',
          hi: 'आधुनिक भौतिकी (परमाणु, नाभिक, द्वैत प्रकृति)',
          mr: 'आधुनिक भौतिकशास्त्र (अणू, न्यूक्लियस, दुहेरी स्वभाव)'
        },
        neetScore: 2,
        metrics: { physics: 60 },
        careerTags: ['Physics_Moderate']
      },
      {
        text: {
          en: 'Waves & Oscillations',
          hi: 'तरंग और दोलन',
          mr: 'लहर आणि दोलन'
        },
        neetScore: 2,
        metrics: { physics: 60 },
        careerTags: ['Physics_Moderate']
      }
    ]
  },
  {
    id: 'q27',
    question: {
      en: 'Which Physics chapters are you WEAKEST in? (Select top 2)',
      hi: 'भौतिकी के कौन से अध्याय आपके सबसे कमजोर हैं? (शीर्ष 2 चुनें)',
      mr: 'भौतिकशास्त्रातील कोणते अध्याय तुम्हाला सर्वात कमकुवत आहेत? (शीर्ष 2 निवडा)'
    },
    type: 'single_choice',
    category: 'extended',
    section: 'Extended Deep Dive',
    options: [
      {
        text: {
          en: 'Rotation & Angular Motion',
          hi: 'घूर्णन और कोणीय गति',
          mr: 'रोटेशन आणि कोनीय गती'
        },
        neetScore: -5,
        metrics: { physics: 35 },
        careerTags: ['Physics_Weak']
      },
      {
        text: {
          en: 'Electromagnetic Induction & AC',
          hi: 'विद्युत चुंबकीय प्रेरण और AC',
          mr: 'इलेक्ट्रोमॅग्नेटिक इंडक्शन आणि AC'
        },
        neetScore: -4,
        metrics: { physics: 40 },
        careerTags: ['Physics_Weak']
      },
      {
        text: {
          en: 'Semiconductors & Electronics',
          hi: 'अर्धचालक और इलेक्ट्रॉनिक्स',
          mr: 'सेमीकंडक्टर आणि इलेक्ट्रॉनिक्स'
        },
        neetScore: -3,
        metrics: { physics: 45 },
        careerTags: ['Physics_Weak']
      },
      {
        text: {
          en: 'Gravitation',
          hi: 'गुरुत्वाकर्षण',
          mr: 'गुरुत्वाकर्षण'
        },
        neetScore: -2,
        metrics: { physics: 50 },
        careerTags: ['Physics_Weak']
      },
      {
        text: {
          en: 'None, I am balanced across chapters',
          hi: 'कोई नहीं, मैं सभी अध्यायों में संतुलित हूं',
          mr: 'काही नाही, मी सर्व अध्यायांमध्ये संतुलित आहे'
        },
        neetScore: 5,
        metrics: { physics: 75 }
      }
    ]
  },
  {
    id: 'q28',
    question: {
      en: 'Which Chemistry topics are you STRONGEST in?',
      hi: 'रसायन विज्ञान के कौन से विषय आपके सबसे मजबूत हैं?',
      mr: 'रसायनशास्त्रातील कोणते विषय तुम्हाला सर्वात मजबूत आहेत?'
    },
    type: 'single_choice',
    category: 'extended',
    section: 'Extended Deep Dive',
    options: [
      {
        text: {
          en: 'Organic Chemistry (Mechanisms, Reactions)',
          hi: 'कार्बनिक रसायन विज्ञान (तंत्र, प्रतिक्रियाएं)',
          mr: 'कार्बनिक रसायनशास्त्र (यंत्रणा, प्रतिक्रिया)'
        },
        neetScore: 4,
        metrics: { chemistry: 75 },
        careerTags: ['Chemistry_Strong']
      },
      {
        text: {
          en: 'Physical Chemistry (Numericals, Thermodynamics)',
          hi: 'भौतिक रसायन विज्ञान (संख्यात्मक, ऊष्मागतिकी)',
          mr: 'भौतिक रसायनशास्त्र (संख्यात्मक, ऊष्मागतिकी)'
        },
        neetScore: 3,
        metrics: { chemistry: 70 },
        careerTags: ['Chemistry_Strong']
      },
      {
        text: {
          en: 'Inorganic Chemistry (Periodic Table, Chemical Bonding)',
          hi: 'अकार्बनिक रसायन विज्ञान (आवर्त सारणी, रासायनिक बंधन)',
          mr: 'अकार्बनिक रसायनशास्त्र (आवर्त सारणी, रासायनिक बंधन)'
        },
        neetScore: 3,
        metrics: { chemistry: 65 },
        careerTags: ['Chemistry_Moderate']
      },
      {
        text: {
          en: 'Biomolecules & Polymers',
          hi: 'बायोमोलेक्यूल और पॉलिमर',
          mr: 'बायोमोलेक्यूल आणि पॉलिमर'
        },
        neetScore: 2,
        metrics: { chemistry: 60 },
        careerTags: ['Chemistry_Moderate']
      },
      {
        text: {
          en: 'I am balanced across all topics',
          hi: 'मैं सभी विषयों में संतुलित हूं',
          mr: 'मी सर्व विषयांमध्ये संतुलित आहे'
        },
        neetScore: 5,
        metrics: { chemistry: 75 }
      }
    ]
  },
  {
    id: 'q29',
    question: {
      en: 'Which Biology sections are you STRONGEST in?',
      hi: 'जीव विज्ञान के कौन से खंड आपके सबसे मजबूत हैं?',
      mr: 'जीवशास्त्रातील कोणते विभाग तुम्हाला सर्वात मजबूत आहेत?'
    },
    type: 'single_choice',
    category: 'extended',
    section: 'Extended Deep Dive',
    options: [
      {
        text: {
          en: 'Botany (Plant Kingdom, Morphology, Physiology)',
          hi: 'वनस्पति विज्ञान (पादप साम्राज्य, आकृति विज्ञान, शरीर क्रिया विज्ञान)',
          mr: 'वनस्पतीशास्त्र (प्लांट किंगडम, आकारशास्त्र, शरीरक्रिया)'
        },
        neetScore: 3,
        metrics: { biology: 70 },
        careerTags: ['Biology_Strong']
      },
      {
        text: {
          en: 'Zoology (Animal Kingdom, Human Physiology)',
          hi: 'प्राणी विज्ञान (जंतु साम्राज्य, मानव शरीर क्रिया विज्ञान)',
          mr: 'प्राणीशास्त्र (प्राणी साम्राज्य, मानव शरीरक्रिया)'
        },
        neetScore: 3,
        metrics: { biology: 70 },
        careerTags: ['Biology_Strong']
      },
      {
        text: {
          en: 'Cell Biology & Genetics',
          hi: 'कोशिका जीव विज्ञान और आनुवंशिकी',
          mr: 'सेल जीवशास्त्र आणि अनुवांशिकता'
        },
        neetScore: 4,
        metrics: { biology: 75 },
        careerTags: ['Biology_Strong']
      },
      {
        text: {
          en: 'Ecology & Environment',
          hi: 'पारिस्थितिकी और पर्यावरण',
          mr: 'परिस्थितिकी आणि पर्यावरण'
        },
        neetScore: 2,
        metrics: { biology: 60 },
        careerTags: ['Biology_Moderate']
      },
      {
        text: {
          en: 'I am balanced across all sections',
          hi: 'मैं सभी खंडों में संतुलित हूं',
          mr: 'मी सर्व विभागांमध्ये संतुलित आहे'
        },
        neetScore: 5,
        metrics: { biology: 75 }
      }
    ]
  },
  {
    id: 'q30',
    question: {
      en: 'How much time do you spend on each subject in a 3-hour mock test?',
      hi: '3 घंटे के मॉक टेस्ट में आप प्रत्येक विषय पर कितना समय बिताते हैं?',
      mr: '3 तास मॉक टेस्टमध्ये तुम्ही प्रत्येक विषयावर किती वेळ घालवता?'
    },
    type: 'single_choice',
    category: 'extended',
    section: 'Extended Deep Dive',
    options: [
      {
        text: {
          en: 'Physics: 90min, Chemistry: 60min, Biology: 30min (Imbalanced)',
          hi: 'भौतिकी: 90मिनट, रसायन: 60मिनट, जीव विज्ञान: 30मिनट (असंतुलित)',
          mr: 'भौतिकशास्त्र: 90मिनिटे, रसायन: 60मिनिटे, जीवशास्त्र: 30मिनिटे (असंतुलित)'
        },
        neetScore: -3,
        metrics: { accuracy: 50, stamina: 60 }
      },
      {
        text: {
          en: 'Physics: 75min, Chemistry: 60min, Biology: 45min (Moderate balance)',
          hi: 'भौतिकी: 75मिनट, रसायन: 60मिनट, जीव विज्ञान: 45मिनट (मध्यम संतुलन)',
          mr: 'भौतिकशास्त्र: 75मिनिटे, रसायन: 60मिनिटे, जीवशास्त्र: 45मिनिटे (मध्यम संतुलन)'
        },
        neetScore: 2,
        metrics: { accuracy: 65, stamina: 70 }
      },
      {
        text: {
          en: 'Physics: 60min, Chemistry: 60min, Biology: 60min (Perfect balance)',
          hi: 'भौतिकी: 60मिनट, रसायन: 60मिनट, जीव विज्ञान: 60मिनट (सही संतुलन)',
          mr: 'भौतिकशास्त्र: 60मिनिटे, रसायन: 60मिनिटे, जीवशास्त्र: 60मिनिटे (परिपूर्ण संतुलन)'
        },
        neetScore: 5,
        metrics: { accuracy: 75, stamina: 75 }
      },
      {
        text: {
          en: 'I don\'t track time, just complete as fast as possible',
          hi: 'मैं समय ट्रैक नहीं करता, बस जितना तेज हो सके पूरा करता हूं',
          mr: 'मी वेळ ट्रॅक करत नाही, फक्त शक्य तितक्या वेगाने पूर्ण करतो'
        },
        neetScore: -5,
        metrics: { accuracy: 40, stamina: 55 }
      }
    ]
  },
  {
    id: 'q31',
    question: {
      en: 'How confident are you with NCERT concepts?',
      hi: 'NCERT की अवधारणाओं के साथ आप कितने आश्वस्त हैं?',
      mr: 'NCERT संकल्पनांशी तुम्ही किती आत्मविश्वासू आहात?'
    },
    type: 'single_choice',
    category: 'extended',
    section: 'Extended Deep Dive',
    options: [
      {
        text: {
          en: 'Very confident (80%+ concepts clear)',
          hi: 'बहुत आश्वस्त (80%+ अवधारणाएं स्पष्ट)',
          mr: 'खूप आत्मविश्वासू (80%+ संकल्पना स्पष्ट)'
        },
        neetScore: 8,
        metrics: { accuracy: 75, mindset: 75 }
      },
      {
        text: {
          en: 'Somewhat confident (50-80% concepts clear)',
          hi: 'कुछ हद तक आश्वस्त (50-80% अवधारणाएं स्पष्ट)',
          mr: 'काही प्रमाणात आत्मविश्वासू (50-80% संकल्पना स्पष्ट)'
        },
        neetScore: 3,
        metrics: { accuracy: 60, mindset: 60 }
      },
      {
        text: {
          en: 'Need work (<50% concepts clear)',
          hi: 'काम की आवश्यकता (<50% अवधारणाएं स्पष्ट)',
          mr: 'कामाची आवश्यकता (<50% संकल्पना स्पष्ट)'
        },
        neetScore: -5,
        metrics: { accuracy: 45, mindset: 50 }
      },
      {
        text: {
          en: 'I rely more on reference books than NCERT',
          hi: 'मैं NCERT से अधिक संदर्भ पुस्तकों पर निर्भर करता हूं',
          mr: 'मी NCERT पेक्षा संदर्भ पुस्तकांवर अधिक अवलंबून आहे'
        },
        neetScore: -3,
        metrics: { accuracy: 50, mindset: 55 }
      }
    ]
  },
  {
    id: 'q32',
    question: {
      en: 'How many previous year NEET questions have you solved?',
      hi: 'आपने कितने पिछले वर्ष के NEET प्रश्न हल किए हैं?',
      mr: 'तुम्ही किती मागील वर्षाचे NEET प्रश्न सोडवले आहेत?'
    },
    type: 'single_choice',
    category: 'extended',
    section: 'Extended Deep Dive',
    options: [
      {
        text: {
          en: 'All PYQs (2016-2024, 8+ years)',
          hi: 'सभी PYQ (2016-2024, 8+ वर्ष)',
          mr: 'सर्व PYQ (2016-2024, 8+ वर्षे)'
        },
        neetScore: 10,
        metrics: { accuracy: 80, stamina: 80 }
      },
      {
        text: {
          en: 'Most PYQs (2020-2024, 4-5 years)',
          hi: 'अधिकांश PYQ (2020-2024, 4-5 वर्ष)',
          mr: 'बहुतेक PYQ (2020-2024, 4-5 वर्षे)'
        },
        neetScore: 5,
        metrics: { accuracy: 70, stamina: 70 }
      },
      {
        text: {
          en: 'Some PYQs (2022-2024, 2-3 years)',
          hi: 'कुछ PYQ (2022-2024, 2-3 वर्ष)',
          mr: 'काही PYQ (2022-2024, 2-3 वर्षे)'
        },
        neetScore: 0,
        metrics: { accuracy: 60, stamina: 60 }
      },
      {
        text: {
          en: 'Very few or none (<2 years)',
          hi: 'बहुत कम या कोई नहीं (<2 वर्ष)',
          mr: 'खूप कमी किंवा काही नाही (<2 वर्षे)'
        },
        neetScore: -10,
        metrics: { accuracy: 50, stamina: 50 }
      }
    ]
  },
  {
    id: 'q33',
    question: {
      en: 'How many full-length mock tests do you take per month?',
      hi: 'आप प्रति माह कितने पूर्ण-लंबाई मॉक टेस्ट देते हैं?',
      mr: 'तुम्ही दर महिन्याला किती पूर्ण-लांबीचे मॉक टेस्ट घेता?'
    },
    type: 'single_choice',
    category: 'extended',
    section: 'Extended Deep Dive',
    options: [
      {
        text: {
          en: '4+ tests (Weekly or more)',
          hi: '4+ टेस्ट (साप्ताहिक या अधिक)',
          mr: '4+ चाचण्या (साप्ताहिक किंवा अधिक)'
        },
        neetScore: 10,
        metrics: { stamina: 85, accuracy: 75 }
      },
      {
        text: {
          en: '2-3 tests (Bi-weekly)',
          hi: '2-3 टेस्ट (द्वि-साप्ताहिक)',
          mr: '2-3 चाचण्या (द्वि-साप्ताहिक)'
        },
        neetScore: 5,
        metrics: { stamina: 70, accuracy: 65 }
      },
      {
        text: {
          en: '1 test per month',
          hi: 'प्रति माह 1 टेस्ट',
          mr: 'दर महिन्याला 1 चाचणी'
        },
        neetScore: 0,
        metrics: { stamina: 60, accuracy: 60 }
      },
      {
        text: {
          en: '<1 test per month (Irregular)',
          hi: 'प्रति माह <1 टेस्ट (अनियमित)',
          mr: 'दर महिन्याला <1 चाचणी (अनियमित)'
        },
        neetScore: -10,
        metrics: { stamina: 45, accuracy: 50 }
      }
    ]
  },
  {
    id: 'q34',
    question: {
      en: 'How has your mock test score changed over the last 3 months?',
      hi: 'पिछले 3 महीनों में आपका मॉक टेस्ट स्कोर कैसे बदला है?',
      mr: 'गेल्या 3 महिन्यांत तुमचा मॉक टेस्ट स्कोर कसा बदलला आहे?'
    },
    type: 'single_choice',
    category: 'extended',
    section: 'Extended Deep Dive',
    options: [
      {
        text: {
          en: 'Improving consistently (+30-50 marks per month)',
          hi: 'लगातार सुधार (+30-50 अंक प्रति माह)',
          mr: 'सतत सुधारणा (+30-50 गुण प्रति महिना)'
        },
        neetScore: 15,
        metrics: { mindset: 85, stamina: 80 },
        careerTags: ['Improving_Trend']
      },
      {
        text: {
          en: 'Improving gradually (+10-30 marks per month)',
          hi: 'धीरे-धीरे सुधार (+10-30 अंक प्रति माह)',
          mr: 'हळूहळू सुधारणा (+10-30 गुण प्रति महिना)'
        },
        neetScore: 8,
        metrics: { mindset: 75, stamina: 70 }
      },
      {
        text: {
          en: 'Fluctuating (Up and down, no clear trend)',
          hi: 'उतार-चढ़ाव (ऊपर और नीचे, कोई स्पष्ट प्रवृत्ति नहीं)',
          mr: 'चढ-उतार (वर आणि खाली, स्पष्ट प्रवृत्ती नाही)'
        },
        neetScore: 0,
        metrics: { mindset: 60, stamina: 60 }
      },
      {
        text: {
          en: 'Stagnant (Same range, no improvement)',
          hi: 'स्थिर (समान सीमा, कोई सुधार नहीं)',
          mr: 'स्थिर (समान श्रेणी, सुधारणा नाही)'
        },
        neetScore: -5,
        metrics: { mindset: 55, stamina: 55 },
        careerTags: ['Stagnant_Trend']
      },
      {
        text: {
          en: 'Declining (Score going down)',
          hi: 'गिरावट (स्कोर नीचे जा रहा है)',
          mr: 'घट (गुण खाली जात आहेत)'
        },
        neetScore: -15,
        metrics: { mindset: 40, stamina: 45 },
        careerTags: ['Declining_Trend']
      }
    ]
  },
  {
    id: 'q35',
    question: {
      en: 'How do you typically revise completed chapters?',
      hi: 'आप आमतौर पर पूर्ण किए गए अध्यायों का संशोधन कैसे करते हैं?',
      mr: 'तुम्ही सामान्यपणे पूर्ण केलेल्या अध्यायांचे पुनरावलोकन कसे करता?'
    },
    type: 'single_choice',
    category: 'extended',
    section: 'Extended Deep Dive',
    options: [
      {
        text: {
          en: 'Regular weekly revision cycle',
          hi: 'नियमित साप्ताहिक संशोधन चक्र',
          mr: 'नियमित साप्ताहिक पुनरावलोकन चक्र'
        },
        neetScore: 8,
        metrics: { accuracy: 75, mindset: 70 }
      },
      {
        text: {
          en: 'Monthly revision of all completed chapters',
          hi: 'सभी पूर्ण किए गए अध्यायों का मासिक संशोधन',
          mr: 'सर्व पूर्ण केलेल्या अध्यायांचे मासिक पुनरावलोकन'
        },
        neetScore: 5,
        metrics: { accuracy: 65, mindset: 65 }
      },
      {
        text: {
          en: 'Only before mock tests',
          hi: 'केवल मॉक टेस्ट से पहले',
          mr: 'फक्त मॉक टेस्ट आधी'
        },
        neetScore: -2,
        metrics: { accuracy: 55, mindset: 60 }
      },
      {
        text: {
          en: 'No systematic revision, just re-read notes occasionally',
          hi: 'कोई व्यवस्थित संशोधन नहीं, बस कभी-कभी नोट्स फिर से पढ़ते हैं',
          mr: 'कोणतेही व्यवस्थित पुनरावलोकन नाही, फक्त कधीकधी नोट्स पुन्हा वाचतात'
        },
        neetScore: -8,
        metrics: { accuracy: 45, mindset: 50 }
      }
    ]
  }
];

// Helper function to get question by ID
export function getNEETQuestionById(id: string): NEETQuestion | undefined {
  return neetQuestions.find(q => q.id === id);
}

// Helper function to get questions by category
export function getNEETQuestionsByCategory(category: string): NEETQuestion[] {
  return neetQuestions.filter(q => q.category === category);
}


