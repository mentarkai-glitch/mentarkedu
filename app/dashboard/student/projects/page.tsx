'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Sparkles, FileText, Calendar, CheckCircle2, 
  Lightbulb, ExternalLink, Clock, Target, BookMarked,
  HelpCircle, TrendingUp, Download, Share2, AlertCircle,
  ListChecks
} from 'lucide-react';
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

  const subjects = getAllSubjects();

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubject(subjectId);
    const subject = getSubjectById(subjectId);
    setSubjectInfo(subject || null);
    if (subject && subject.commonProjectTypes.length > 0) {
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

    setLoading(true);
    setError('');
    setActiveTab('overview');

    try {
      const response = await fetch('/api/projects/helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      } else {
        setError(data.message || 'Failed to generate project help');
      }
    } catch (error) {
      console.error('Project help error:', error);
      setError('Failed to generate project help. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
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
                <div>
                  <Label className="text-slate-300 mb-2 block">Subject *</Label>
                  <Select value={selectedSubject} onValueChange={handleSubjectChange}>
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
                  disabled={loading || !selectedSubject || !description.trim()}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                      Generating Help...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Project Help
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
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
                  <Button variant="outline" className="border-yellow-500/30 text-yellow-400">
                    <Download className="w-4 h-4 mr-2" /> Export
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
