export interface EmotionAnalysisInput {
  text: string;
  energy_level?: number; // 1-5
  focus_level?: number; // 1-5
  date?: string;
  previous_emotions?: Array<{
    date: string;
    score: number;
    emotion: string;
  }>;
}

export function generateEmotionAnalysisPrompt(input: EmotionAnalysisInput): string {
  let prompt = `Analyze the emotional state and sentiment of this student check-in:

**Student's Response:**
"${input.text}"
`;

  if (input.energy_level || input.focus_level) {
    prompt += `\n**Additional Context:**\n`;
    if (input.energy_level) {
      prompt += `- Energy Level: ${input.energy_level}/5\n`;
    }
    if (input.focus_level) {
      prompt += `- Focus Level: ${input.focus_level}/5\n`;
    }
  }

  if (input.previous_emotions && input.previous_emotions.length > 0) {
    prompt += `\n**Recent Emotional History:**\n`;
    input.previous_emotions.slice(0, 5).forEach((emotion) => {
      prompt += `- ${emotion.date}: ${emotion.emotion} (score: ${emotion.score})\n`;
    });
  }

  prompt += `
**Analysis Required:**

Return a JSON object with the following structure:
{
  "sentiment_score": <number between -1 and 1>,
  "primary_emotion": "<emotion keyword>",
  "emotion_category": "<category>",
  "intensity": <number between 0 and 1>,
  "key_themes": ["theme1", "theme2"],
  "concerns": ["concern1", "concern2"],
  "positive_aspects": ["aspect1", "aspect2"],
  "recommended_response": "<brief supportive message>",
  "risk_flags": ["flag1", "flag2"] // if any concerning patterns
}

**Sentiment Score Guidelines:**
- 0.8 to 1.0: Highly motivated, excited, energized
- 0.4 to 0.7: Generally positive, focused
- 0.0 to 0.3: Neutral, stable
- -0.3 to -0.1: Slightly stressed, tired
- -0.7 to -0.4: Struggling, demotivated
- -1.0 to -0.8: Severe burnout, distress (flag for immediate attention)

**Emotion Categories:**
- academic_stress
- motivation_high
- motivation_low
- exam_anxiety
- burnout_risk
- excited_about_learning
- confused_needs_help
- confident_making_progress
- overwhelmed
- balanced_healthy

**Risk Flags** (if applicable):
- burnout_risk
- persistent_low_motivation
- academic_overwhelm
- social_isolation
- health_concerns
- requires_immediate_attention

Provide a thorough, empathetic analysis:`;

  return prompt;
}

export function generateInsightSummaryPrompt(
  emotionHistory: Array<{
    date: string;
    score: number;
    emotion: string;
    text?: string;
  }>,
  timeframe: string
): string {
  return `Analyze this student's emotional journey over ${timeframe} and provide insights:

**Emotion Timeline:**
${emotionHistory
  .map((e) => `${e.date}: ${e.emotion} (${e.score}) ${e.text ? `- "${e.text}"` : ""}`)
  .join("\n")}

**Generate Insights:**

1. **Overall Trend:**
   - Is the student's emotional state improving, declining, or stable?
   - What patterns emerge?

2. **Key Triggers:**
   - What events or situations correlate with emotional changes?
   - Are there recurring stressors?

3. **Strengths Observed:**
   - When does the student show resilience?
   - What motivates them positively?

4. **Areas of Concern:**
   - Any red flags or worrying patterns?
   - Is intervention needed?

5. **Recommendations:**
   - What should teachers/mentors focus on?
   - Specific strategies to support this student
   - Resources or activities that might help

Return a comprehensive but concise analysis (200-300 words) that a teacher can read in 2 minutes.`;
}

export function generateDailyCheckInQuestions(): Array<{
  id: string;
  question: string;
  type: "scale" | "text";
}> {
  return [
    {
      id: "energy",
      question: "How's your energy level today?",
      type: "scale",
    },
    {
      id: "focus",
      question: "How well were you able to focus?",
      type: "scale",
    },
    {
      id: "emotion",
      question: "How are you feeling right now? (in your own words)",
      type: "text",
    },
  ];
}

