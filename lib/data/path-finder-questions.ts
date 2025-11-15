export type Language = 'en' | 'hi' | 'mr';

export interface PathFinderQuestion {
  id: string;
  question: Record<Language, string>;
  type: 'single_choice' | 'slider' | 'multi_select' | 'text';
  options?: Record<Language, string[]>;
  min?: number;
  max?: number;
  category: string;
  placeholder?: Record<Language, string>;
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
  },
  // NEW ENHANCED QUESTIONS - Current State Analysis
  {
    id: 'q13',
    question: {
      en: 'What makes you feel most alive? (Select all that apply)',
      hi: 'क्या आपको सबसे ज्यादा जीवंत महसूस कराता है? (सभी लागू विकल्प चुनें)',
      mr: 'तुम्हाला सर्वात जास्त जिवंत कसे वाटते? (सर्व लागू पर्याय निवडा)'
    },
    type: 'multi_select',
    options: {
      en: [
        'Solving complex problems',
        'Creating something new',
        'Helping others succeed',
        'Leading and organizing',
        'Learning new things',
        'Competing and winning',
        'Exploring and discovering',
        'Building and constructing'
      ],
      hi: [
        'जटिल समस्याएं हल करना',
        'कुछ नया बनाना',
        'दूसरों को सफल होने में मदद करना',
        'नेतृत्व और संगठन',
        'नई चीजें सीखना',
        'प्रतिस्पर्धा करना और जीतना',
        'अन्वेषण और खोज',
        'निर्माण और निर्माण'
      ],
      mr: [
        'जटिल समस्या सोडवणे',
        'काहीतरी नवीन तयार करणे',
        'इतरांना यशस्वी होण्यात मदत करणे',
        'नेतृत्व आणि संघटना',
        'नवीन गोष्टी शिकणे',
        'स्पर्धा करणे आणि जिंकणे',
        'अन्वेषण आणि शोध',
        'बांधकाम आणि निर्माण'
      ]
    },
    category: 'passions'
  },
  {
    id: 'q14',
    question: {
      en: 'What do your friends/family say you are naturally good at?',
      hi: 'आपके दोस्त/परिवार कहते हैं कि आप स्वाभाविक रूप से किसमें अच्छे हैं?',
      mr: 'तुमचे मित्र/कुटुंब म्हणतात की तुम्ही नैसर्गिकरित्या कोणत्या गोष्टीत चांगले आहात?'
    },
    type: 'multi_select',
    options: {
      en: [
        'Math and logic',
        'Art and creativity',
        'Communication and talking',
        'Organizing and planning',
        'Problem-solving',
        'Teaching and explaining',
        'Building and fixing things',
        'Research and analysis'
      ],
      hi: [
        'गणित और तर्क',
        'कला और रचनात्मकता',
        'संचार और बात करना',
        'संगठन और योजना',
        'समस्या समाधान',
        'शिक्षण और व्याख्या',
        'निर्माण और मरम्मत',
        'अनुसंधान और विश्लेषण'
      ],
      mr: [
        'गणित आणि तर्क',
        'कला आणि सर्जनशीलता',
        'संवाद आणि बोलणे',
        'संघटना आणि नियोजन',
        'समस्या सोडवणे',
        'शिक्षण आणि स्पष्टीकरण',
        'बांधकाम आणि दुरुस्ती',
        'संशोधन आणि विश्लेषण'
      ]
    },
    category: 'natural_abilities'
  },
  {
    id: 'q15',
    question: {
      en: 'What activities do you lose track of time doing?',
      hi: 'कौन सी गतिविधियाँ करते समय आप समय का हिसाब भूल जाते हैं?',
      mr: 'कोणत्या क्रियाकलाप करताना तुम्ही वेळेचा हिशोब विसरता?'
    },
    type: 'multi_select',
    options: {
      en: [
        'Reading books/articles',
        'Coding/programming',
        'Drawing/designing',
        'Building projects',
        'Watching educational videos',
        'Debating/discussing ideas',
        'Solving puzzles/games',
        'Researching topics online'
      ],
      hi: [
        'किताबें/लेख पढ़ना',
        'कोडिंग/प्रोग्रामिंग',
        'ड्राइंग/डिज़ाइनिंग',
        'प्रोजेक्ट बनाना',
        'शैक्षणिक वीडियो देखना',
        'विचारों पर बहस/चर्चा',
        'पहेलियाँ/खेल हल करना',
        'ऑनलाइन विषयों पर शोध'
      ],
      mr: [
        'पुस्तके/लेख वाचणे',
        'कोडिंग/प्रोग्रामिंग',
        'रेखांकन/डिझाइनिंग',
        'प्रकल्प बनवणे',
        'शैक्षणिक व्हिडिओ पाहणे',
        'विचारांवर वादविवाद/चर्चा',
        'कोडे/खेळ सोडवणे',
        'ऑनलाइन विषयांवर संशोधन'
      ]
    },
    category: 'flow_activities'
  },
  {
    id: 'q16',
    question: {
      en: 'What problems in the world bother you most?',
      hi: 'दुनिया की कौन सी समस्याएं आपको सबसे ज्यादा परेशान करती हैं?',
      mr: 'जगातील कोणत्या समस्या तुम्हाला सर्वात जास्त त्रास देतात?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Poverty and inequality',
        'Environmental issues',
        'Healthcare access',
        'Education gaps',
        'Technology and innovation needs',
        'Social justice issues',
        'Economic problems',
        'Scientific challenges'
      ],
      hi: [
        'गरीबी और असमानता',
        'पर्यावरणीय मुद्दे',
        'स्वास्थ्य सेवा पहुंच',
        'शिक्षा अंतराल',
        'प्रौद्योगिकी और नवाचार की आवश्यकता',
        'सामाजिक न्याय के मुद्दे',
        'आर्थिक समस्याएं',
        'वैज्ञानिक चुनौतियां'
      ],
      mr: [
        'गरिबी आणि असमानता',
        'पर्यावरणीय समस्या',
        'आरोग्य सेवा प्रवेश',
        'शिक्षण अंतर',
        'तंत्रज्ञान आणि नवकल्पना गरजा',
        'सामाजिक न्याय समस्या',
        'आर्थिक समस्या',
        'वैज्ञानिक आव्हाने'
      ]
    },
    category: 'values'
  },
  // Career Vision & Aspirations
  {
    id: 'q17',
    question: {
      en: 'Where do you see yourself in 10 years? (Describe briefly)',
      hi: '10 साल में आप खुद को कहाँ देखते हैं? (संक्षेप में वर्णन करें)',
      mr: '10 वर्षांत तुम्ही स्वतःला कोठे पाहता? (थोडक्यात वर्णन करा)'
    },
    type: 'text',
    placeholder: {
      en: 'e.g., Working as a software engineer at a tech company, or running my own design studio...',
      hi: 'उदा., एक टेक कंपनी में सॉफ्टवेयर इंजीनियर के रूप में काम करना, या अपना डिज़ाइन स्टूडियो चलाना...',
      mr: 'उदा., तंत्रज्ञान कंपनीत सॉफ्टवेअर अभियंता म्हणून काम करणे, किंवा माझे स्वतःचे डिझाइन स्टुडिओ चालवणे...'
    },
    category: 'career_vision'
  },
  {
    id: 'q18',
    question: {
      en: 'What lifestyle do you want?',
      hi: 'आप किस जीवनशैली को चाहते हैं?',
      mr: 'तुम्हाला कोणती जीवनशैली हवी आहे?'
    },
    type: 'single_choice',
    options: {
      en: [
        'High income, high stress (corporate/tech)',
        'Balanced work-life (moderate income)',
        'Creative freedom (variable income)',
        'Social impact (moderate income, high satisfaction)',
        'Entrepreneurship (risky but rewarding)',
        'Research/Academic (steady, intellectual)'
      ],
      hi: [
        'उच्च आय, उच्च तनाव (कॉर्पोरेट/टेक)',
        'संतुलित कार्य-जीवन (मध्यम आय)',
        'रचनात्मक स्वतंत्रता (परिवर्तनशील आय)',
        'सामाजिक प्रभाव (मध्यम आय, उच्च संतुष्टि)',
        'उद्यमिता (जोखिमपूर्ण लेकिन फायदेमंद)',
        'अनुसंधान/शैक्षणिक (स्थिर, बौद्धिक)'
      ],
      mr: [
        'उच्च उत्पन्न, उच्च तणाव (कॉर्पोरेट/तंत्रज्ञान)',
        'संतुलित काम-जीवन (मध्यम उत्पन्न)',
        'सर्जनशील स्वातंत्र्य (परिवर्तनशील उत्पन्न)',
        'सामाजिक प्रभाव (मध्यम उत्पन्न, उच्च समाधान)',
        'उद्योजकता (धोकादायक पण फायदेशीर)',
        'संशोधन/शैक्षणिक (स्थिर, बौद्धिक)'
      ]
    },
    category: 'lifestyle'
  },
  {
    id: 'q19',
    question: {
      en: 'What extracurricular activities interest you?',
      hi: 'कौन सी पाठ्येतर गतिविधियाँ आपको रुचिकर लगती हैं?',
      mr: 'कोणत्या पाठ्येतर क्रियाकलाप तुम्हाला रुचिकर वाटतात?'
    },
    type: 'multi_select',
    options: {
      en: [
        'Sports and athletics',
        'Music and arts',
        'Debate and public speaking',
        'Science clubs/olympiads',
        'Coding and tech clubs',
        'Social service/NGO work',
        'Entrepreneurship clubs',
        'Writing and journalism'
      ],
      hi: [
        'खेल और एथलेटिक्स',
        'संगीत और कला',
        'बहस और सार्वजनिक बोलना',
        'विज्ञान क्लब/ओलंपियाड',
        'कोडिंग और टेक क्लब',
        'सामाजिक सेवा/एनजीओ कार्य',
        'उद्यमिता क्लब',
        'लेखन और पत्रकारिता'
      ],
      mr: [
        'खेळ आणि अॅथलेटिक्स',
        'संगीत आणि कला',
        'वादविवाद आणि सार्वजनिक बोलणे',
        'विज्ञान क्लब/ओलिंपियाड',
        'कोडिंग आणि तंत्रज्ञान क्लब',
        'सामाजिक सेवा/एनजीओ कार्य',
        'उद्योजकता क्लब',
        'लेखन आणि पत्रकारिता'
      ]
    },
    category: 'extracurriculars'
  },
  {
    id: 'q20',
    question: {
      en: 'Rate your interest in entrepreneurship (starting your own business)',
      hi: 'उद्यमिता (अपना व्यवसाय शुरू करना) में अपनी रुचि दर्ज करें',
      mr: 'उद्योजकतेमध्ये तुमची रुची दर्ज करा (स्वतःचा व्यवसाय सुरू करणे)'
    },
    type: 'slider',
    min: 0,
    max: 10,
    category: 'entrepreneurship'
  },
  {
    id: 'q21',
    question: {
      en: 'How important is work-life balance to you?',
      hi: 'आपके लिए कार्य-जीवन संतुलन कितना महत्वपूर्ण है?',
      mr: 'तुमच्यासाठी काम-जीवन संतुलन किती महत्त्वाचे आहे?'
    },
    type: 'slider',
    min: 0,
    max: 10,
    category: 'work_life_balance'
  },
  // Practical Considerations
  {
    id: 'q22',
    question: {
      en: 'Where would you prefer to study/work?',
      hi: 'आप कहाँ अध्ययन/काम करना पसंद करेंगे?',
      mr: 'तुम्ही कोठे अभ्यास/काम करायला पसंद कराल?'
    },
    type: 'multi_select',
    options: {
      en: [
        'Metro cities (Mumbai, Delhi, Bangalore)',
        'Tier-2 cities (Pune, Hyderabad, Chennai)',
        'Smaller cities',
        'Abroad (US, UK, etc.)',
        'Anywhere with good opportunities',
        'Stay close to home'
      ],
      hi: [
        'मेट्रो शहर (मुंबई, दिल्ली, बैंगलोर)',
        'टियर-2 शहर (पुणे, हैदराबाद, चेन्नई)',
        'छोटे शहर',
        'विदेश (अमेरिका, यूके, आदि)',
        'अच्छे अवसरों वाला कोई भी स्थान',
        'घर के पास रहें'
      ],
      mr: [
        'मेट्रो शहरे (मुंबई, दिल्ली, बंगळूर)',
        'टियर-2 शहरे (पुणे, हैदराबाद, चेन्नई)',
        'लहान शहरे',
        'परदेश (अमेरिका, यूके, इ.)',
        'चांगल्या संधींसह कोणतेही ठिकाण',
        'घराजवळ राहा'
      ]
    },
    category: 'geographic_preference'
  },
  {
    id: 'q23',
    question: {
      en: 'How do family expectations align with your interests?',
      hi: 'पारिवारिक अपेक्षाएं आपकी रुचियों के साथ कैसे मेल खाती हैं?',
      mr: 'कुटुंबाच्या अपेक्षा तुमच्या आवडींशी कशा जुळतात?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Fully aligned - family supports my choices',
        'Mostly aligned - some discussions needed',
        'Partially aligned - need to convince family',
        'Not aligned - significant pressure',
        'Family has no specific expectations'
      ],
      hi: [
        'पूर्ण रूप से संरेखित - परिवार मेरे विकल्पों का समर्थन करता है',
        'ज्यादातर संरेखित - कुछ चर्चाओं की आवश्यकता',
        'आंशिक रूप से संरेखित - परिवार को मनाने की आवश्यकता',
        'संरेखित नहीं - महत्वपूर्ण दबाव',
        'परिवार की कोई विशिष्ट अपेक्षाएं नहीं'
      ],
      mr: [
        'पूर्णपणे संरेखित - कुटुंब माझ्या निवडींचा समर्थन करते',
        'बहुतेक संरेखित - काही चर्चांची गरज',
        'आंशिकपणे संरेखित - कुटुंबाला पटवण्याची गरज',
        'संरेखित नाही - महत्त्वपूर्ण दबाव',
        'कुटुंबाची कोणतीही विशिष्ट अपेक्षा नाही'
      ]
    },
    category: 'family_expectations'
  },
  {
    id: 'q24',
    question: {
      en: 'How do you prefer to learn new skills?',
      hi: 'आप नए कौशल कैसे सीखना पसंद करते हैं?',
      mr: 'तुम्ही नवीन कौशल्ये कसे शिकायला पसंद करता?'
    },
    type: 'multi_select',
    options: {
      en: [
        'Online courses and tutorials',
        'Hands-on projects',
        'Mentorship and guidance',
        'Formal education/degree',
        'Self-learning through books',
        'Workshops and bootcamps',
        'Learning by doing real work'
      ],
      hi: [
        'ऑनलाइन पाठ्यक्रम और ट्यूटोरियल',
        'हाथों से प्रोजेक्ट',
        'सलाह और मार्गदर्शन',
        'औपचारिक शिक्षा/डिग्री',
        'किताबों के माध्यम से स्व-शिक्षा',
        'कार्यशालाएं और बूटकैंप',
        'वास्तविक काम करके सीखना'
      ],
      mr: [
        'ऑनलाइन अभ्यासक्रम आणि ट्यूटोरियल',
        'हाताने प्रकल्प',
        'मार्गदर्शन आणि मार्गदर्शन',
        'औपचारिक शिक्षा/पदवी',
        'पुस्तकांद्वारे स्व-शिक्षण',
        'कार्यशाळा आणि बूटकॅम्प',
        'वास्तविक काम करून शिकणे'
      ]
    },
    category: 'skill_learning'
  },
  {
    id: 'q25',
    question: {
      en: 'What type of problems do you enjoy solving most?',
      hi: 'आप किस प्रकार की समस्याओं को हल करना सबसे ज्यादा पसंद करते हैं?',
      mr: 'तुम्हाला कोणत्या प्रकारच्या समस्या सोडवायला सर्वात जास्त आवडतात?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Mathematical/logical problems',
        'Creative/design challenges',
        'Social/human problems',
        'Technical/hands-on problems',
        'Business/strategic problems',
        'Research/scientific problems'
      ],
      hi: [
        'गणितीय/तार्किक समस्याएं',
        'रचनात्मक/डिज़ाइन चुनौतियां',
        'सामाजिक/मानवी समस्याएं',
        'तकनीकी/हाथों से समस्याएं',
        'व्यापार/रणनीतिक समस्याएं',
        'अनुसंधान/वैज्ञानिक समस्याएं'
      ],
      mr: [
        'गणितीय/तार्किक समस्या',
        'सर्जनशील/डिझाइन आव्हाने',
        'सामाजिक/मानवी समस्या',
        'तांत्रिक/हाताने समस्या',
        'व्यवसाय/रणनीतिक समस्या',
        'संशोधन/वैज्ञानिक समस्या'
      ]
    },
    category: 'problem_type'
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
  },
  // New question mappings
  q13: {
    'Solving complex problems': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Creating something new': [{ trait: 'creative', score: 2 }],
    'Helping others succeed': [{ trait: 'people', score: 2 }],
    'Leading and organizing': [{ trait: 'leader', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Learning new things': [{ trait: 'logical', score: 1 }, { trait: 'creative', score: 1 }],
    'Competing and winning': [{ trait: 'disciplined', score: 1 }, { trait: 'leader', score: 1 }],
    'Exploring and discovering': [{ trait: 'creative', score: 1 }, { trait: 'logical', score: 1 }],
    'Building and constructing': [{ trait: 'handsOn', score: 2 }, { trait: 'logical', score: 1 }]
  },
  q14: {
    'Math and logic': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Art and creativity': [{ trait: 'creative', score: 2 }],
    'Communication and talking': [{ trait: 'people', score: 2 }, { trait: 'leader', score: 1 }],
    'Organizing and planning': [{ trait: 'leader', score: 1 }, { trait: 'disciplined', score: 2 }],
    'Problem-solving': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Teaching and explaining': [{ trait: 'people', score: 2 }, { trait: 'leader', score: 1 }],
    'Building and fixing things': [{ trait: 'handsOn', score: 2 }, { trait: 'logical', score: 1 }],
    'Research and analysis': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }]
  },
  q15: {
    'Reading books/articles': [{ trait: 'logical', score: 1 }, { trait: 'disciplined', score: 1 }],
    'Coding/programming': [{ trait: 'logical', score: 2 }, { trait: 'handsOn', score: 1 }],
    'Drawing/designing': [{ trait: 'creative', score: 2 }],
    'Building projects': [{ trait: 'handsOn', score: 2 }, { trait: 'logical', score: 1 }],
    'Watching educational videos': [{ trait: 'logical', score: 1 }, { trait: 'disciplined', score: 1 }],
    'Debating/discussing ideas': [{ trait: 'people', score: 1 }, { trait: 'leader', score: 1 }],
    'Solving puzzles/games': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Researching topics online': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }]
  },
  q16: {
    'Poverty and inequality': [{ trait: 'people', score: 2 }],
    'Environmental issues': [{ trait: 'logical', score: 1 }, { trait: 'people', score: 1 }],
    'Healthcare access': [{ trait: 'people', score: 2 }, { trait: 'logical', score: 1 }],
    'Education gaps': [{ trait: 'people', score: 2 }, { trait: 'leader', score: 1 }],
    'Technology and innovation needs': [{ trait: 'logical', score: 2 }, { trait: 'creative', score: 1 }],
    'Social justice issues': [{ trait: 'people', score: 2 }, { trait: 'leader', score: 1 }],
    'Economic problems': [{ trait: 'logical', score: 2 }, { trait: 'leader', score: 1 }],
    'Scientific challenges': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }]
  },
  q18: {
    'High income, high stress (corporate/tech)': [{ trait: 'disciplined', score: 2 }, { trait: 'logical', score: 1 }],
    'Balanced work-life (moderate income)': [{ trait: 'people', score: 1 }, { trait: 'disciplined', score: 1 }],
    'Creative freedom (variable income)': [{ trait: 'creative', score: 2 }],
    'Social impact (moderate income, high satisfaction)': [{ trait: 'people', score: 2 }, { trait: 'leader', score: 1 }],
    'Entrepreneurship (risky but rewarding)': [{ trait: 'leader', score: 2 }, { trait: 'creative', score: 1 }],
    'Research/Academic (steady, intellectual)': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }]
  },
  q19: {
    'Sports and athletics': [{ trait: 'handsOn', score: 1 }, { trait: 'disciplined', score: 1 }],
    'Music and arts': [{ trait: 'creative', score: 2 }],
    'Debate and public speaking': [{ trait: 'people', score: 1 }, { trait: 'leader', score: 2 }],
    'Science clubs/olympiads': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Coding and tech clubs': [{ trait: 'logical', score: 2 }, { trait: 'handsOn', score: 1 }],
    'Social service/NGO work': [{ trait: 'people', score: 2 }],
    'Entrepreneurship clubs': [{ trait: 'leader', score: 2 }, { trait: 'creative', score: 1 }],
    'Writing and journalism': [{ trait: 'creative', score: 2 }, { trait: 'people', score: 1 }]
  },
  q22: {
    'Metro cities (Mumbai, Delhi, Bangalore)': [{ trait: 'leader', score: 1 }],
    'Tier-2 cities (Pune, Hyderabad, Chennai)': [],
    'Smaller cities': [{ trait: 'people', score: 1 }],
    'Abroad (US, UK, etc.)': [{ trait: 'disciplined', score: 1 }, { trait: 'leader', score: 1 }],
    'Anywhere with good opportunities': [{ trait: 'leader', score: 1 }],
    'Stay close to home': [{ trait: 'people', score: 1 }]
  },
  q23: {
    'Fully aligned - family supports my choices': [{ trait: 'leader', score: 1 }],
    'Mostly aligned - some discussions needed': [],
    'Partially aligned - need to convince family': [{ trait: 'leader', score: 1 }],
    'Not aligned - significant pressure': [],
    'Family has no specific expectations': []
  },
  q24: {
    'Online courses and tutorials': [{ trait: 'logical', score: 1 }, { trait: 'disciplined', score: 1 }],
    'Hands-on projects': [{ trait: 'handsOn', score: 2 }],
    'Mentorship and guidance': [{ trait: 'people', score: 1 }],
    'Formal education/degree': [{ trait: 'disciplined', score: 1 }],
    'Self-learning through books': [{ trait: 'logical', score: 1 }, { trait: 'disciplined', score: 1 }],
    'Workshops and bootcamps': [{ trait: 'handsOn', score: 1 }, { trait: 'people', score: 1 }],
    'Learning by doing real work': [{ trait: 'handsOn', score: 2 }, { trait: 'logical', score: 1 }]
  },
  q25: {
    'Mathematical/logical problems': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Creative/design challenges': [{ trait: 'creative', score: 2 }],
    'Social/human problems': [{ trait: 'people', score: 2 }],
    'Technical/hands-on problems': [{ trait: 'handsOn', score: 2 }, { trait: 'logical', score: 1 }],
    'Business/strategic problems': [{ trait: 'leader', score: 2 }, { trait: 'logical', score: 1 }],
    'Research/scientific problems': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }]
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

