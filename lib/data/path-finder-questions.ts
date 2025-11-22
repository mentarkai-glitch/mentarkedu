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
  // Phase 1: Natural Vibe (Q1-Q5)
  {
    id: 'q1',
    question: {
      en: 'Open your YouTube or Instagram feed. What is the majority of the content about?',
      hi: 'अपना YouTube या Instagram feed खोलें। अधिकांश सामग्री किस बारे में है?',
      mr: 'तुमचा YouTube किंवा Instagram feed उघडा. बहुतेक सामग्री कशाबद्दल आहे?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Tech reviews, coding, or "How things work" videos',
        'Finance, stock market, "Day in the life of a CEO", or business news',
        'Art, dance, music, fashion, or movie analysis',
        'Psychology facts, history documentaries, or social issues',
        'Gaming, memes, or random entertainment',
        'I don\'t use social media'
      ],
      hi: [
        'टेक समीक्षा, कोडिंग, या "चीजें कैसे काम करती हैं" वीडियो',
        'वित्त, शेयर बाजार, "CEO का दिन", या व्यापार समाचार',
        'कला, नृत्य, संगीत, फैशन, या फिल्म विश्लेषण',
        'मनोविज्ञान तथ्य, इतिहास वृत्तचित्र, या सामाजिक मुद्दे',
        'गेमिंग, मीम, या यादृच्छिक मनोरंजन',
        'मैं सोशल मीडिया का उपयोग नहीं करता'
      ],
      mr: [
        'टेक समीक्षा, कोडिंग, किंवा "गोष्टी कशा काम करतात" व्हिडिओ',
        'वित्त, शेयर बाजार, "CEO चा दिवस", किंवा व्यवसाय बातम्या',
        'कला, नृत्य, संगीत, फॅशन, किंवा चित्रपट विश्लेषण',
        'मानसशास्त्र तथ्ये, इतिहास वृत्तचित्रे, किंवा सामाजिक समस्या',
        'गेमिंग, मीम, किंवा यादृच्छिक मनोरंजन',
        'मी सोशल मीडिया वापरत नाही'
      ]
    },
    category: 'vibe'
  },
  {
    id: 'q2',
    question: {
      en: 'Your school is organizing a massive cultural fest. Which role do you instinctively volunteer for?',
      hi: 'आपका स्कूल एक बड़ा सांस्कृतिक उत्सव आयोजित कर रहा है। आप स्वाभाविक रूप से किस भूमिका के लिए स्वेच्छा से काम करते हैं?',
      mr: 'तुमच्या शाळेत एक मोठा सांस्कृतिक उत्सव आयोजित केला जात आहे. तुम्ही सहजपणे कोणत्या भूमिकेसाठी स्वयंसेवक बनता?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Managing the budget, ticket sales, and sponsorship deals',
        'Designing the posters, stage backdrop, and social media posts',
        'Setting up the sound system, lighting, and electrical wiring',
        'Hosting the event (Emcee) or managing the guest list'
      ],
      hi: [
        'बजट, टिकट बिक्री, और प्रायोजन सौदों का प्रबंधन',
        'पोस्टर, मंच पृष्ठभूमि, और सोशल मीडिया पोस्ट डिजाइन करना',
        'साउंड सिस्टम, लाइटिंग, और विद्युत वायरिंग सेट करना',
        'इवेंट होस्ट करना (एमसी) या अतिथि सूची प्रबंधन'
      ],
      mr: [
        'अंदाजपत्रक, तिकीट विक्री, आणि प्रायोजन करारांचे व्यवस्थापन',
        'पोस्टर, मंच पार्श्वभूमी, आणि सोशल मीडिया पोस्ट डिझाइन करणे',
        'साउंड सिस्टम, लाइटिंग, आणि विद्युत वायरिंग सेट करणे',
        'कार्यक्रम होस्ट करणे (एमसी) किंवा अतिथी सूची व्यवस्थापन'
      ]
    },
    category: 'vibe'
  },
  {
    id: 'q3',
    question: {
      en: 'Your phone screen just went black. What is your immediate reaction?',
      hi: 'आपकी फोन स्क्रीन अभी काली हो गई। आपकी तत्काल प्रतिक्रिया क्या है?',
      mr: 'तुमचा फोन स्क्रीन नुकताच काळा झाला. तुमची त्वरित प्रतिक्रिया काय आहे?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Google the model number + "black screen fix" and try to reboot/repair it myself',
        'Calculate how much money I need to save to buy a new one',
        'Call a friend or parent immediately to panic/ask for help',
        'Wonder if this is a sign from the universe to do a digital detox'
      ],
      hi: [
        'मॉडल नंबर + "ब्लैक स्क्रीन फिक्स" गूगल करें और इसे खुद रीबूट/मरम्मत करने की कोशिश करें',
        'गणना करें कि नया खरीदने के लिए मुझे कितना पैसा बचाना होगा',
        'तुरंत दोस्त या माता-पिता को घबराहट/मदद के लिए कॉल करें',
        'सोचें कि क्या यह ब्रह्मांड से एक संकेत है कि डिजिटल डिटॉक्स करें'
      ],
      mr: [
        'मॉडेल नंबर + "ब्लॅक स्क्रीन फिक्स" गूगल करा आणि ते स्वतः रीबूट/दुरुस्त करण्याचा प्रयत्न करा',
        'नवीन खरेदी करण्यासाठी मला किती पैसे जमा करावे लागतील याची गणना करा',
        'त्वरित मित्र किंवा पालकांना घाबरून/मदतीसाठी कॉल करा',
        'विचार करा की हे ब्रह्मांडाकडून डिजिटल डिटॉक्स करण्याचे चिन्ह आहे का'
      ]
    },
    category: 'vibe'
  },
  {
    id: 'q4',
    question: {
      en: 'In a group project, what do you usually end up doing?',
      hi: 'एक समूह परियोजना में, आप आमतौर पर क्या करते हैं?',
      mr: 'गट प्रकल्पात, तुम्ही सामान्यत: काय करता?'
    },
    type: 'single_choice',
    options: {
      en: [
        'I do the research and write the factual content',
        'I make the PowerPoint look beautiful and present it',
        'I organize the team, set deadlines, and make sure everyone works',
        'I analyze the data and make the charts/graphs'
      ],
      hi: [
        'मैं शोध करता हूं और तथ्यात्मक सामग्री लिखता हूं',
        'मैं PowerPoint को सुंदर बनाता हूं और इसे प्रस्तुत करता हूं',
        'मैं टीम को व्यवस्थित करता हूं, समय सीमा निर्धारित करता हूं, और सुनिश्चित करता हूं कि सभी काम करें',
        'मैं डेटा का विश्लेषण करता हूं और चार्ट/ग्राफ बनाता हूं'
      ],
      mr: [
        'मी संशोधन करतो आणि तथ्यात्मक सामग्री लिहितो',
        'मी PowerPoint सुंदर बनवतो आणि ते सादर करतो',
        'मी संघाचे व्यवस्थापन करतो, कालमर्यादा सेट करतो, आणि सर्वांना काम करत असल्याची खात्री करतो',
        'मी डेटाचे विश्लेषण करतो आणि चार्ट/आलेख बनवतो'
      ]
    },
    category: 'vibe'
  },
  {
    id: 'q5',
    question: {
      en: 'When you are studying or working, which activity makes time fly the fastest? (You don\'t check the clock)',
      hi: 'जब आप पढ़ रहे होते हैं या काम कर रहे होते हैं, तो कौन सी गतिविधि समय को सबसे तेज़ी से उड़ाती है? (आप घड़ी नहीं देखते)',
      mr: 'जेव्हा तुम अभ्यास करत असता किंवा काम करत असता, तेव्हा कोणती क्रियाकलाप वेळ सर्वात वेगाने उडवते? (तुम्ही घड्याळ बघत नाही)'
    },
    type: 'single_choice',
    options: {
      en: [
        'Solving Math problems or coding',
        'Reading stories, history, or social studies',
        'Drawing, editing videos, or creating music',
        'Understanding biological diagrams or chemical reactions'
      ],
      hi: [
        'गणित की समस्याएं हल करना या कोडिंग',
        'कहानियां, इतिहास, या सामाजिक अध्ययन पढ़ना',
        'ड्राइंग, वीडियो संपादन, या संगीत बनाना',
        'जैविक आरेख या रासायनिक प्रतिक्रियाओं को समझना'
      ],
      mr: [
        'गणित समस्या सोडवणे किंवा कोडिंग',
        'कथा, इतिहास, किंवा सामाजिक अभ्यास वाचणे',
        'रेखांकन, व्हिडिओ संपादन, किंवा संगीत तयार करणे',
        'जैविक आकृत्या किंवा रासायनिक प्रतिक्रिया समजून घेणे'
      ]
    },
    category: 'vibe'
  },
  {
    id: 'q6',
    question: {
      en: 'Which of these careers sounds like a NIGHTMARE to you? (Select up to 3)',
      hi: 'इनमें से कौन सा करियर आपको एक बुरे सपने जैसा लगता है? (अधिकतम 3 चुनें)',
      mr: 'यापैकी कोणते करिअर तुम्हाला एक वाईट स्वप्नासारखे वाटते? (जास्तीत जास्त 3 निवडा)'
    },
    type: 'multi_select',
    options: {
      en: [
        'Sitting in front of a computer coding for 8 hours',
        'Dealing with blood, needles, or sick people',
        'Staring at spreadsheets and calculating taxes',
        'Writing long essays or reading ancient literature',
        'Public speaking or selling things to strangers'
      ],
      hi: [
        '8 घंटे तक कंप्यूटर के सामने बैठकर कोडिंग करना',
        'खून, सुई, या बीमार लोगों से निपटना',
        'स्प्रेडशीट को घूरना और करों की गणना करना',
        'लंबे निबंध लिखना या प्राचीन साहित्य पढ़ना',
        'सार्वजनिक बोलना या अजनबियों को चीजें बेचना'
      ],
      mr: [
        '8 तास कंप्यूटरसमोर बसून कोडिंग करणे',
        'रक्त, सुई, किंवा आजारी लोकांशी व्यवहार करणे',
        'स्प्रेडशीट बघत बसणे आणि करांची गणना करणे',
        'लांब निबंध लिहिणे किंवा प्राचीन साहित्य वाचणे',
        'सार्वजनिक बोलणे किंवा अपरिचितांना गोष्टी विकणे'
      ]
    },
    category: 'dealbreakers'
  },
  {
    id: 'q7',
    question: {
      en: 'Where do you see yourself working in 5 years?',
      hi: '5 साल में आप खुद को कहाँ काम करते हुए देखते हैं?',
      mr: '5 वर्षांत तुम्ही स्वतःला कोठे काम करताना पाहता?'
    },
    type: 'single_choice',
    options: {
      en: [
        'In a corporate office with a nice view and a suit',
        'In a creative studio, messy but colorful',
        'In a lab or a hospital, doing intense work',
        'Traveling, meeting people, or working outdoors',
        'From my bedroom, working remotely on my own terms'
      ],
      hi: [
        'एक कॉर्पोरेट कार्यालय में एक अच्छे दृश्य और सूट के साथ',
        'एक रचनात्मक स्टूडियो में, गन्दा लेकिन रंगीन',
        'एक प्रयोगशाला या अस्पताल में, तीव्र काम करते हुए',
        'यात्रा करना, लोगों से मिलना, या बाहर काम करना',
        'मेरे बेडरूम से, अपनी शर्तों पर दूरस्थ रूप से काम करना'
      ],
      mr: [
        'एक कॉर्पोरेट कार्यालयात छान दृश्य आणि सूटसह',
        'एक सर्जनशील स्टुडिओत, गोंधळलेले पण रंगीत',
        'एक प्रयोगशाला किंवा रुग्णालयात, तीव्र काम करताना',
        'प्रवास करणे, लोकांना भेटणे, किंवा बाहेर काम करणे',
        'माझ्या बेडरूममधून, माझ्या स्वतःच्या अटींवर दूरस्थपणे काम करणे'
      ]
    },
    category: 'dealbreakers'
  },
  {
    id: 'q8',
    question: {
      en: 'Be honest: How do you handle a math problem you can\'t solve?',
      hi: 'ईमानदार रहें: आप एक गणित की समस्या को कैसे संभालते हैं जिसे आप हल नहीं कर सकते?',
      mr: 'प्रामाणिक राहा: तुम्ही एक गणित समस्या कशी हाताळता जी तुम्ही सोडवू शकत नाही?'
    },
    type: 'single_choice',
    options: {
      en: [
        'I love the challenge. I fight it until I get the answer',
        'I can do it if I have the formula, but I don\'t love it',
        'I hate it. It gives me anxiety'
      ],
      hi: [
        'मुझे चुनौती पसंद है। मैं तब तक लड़ता हूं जब तक मुझे जवाब नहीं मिल जाता',
        'अगर मेरे पास सूत्र है तो मैं कर सकता हूं, लेकिन मुझे यह पसंद नहीं है',
        'मुझे इससे नफरत है। यह मुझे चिंता देता है'
      ],
      mr: [
        'मला आव्हान आवडते. मी उत्तर मिळेपर्यंत लढतो',
        'सूत्र असल्यास मी करू शकतो, पण मला ते आवडत नाही',
        'मला ते आवडत नाही. ते मला चिंता देते'
      ]
    },
    category: 'aptitude'
  },
  {
    id: 'q9',
    question: {
      en: 'How do you study best for an exam?',
      hi: 'आप परीक्षा के लिए सबसे अच्छा कैसे अध्ययन करते हैं?',
      mr: 'तुम परीक्षेसाठी सर्वोत्तम कसे अभ्यास करता?'
    },
    type: 'single_choice',
    options: {
      en: [
        'I memorize facts, dates, and diagrams easily',
        'I need to understand the "Why" and "How". Memorizing is hard',
        'I make stories or acronyms to remember things'
      ],
      hi: [
        'मैं तथ्यों, तारीखों और आरेखों को आसानी से याद कर लेता हूं',
        'मुझे "क्यों" और "कैसे" को समझने की जरूरत है। याद करना मुश्किल है',
        'मैं चीजों को याद रखने के लिए कहानियां या संक्षिप्त नाम बनाता हूं'
      ],
      mr: [
        'मी तथ्ये, तारखा आणि आकृत्या सहजपणे लक्षात ठेवतो',
        'मला "का" आणि "कसे" समजून घेण्याची गरज आहे. लक्षात ठेवणे कठीण आहे',
        'मी गोष्टी लक्षात ठेवण्यासाठी कथा किंवा संक्षिप्त नावे बनवतो'
      ]
    },
    category: 'aptitude'
  },
  {
    id: 'q10',
    question: {
      en: 'If you had to read a 20-page report on Climate Change, what would you do?',
      hi: 'अगर आपको जलवायु परिवर्तन पर 20-पेज की रिपोर्ट पढ़नी होती, तो आप क्या करते?',
      mr: 'जर तुम्हाला जलवायु बदलावर 20-पृष्ठाची अहवाल वाचावी लागली, तर तुम्ही काय कराल?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Read every word and highlight key points',
        'Skim the headlines and look at the graphs',
        'Use ChatGPT to summarize it for me',
        'I wouldn\'t read it; I\'d watch a video about it'
      ],
      hi: [
        'हर शब्द पढ़ें और मुख्य बिंदुओं को हाइलाइट करें',
        'शीर्षकों को स्किम करें और ग्राफ़ देखें',
        'इसे सारांशित करने के लिए ChatGPT का उपयोग करें',
        'मैं इसे नहीं पढ़ूंगा; मैं इसके बारे में एक वीडियो देखूंगा'
      ],
      mr: [
        'प्रत्येक शब्द वाचा आणि मुख्य मुद्दे हायलाइट करा',
        'शीर्षके स्किम करा आणि आलेख बघा',
        'माझ्यासाठी सारांशित करण्यासाठी ChatGPT वापरा',
        'मी ते वाचणार नाही; मी त्याबद्दल एक व्हिडिओ पाहीन'
      ]
    },
    category: 'aptitude'
  },
  {
    id: 'q11',
    question: {
      en: 'When you see a new gadget or machine, do you wonder how the circuits inside work?',
      hi: 'जब आप एक नया गैजेट या मशीन देखते हैं, क्या आप सोचते हैं कि अंदर के सर्किट कैसे काम करते हैं?',
      mr: 'जेव्हा तुम्ही एक नवीन गॅजेट किंवा मशीन बघता, तेव्हा तुम्हाला आश्चर्य वाटते का की आतील सर्किट कसे काम करतात?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Yes, always. I sometimes take things apart',
        'No, I just care about what features it has',
        'I wonder how much profit the company makes on it'
      ],
      hi: [
        'हाँ, हमेशा। मैं कभी-कभी चीजों को अलग कर देता हूं',
        'नहीं, मुझे सिर्फ इसकी विशेषताओं की परवाह है',
        'मुझे आश्चर्य है कि कंपनी इस पर कितना मुनाफा कमाती है'
      ],
      mr: [
        'होय, नेहमी. मी कधीकधी गोष्टी वेगळ्या करतो',
        'नाही, मला फक्त त्याच्या वैशिष्ट्यांबद्दल काळजी आहे',
        'मला आश्चर्य वाटते की कंपनी त्यावर किती नफा कमावते'
      ]
    },
    category: 'aptitude'
  },
  {
    id: 'q12',
    question: {
      en: 'What does "Success" mean to you in 10 years?',
      hi: '10 साल में आपके लिए "सफलता" का क्या मतलब है?',
      mr: '10 वर्षांत तुमच्यासाठी "यश" म्हणजे काय?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Money. I want to be wealthy and financially free',
        'Impact. I want to solve big problems (climate, health, justice)',
        'Fame. I want people to know my name and follow my work',
        'Stability. I want a safe job with good work-life balance'
      ],
      hi: [
        'पैसा। मैं धनी और आर्थिक रूप से स्वतंत्र होना चाहता हूं',
        'प्रभाव। मैं बड़ी समस्याओं को हल करना चाहता हूं (जलवायु, स्वास्थ्य, न्याय)',
        'प्रसिद्धि। मैं चाहता हूं कि लोग मेरा नाम जानें और मेरे काम का अनुसरण करें',
        'स्थिरता। मैं अच्छे कार्य-जीवन संतुलन के साथ एक सुरक्षित नौकरी चाहता हूं'
      ],
      mr: [
        'पैसा. मला श्रीमंत आणि आर्थिकदृष्ट्या स्वतंत्र व्हायचे आहे',
        'प्रभाव. मला मोठ्या समस्या सोडवायच्या आहेत (जलवायू, आरोग्य, न्याय)',
        'प्रसिद्धी. मला लोक माझे नाव जाणून घ्यावे आणि माझ्या कामाचे अनुसरण करावे असे वाटते',
        'स्थिरता. मला चांगल्या काम-जीवन संतुलनासह एक सुरक्षित नोकरी हवी आहे'
      ]
    },
    category: 'vision'
  },
  // Phase 4: Future Vision (Q12-Q15)
  {
    id: 'q13',
    question: {
      en: 'If you had ₹1 Lakh to start a project, what would you do?',
      hi: 'अगर आपके पास एक प्रोजेक्ट शुरू करने के लिए ₹1 लाख होते, तो आप क्या करते?',
      mr: 'जर तुमच्याकडे एक प्रकल्प सुरू करण्यासाठी ₹1 लाख असते, तर तुम्ही काय कराल?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Build a product or app prototype',
        'Buy and resell items (sneakers/stocks) for profit',
        'Create a content channel/film/portfolio',
        'I wouldn\'t risk it. I\'d put it in a Fixed Deposit'
      ],
      hi: [
        'एक उत्पादन या ऐप प्रोटोटाइप बनाएं',
        'मुनाफे के लिए सामान खरीदें और बेचें (स्नीकर्स/स्टॉक)',
        'एक कंटेंट चैनल/फिल्म/पोर्टफोलियो बनाएं',
        'मैं इसे जोखिम में नहीं डालूंगा। मैं इसे फिक्स्ड डिपॉजिट में रखूंगा'
      ],
      mr: [
        'एक उत्पादन किंवा ऍप प्रोटोटाइप तयार करा',
        'नफ्यासाठी वस्तू खरेदी करा आणि विक्री करा (स्नीकर्स/स्टॉक)',
        'एक सामग्री चॅनेल/चित्रपट/पोर्टफोलिओ तयार करा',
        'मी ते जोखीमात टाकणार नाही. मी ते फिक्स्ड डिपॉझिटमध्ये ठेवेन'
      ]
    },
    category: 'vision'
  },
  {
    id: 'q14',
    question: {
      en: 'Why do you want a career?',
      hi: 'आप करियर क्यों चाहते हैं?',
      mr: 'तुम्हाला करिअर का हवे आहे?'
    },
    type: 'single_choice',
    options: {
      en: [
        'To build or invent new things',
        'To understand how the world/people work',
        'To organize systems and make money',
        'To express myself creatively'
      ],
      hi: [
        'नई चीजें बनाने या आविष्कार करने के लिए',
        'यह समझने के लिए कि दुनिया/लोग कैसे काम करते हैं',
        'सिस्टम को व्यवस्थित करने और पैसा कमाने के लिए',
        'रचनात्मक रूप से खुद को व्यक्त करने के लिए'
      ],
      mr: [
        'नवीन गोष्टी तयार करण्यासाठी किंवा शोधण्यासाठी',
        'जग/लोक कसे काम करतात हे समजून घेण्यासाठी',
        'सिस्टम व्यवस्थापित करण्यासाठी आणि पैसे कमवण्यासाठी',
        'सर्जनशीलतेने स्वतःला व्यक्त करण्यासाठी'
      ]
    },
    category: 'vision'
  },
  {
    id: 'q15',
    question: {
      en: 'How much do you want to talk to people in your job?',
      hi: 'आप अपनी नौकरी में लोगों से कितना बात करना चाहते हैं?',
      mr: 'तुम्हाला तुमच्या नोकरीत लोकांशी किती बोलायचे आहे?'
    },
    type: 'single_choice',
    options: {
      en: [
        'All day. I love meeting new people',
        'Sometimes, but I need quiet time to focus',
        'As little as possible. I prefer working with data/machines'
      ],
      hi: [
        'पूरे दिन। मुझे नए लोगों से मिलना पसंद है',
        'कभी-कभी, लेकिन मुझे ध्यान केंद्रित करने के लिए शांत समय चाहिए',
        'जितना कम हो सके। मैं डेटा/मशीनों के साथ काम करना पसंद करता हूं'
      ],
      mr: [
        'संपूर्ण दिवस. मला नवीन लोकांना भेटणे आवडते',
        'कधीकधी, पण मला लक्ष केंद्रित करण्यासाठी शांत वेळ हवा आहे',
        'शक्य तितके कमी. मला डेटा/यंत्रांसह काम करणे आवडते'
      ]
    },
    category: 'vision'
  },
  // Phase 5: Logistics (Q16-Q20)
  {
    id: 'q16',
    question: {
      en: 'Competitive exams (JEE/NEET/CA) require 10-12 hours of study daily for 2 years. Can you do this?',
      hi: 'प्रतिस्पर्धी परीक्षाएं (JEE/NEET/CA) के लिए 2 साल तक रोजाना 10-12 घंटे अध्ययन की आवश्यकता होती है। क्या आप यह कर सकते हैं?',
      mr: 'स्पर्धात्मक परीक्षा (JEE/NEET/CA) साठी 2 वर्षे दररोज 10-12 तास अभ्यास आवश्यक आहे. तुम्ही हे करू शकता का?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Yes, I am ready to grind for my goal',
        'Maybe, but I might burn out',
        'No, I prefer a balanced life with hobbies',
        'Absolutely not'
      ],
      hi: [
        'हाँ, मैं अपने लक्ष्य के लिए मेहनत करने के लिए तैयार हूं',
        'शायद, लेकिन मैं थक सकता हूं',
        'नहीं, मैं शौक के साथ एक संतुलित जीवन पसंद करता हूं',
        'बिल्कुल नहीं'
      ],
      mr: [
        'होय, मी माझ्या लक्ष्यासाठी मेहनत करण्यासाठी तयार आहे',
        'कदाचित, पण मी थकू शकतो',
        'नाही, मला शौकांसह एक संतुलित जीवन आवडते',
        'अजिबात नाही'
      ]
    },
    category: 'logistics'
  },
  {
    id: 'q17',
    question: {
      en: 'Where do you plan to study for your degree?',
      hi: 'आप अपनी डिग्री के लिए कहाँ अध्ययन करने की योजना बना रहे हैं?',
      mr: 'तुम्ही तुमच्या पदवीसाठी कोठे अभ्यास करण्याची योजना आखता?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Top Tier Colleges in India (IIT/AIIMS/SRCC)',
        'Abroad (USA/UK/Canada/Europe)',
        'Local city college (Stay near home)',
        'Online/Remote degrees'
      ],
      hi: [
        'भारत में शीर्ष स्तर के कॉलेज (IIT/AIIMS/SRCC)',
        'विदेश (USA/UK/Canada/Europe)',
        'स्थानीय शहर का कॉलेज (घर के पास रहें)',
        'ऑनलाइन/दूरस्थ डिग्री'
      ],
      mr: [
        'भारतातील शीर्ष स्तराचे महाविद्यालये (IIT/AIIMS/SRCC)',
        'परदेश (USA/UK/Canada/Europe)',
        'स्थानिक शहर महाविद्यालय (घराजवळ राहा)',
        'ऑनलाइन/दूरस्थ पदवी'
      ]
    },
    category: 'logistics'
  },
  {
    id: 'q18',
    question: {
      en: 'What is your approximate family budget for college education (per year)?',
      hi: 'कॉलेज शिक्षा के लिए आपका अनुमानित पारिवारिक बजट (प्रति वर्ष) क्या है?',
      mr: 'महाविद्यालयीन शिक्षेसाठी तुमचा अंदाजे कुटुंब अंदाजपत्रक (प्रति वर्ष) किती आहे?'
    },
    type: 'single_choice',
    options: {
      en: [
        '< ₹2 Lakhs (Need Scholarships/Govt Colleges)',
        '₹2 - ₹5 Lakhs',
        '₹5 - ₹10 Lakhs',
        '₹15 Lakhs+ (Money is not a major issue)'
      ],
      hi: [
        '< ₹2 लाख (छात्रवृत्ति/सरकारी कॉलेज की आवश्यकता)',
        '₹2 - ₹5 लाख',
        '₹5 - ₹10 लाख',
        '₹15 लाख+ (पैसा एक बड़ी समस्या नहीं है)'
      ],
      mr: [
        '< ₹2 लाख (शिष्यवृत्ती/सरकारी महाविद्यालयांची गरज)',
        '₹2 - ₹5 लाख',
        '₹5 - ₹10 लाख',
        '₹15 लाख+ (पैसा एक मोठी समस्या नाही)'
      ]
    },
    category: 'logistics'
  },
  {
    id: 'q19',
    question: {
      en: 'How much influence do your parents have on this decision?',
      hi: 'इस निर्णय पर आपके माता-पिता का कितना प्रभाव है?',
      mr: 'या निर्णयावर तुमच्या पालकांचा किती प्रभाव आहे?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Total freedom. It\'s my choice',
        'They have suggestions, but I decide',
        'They are pressuring me into a specific stream'
      ],
      hi: [
        'पूर्ण स्वतंत्रता। यह मेरी पसंद है',
        'उनके सुझाव हैं, लेकिन मैं तय करता हूं',
        'वे मुझे एक विशिष्ट स्ट्रीम में दबाव डाल रहे हैं'
      ],
      mr: [
        'पूर्ण स्वातंत्र्य. ही माझी निवड आहे',
        'त्यांच्या सुझावांना आहेत, पण मी ठरवतो',
        'ते मला एक विशिष्ट स्ट्रीममध्ये दबाव देत आहेत'
      ]
    },
    category: 'logistics'
  },
  {
    id: 'q20',
    question: {
      en: 'If you don\'t get your dream career, what is your "Plan B"?',
      hi: 'अगर आपको अपना सपनों का करियर नहीं मिलता, तो आपकी "योजना बी" क्या है?',
      mr: 'जर तुम्हाला तुमचा स्वप्नाचा करिअर मिळाला नाही, तर तुमची "योजना बी" काय आहे?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Join a family business / Start a business',
        'Government Exams (UPSC/Bank)',
        'Learn a tech skill (Coding/Design) and get a job',
        'I don\'t have a plan B yet'
      ],
      hi: [
        'पारिवारिक व्यवसाय में शामिल हों / व्यवसाय शुरू करें',
        'सरकारी परीक्षाएं (UPSC/बैंक)',
        'एक तकनीकी कौशल सीखें (कोडिंग/डिज़ाइन) और नौकरी पाएं',
        'मेरे पास अभी तक योजना बी नहीं है'
      ],
      mr: [
        'कुटुंब व्यवसायात सामील व्हा / व्यवसाय सुरू करा',
        'सरकारी परीक्षा (UPSC/बैंक)',
        'एक तांत्रिक कौशल्य शिका (कोडिंग/डिझाइन) आणि नोकरी मिळवा',
        'माझ्याकडे अजून योजना बी नाही'
      ]
    },
    category: 'logistics'
  },
  // Phase 6: Validation (Q21-Q25)
  {
    id: 'q21',
    question: {
      en: 'Select the school subjects you genuinely ENJOY (not just get good marks in)',
      hi: 'उन स्कूल विषयों का चयन करें जिनका आप वास्तव में आनंद लेते हैं (सिर्फ अच्छे अंक प्राप्त करने के लिए नहीं)',
      mr: 'शाळेतील विषय निवडा ज्याचा तुम्ही खरोखर आनंद घेता (फक्त चांगले गुण मिळवण्यासाठी नाही)'
    },
    type: 'multi_select',
    options: {
      en: [
        'Mathematics',
        'Physics',
        'Chemistry',
        'Biology',
        'History',
        'Geography',
        'English',
        'Computer Science',
        'Economics',
        'Art',
        'Physical Education'
      ],
      hi: [
        'गणित',
        'भौतिकी',
        'रसायन विज्ञान',
        'जीव विज्ञान',
        'इतिहास',
        'भूगोल',
        'अंग्रेजी',
        'कंप्यूटर विज्ञान',
        'अर्थशास्त्र',
        'कला',
        'शारीरिक शिक्षा'
      ],
      mr: [
        'गणित',
        'भौतिकशास्त्र',
        'रसायनशास्त्र',
        'जीवशास्त्र',
        'इतिहास',
        'भूगोल',
        'इंग्रजी',
        'संगणक विज्ञान',
        'अर्थशास्त्र',
        'कला',
        'शारीरिक शिक्षण'
      ]
    },
    category: 'validation'
  },
  {
    id: 'q22',
    question: {
      en: 'How good are you with computers/tech?',
      hi: 'आप कंप्यूटर/तकनीक के साथ कितने अच्छे हैं?',
      mr: 'तुम्ही संगणक/तंत्रज्ञानासह किती चांगले आहात?'
    },
    type: 'single_choice',
    options: {
      en: [
        'I can code/program basic things',
        'I use creative software (Photoshop, Canva, Video Editors)',
        'I am good at social media and browsing',
        'I only use it for school and entertainment'
      ],
      hi: [
        'मैं बुनियादी चीजें कोड/प्रोग्राम कर सकता हूं',
        'मैं रचनात्मक सॉफ्टवेयर का उपयोग करता हूं (Photoshop, Canva, Video Editors)',
        'मैं सोशल मीडिया और ब्राउज़िंग में अच्छा हूं',
        'मैं इसे केवल स्कूल और मनोरंजन के लिए उपयोग करता हूं'
      ],
      mr: [
        'मी मूलभूत गोष्टी कोड/प्रोग्राम करू शकतो',
        'मी सर्जनशील सॉफ्टवेअर वापरतो (Photoshop, Canva, Video Editors)',
        'मी सोशल मीडिया आणि ब्राउझिंगमध्ये चांगला आहे',
        'मी ते फक्त शाळा आणि मनोरंजनासाठी वापरतो'
      ]
    },
    category: 'validation'
  },
  {
    id: 'q23',
    question: {
      en: 'Would you prefer a salary of ₹50k (Guaranteed) or a chance to make ₹5 Lakhs (Risky)?',
      hi: 'क्या आप ₹50k (गारंटीकृत) का वेतन पसंद करेंगे या ₹5 लाख कमाने का मौका (जोखिमपूर्ण)?',
      mr: 'तुम्ही ₹50k (हमी) पगार पसंद कराल किंवा ₹5 लाख कमवण्याची संधी (धोकादायक)?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Guaranteed ₹50k',
        'Risky ₹5 Lakhs'
      ],
      hi: [
        'गारंटीकृत ₹50k',
        'जोखिमपूर्ण ₹5 लाख'
      ],
      mr: [
        'हमी ₹50k',
        'धोकादायक ₹5 लाख'
      ]
    },
    category: 'validation'
  },
  {
    id: 'q24',
    question: {
      en: 'If you want to help people, how do you prefer to do it?',
      hi: 'अगर आप लोगों की मदद करना चाहते हैं, तो आप इसे कैसे करना पसंद करते हैं?',
      mr: 'जर तुम्हाला लोकांना मदत करायची असेल, तर तुम्ही ते कसे करायला पसंद करता?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Directly (Doctor, Teacher, Psychologist)',
        'Indirectly via systems (Policy maker, Engineer, NGO Manager)',
        'I am not primarily motivated by helping people'
      ],
      hi: [
        'सीधे (डॉक्टर, शिक्षक, मनोवैज्ञानिक)',
        'सिस्टम के माध्यम से अप्रत्यक्ष रूप से (नीति निर्माता, इंजीनियर, एनजीओ प्रबंधक)',
        'मैं मुख्य रूप से लोगों की मदद करने से प्रेरित नहीं हूं'
      ],
      mr: [
        'थेट (डॉक्टर, शिक्षक, मानसशास्त्रज्ञ)',
        'सिस्टमद्वारे अप्रत्यक्षपणे (धोरण निर्माता, अभियंता, एनजीओ व्यवस्थापक)',
        'मी मुख्यत्वे लोकांना मदत करण्यापासून प्रेरित नाही'
      ]
    },
    category: 'validation'
  },
  {
    id: 'q25',
    question: {
      en: 'If you could be guaranteed success in ONE field without studying, which would you pick?',
      hi: 'अगर आपको बिना पढ़ाई के एक क्षेत्र में सफलता की गारंटी मिल सकती है, तो आप कौन सा चुनेंगे?',
      mr: 'जर तुम्हाला अभ्यासाशिवाय एक क्षेत्रात यशाची हमी मिळू शकली, तर तुम्ही कोणते निवडाल?'
    },
    type: 'single_choice',
    options: {
      en: [
        'Scientist/Inventor',
        'CEO/Business Tycoon',
        'Artist/Celebrity/Creator',
        'Judge/Diplomat/Leader',
        'Doctor/Surgeon'
      ],
      hi: [
        'वैज्ञानिक/आविष्कारक',
        'CEO/व्यापार उद्योगपति',
        'कलाकार/सेलिब्रिटी/निर्माता',
        'न्यायाधीश/राजनयिक/नेता',
        'डॉक्टर/सर्जन'
      ],
      mr: [
        'वैज्ञानिक/शोधक',
        'CEO/व्यवसाय उद्योगपती',
        'कलाकार/सेलिब्रिटी/निर्माता',
        'न्यायाधीश/राजनयिक/नेता',
        'डॉक्टर/सर्जन'
      ]
    },
    category: 'validation'
  }
];

// Trait mapping for scoring - New Psychometric Structure
export const traitMapping: Record<string, Record<string, { trait: string; score: number }[]>> = {
  // Phase 1: Natural Vibe (Q1-Q5)
  q1: {
    'Tech reviews, coding, or "How things work" videos': [{ trait: 'logical', score: 2 }, { trait: 'handsOn', score: 1 }],
    'Finance, stock market, "Day in the life of a CEO", or business news': [{ trait: 'leader', score: 2 }, { trait: 'logical', score: 1 }],
    'Art, dance, music, fashion, or movie analysis': [{ trait: 'creative', score: 2 }],
    'Psychology facts, history documentaries, or social issues': [{ trait: 'people', score: 2 }, { trait: 'creative', score: 1 }],
    'Gaming, memes, or random entertainment': [{ trait: 'handsOn', score: 1 }],
    'I don\'t use social media': []
  },
  q2: {
    'Managing the budget, ticket sales, and sponsorship deals': [{ trait: 'leader', score: 2 }, { trait: 'logical', score: 1 }],
    'Designing the posters, stage backdrop, and social media posts': [{ trait: 'creative', score: 2 }],
    'Setting up the sound system, lighting, and electrical wiring': [{ trait: 'handsOn', score: 2 }, { trait: 'logical', score: 1 }],
    'Hosting the event (Emcee) or managing the guest list': [{ trait: 'people', score: 2 }, { trait: 'leader', score: 1 }]
  },
  q3: {
    'Google the model number + "black screen fix" and try to reboot/repair it myself': [{ trait: 'logical', score: 2 }, { trait: 'handsOn', score: 1 }],
    'Calculate how much money I need to save to buy a new one': [{ trait: 'logical', score: 1 }, { trait: 'leader', score: 1 }],
    'Call a friend or parent immediately to panic/ask for help': [{ trait: 'people', score: 1 }],
    'Wonder if this is a sign from the universe to do a digital detox': [{ trait: 'creative', score: 1 }]
  },
  q4: {
    'I do the research and write the factual content': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'I make the PowerPoint look beautiful and present it': [{ trait: 'creative', score: 2 }, { trait: 'people', score: 1 }],
    'I organize the team, set deadlines, and make sure everyone works': [{ trait: 'leader', score: 2 }, { trait: 'disciplined', score: 1 }],
    'I analyze the data and make the charts/graphs': [{ trait: 'logical', score: 2 }, { trait: 'handsOn', score: 1 }]
  },
  q5: {
    'Solving Math problems or coding': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Reading stories, history, or social studies': [{ trait: 'creative', score: 1 }, { trait: 'people', score: 1 }],
    'Drawing, editing videos, or creating music': [{ trait: 'creative', score: 2 }],
    'Understanding biological diagrams or chemical reactions': [{ trait: 'logical', score: 2 }, { trait: 'handsOn', score: 1 }]
  },
  // Phase 2: Dealbreakers (Q6-Q7) - Negative filtering handled in scoring logic
  q6: {
    'Sitting in front of a computer coding for 8 hours': [], // Negative: reduces tech stream
    'Dealing with blood, needles, or sick people': [], // Negative: reduces medical stream
    'Staring at spreadsheets and calculating taxes': [], // Negative: reduces commerce stream
    'Writing long essays or reading ancient literature': [], // Negative: reduces humanities stream
    'Public speaking or selling things to strangers': [] // Negative: reduces sales/law stream
  },
  q7: {
    'In a corporate office with a nice view and a suit': [{ trait: 'leader', score: 1 }, { trait: 'disciplined', score: 1 }],
    'In a creative studio, messy but colorful': [{ trait: 'creative', score: 2 }],
    'In a lab or a hospital, doing intense work': [{ trait: 'logical', score: 2 }, { trait: 'people', score: 1 }],
    'Traveling, meeting people, or working outdoors': [{ trait: 'people', score: 2 }, { trait: 'handsOn', score: 1 }],
    'From my bedroom, working remotely on my own terms': [{ trait: 'creative', score: 1 }, { trait: 'disciplined', score: 1 }]
  },
  // Phase 3: Aptitude Reality (Q8-Q11)
  q8: {
    'I love the challenge. I fight it until I get the answer': [{ trait: 'logical', score: 3 }, { trait: 'disciplined', score: 2 }],
    'I can do it if I have the formula, but I don\'t love it': [{ trait: 'logical', score: 1 }, { trait: 'disciplined', score: 1 }],
    'I hate it. It gives me anxiety': [] // Low math aptitude
  },
  q9: {
    'I memorize facts, dates, and diagrams easily': [{ trait: 'disciplined', score: 2 }, { trait: 'people', score: 1 }], // Bio/History fit
    'I need to understand the "Why" and "How". Memorizing is hard': [{ trait: 'logical', score: 2 }, { trait: 'creative', score: 1 }], // Physics/Math fit
    'I make stories or acronyms to remember things': [{ trait: 'creative', score: 2 }, { trait: 'people', score: 1 }] // Humanities fit
  },
  q10: {
    'Read every word and highlight key points': [{ trait: 'disciplined', score: 2 }, { trait: 'logical', score: 1 }],
    'Skim the headlines and look at the graphs': [{ trait: 'logical', score: 1 }, { trait: 'creative', score: 1 }],
    'Use ChatGPT to summarize it for me': [{ trait: 'logical', score: 1 }, { trait: 'handsOn', score: 1 }],
    'I wouldn\'t read it; I\'d watch a video about it': [{ trait: 'creative', score: 1 }, { trait: 'handsOn', score: 1 }]
  },
  q11: {
    'Yes, always. I sometimes take things apart': [{ trait: 'logical', score: 2 }, { trait: 'handsOn', score: 2 }], // Engineering
    'No, I just care about what features it has': [{ trait: 'people', score: 1 }, { trait: 'creative', score: 1 }], // Consumer/User
    'I wonder how much profit the company makes on it': [{ trait: 'leader', score: 2 }, { trait: 'logical', score: 1 }] // Business
  },
  // Phase 4: Future Vision (Q12-Q15)
  q12: {
    'Money. I want to be wealthy and financially free': [{ trait: 'leader', score: 2 }, { trait: 'logical', score: 1 }],
    'Impact. I want to solve big problems (climate, health, justice)': [{ trait: 'people', score: 2 }, { trait: 'logical', score: 1 }],
    'Fame. I want people to know my name and follow my work': [{ trait: 'creative', score: 2 }, { trait: 'leader', score: 1 }],
    'Stability. I want a safe job with good work-life balance': [{ trait: 'disciplined', score: 2 }, { trait: 'people', score: 1 }]
  },
  q13: {
    'Build a product or app prototype': [{ trait: 'logical', score: 2 }, { trait: 'handsOn', score: 1 }], // Financial awareness
    'Buy and resell items (sneakers/stocks) for profit': [{ trait: 'leader', score: 2 }, { trait: 'logical', score: 1 }], // Financial awareness
    'Create a content channel/film/portfolio': [{ trait: 'creative', score: 2 }],
    'I wouldn\'t risk it. I\'d put it in a Fixed Deposit': [{ trait: 'disciplined', score: 2 }] // Financial awareness
  },
  q14: {
    'To build or invent new things': [{ trait: 'logical', score: 2 }, { trait: 'handsOn', score: 1 }],
    'To understand how the world/people work': [{ trait: 'people', score: 2 }, { trait: 'logical', score: 1 }],
    'To organize systems and make money': [{ trait: 'leader', score: 2 }, { trait: 'logical', score: 1 }],
    'To express myself creatively': [{ trait: 'creative', score: 2 }]
  },
  q15: {
    'All day. I love meeting new people': [{ trait: 'people', score: 3 }, { trait: 'leader', score: 1 }],
    'Sometimes, but I need quiet time to focus': [{ trait: 'people', score: 1 }, { trait: 'logical', score: 1 }],
    'As little as possible. I prefer working with data/machines': [{ trait: 'logical', score: 2 }, { trait: 'handsOn', score: 1 }]
  },
  // Phase 5: Logistics (Q16-Q20)
  q16: {
    'Yes, I am ready to grind for my goal': [{ trait: 'disciplined', score: 3 }], // High resilience
    'Maybe, but I might burn out': [{ trait: 'disciplined', score: 1 }], // Medium resilience
    'No, I prefer a balanced life with hobbies': [{ trait: 'people', score: 1 }, { trait: 'creative', score: 1 }], // Low resilience
    'Absolutely not': [] // Very low resilience
  },
  q17: {
    'Top Tier Colleges in India (IIT/AIIMS/SRCC)': [{ trait: 'disciplined', score: 2 }, { trait: 'logical', score: 1 }],
    'Abroad (USA/UK/Canada/Europe)': [{ trait: 'leader', score: 1 }, { trait: 'disciplined', score: 1 }],
    'Local city college (Stay near home)': [{ trait: 'people', score: 1 }],
    'Online/Remote degrees': [{ trait: 'creative', score: 1 }, { trait: 'disciplined', score: 1 }]
  },
  q18: {
    '< ₹2 Lakhs (Need Scholarships/Govt Colleges)': [], // Budget constraint flag
    '₹2 - ₹5 Lakhs': [],
    '₹5 - ₹10 Lakhs': [],
    '₹15 Lakhs+ (Money is not a major issue)': [{ trait: 'leader', score: 1 }]
  },
  q19: {
    'Total freedom. It\'s my choice': [{ trait: 'leader', score: 1 }],
    'They have suggestions, but I decide': [],
    'They are pressuring me into a specific stream': []
  },
  q20: {
    'Join a family business / Start a business': [{ trait: 'leader', score: 2 }, { trait: 'creative', score: 1 }],
    'Government Exams (UPSC/Bank)': [{ trait: 'disciplined', score: 2 }, { trait: 'logical', score: 1 }],
    'Learn a tech skill (Coding/Design) and get a job': [{ trait: 'logical', score: 2 }, { trait: 'handsOn', score: 1 }],
    'I don\'t have a plan B yet': []
  },
  // Phase 6: Validation (Q21-Q25)
  q21: {
    'Mathematics': [{ trait: 'logical', score: 2 }, { trait: 'disciplined', score: 1 }],
    'Physics': [{ trait: 'logical', score: 2 }, { trait: 'handsOn', score: 1 }],
    'Chemistry': [{ trait: 'logical', score: 1 }, { trait: 'handsOn', score: 1 }],
    'Biology': [{ trait: 'people', score: 1 }, { trait: 'logical', score: 1 }],
    'History': [{ trait: 'creative', score: 1 }, { trait: 'people', score: 1 }],
    'Geography': [{ trait: 'logical', score: 1 }, { trait: 'creative', score: 1 }],
    'English': [{ trait: 'creative', score: 2 }],
    'Computer Science': [{ trait: 'logical', score: 2 }, { trait: 'handsOn', score: 1 }],
    'Economics': [{ trait: 'logical', score: 2 }, { trait: 'leader', score: 1 }],
    'Art': [{ trait: 'creative', score: 2 }],
    'Physical Education': [{ trait: 'handsOn', score: 1 }, { trait: 'disciplined', score: 1 }]
  },
  q22: {
    'I can code/program basic things': [{ trait: 'logical', score: 2 }, { trait: 'handsOn', score: 1 }],
    'I use creative software (Photoshop, Canva, Video Editors)': [{ trait: 'creative', score: 2 }],
    'I am good at social media and browsing': [{ trait: 'people', score: 1 }, { trait: 'creative', score: 1 }],
    'I only use it for school and entertainment': []
  },
  q23: {
    'Guaranteed ₹50k': [{ trait: 'disciplined', score: 2 }], // Risk averse
    'Risky ₹5 Lakhs': [{ trait: 'leader', score: 2 }, { trait: 'creative', score: 1 }] // Risk taker
  },
  q24: {
    'Directly (Doctor, Teacher, Psychologist)': [{ trait: 'people', score: 3 }],
    'Indirectly via systems (Policy maker, Engineer, NGO Manager)': [{ trait: 'logical', score: 2 }, { trait: 'leader', score: 1 }],
    'I am not primarily motivated by helping people': []
  },
  q25: {
    'Scientist/Inventor': [{ trait: 'logical', score: 3 }, { trait: 'creative', score: 1 }],
    'CEO/Business Tycoon': [{ trait: 'leader', score: 3 }, { trait: 'logical', score: 1 }],
    'Artist/Celebrity/Creator': [{ trait: 'creative', score: 3 }],
    'Judge/Diplomat/Leader': [{ trait: 'leader', score: 2 }, { trait: 'people', score: 2 }],
    'Doctor/Surgeon': [{ trait: 'people', score: 3 }, { trait: 'logical', score: 1 }]
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

