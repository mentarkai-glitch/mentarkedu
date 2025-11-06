import type { StudentProfile, StudentARKData } from "@/lib/types";
import { getRecommendedMilestoneCount } from "@/lib/data/student-timeframes";

export interface StudentARKInput {
  categoryId: string;
  categoryName: string;
  goalStatement: string;
  timeframe: {
    id: string;
    name: string;
    duration: string;
    durationWeeks: number;
  };
  studentProfile: {
    grade: string;
    learning_style: string;
    study_hours: string;
    interests: string[];
    goals: string[];
    biggest_challenges: string[];
  };
  psychologyProfile: {
    motivation: number;
    stress: number;
    confidence: number;
  };
  onboardingProfile?: StudentProfile;
  specificFocus?: string;
  deepDiveAnswers?: Record<string, any>; // NEW: Category-specific detailed answers
}

/**
 * Build deep dive context from category-specific answers
 */
function buildDeepDiveContext(answers?: Record<string, any>): string {
  if (!answers || Object.keys(answers).length === 0) {
    return "";
  }

  let context = "\n**Detailed Goal Information:**\n";
  
  // Format answers nicely
  Object.entries(answers).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      const formattedKey = key.split('_').map(w => 
        w.charAt(0).toUpperCase() + w.slice(1)
      ).join(' ');
      
      let formattedValue = value;
      if (Array.isArray(value)) {
        formattedValue = value.join(", ");
      } else if (typeof value === 'object') {
        formattedValue = JSON.stringify(value);
      }
      
      context += `- ${formattedKey}: ${formattedValue}\n`;
    }
  });

  return context;
}

/**
 * Build onboarding context from student profile
 */
function buildOnboardingContext(profile?: StudentProfile): string {
  if (!profile) return "No onboarding data available.";

  return `
**Complete Student Profile:**
- Level: ${profile.level} (Grade ${profile.grade})
- School Type: ${profile.school_type}
- Location: ${profile.location}
${profile.board ? `- Board: ${profile.board}` : ""}
${profile.stream ? `- Stream: ${profile.stream}` : ""}
${profile.exam_prep ? `- Exam Preparation: ${profile.exam_prep}` : ""}
- Study Hours Available: ${profile.study_hours}
- Learning Style: ${profile.learning_style}
- Career Clarity: ${profile.career_clarity}
- Support System: ${profile.support_system}
- Digital Access: ${profile.digital_access}
- Financial Comfort: ${profile.financial_comfort}
- Biggest Challenges: ${profile.biggest_challenges.join(", ")}

**Psychology Baseline:**
- Motivation Level: ${profile.motivation_level}/10
- Stress Level: ${profile.stress_level}/10
- Confidence Level: ${profile.confidence_level}/10

**Interests:** ${profile.interests.join(", ")}
**Goals:** ${profile.goals.join(", ")}
`;
}

/**
 * Get age-appropriate language based on grade
 */
function getLanguageStyle(grade: string): string {
  const gradeNum = parseInt(grade);
  
  if (gradeNum <= 8) {
    return "simple, encouraging, and fun language suitable for middle school students";
  } else if (gradeNum <= 10) {
    return "clear and motivating language suitable for high school students";
  } else {
    return "mature and inspiring language suitable for senior students preparing for college";
  }
}

/**
 * Get recommended resources based on grade and category
 */
function getResourceGuidelines(grade: string, categoryId: string): string {
  const gradeNum = parseInt(grade);
  
  const baseResources = [
    "Khan Academy for foundational concepts",
    "YouTube channels with verified educational content",
    "NCERT textbooks and solutions"
  ];

  if (categoryId === 'academic_excellence') {
    if (gradeNum >= 11) {
      baseResources.push("JEE/NEET preparation materials", "Previous year question papers");
    } else {
      baseResources.push("Age-appropriate educational apps", "Interactive learning platforms");
    }
  } else if (categoryId === 'career_preparation') {
    baseResources.push(
      "Career exploration websites",
      "Mentorship programs",
      "Skill-building online courses (age-appropriate)"
    );
  } else if (categoryId === 'emotional_wellbeing') {
    baseResources.push(
      "Mindfulness and meditation apps",
      "Student counseling resources",
      "Peer support groups"
    );
  }

  return baseResources.join(", ");
}

/**
 * Generate student-specific ARK prompt
 */
export function generateStudentARKPrompt(input: StudentARKInput): string {
  const milestoneCount = getRecommendedMilestoneCount(input.timeframe.durationWeeks);
  const languageStyle = getLanguageStyle(input.studentProfile.grade);
  const resourceGuidelines = getResourceGuidelines(input.studentProfile.grade, input.categoryId);

  // Adjust intensity based on psychology
  let intensityLevel = "moderate";
  if (input.psychologyProfile.motivation >= 8 && input.psychologyProfile.stress <= 4) {
    intensityLevel = "high";
  } else if (input.psychologyProfile.stress >= 7 || input.psychologyProfile.motivation <= 4) {
    intensityLevel = "gentle";
  }

  return `Generate a personalized student learning roadmap (ARK - Adaptive Roadmap of Knowledge) optimized for a ${input.studentProfile.grade} student in India.

**Student Context:**
- Grade: ${input.studentProfile.grade}
- Category: ${input.categoryName}
- Goal: ${input.goalStatement}
- Timeframe: ${input.timeframe.duration} (${input.timeframe.name})
- Learning Style: ${input.studentProfile.learning_style}
- Weekly Study Hours Available: ${input.studentProfile.study_hours}
${input.specificFocus ? `- Specific Focus: ${input.specificFocus}` : ""}

**Current Psychology (Important for Pacing):**
- Motivation Level: ${input.psychologyProfile.motivation}/10
- Stress Level: ${input.psychologyProfile.stress}/10
- Confidence Level: ${input.psychologyProfile.confidence}/10
- Recommended Intensity: ${intensityLevel}

**Student Interests:** ${input.studentProfile.interests.join(", ")}
**Student Goals:** ${input.studentProfile.goals.join(", ")}
**Current Challenges:** ${input.studentProfile.biggest_challenges.join(", ")}

${buildDeepDiveContext(input.deepDiveAnswers)}

${buildOnboardingContext(input.onboardingProfile)}

**Requirements:**

1. **Milestone Structure:**
   - Create EXACTLY ${milestoneCount} milestones
   - Each milestone should be achievable within ${Math.ceil(input.timeframe.durationWeeks / milestoneCount)} weeks
   - Progressive difficulty - start easier, build up
   - Use ${languageStyle}

2. **Content Adaptation:**
   - Use age-appropriate examples and references
   - Consider Indian education system (CBSE/ICSE/State boards)
   - Include school-friendly timings (respect school hours and homework)
   - Balance rigor with wellbeing based on stress level (${input.psychologyProfile.stress}/10)

3. **Resource Selection (CRITICAL - Must be COMPREHENSIVE):**
   - For EACH milestone, provide 5-8 detailed resources including:
     * **FREE Resources (3-5 per milestone):**
       - YouTube videos (with specific channels/titles)
       - Free courses (Khan Academy, Coursera free courses, edX audit track)
       - Articles/blog posts (from reputable sources)
       - Free tools and websites
       - NCERT/official textbooks (if applicable)
     * **PAID Resources (2-3 per milestone) - Optional but valuable:**
       - Paid courses (Coursera, Udemy, Unacademy, BYJU'S)
       - Books (with ISBN or purchase links)
       - Premium tools or apps
       - Coaching classes or online programs
   - Include: ${resourceGuidelines}
   - Every resource MUST have:
     - Actual URL (or "Search: [platform] [specific topic]" if URL unavailable)
     - Provider/platform name
     - Duration (for videos/courses)
     - Cost (free or ₹ amount)
     - Clear description of why it's useful
     - Learning outcomes
   - Mix of formats: videos, articles, courses, books, tools, websites
   - Indian context: prioritize Indian platforms (Unacademy, BYJU'S, Vedantu) alongside international ones

4. **Motivation & Support:**
   - Add encouraging checkpoints and quick wins
   - Include peer collaboration opportunities where appropriate
   - Suggest parent/teacher involvement points
   - Create celebration moments for completed milestones

5. **Daily Timeline (Provide SAMPLE for first 2-3 weeks only):**
   - Provide a SAMPLE timeline for the FIRST 2-3 weeks as a template
   - For longer ARKs (4+ weeks), provide a weekly structure template instead of all days
   - For EACH week in the sample, specify:
     * Daily tasks with specific titles (Monday through Sunday)
     * Time estimates (in hours)
     * Task types (learning, practice, assessment, review, rest)
     * Priority levels
     * Resources to use for each task
   - Include a "weeklyStructure" template that can be repeated for remaining weeks
   - Consider ${input.studentProfile.study_hours} available study hours
   - Include mix of theory, practice, and rest
   - Weekday tasks: 30-60 minutes
   - Weekend tasks: 2-4 hours
   - **IMPORTANT:** For ${input.timeframe.durationWeeks}+ week ARKs, provide sample weeks + template, NOT all ${input.timeframe.durationWeeks * 7} days

6. **Wellbeing Integration:**
   ${input.psychologyProfile.stress >= 6 ? "- IMPORTANT: Student has high stress. Include stress-management techniques and lighter workload" : ""}
   ${input.psychologyProfile.confidence <= 4 ? "- IMPORTANT: Student has low confidence. Include confidence-building exercises and quick wins" : ""}
   ${input.psychologyProfile.motivation <= 5 ? "- IMPORTANT: Student needs motivation. Include inspiring stories and immediate rewards" : ""}

**Output Format (JSON):**

Return ONLY a valid JSON object (no markdown, no code blocks) with this structure:

{
  "title": "Student-friendly, inspiring ARK title (max 60 chars)",
  "description": "Motivational 2-3 sentence overview that excites the student",
  "estimatedCompletionWeeks": ${input.timeframe.durationWeeks},
  "difficultyLevel": "beginner|intermediate|advanced",
  "milestones": [
    {
      "order": 1,
      "title": "Clear milestone title",
      "description": "What student will achieve (2-3 sentences)",
      "estimatedWeeks": number,
      "estimatedHours": number,
      "targetDate": "YYYY-MM-DD or relative like 'Week 1', 'Week 2'",
      "difficulty": "easy|medium|hard",
      "skillsGained": ["skill1", "skill2", "skill3"],
      "checkpointQuestions": [
        "Question to verify understanding 1",
        "Question 2"
      ],
      "celebrationMessage": "Encouraging message when milestone is completed",
      "tasks": [
        {
          "title": "Specific actionable task",
          "description": "How to do it",
          "estimatedHours": number,
          "isOptional": false
        }
      ],
      "resources": [
        {
          "type": "video|article|course|book|podcast|tool|website",
          "title": "Specific resource title (e.g., 'Khan Academy: Algebra Basics Course' not just 'Khan Academy')",
          "provider": "Khan Academy, YouTube, NCERT, Coursera, EdX, Unacademy, BYJU'S, Vedantu, etc.",
          "url": "Actual URL if available, or 'Search: [provider] [specific topic]' with exact search terms",
          "description": "Detailed explanation of why this resource is valuable and what the student will learn (2-3 sentences)",
          "isFree": true|false,
          "cost": "Free" or "₹X" (for paid resources),
          "estimatedDurationMinutes": number,
          "isRequired": true|false,
          "learningOutcomes": ["specific outcome 1", "specific outcome 2", "specific outcome 3"],
          "author": "Author/instructor name if available",
          "difficulty": "beginner|intermediate|advanced"
        }
      ]
      **IMPORTANT:** Provide 5-8 resources per milestone (mix of free and paid)
    }
  ],
  "dailyTimeline": [
    {
      "weekNumber": 1,
      "dayOfWeek": "Monday",
      "date": "YYYY-MM-DD (specific date)",
      "tasks": [
        {
          "title": "Specific actionable task title",
          "description": "Detailed step-by-step instructions on what to do (2-3 sentences)",
          "estimatedHours": number (decimal allowed, e.g., 0.5, 1.5),
          "type": "learning|practice|assessment|review|rest",
          "priority": "low|medium|high|critical",
          "resources": ["Specific resource title from milestone resources"],
          "milestoneOrder": 1 (which milestone this task belongs to)
        }
      ]
    }
    // Provide 2-3 sample weeks, then include a "weeklyStructure" template for remaining weeks
  ],
  "weeklyStructure": {
    "monday": "Template for Monday tasks (repeated weekly)",
    "tuesday": "Template for Tuesday tasks",
    // ... etc for all days
    "weekend": "Template for weekend intensive study"
  },
  **IMPORTANT:** For ARKs longer than 3 weeks, provide 2-3 sample weeks + weeklyStructure template. Do NOT generate all ${input.timeframe.durationWeeks * 7} days - that's too much!
  "weeklySchedule": {
    "mondayToFriday": "Suggested daily routine during school days (30-60 minutes)",
    "weekend": "Suggested weekend study plan (2-4 hours)",
    "bufferDays": "Which days to keep light"
  },
  "successCriteria": ["How to know you've succeeded - criteria 1", "criteria 2"],
  "parentGuidance": "2-3 sentence tip for parents to support this ARK",
  "teacherCollaboration": "How school teachers can help (optional)",
  "motivationTips": ["Tip 1 to stay motivated", "Tip 2"],
  "nextSteps": "What to do after completing this ARK",
  "recommendedPartners": [
    {
      "provider": "Khan Academy|Coursera|EdX|YouTube|Unacademy",
      "reason": "Why this platform is recommended for this ARK"
    }
  ]
}

**Critical Instructions:**
- Make it realistic for a ${input.studentProfile.grade} student
- Consider they have school, homework, and other commitments
- ${input.psychologyProfile.stress >= 7 ? "Keep workload LIGHT - student is highly stressed" : ""}
- ${input.psychologyProfile.motivation >= 8 ? "Student is highly motivated - can handle ambitious goals" : ""}
- Use Indian context (₹ for costs, Indian examples, local resources)

**RESOURCE REQUIREMENTS (MUST FOLLOW):**
- Provide 5-8 resources PER milestone (minimum 5, aim for 8)
- Mix of free (60-70%) and paid (30-40%) resources
- Include: Videos, Articles, Courses, Books, Tools, Websites
- Every resource needs: title, provider, url (or search query), description, cost, duration, learning outcomes
- Indian platforms: Unacademy, BYJU'S, Vedantu, Khan Academy, NCERT, Aakash, Allen
- International platforms: Coursera, edX, Udemy, YouTube (specific channels)
- Every resource must be actually useful and accessible to Indian students

**TIMELINE REQUIREMENTS (MUST FOLLOW):**
- For ARKs 1-3 weeks: Provide complete daily timeline for all days
- For ARKs 4+ weeks: Provide 2-3 sample weeks + weeklyStructure template
- Sample weeks should show the pattern clearly
- Weekdays: 30-60 minutes of tasks
- Weekends: 2-4 hours of tasks
- Include specific dates for sample weeks
- Link tasks to specific milestones
- Include resources for each task
- **DO NOT** generate ${input.timeframe.durationWeeks > 3 ? `all ${input.timeframe.durationWeeks * 7} days` : 'more than 3 weeks'} - use templates instead

**OUTPUT REQUIREMENTS (CRITICAL - MUST FOLLOW):**
- Return ONLY the JSON object, no markdown code blocks, no additional text
- JSON must be valid and COMPLETE - do not truncate or cut off
- All fields must be filled (no null/undefined unless truly optional)
- **Milestones array MUST have exactly ${milestoneCount} items - DO NOT generate fewer**
- Each milestone MUST have 5-8 resources in the resources array
- Resources array must have 5-8 items per milestone
- DailyTimeline: ${input.timeframe.durationWeeks <= 3 ? `Provide all ${input.timeframe.durationWeeks * 7} days` : 'Provide 2-3 sample weeks (14-21 days) + weeklyStructure template'}
- **IMPORTANT:** If the response is too long, prioritize completeness over detail - ensure ALL ${milestoneCount} milestones are included even if resources are slightly less detailed
- **DO NOT** stop mid-JSON or truncate the response
- Ensure the JSON closes all brackets properly: }]}

**CRITICAL:** You MUST generate exactly ${milestoneCount} milestones. If you cannot fit all details, reduce detail per milestone but keep all ${milestoneCount} milestones.

Generate the COMPLETE ARK JSON now (ensure all ${milestoneCount} milestones are included):`;
}

/**
 * Customize an institute template for a specific student
 */
export function generateTemplateCustomizationPrompt(
  template: any,
  studentProfile: StudentProfile,
  studentGoal: string
): string {
  return `Customize this institute-created ARK template for a specific student.

**Original Template:**
Title: ${template.title}
Description: ${template.description}
Milestones: ${JSON.stringify(template.milestones)}

**Student to Customize For:**
- Grade: ${studentProfile.grade}
- Goal: ${studentGoal}
- Learning Style: ${studentProfile.learning_style}
- Motivation: ${studentProfile.motivation_level}/10
- Stress: ${studentProfile.stress_level}/10
- Challenges: ${studentProfile.biggest_challenges.join(", ")}

**Task:**
Adapt the template milestones to better fit this student's:
1. Personal goal (${studentGoal})
2. Learning style
3. Current psychology (motivation and stress levels)
4. Specific challenges

Return the customized milestones in the same JSON format, keeping the structure but personalizing:
- Task descriptions
- Resource recommendations
- Pacing (slower if high stress, faster if high motivation)
- Examples and language

Return ONLY the JSON object with customized milestones.`;
}

