'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Sparkles, FileText, Calendar, CheckCircle2, 
  Lightbulb, ExternalLink, Clock, Target, BookMarked,
  HelpCircle, TrendingUp, Download, Share2, AlertCircle,
  ListChecks, History, FileCode
} from 'lucide-react';
import JSZip from 'jszip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getAllSubjects, getSubjectById, type SubjectInfo } from '@/lib/data/project-subjects';
import { toast } from 'sonner';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { generateProjectReport, downloadDocumentAsFile } from '@/lib/services/document-generation';

interface ProjectHelp {
  overview: string;
  breakdown?: any;
  step_by_step_plan?: any[];
  detailed_resources?: any;
  timeline?: any;
  evaluation_criteria?: any;
  answer_specific_questions?: Array<{ question: string; answer: string }>;
  sample_structure?: any;
  troubleshooting?: any;
  additional_tips?: string[];
}

type ProjectTemplate = {
  title: string;
  subjectId: string;
  projectType: string;
  description: string;
  requirements: string;
  gradeLevel: string;
};

type ProjectHistoryItem = {
  generatedAt: string;
  subjectId: string;
  projectType: string;
  description: string;
  requirements: string;
  deadline: string;
  gradeLevel: string;
  wordLimit: string;
  format: string;
  questions: string[];
  modelUsed?: string;
  help: ProjectHelp;
};

const FORM_STORAGE_KEY = 'mentark-project-helper-form-v1';
const HISTORY_STORAGE_KEY = 'mentark-project-helper-history-v1';
const MAX_HISTORY = 5;

const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    title: 'Physics Lab Report',
    subjectId: 'physics',
    projectType: 'Lab Report',
    description: 'Investigate the relationship between current and resistance using Ohm`s law with detailed observations.',
    requirements: 'Include hypothesis, materials list, data table, calculations, and error analysis.',
    gradeLevel: 'Grade 11',
  },
  {
    title: 'History Documentary',
    subjectId: 'history',
    projectType: 'Multimedia Presentation',
    description: 'Create a short documentary on causes and consequences of World War I with interviews and archival footage summary.',
    requirements: 'Include timeline, key events, primary sources, and reflective conclusion.',
    gradeLevel: 'Grade 10',
  },
  {
    title: 'Computer Science Capstone',
    subjectId: 'computer_science',
    projectType: 'Software Project',
    description: 'Design and prototype a mobile app that helps students track studying habits and mental wellbeing.',
    requirements: 'Needs feature list, user personas, wireframes, tech stack recommendation, and testing plan.',
    gradeLevel: 'Undergraduate',
  },
];

export default function ProjectsPage() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [projectType, setProjectType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [deadline, setDeadline] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [wordLimit, setWordLimit] = useState('');
  const [format, setFormat] = useState('');
  const [questions, setQuestions] = useState<string[]>(['']);
  const [projectHelp, setProjectHelp] = useState<ProjectHelp | null>(null);
  const [subjectInfo, setSubjectInfo] = useState<SubjectInfo | null>(null);
  const [error, setError] = useState('');
  const [modelUsed, setModelUsed] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const [history, setHistory] = useState<ProjectHistoryItem[]>([]);
  const [exporting, setExporting] = useState(false);

  const subjects = useMemo(() => getAllSubjects(), []);
  const displayHistory = useMemo(() => history.slice(0, MAX_HISTORY), [history]);

  const applyTemplate = (template: ProjectTemplate) => {
    handleSubjectChange(template.subjectId, false);
    setProjectType(template.projectType);
    setDescription(template.description);
    setRequirements(template.requirements);
    setGradeLevel(template.gradeLevel);
    setDeadline('');
    setWordLimit('');
    setFormat('');
    setQuestions(['']);
    setProjectHelp(null);
    setError('');
  };

  const handleHistoryLoad = (item: ProjectHistoryItem) => {
    handleSubjectChange(item.subjectId, false);
    setProjectType(item.projectType);
    setDescription(item.description);
    setRequirements(item.requirements);
    setDeadline(item.deadline);
    setGradeLevel(item.gradeLevel);
    setWordLimit(item.wordLimit);
    setFormat(item.format);
    setQuestions(item.questions.length ? item.questions : ['']);
    setProjectHelp(item.help);
    setModelUsed(item.modelUsed || '');
    setActiveTab('overview');
    setError('');
  };

  const handleExport = async () => {
    if (!projectHelp) return;
    setExporting(true);
    try {
      const zip = new JSZip();
      const overviewMd = `# Project Overview\n\n${projectHelp.overview}\n\n## Key Components\n\n${projectHelp.breakdown ? JSON.stringify(projectHelp.breakdown, null, 2) : 'N/A'}\n`;
      const planJson = {
        generatedAt: new Date().toISOString(),
        subject: subjectInfo?.name ?? selectedSubject,
        projectType,
        description,
        requirements,
        deadline,
        gradeLevel,
        wordLimit,
        format,
        questions,
        modelUsed,
        projectHelp,
      };
      zip.file('project-overview.md', overviewMd);
      zip.file('project-plan.json', JSON.stringify(planJson, null, 2));
      if (projectHelp.answer_specific_questions?.length) {
        zip.file('questions-and-answers.json', JSON.stringify(projectHelp.answer_specific_questions, null, 2));
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${(subjectInfo?.name || 'project').toLowerCase().replace(/\s+/g, '-')}-helper.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success('Project pack exported');
    } catch (err) {
      console.error('Export error', err);
      toast.error('Failed to export project pack');
    } finally {
      setExporting(false);
    }
  };

  const handleGenerateProjectReport = async () => {
    if (!projectHelp) {
      toast.error('Please generate project help first');
      return;
    }

    setGeneratingReport(true);
    try {
      toast.loading('Generating project report...', { id: 'project-report' });

      const projectData = {
        title: `${subjectInfo?.name || selectedSubject} - ${projectType}`,
        description,
        requirements,
        status: 'in_progress',
        start_date: new Date().toISOString(),
        end_date: deadline ? new Date(deadline).toISOString() : null,
        technologies: projectHelp.breakdown?.technologies || [],
        deliverables: projectHelp.step_by_step_plan?.map((step: any) => step.title || step) || [],
        metrics: {},
        challenges: projectHelp.troubleshooting ? [projectHelp.troubleshooting] : [],
        learnings: projectHelp.additional_tips || [],
      };

      const result = await generateProjectReport({
        project_data: projectData,
        format: 'pdf',
      });

      toast.success('Project report generated! Downloading...', { id: 'project-report' });
      await downloadDocumentAsFile(
        result.id,
        `project-report-${(subjectInfo?.name || 'project').toLowerCase().replace(/\s+/g, '-')}.pdf`
      );
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate project report', { id: 'project-report' });
    } finally {
      setGeneratingReport(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const storedForm = localStorage.getItem(FORM_STORAGE_KEY);
      if (storedForm) {
        const parsed = JSON.parse(storedForm) as {
          selectedSubject: string;
          projectType: string;
          description: string;
          requirements: string;
          deadline: string;
          gradeLevel: string;
          wordLimit: string;
          format: string;
          questions: string[];
        };
        setSelectedSubject(parsed.selectedSubject || '');
        setProjectType(parsed.projectType || '');
        setDescription(parsed.description || '');
        setRequirements(parsed.requirements || '');
        setDeadline(parsed.deadline || '');
        setGradeLevel(parsed.gradeLevel || '');
        setWordLimit(parsed.wordLimit || '');
        setFormat(parsed.format || '');
        setQuestions(parsed.questions?.length ? parsed.questions : ['']);
        if (parsed.selectedSubject) {
          const subject = getSubjectById(parsed.selectedSubject);
          setSubjectInfo(subject || null);
        }
      }

      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory) as ProjectHistoryItem[]);
      }
    } catch (err) {
      console.warn('Failed to restore project helper state', err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateStatus = () => setIsOnline(navigator.onLine);
    updateStatus();
    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        FORM_STORAGE_KEY,
        JSON.stringify({
          selectedSubject,
          projectType,
          description,
          requirements,
          deadline,
          gradeLevel,
          wordLimit,
          format,
          questions,
        })
      );
    } catch (err) {
      console.warn('Failed to persist project helper form', err);
    }
  }, [selectedSubject, projectType, description, requirements, deadline, gradeLevel, wordLimit, format, questions]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
    } catch (err) {
      console.warn('Failed to persist project helper history', err);
    }
  }, [history]);

  const handleSubjectChange = (subjectId: string, setDefaultType = true) => {
    setSelectedSubject(subjectId);
    const subject = getSubjectById(subjectId);
    setSubjectInfo(subject || null);
    if (setDefaultType && subject && subject.commonProjectTypes.length > 0) {
      setProjectType(subject.commonProjectTypes[0]);
    }
  };

  const handleAddQuestion = () => setQuestions([...questions, '']);
  const handleQuestionChange = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };
  const handleRemoveQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleGenerateHelp = async () => {
    if (!selectedSubject || !description.trim()) {
      setError('Please select a subject and provide a project description');
      return;
    }
    if (!isOnline) {
      setError('You appear to be offline. Reconnect to generate project help.');
      return;
    }

    setLoading(true);
    setError('');
    setActiveTab('overview');

    try {
      const response = await fetch('/api/projects/helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subject_id: selectedSubject,
          project_type: projectType || 'General',
          description: description.trim(),
          requirements: requirements.trim(),
          deadline: deadline.trim(),
          grade_level: gradeLevel.trim(),
          word_limit: wordLimit.trim(),
          format: format.trim(),
          specific_questions: questions.filter(q => q.trim().length > 0)
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setProjectHelp(data.data.project_help);
        setModelUsed(data.data.model_used);
        setSubjectInfo(getSubjectById(selectedSubject) || null);
        const historyItem: ProjectHistoryItem = {
          generatedAt: new Date().toISOString(),
          subjectId: selectedSubject,
          projectType: projectType || 'General',
          description: description.trim(),
          requirements: requirements.trim(),
          deadline: deadline.trim(),
          gradeLevel: gradeLevel.trim(),
          wordLimit: wordLimit.trim(),
          format: format.trim(),
          questions: questions.filter(q => q.trim().length > 0),
          modelUsed: data.data.model_used,
          help: data.data.project_help,
        };
        setHistory((prev) => [historyItem, ...prev.filter((item) => item.description !== historyItem.description)].slice(0, MAX_HISTORY));
        toast.success('Project plan generated successfully');
      } else {
        setError(data.message || 'Failed to generate project help');
      }
    } catch (error) {
      console.error('Project help error:', error);
      setError('Failed to generate project help. Please try again.');
      toast.error('Could not generate project plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <OfflineBanner
            isOnline={isOnline}
            message="You are offline. Project helper requests will queue until you reconnect."
            className="mb-4"
          />
          <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                <BookOpen className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  Project & Assignment Helper
                </h1>
                <p className="text-slate-400">AI-powered comprehensive assistance for all your academic projects</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
              {isOnline ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <span>Connected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-red-300">Offline &mdash; fill out details and retry once online</span>
                </>
              )}
            </div>
          </div>

          {error && !projectHelp && (
            <Alert className="mb-6 bg-red-500/10 border-red-500/30 text-red-200">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!projectHelp && (
            <Card className="bg-black border-yellow-500/50 mb-6">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Tell Us About Your Project
                </CardTitle>
                <CardDescription>Fill in the details to get personalized, detailed assistance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  {PROJECT_TEMPLATES.map((template) => (
                    <Button
                      key={template.title}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                      onClick={() => applyTemplate(template)}
                    >
                      <Sparkles className="w-3 h-3 mr-1" /> {template.title}
                    </Button>
                  ))}
                </div>

                <div>
                  <Label className="text-slate-300 mb-2 block">Subject *</Label>
                  <Select value={selectedSubject} onValueChange={(value) => handleSubjectChange(value)}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select a subject..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <span className="flex items-center gap-2">
                            <span>{subject.icon}</span>
                            <span>{subject.name}</span>
                            <Badge variant="outline" className="ml-2 text-xs">{subject.category}</Badge>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {subjectInfo && subjectInfo.commonProjectTypes.length > 0 && (
                  <div>
                    <Label className="text-slate-300 mb-2 block">Project Type</Label>
                    <Select value={projectType} onValueChange={setProjectType}>
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue placeholder="Select project type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectInfo.commonProjectTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                        <SelectItem value="custom">Custom / Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="description" className="text-slate-300 mb-2 block">Project Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project or assignment in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    className="bg-slate-800 border-slate-700 resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="requirements" className="text-slate-300 mb-2 block">Requirements</Label>
                    <Textarea
                      id="requirements"
                      placeholder="Any specific requirements or guidelines?"
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                      rows={3}
                      className="bg-slate-800 border-slate-700 resize-none"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deadline" className="text-slate-300 mb-2 block">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade_level" className="text-slate-300 mb-2 block">Grade / Class Level</Label>
                    <Input
                      id="grade_level"
                      placeholder="e.g., Class 10, Grade 12"
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="word_limit" className="text-slate-300 mb-2 block">Word Limit</Label>
                      <Input
                        id="word_limit"
                        placeholder="e.g., 1500 words"
                        value={wordLimit}
                        onChange={(e) => setWordLimit(e.target.value)}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="format" className="text-slate-300 mb-2 block">Format</Label>
                      <Input
                        id="format"
                        placeholder="e.g., Essay, Report"
                        value={format}
                        onChange={(e) => setFormat(e.target.value)}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-slate-300">Specific Questions (Optional)</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={handleAddQuestion} className="text-yellow-400 hover:text-yellow-500">
                      <HelpCircle className="w-4 h-4 mr-1" /> Add Question
                    </Button>
                  </div>
                  {questions.map((question, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder="What specific help do you need?"
                        value={question}
                        onChange={(e) => handleQuestionChange(index, e.target.value)}
                        className="bg-slate-800 border-slate-700 flex-1"
                      />
                      {questions.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveQuestion(index)} className="text-red-400">
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {error && (
                  <Alert className="bg-red-500/10 border-red-500/30">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <AlertDescription className="text-red-400">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleGenerateHelp}
                  disabled={loading || !selectedSubject || !description.trim() || !isOnline}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                      Generating Help...
                    </>
                  ) : isOnline ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Project Help
                    </>
                  ) : (
                    'Reconnect to generate'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {displayHistory.length > 0 && (
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2 text-slate-300">
                <History className="w-4 h-4 text-yellow-300" />
                <h2 className="text-lg font-semibold">Recent project plans</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayHistory.map((item, idx) => {
                  const subject = getSubjectById(item.subjectId);
                  return (
                    <Card key={`${item.generatedAt}-${idx}`} className="bg-slate-900/60 border-slate-800">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm text-slate-200 line-clamp-2">{item.description}</CardTitle>
                          {subject && <span className="text-2xl">{subject.icon}</span>}
                        </div>
                        <CardDescription className="text-xs text-slate-500">
                          {subject?.name ?? item.subjectId} • {item.projectType} • {new Date(item.generatedAt).toLocaleString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-xs text-slate-400 line-clamp-3">{item.help.overview}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/10"
                          onClick={() => handleHistoryLoad(item)}
                        >
                          Reopen plan
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-slate-900/50 border-yellow-500/30">
                  <CardContent className="pt-6">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && projectHelp && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {subjectInfo && (
                    <>
                      <div className="text-4xl">{subjectInfo.icon}</div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{subjectInfo.name} Project Help</h2>
                        {modelUsed && <p className="text-sm text-slate-400">Powered by {modelUsed}</p>}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-yellow-500/30 text-yellow-400"
                    onClick={handleExport}
                    disabled={exporting}
                  >
                    {exporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2" />
                        Preparing...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" /> Export Pack
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-500/30 text-green-400"
                    onClick={handleGenerateProjectReport}
                    disabled={generatingReport || !projectHelp}
                  >
                    {generatingReport ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileCode className="w-4 h-4 mr-2" /> Generate Report
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="border-slate-500/30 text-slate-400" onClick={() => {
                    setProjectHelp(null);
                    setDescription('');
                    setRequirements('');
                    setDeadline('');
                    setGradeLevel('');
                    setWordLimit('');
                    setFormat('');
                    setQuestions(['']);
                    setModelUsed('');
                    setActiveTab('overview');
                  }}>
                    New Project
                  </Button>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6 bg-slate-800 border-slate-700">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="steps">Steps</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
                  <TabsTrigger value="structure">Structure</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <Card className="bg-slate-900/50 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-yellow-400">Project Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 whitespace-pre-wrap mb-6">{projectHelp.overview}</p>
                      {projectHelp.breakdown && (
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                            <Label className="text-slate-400 mb-2 block">Difficulty</Label>
                            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50">
                              {projectHelp.breakdown.difficulty_assessment || 'Medium'}
                            </Badge>
                          </div>
                          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                            <Label className="text-slate-400 mb-2 block">Estimated Time</Label>
                            <p className="text-white font-semibold">{projectHelp.breakdown.estimated_time || '2-3 weeks'}</p>
                          </div>
                          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                            <Label className="text-slate-400 mb-2 block">Components</Label>
                            <p className="text-white font-semibold">{projectHelp.breakdown.key_components?.length || 0}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="steps" className="mt-6">
                  <Card className="bg-slate-900/50 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-yellow-400">Step-by-Step Plan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {projectHelp.step_by_step_plan && projectHelp.step_by_step_plan.length > 0 ? (
                        <div className="space-y-6">
                          {projectHelp.step_by_step_plan.map((step: any, idx: number) => (
                            <div key={idx} className="relative">
                              <div className="absolute left-0 top-0 w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center font-bold text-black">
                                {step.step_number || idx + 1}
                              </div>
                              <div className="ml-14 p-5 bg-slate-800 rounded-lg border border-slate-700">
                                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                                <p className="text-slate-300 mb-4 whitespace-pre-wrap">{step.description}</p>
                                {step.tips && step.tips.length > 0 && (
                                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                                    <Label className="text-yellow-400 text-sm mb-2 block">Tips</Label>
                                    <ul className="list-disc list-inside space-y-1 text-slate-300 text-sm">
                                      {step.tips.map((tip: string, tidx: number) => (
                                        <li key={tidx}>{tip}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-8">No step-by-step plan available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="resources" className="mt-6">
                  <Card className="bg-slate-900/50 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-yellow-400">Resources & Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {subjectInfo && (
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                          <div>
                            <Label className="text-slate-400 mb-2 block">Websites</Label>
                            {subjectInfo.resources.websites.map((site, idx) => (
                              <div key={idx} className="p-2 bg-slate-800 rounded border border-slate-700 text-sm text-slate-300 mb-2">
                                {site}
                              </div>
                            ))}
                          </div>
                          <div>
                            <Label className="text-slate-400 mb-2 block">Tools</Label>
                            {subjectInfo.resources.tools.map((tool, idx) => (
                              <div key={idx} className="p-2 bg-slate-800 rounded border border-slate-700 text-sm text-slate-300 mb-2">
                                {tool}
                              </div>
                            ))}
                          </div>
                          <div>
                            <Label className="text-slate-400 mb-2 block">Platforms</Label>
                            {subjectInfo.resources.platforms.map((platform, idx) => (
                              <div key={idx} className="p-2 bg-slate-800 rounded border border-slate-700 text-sm text-slate-300 mb-2">
                                {platform}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {projectHelp.detailed_resources && (
                        <div className="text-slate-300 whitespace-pre-wrap">
                          {JSON.stringify(projectHelp.detailed_resources, null, 2)}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline" className="mt-6">
                  <Card className="bg-slate-900/50 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-yellow-400">Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {projectHelp.timeline ? (
                        <div className="text-slate-300 whitespace-pre-wrap">
                          {JSON.stringify(projectHelp.timeline, null, 2)}
                        </div>
                      ) : (
                        <p className="text-slate-400">No timeline available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="evaluation" className="mt-6">
                  <Card className="bg-slate-900/50 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-yellow-400">Evaluation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {projectHelp.evaluation_criteria ? (
                        <div className="text-slate-300 whitespace-pre-wrap">
                          {JSON.stringify(projectHelp.evaluation_criteria, null, 2)}
                        </div>
                      ) : (
                        <p className="text-slate-400">No evaluation criteria available</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="structure" className="mt-6">
                  <Card className="bg-slate-900/50 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-yellow-400">Structure</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {projectHelp.sample_structure ? (
                        <div className="text-slate-300 whitespace-pre-wrap">
                          {JSON.stringify(projectHelp.sample_structure, null, 2)}
                        </div>
                      ) : (
                        <p className="text-slate-400">No structure information available</p>
                      )}
                      {projectHelp.answer_specific_questions && projectHelp.answer_specific_questions.length > 0 && (
                        <div className="mt-6">
                          <Label className="text-yellow-400 mb-4 block">Answers to Your Questions</Label>
                          {projectHelp.answer_specific_questions.map((qa, idx) => (
                            <div key={idx} className="p-5 bg-slate-800 rounded-lg border border-slate-700 mb-4">
                              <h4 className="font-semibold text-yellow-400 mb-2">Q: {qa.question}</h4>
                              <p className="text-slate-300 text-sm whitespace-pre-wrap">{qa.answer}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
