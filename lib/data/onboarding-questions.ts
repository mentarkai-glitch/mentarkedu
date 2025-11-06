import { OnboardingQuestion, StudentLevel } from '@/lib/types';

// ==================== JUNIOR STUDENTS (Classes 6-8) ====================

export const juniorQuestions: OnboardingQuestion[] = [
  // Section 1: About You (4 questions)
  {
    id: "junior_grade",
    question: "Which class are you in?",
    type: "single_choice",
    options: ["Class 6", "Class 7", "Class 8"],
    required: true,
    category: "profile"
  },
  {
    id: "junior_school_type",
    question: "What kind of school do you go to?",
    type: "single_choice",
    options: ["🏫 Government School", "🎓 Private School", "💻 Online School", "🏡 Home Schooled"],
    required: true,
    category: "profile"
  },
  {
    id: "junior_location",
    question: "Where do you live?",
    type: "single_choice",
    options: ["🏙️ Big City", "🏘️ Small City/Town", "🌾 Village"],
    required: true,
    category: "profile"
  },
  {
    id: "junior_school_feeling",
    question: "How do you usually feel at school?",
    type: "single_choice",
    options: ["😊 Happy and excited", "😐 It's okay", "😟 Worried or stressed", "🥱 Bored"],
    required: true,
    category: "profile"
  },

  // Section 2: What You Love (5 questions)
  {
    id: "junior_free_time",
    question: "What's your favorite way to spend free time?",
    type: "single_choice",
    options: ["🎮 Playing games", "📚 Reading books", "⚽ Sports", "🎨 Drawing/Art", "📺 Watching videos", "🎵 Music/Dance"],
    required: true,
    category: "interests"
  },
  {
    id: "junior_favorite_subject",
    question: "Which subject makes you most excited?",
    type: "single_choice",
    options: ["🧮 Math", "🔬 Science", "🌍 Social Studies", "✍️ English/Languages", "🎨 Art/Craft", "💪 Sports/PE"],
    required: true,
    category: "interests"
  },
  {
    id: "junior_hardest_subject",
    question: "Which subject do you find hardest?",
    type: "single_choice",
    options: ["🧮 Math", "🔬 Science", "🌍 Social Studies", "✍️ English/Languages", "🎨 Art/Craft", "💪 Sports/PE"],
    required: true,
    category: "interests"
  },
  {
    id: "junior_learning_style",
    question: "How do you like to learn new things?",
    type: "single_choice",
    options: ["📺 Watching videos", "👂 Listening to teacher", "📖 Reading books", "🎯 Doing activities myself", "👥 Learning with friends"],
    required: true,
    category: "learning"
  },
  {
    id: "junior_proud_of",
    question: "What makes you feel proud of yourself?",
    type: "single_choice",
    options: ["🏆 Getting good marks", "🎨 Creating something", "⚽ Winning in sports", "🤝 Helping others", "📚 Learning something new"],
    required: true,
    category: "personality"
  },

  // Section 3: How You Feel (4 questions)
  {
    id: "junior_happiness",
    question: "How happy are you on most days?",
    type: "single_choice",
    options: ["😄 Very happy (5/5)", "🙂 Pretty happy (4/5)", "😐 Okay (3/5)", "😕 Not so happy (2/5)", "😢 Sad (1/5)"],
    required: true,
    category: "emotions"
  },
  {
    id: "junior_difficulty_response",
    question: "When something is difficult, what do you do?",
    type: "single_choice",
    options: ["💪 I keep trying", "👨‍👩‍👧 I ask for help", "😞 I give up easily", "😤 I get frustrated"],
    required: true,
    category: "personality"
  },
  {
    id: "junior_support_person",
    question: "Who do you talk to when you're upset?",
    type: "single_choice",
    options: ["👨‍👩‍👧 Parents", "👫 Friends", "👩‍🏫 Teacher", "🤐 I keep it to myself"],
    required: true,
    category: "support"
  },
  {
    id: "junior_study_space",
    question: "Do you have a place at home where you can study quietly?",
    type: "single_choice",
    options: ["✅ Yes, my own room", "🏠 Yes, a shared space", "❌ No, it's noisy", "🤷 Sometimes"],
    required: true,
    category: "environment"
  },

  // Section 4: Dreams & Fun (3 questions)
  {
    id: "junior_career_dream",
    question: "Do you know what you want to be when you grow up?",
    type: "single_choice",
    options: ["✅ Yes! I have a dream", "🤔 I have some ideas", "🤷 No idea yet (and that's okay!)"],
    required: true,
    category: "future"
  },
  {
    id: "junior_exciting_activities",
    question: "What sounds most exciting to you?",
    type: "single_choice",
    options: ["💻 Making apps/games", "🏥 Helping sick people", "👨‍🏫 Teaching others", "🎨 Creating art/music", "⚽ Playing sports", "🚀 Discovering new things", "💼 Running a business", "🤷 Still exploring!"],
    required: true,
    category: "interests"
  },
  {
    id: "junior_improvement_goal",
    question: "What's one thing you really want to get better at?",
    type: "single_choice",
    options: ["📚 Studying better", "⚽ Sports/Games", "🎨 Art/Music", "💬 Making friends", "😌 Staying calm", "⏰ Managing my time"],
    required: true,
    category: "goals"
  }
];

// ==================== MIDDLE STUDENTS (Classes 9-10) ====================

export const middleQuestions: OnboardingQuestion[] = [
  // Section 1: About You (5 questions)
  {
    id: "middle_grade",
    question: "Which class are you in?",
    type: "single_choice",
    options: ["Class 9", "Class 10"],
    required: true,
    category: "profile"
  },
  {
    id: "middle_board",
    question: "Which board are you in?",
    type: "single_choice",
    options: ["CBSE", "ICSE", "State Board", "International Board"],
    required: true,
    category: "profile"
  },
  {
    id: "middle_school_type",
    question: "What kind of school do you go to?",
    type: "single_choice",
    options: ["🏫 Government School", "🎓 Private School", "💻 Online School", "🏡 Home Schooled"],
    required: true,
    category: "profile"
  },
  {
    id: "middle_study_hours",
    question: "How many hours can you study daily (outside school)?",
    type: "single_choice",
    options: ["Less than 1 hour", "1-2 hours", "2-4 hours", "4+ hours"],
    required: true,
    category: "study_habits"
  },
  {
    id: "middle_coaching",
    question: "Do you go to coaching classes?",
    type: "single_choice",
    options: ["Yes, regularly", "Yes, sometimes", "No"],
    required: true,
    category: "study_habits"
  },

  // Section 2: Studies & Goals (6 questions)
  {
    id: "middle_board_exams",
    question: "How do you feel about board exams?",
    type: "single_choice",
    options: ["😰 Very stressed", "😟 A bit worried", "😐 Confident", "😎 Fully prepared"],
    required: true,
    category: "emotions"
  },
  {
    id: "middle_favorite_subjects",
    question: "Which subjects do you enjoy most?",
    type: "multiple_choice",
    options: ["Math", "Science", "Social Science", "English", "Languages", "Computer", "Art"],
    required: true,
    category: "interests"
  },
  {
    id: "middle_challenging_subjects",
    question: "Which subjects are most challenging?",
    type: "multiple_choice",
    options: ["Math", "Science", "Social Science", "English", "Languages", "Computer", "Art"],
    required: true,
    category: "interests"
  },
  {
    id: "middle_study_routine",
    question: "What's your current study routine like?",
    type: "single_choice",
    options: ["📅 Regular schedule", "🎯 Only before exams", "🤷 No fixed routine", "😴 I struggle to study"],
    required: true,
    category: "study_habits"
  },
  {
    id: "middle_stream_preference",
    question: "After 10th, which stream are you thinking of?",
    type: "single_choice",
    options: ["🔬 Science (PCM/PCB)", "💼 Commerce", "🎨 Arts/Humanities", "🤷 Not sure yet"],
    required: true,
    category: "future"
  },
  {
    id: "middle_career_clarity",
    question: "Do you have a career in mind?",
    type: "single_choice",
    options: ["✅ Yes, clear idea", "🤔 Few options", "🤷 No clue yet"],
    required: true,
    category: "future"
  },

  // Section 3: Psychology & Feelings (5 questions)
  {
    id: "middle_motivation",
    question: "How motivated do you feel about studies?",
    type: "slider",
    min: 1,
    max: 10,
    required: true,
    category: "psychology"
  },
  {
    id: "middle_stress",
    question: "How stressed do you feel on most days?",
    type: "slider",
    min: 1,
    max: 10,
    required: true,
    category: "psychology"
  },
  {
    id: "middle_stress_sources",
    question: "What stresses you most?",
    type: "multiple_choice",
    options: ["Exams", "Parents' expectations", "Peer pressure", "Future worries", "Marks/Competition"],
    required: true,
    category: "psychology"
  },
  {
    id: "middle_confidence",
    question: "How confident are you about achieving your goals?",
    type: "slider",
    min: 1,
    max: 10,
    required: true,
    category: "psychology"
  },
  {
    id: "middle_failure_response",
    question: "When you fail at something, what happens?",
    type: "single_choice",
    options: ["💪 I learn and try again", "😞 I feel bad for days", "😤 I blame others", "🤷 I move on quickly"],
    required: true,
    category: "personality"
  },

  // Section 4: Support & Resources (4 questions)
  {
    id: "middle_support_person",
    question: "Who supports you most in studies?",
    type: "single_choice",
    options: ["Parents", "Teachers", "Friends", "Self-motivated", "No one"],
    required: true,
    category: "support"
  },
  {
    id: "middle_internet_access",
    question: "Do you have internet access for learning?",
    type: "single_choice",
    options: ["Yes, always", "Sometimes", "Rarely", "No"],
    required: true,
    category: "resources"
  },
  {
    id: "middle_family_education",
    question: "Your family's education background?",
    type: "single_choice",
    options: ["Highly educated", "Moderate", "Limited education"],
    required: true,
    category: "background"
  },
  {
    id: "middle_study_environment",
    question: "Study environment at home?",
    type: "single_choice",
    options: ["Dedicated room", "Shared space", "Noisy", "No fixed space"],
    required: true,
    category: "environment"
  }
];

// ==================== SENIOR STUDENTS (Classes 11-12) ====================

export const seniorQuestions: OnboardingQuestion[] = [
  // Section 1: Profile (6 questions)
  {
    id: "senior_grade",
    question: "Which class are you in?",
    type: "single_choice",
    options: ["Class 11", "Class 12"],
    required: true,
    category: "profile"
  },
  {
    id: "senior_stream",
    question: "Which stream are you in?",
    type: "single_choice",
    options: ["Science (PCM)", "Science (PCB)", "Commerce", "Arts/Humanities"],
    required: true,
    category: "profile"
  },
  {
    id: "senior_exam_prep",
    question: "Are you preparing for any entrance exam?",
    type: "single_choice",
    options: ["✅ Yes", "🤔 Planning to", "❌ No"],
    required: true,
    category: "exam_prep"
  },
  {
    id: "senior_exam_type",
    question: "If yes, which exam?",
    type: "single_choice",
    options: ["JEE Main/Advanced", "NEET", "CLAT", "CA", "Design", "Other"],
    required: false,
    category: "exam_prep"
  },
  {
    id: "senior_coaching",
    question: "Do you attend coaching?",
    type: "single_choice",
    options: ["Yes, full-time", "Yes, part-time", "Self-study", "Online only"],
    required: true,
    category: "study_habits"
  },
  {
    id: "senior_study_hours",
    question: "How many hours do you study daily (outside school)?",
    type: "single_choice",
    options: ["<2 hours", "2-4 hours", "4-6 hours", "6-8 hours", "8+ hours"],
    required: true,
    category: "study_habits"
  },

  // Section 2: Career Clarity (5 questions)
  {
    id: "senior_career_clarity",
    question: "How clear are you about your career goal?",
    type: "single_choice",
    options: ["🎯 Crystal clear", "🤔 Have some ideas", "😕 Confused", "🤷 Completely lost"],
    required: true,
    category: "career"
  },
  {
    id: "senior_field_interest",
    question: "What field interests you most?",
    type: "single_choice",
    options: ["Engineering", "Medical", "Commerce/Business", "Law", "Design", "Research", "Teaching", "Arts", "Government", "Entrepreneurship", "Not sure"],
    required: true,
    category: "career"
  },
  {
    id: "senior_stream_reason",
    question: "Why did you choose your current stream?",
    type: "single_choice",
    options: ["My passion", "Good career scope", "Parents suggested", "Friends took it", "Had to choose something"],
    required: true,
    category: "career"
  },
  {
    id: "senior_career_priority",
    question: "What matters most in your future career?",
    type: "single_choice",
    options: ["Money", "Passion", "Impact on society", "Recognition", "Work-life balance", "Stability"],
    required: true,
    category: "career"
  },
  {
    id: "senior_future_pressure",
    question: "Do you feel pressure about your future?",
    type: "single_choice",
    options: ["😰 Extreme pressure", "😟 Moderate pressure", "😐 Some pressure", "😌 No pressure"],
    required: true,
    category: "psychology"
  },

  // Section 3: Study Patterns (5 questions)
  {
    id: "senior_learning_style",
    question: "Your learning style?",
    type: "single_choice",
    options: ["Visual (videos/diagrams)", "Reading/Writing", "Hands-on", "Mix"],
    required: true,
    category: "learning"
  },
  {
    id: "senior_best_study_time",
    question: "When do you study best?",
    type: "single_choice",
    options: ["Early morning", "Afternoon", "Evening", "Late night", "No preference"],
    required: true,
    category: "study_habits"
  },
  {
    id: "senior_exam_prep_style",
    question: "How do you handle exam prep?",
    type: "single_choice",
    options: ["Start early with plan", "Last-minute", "Panic & cram", "Don't prepare much"],
    required: true,
    category: "study_habits"
  },
  {
    id: "senior_biggest_challenge",
    question: "Biggest challenge in studies?",
    type: "single_choice",
    options: ["Time management", "Focus issues", "Tough concepts", "Motivation", "Stress/Anxiety"],
    required: true,
    category: "challenges"
  },
  {
    id: "senior_study_session",
    question: "Your typical study session is:",
    type: "single_choice",
    options: ["Focused & productive", "Gets distracted", "Varies by mood", "Struggle to sit"],
    required: true,
    category: "study_habits"
  },

  // Section 4: Mental Health & Support (7 questions)
  {
    id: "senior_motivation",
    question: "Motivation level?",
    type: "slider",
    min: 1,
    max: 10,
    required: true,
    category: "psychology"
  },
  {
    id: "senior_stress",
    question: "Stress level?",
    type: "slider",
    min: 1,
    max: 10,
    required: true,
    category: "psychology"
  },
  {
    id: "senior_confidence",
    question: "Confidence about future?",
    type: "slider",
    min: 1,
    max: 10,
    required: true,
    category: "psychology"
  },
  {
    id: "senior_stress_sources",
    question: "Main source of stress?",
    type: "multiple_choice",
    options: ["Entrance exams", "Board exams", "Parents' expectations", "Peer comparison", "Career confusion", "Relationships"],
    required: true,
    category: "psychology"
  },
  {
    id: "senior_sleep_quality",
    question: "Sleep quality?",
    type: "single_choice",
    options: ["7+ hours & good", "5-7 hours", "<5 hours", "Very irregular"],
    required: true,
    category: "health"
  },
  {
    id: "senior_burnout",
    question: "Do you feel burnout?",
    type: "single_choice",
    options: ["Often", "Sometimes", "Rarely", "Never"],
    required: true,
    category: "psychology"
  },
  {
    id: "senior_support_system",
    question: "Support system?",
    type: "single_choice",
    options: ["Strong (family+friends)", "Moderate", "Limited", "Feel alone"],
    required: true,
    category: "support"
  },

  // Section 5: Resources & Environment (5 questions)
  {
    id: "senior_study_space",
    question: "Study space at home?",
    type: "single_choice",
    options: ["Own room", "Shared space", "Library", "No fixed space"],
    required: true,
    category: "environment"
  },
  {
    id: "senior_digital_access",
    question: "Digital access?",
    type: "single_choice",
    options: ["Own laptop+internet", "Shared device", "Mobile only", "Limited"],
    required: true,
    category: "resources"
  },
  {
    id: "senior_financial_comfort",
    question: "Financial comfort for education?",
    type: "single_choice",
    options: ["Can afford anything", "Moderate budget", "Tight budget", "Need scholarships"],
    required: true,
    category: "resources"
  },
  {
    id: "senior_parents_involvement",
    question: "Parents' involvement?",
    type: "single_choice",
    options: ["Very supportive", "Supportive", "Neutral", "Pressuring", "Uninvolved"],
    required: true,
    category: "support"
  },
  {
    id: "senior_mentor",
    question: "Do you have a mentor/guide?",
    type: "single_choice",
    options: ["Yes", "No but need one", "Self-guided"],
    required: true,
    category: "support"
  }
];

// ==================== QUESTION SETS BY LEVEL ====================

export const questionSets: Record<StudentLevel, OnboardingQuestion[]> = {
  junior: juniorQuestions,
  middle: middleQuestions,
  senior: seniorQuestions
};

// ==================== HELPER FUNCTIONS ====================

export function getQuestionsByLevel(level: StudentLevel): OnboardingQuestion[] {
  return questionSets[level];
}

export function getQuestionsByGrade(grade: string): OnboardingQuestion[] {
  const gradeNum = parseInt(grade.replace(/\D/g, ''));
  
  if (gradeNum >= 6 && gradeNum <= 8) {
    return questionSets.junior;
  } else if (gradeNum >= 9 && gradeNum <= 10) {
    return questionSets.middle;
  } else if (gradeNum >= 11 && gradeNum <= 12) {
    return questionSets.senior;
  }
  
  // Default to junior for unexpected grades
  return questionSets.junior;
}

export function getStudentLevel(grade: string): StudentLevel {
  const gradeNum = parseInt(grade.replace(/\D/g, ''));
  
  if (gradeNum >= 6 && gradeNum <= 8) {
    return "junior";
  } else if (gradeNum >= 9 && gradeNum <= 10) {
    return "middle";
  } else if (gradeNum >= 11 && gradeNum <= 12) {
    return "senior";
  }
  
  return "junior";
}
