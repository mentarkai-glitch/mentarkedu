/**
 * Demo Path Finder - Quiz Questions
 * 7 questions for 10th-standard students to determine strengths and stream fit
 */

export interface DemoQuestion {
  id: number;
  text: string;
  type: 'single-choice' | 'slider';
  options?: string[];
  traitMapping: Record<string, string[]>; // option -> traits
  studyToleranceMapping?: boolean; // true if this is the slider question
}

export const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    id: 1,
    text: "What do you enjoy doing most?",
    type: 'single-choice',
    options: [
      "Solving puzzles & problems",
      "Building things",
      "Creating art/design",
      "Helping people",
      "Organising & leading",
      "Playing sports"
    ],
    traitMapping: {
      "Solving puzzles & problems": ["logical", "disciplined"],
      "Building things": ["hands-on", "logical"],
      "Creating art/design": ["creative"],
      "Helping people": ["people"],
      "Organising & leading": ["leader", "people"],
      "Playing sports": ["hands-on", "disciplined"]
    }
  },
  {
    id: 2,
    text: "Which class activity excites you?",
    type: 'single-choice',
    options: [
      "Experiments & practicals",
      "Maths problems",
      "Debates & discussions",
      "Drawing & designing",
      "Business projects"
    ],
    traitMapping: {
      "Experiments & practicals": ["hands-on", "logical"],
      "Maths problems": ["logical", "disciplined"],
      "Debates & discussions": ["people", "leader"],
      "Drawing & designing": ["creative"],
      "Business projects": ["leader", "people"]
    }
  },
  {
    id: 3,
    text: "How do you prefer to learn?",
    type: 'single-choice',
    options: [
      "Step-by-step explanations",
      "By doing (hands-on)",
      "Visual & diagrams",
      "Reading & research",
      "Group discussions"
    ],
    traitMapping: {
      "Step-by-step explanations": ["disciplined", "logical"],
      "By doing (hands-on)": ["hands-on"],
      "Visual & diagrams": ["creative"],
      "Reading & research": ["logical", "disciplined"],
      "Group discussions": ["people", "leader"]
    }
  },
  {
    id: 4,
    text: "How comfortable are you with long study sessions?",
    type: 'slider',
    traitMapping: {},
    studyToleranceMapping: true // This maps to study_tolerance numeric value
  },
  {
    id: 5,
    text: "Do you prefer structured tasks or creative freedom?",
    type: 'single-choice',
    options: [
      "Structured tasks",
      "Creative freedom",
      "Mix of both"
    ],
    traitMapping: {
      "Structured tasks": ["disciplined", "logical"],
      "Creative freedom": ["creative"],
      "Mix of both": ["creative", "disciplined"]
    }
  },
  {
    id: 6,
    text: "Which feels more rewarding?",
    type: 'single-choice',
    options: [
      "Solving a hard problem",
      "Creating something new",
      "Seeing people benefit from my work",
      "Leading a team"
    ],
    traitMapping: {
      "Solving a hard problem": ["logical", "disciplined"],
      "Creating something new": ["creative"],
      "Seeing people benefit from my work": ["people"],
      "Leading a team": ["leader", "people"]
    }
  },
  {
    id: 7,
    text: "Budget & location preference?",
    type: 'single-choice',
    options: [
      "Stay in city / family supports fees",
      "Need affordable options / scholarship",
      "Open to relocation for the right college"
    ],
    traitMapping: {
      "Stay in city / family supports fees": [], // No trait, just financial flag
      "Need affordable options / scholarship": [], // Financial constraint flag
      "Open to relocation for the right college": [] // No constraint
    }
  }
];

export const TOTAL_QUESTIONS = DEMO_QUESTIONS.length;
