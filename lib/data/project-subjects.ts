/**
 * Project & Assignment Helper - Subject Data
 * Comprehensive subject information for AI-powered project assistance
 */

export interface SubjectInfo {
  id: string;
  name: string;
  category: 'STEM' | 'Language' | 'Social Science' | 'Arts' | 'Computer Science' | 'General';
  icon: string;
  commonProjectTypes: string[];
  assessmentMethods: string[];
  typicalFormats: string[];
  keySkills: string[];
  resources: {
    websites: string[];
    tools: string[];
    platforms: string[];
  };
  projectTemplates: ProjectTemplate[];
}

export interface ProjectTemplate {
  type: string;
  description: string;
  structure: {
    sections: Array<{
      name: string;
      description: string;
      required: boolean;
    }>;
  };
  suggestedSteps: string[];
  evaluationCriteria: string[];
}

export const subjects: SubjectInfo[] = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    category: 'STEM',
    icon: '🧮',
    commonProjectTypes: [
      'Mathematical Modeling',
      'Real-world Problem Solving',
      'Data Analysis',
      'Geometry Construction',
      'Statistics Project',
      'Number Theory Research',
      'Mathematical Proof',
      'Algorithm Design'
    ],
    assessmentMethods: ['Problem-solving accuracy', 'Methodology clarity', 'Real-world application', 'Presentation'],
    typicalFormats: ['Report with calculations', 'Presentation with graphs', 'Mathematical proof', 'Model demonstration'],
    keySkills: ['Logical reasoning', 'Problem solving', 'Data analysis', 'Mathematical communication'],
    resources: {
      websites: ['Wolfram Alpha', 'Desmos', 'Khan Academy', 'Mathway', 'GeoGebra'],
      tools: ['Calculator', 'Graphing software', 'Excel/Sheets', 'Python/Matlab'],
      platforms: ['Desmos', 'GeoGebra', 'Wolfram Mathematica', 'Jupyter Notebooks']
    },
    projectTemplates: [
      {
        type: 'Mathematical Modeling',
        description: 'Create a model to solve a real-world problem',
        structure: {
          sections: [
            { name: 'Problem Statement', description: 'Clear problem definition', required: true },
            { name: 'Mathematical Setup', description: 'Variables, equations, assumptions', required: true },
            { name: 'Solution Method', description: 'Step-by-step solving process', required: true },
            { name: 'Results & Analysis', description: 'Numerical results and interpretation', required: true },
            { name: 'Conclusion', description: 'Summary and real-world implications', required: true }
          ]
        },
        suggestedSteps: [
          'Identify a real-world problem',
          'Define variables and parameters',
          'Formulate mathematical equations',
          'Solve using appropriate methods',
          'Validate results',
          'Create visualizations',
          'Write comprehensive report'
        ],
        evaluationCriteria: [
          'Mathematical accuracy',
          'Problem complexity',
          'Real-world relevance',
          'Clarity of explanation',
          'Use of appropriate tools'
        ]
      }
    ]
  },
  {
    id: 'physics',
    name: 'Physics',
    category: 'STEM',
    icon: '⚛️',
    commonProjectTypes: [
      'Experiment & Lab Report',
      'Theoretical Analysis',
      'Engineering Design',
      'Research Paper',
      'Demonstration Project',
      'Simulation Model'
    ],
    assessmentMethods: ['Scientific method', 'Data accuracy', 'Analysis depth', 'Presentation quality'],
    typicalFormats: ['Lab report', 'Research paper', 'Presentation with demos', 'Poster presentation'],
    keySkills: ['Experimental design', 'Data collection', 'Analysis', 'Scientific writing'],
    resources: {
      websites: ['PhET Simulations', 'Physics Classroom', 'Khan Academy', 'HyperPhysics'],
      tools: ['Lab equipment', 'Data logger', 'Simulation software', 'Python/Matlab'],
      platforms: ['PhET', 'CERN Open Data', 'NASA Education', 'Vernier Logger Pro']
    },
    projectTemplates: [
      {
        type: 'Lab Experiment',
        description: 'Design and conduct a physics experiment',
        structure: {
          sections: [
            { name: 'Introduction', description: 'Theory and hypothesis', required: true },
            { name: 'Methodology', description: 'Experimental procedure', required: true },
            { name: 'Data & Observations', description: 'Raw data tables and graphs', required: true },
            { name: 'Analysis', description: 'Calculations and error analysis', required: true },
            { name: 'Conclusion', description: 'Findings and discussion', required: true }
          ]
        },
        suggestedSteps: [
          'Formulate research question',
          'Review relevant theory',
          'Design experiment',
          'Collect data',
          'Analyze results',
          'Calculate uncertainties',
          'Write report'
        ],
        evaluationCriteria: [
          'Experimental design quality',
          'Data accuracy',
          'Error analysis',
          'Understanding of concepts',
          'Report clarity'
        ]
      }
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    category: 'STEM',
    icon: '🧪',
    commonProjectTypes: [
      'Laboratory Experiment',
      'Chemical Analysis',
      'Research Investigation',
      'Environmental Study',
      'Synthesis Project'
    ],
    assessmentMethods: ['Lab safety', 'Experimental accuracy', 'Chemical understanding', 'Report quality'],
    typicalFormats: ['Lab report', 'Research paper', 'Poster', 'Presentation'],
    keySkills: ['Laboratory techniques', 'Chemical analysis', 'Safety protocols', 'Scientific writing'],
    resources: {
      websites: ['ChemCollective', 'ACS Education', 'Royal Society of Chemistry', 'Khan Academy'],
      tools: ['Lab equipment', 'Chemical reagents', 'Spectrophotometer', 'Simulation software'],
      platforms: ['ChemCollective Virtual Labs', 'PhET Chemistry', 'Molecular Workbench']
    },
    projectTemplates: []
  },
  {
    id: 'biology',
    name: 'Biology',
    category: 'STEM',
    icon: '🔬',
    commonProjectTypes: [
      'Field Study',
      'Laboratory Investigation',
      'Research Project',
      'Ecosystem Analysis',
      'Microbiology Study'
    ],
    assessmentMethods: ['Observation skills', 'Scientific method', 'Biological understanding', 'Presentation'],
    typicalFormats: ['Research paper', 'Lab report', 'Field study report', 'Poster'],
    keySkills: ['Observation', 'Microscopy', 'Data collection', 'Scientific writing'],
    resources: {
      websites: ['BioInteractive', 'Khan Academy', 'Crash Course Biology', 'Nature Education'],
      tools: ['Microscope', 'Field equipment', 'Data logger', 'Lab supplies'],
      platforms: ['HHMI BioInteractive', 'Virtual Biology Lab', 'Explore Learning']
    },
    projectTemplates: []
  },
  {
    id: 'computer_science',
    name: 'Computer Science',
    category: 'Computer Science',
    icon: '💻',
    commonProjectTypes: [
      'Software Development',
      'Web Application',
      'Mobile App',
      'Algorithm Implementation',
      'Data Science Project',
      'AI/ML Project'
    ],
    assessmentMethods: ['Code quality', 'Functionality', 'Problem-solving', 'Documentation'],
    typicalFormats: ['Working application', 'Code repository', 'Documentation', 'Presentation'],
    keySkills: ['Programming', 'Problem-solving', 'System design', 'Testing'],
    resources: {
      websites: ['GitHub', 'Stack Overflow', 'MDN Web Docs', 'W3Schools', 'LeetCode'],
      tools: ['IDE (VS Code, PyCharm)', 'Git', 'Testing frameworks', 'API tools'],
      platforms: ['GitHub', 'Replit', 'CodePen', 'Kaggle', 'Google Colab']
    },
    projectTemplates: [
      {
        type: 'Software Development',
        description: 'Build a functional software application',
        structure: {
          sections: [
            { name: 'Requirements', description: 'Project goals and specifications', required: true },
            { name: 'Design', description: 'System architecture and UI mockups', required: true },
            { name: 'Implementation', description: 'Code with comments', required: true },
            { name: 'Testing', description: 'Test cases and results', required: true },
            { name: 'Documentation', description: 'User guide and code documentation', required: true }
          ]
        },
        suggestedSteps: [
          'Define requirements',
          'Plan system architecture',
          'Set up development environment',
          'Implement core features',
          'Write tests',
          'Debug and optimize',
          'Create documentation',
          'Deploy and demo'
        ],
        evaluationCriteria: [
          'Functionality',
          'Code quality',
          'Problem-solving approach',
          'Testing coverage',
          'Documentation clarity'
        ]
      }
    ]
  },
  {
    id: 'english',
    name: 'English',
    category: 'Language',
    icon: '📝',
    commonProjectTypes: [
      'Essay Writing',
      'Creative Writing',
      'Literary Analysis',
      'Research Paper',
      'Presentation',
      'Portfolio'
    ],
    assessmentMethods: ['Writing quality', 'Grammar', 'Creativity', 'Critical thinking'],
    typicalFormats: ['Essay', 'Creative piece', 'Research paper', 'Presentation', 'Portfolio'],
    keySkills: ['Writing', 'Analysis', 'Research', 'Critical thinking'],
    resources: {
      websites: ['Purdue OWL', 'Grammarly', 'Merriam-Webster', 'Project Gutenberg'],
      tools: ['Word processor', 'Grammar checker', 'Citation tool', 'Mind mapping'],
      platforms: ['Google Docs', 'Grammarly', 'Zotero', 'Canva']
    },
    projectTemplates: [
      {
        type: 'Essay Writing',
        description: 'Write a well-structured essay',
        structure: {
          sections: [
            { name: 'Introduction', description: 'Hook, context, thesis statement', required: true },
            { name: 'Body Paragraphs', description: 'Supporting arguments with evidence', required: true },
            { name: 'Counterarguments', description: 'Address opposing views', required: false },
            { name: 'Conclusion', description: 'Summary and final thoughts', required: true },
            { name: 'Bibliography', description: 'Sources and citations', required: true }
          ]
        },
        suggestedSteps: [
          'Understand the prompt',
          'Research the topic',
          'Create outline',
          'Write first draft',
          'Revise and edit',
          'Proofread',
          'Format and cite sources'
        ],
        evaluationCriteria: [
          'Thesis clarity',
          'Argument strength',
          'Evidence quality',
          'Writing style',
          'Grammar and mechanics'
        ]
      }
    ]
  },
  {
    id: 'history',
    name: 'History',
    category: 'Social Science',
    icon: '📜',
    commonProjectTypes: [
      'Research Paper',
      'Historical Analysis',
      'Timeline Project',
      'Documentary',
      'Primary Source Analysis'
    ],
    assessmentMethods: ['Research depth', 'Historical accuracy', 'Analysis', 'Presentation'],
    typicalFormats: ['Research paper', 'Presentation', 'Documentary', 'Timeline', 'Poster'],
    keySkills: ['Research', 'Analysis', 'Critical thinking', 'Historical perspective'],
    resources: {
      websites: ['Library of Congress', 'National Archives', 'JSTOR', 'History.com'],
      tools: ['Citation manager', 'Timeline tools', 'Video editing', 'Presentation software'],
      platforms: ['Prezi', 'Timeline JS', 'Canva', 'YouTube']
    },
    projectTemplates: []
  },
  {
    id: 'geography',
    name: 'Geography',
    category: 'Social Science',
    icon: '🗺️',
    commonProjectTypes: [
      'Field Study',
      'Map Analysis',
      'Case Study',
      'Environmental Report',
      'Geographic Information System (GIS)'
    ],
    assessmentMethods: ['Geographic understanding', 'Data analysis', 'Field work', 'Presentation'],
    typicalFormats: ['Report', 'Maps and diagrams', 'Presentation', 'Poster'],
    keySkills: ['Map reading', 'Data analysis', 'Field observation', 'Spatial thinking'],
    resources: {
      websites: ['National Geographic', 'Google Earth', 'World Bank Data', 'UN Data'],
      tools: ['Maps', 'GPS', 'GIS software', 'Data visualization tools'],
      platforms: ['Google Earth', 'ArcGIS Online', 'Tableau Public', 'QGIS']
    },
    projectTemplates: []
  },
  {
    id: 'economics',
    name: 'Economics',
    category: 'Social Science',
    icon: '💰',
    commonProjectTypes: [
      'Market Analysis',
      'Case Study',
      'Data Analysis',
      'Economic Model',
      'Policy Analysis'
    ],
    assessmentMethods: ['Economic understanding', 'Data analysis', 'Critical thinking', 'Presentation'],
    typicalFormats: ['Report', 'Presentation', 'Data visualization', 'Case study'],
    keySkills: ['Data analysis', 'Economic reasoning', 'Graphical analysis', 'Research'],
    resources: {
      websites: ['World Bank', 'IMF', 'FRED Economic Data', 'Trading Economics'],
      tools: ['Excel/Sheets', 'Statistical software', 'Graphing tools', 'Research databases'],
      platforms: ['FRED', 'Tableau', 'Bloomberg Terminal', 'Stata']
    },
    projectTemplates: []
  },
  {
    id: 'art',
    name: 'Art',
    category: 'Arts',
    icon: '🎨',
    commonProjectTypes: [
      'Art Portfolio',
      'Creative Project',
      'Art History Research',
      'Mixed Media',
      'Digital Art'
    ],
    assessmentMethods: ['Creativity', 'Technique', 'Conceptual understanding', 'Presentation'],
    typicalFormats: ['Portfolio', 'Exhibition', 'Presentation', 'Artist statement'],
    keySkills: ['Creative expression', 'Technical skills', 'Artistic analysis', 'Presentation'],
    resources: {
      websites: ['Artsy', 'MoMA Learning', 'Tate Kids', 'Google Arts & Culture'],
      tools: ['Art supplies', 'Digital art software', 'Camera', 'Photo editing'],
      platforms: ['Procreate', 'Adobe Creative Suite', 'Canva', 'Behance']
    },
    projectTemplates: []
  }
];

export function getSubjectById(id: string): SubjectInfo | undefined {
  return subjects.find(s => s.id === id);
}

export function getSubjectsByCategory(category: SubjectInfo['category']): SubjectInfo[] {
  return subjects.filter(s => s.category === category);
}

export function getAllSubjects(): SubjectInfo[] {
  return subjects;
}
