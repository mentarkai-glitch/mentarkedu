'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { Target, Upload, FileText, Calendar, Brain, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { TabNav } from '@/components/ui/tab-nav';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PageLayout, PageHeader, PageContainer } from '@/components/layout/PageLayout';
import { Spinner, CardSkeleton } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';

interface KnowledgeGap {
  topic: string;
  importance: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: string;
  priority: number;
  dependencies?: string[];
}

interface StudyPlanDay {
  day: number;
  topics: string[];
  timeRequired: string;
  resources: Array<{
    type: string;
    title: string;
    url?: string;
  }>;
  focus: string;
}

interface StudyPlan {
  duration: number;
  topics: StudyPlanDay[];
  recommendations: string[];
  expectedOutcome: string;
}

const FALLBACK_GAPS: KnowledgeGap[] = [
  {
    topic: 'Electrostatics fundamentals',
    importance: 'critical',
    estimatedTime: '3 hours',
    priority: 1,
    dependencies: ['Coulomb’s law refresher'],
  },
  {
    topic: 'Differential equations practice',
    importance: 'high',
    estimatedTime: '2 hours',
    priority: 2,
    dependencies: ['Derivative basics'],
  },
  {
    topic: 'Organic chemistry named reactions',
    importance: 'medium',
    estimatedTime: '90 minutes',
    priority: 3,
  },
];

const FALLBACK_SUMMARY =
  'We could not reach the AI planner just now, so here is a starter gap list based on popular Indian entrance prep weak spots.';

const FALLBACK_PLAN: StudyPlan = {
  duration: 7,
  topics: [
    {
      day: 1,
      topics: ['Electrostatics fundamentals'],
      timeRequired: '3 hours',
      resources: [
        {
          type: 'video',
          title: 'NTA JEE: Electrostatics crash session',
          url: 'https://www.youtube.com/results?search_query=jee+electrostatics+crash+course',
        },
        {
          type: 'notes',
          title: 'NCERT XI Physics Chapter 2 quick revision',
        },
      ],
      focus: 'Revisit charge, electric field, and superposition examples relevant to the JEE pattern.',
    },
    {
      day: 2,
      topics: ['Differential equations practice'],
      timeRequired: '2 hours',
      resources: [
        {
          type: 'practice',
          title: 'Aakash PYQ problem set',
          url: 'https://www.google.com/search?q=aakash+differential+equations+jee+pyq',
        },
      ],
      focus: 'Solve first-order problems and verify steps with worked solutions.',
    },
    {
      day: 3,
      topics: ['Organic chemistry named reactions'],
      timeRequired: '1.5 hours',
      resources: [
        {
          type: 'flashcards',
          title: 'Named reaction mnemonic deck',
          url: 'https://www.google.com/search?q=organic+named+reactions+flashcards',
        },
      ],
      focus: 'Memorise mechanisms and map them to likely exam questions.',
    },
  ],
  recommendations: [
    'Spread revision into 45-minute focus blocks with 10-minute breaks.',
    'Log each study session in Mentark so Daily Assistant can rebalance your week.',
    'If a topic still feels unclear, drop it into Ask Mentark for quick micro-plans.',
  ],
  expectedOutcome: 'Better confidence across three high-leverage topics before mock tests.',
};

export default function StudyWorkspacePage() {
  const [tab, setTab] = useState('analyze');
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<Array<{ content: string; type: string; subject: string }>>([]);
  const [currentMaterial, setCurrentMaterial] = useState({ content: '', type: 'notes', subject: '' });
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [summary, setSummary] = useState('');
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [constraints, setConstraints] = useState({
    availableHoursPerDay: 4,
    urgency: 'medium' as 'low' | 'medium' | 'high',
    preferredLearningStyle: 'mixed',
  });

  const handleAddMaterial = () => {
    if (currentMaterial.content && currentMaterial.subject) {
      setMaterials((prev) => [...prev, currentMaterial]);
      setCurrentMaterial({ content: '', type: 'notes', subject: '' });
    }
  };

  const handleAnalyzeGaps = async () => {
    if (materials.length === 0) return;

    setLoading(true);
    let appliedFallback = false;

    const applyFallbackAnalysis = (reason?: string) => {
      setGaps(FALLBACK_GAPS);
      setSummary(`${FALLBACK_SUMMARY}${reason ? ` (${reason})` : ''}`);
      setTab('gaps');
      toast.info('Using offline gap template so you can keep planning.');
      appliedFallback = true;
    };

    try {
      const response = await fetch('/api/study-analyzer/gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materials }),
      });

      const data = await response.json().catch(() => null);
      if (response.ok && data?.success && Array.isArray(data.data?.gaps) && data.data.gaps.length > 0) {
        setGaps(data.data.gaps);
        setSummary(data.data.summary);
        setTab('gaps');
      } else {
        applyFallbackAnalysis(data?.error || `status_${response.status}`);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      applyFallbackAnalysis('network_error');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (gaps.length === 0) return;

    setLoading(true);
    let appliedFallback = false;

    const applyFallbackPlan = (reason?: string) => {
      setPlan(FALLBACK_PLAN);
      setTab('plan');
      toast.info('Serving a 7-day sample plan while the planner reconnects.', {
        description: reason ? `Reason: ${reason}` : undefined,
      });
      appliedFallback = true;
    };

    try {
      const response = await fetch('/api/study-analyzer/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gaps, constraints }),
      });

      const data = await response.json().catch(() => null);
      if (response.ok && data?.success) {
        setPlan(data.data);
        setTab('plan');
      } else {
        applyFallbackPlan(data?.error || `status_${response.status}`);
      }
    } catch (error) {
      console.error('Plan generation error:', error);
      applyFallbackPlan('network_error');
    } finally {
      setLoading(false);
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium':
        return 'bg-gold-500/20 text-gold-400 border-gold-500/50';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-card/20 text-muted-foreground border-border/50';
    }
  };

  return (
    <PageLayout containerWidth="wide" padding="desktop" maxWidth="6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <PageHeader
          title="Study Workspace"
          description="Upload materials, identify knowledge gaps, and generate AI-guided study plans"
          icon={<Target className="w-8 h-8 text-gold" />}
        />

        <PageContainer spacing="md">

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabNav
              items={[
                { value: 'analyze', label: 'Upload', icon: <span className="text-base">📝</span> },
                { value: 'gaps', label: 'Gaps', icon: <span className="text-base">🎯</span>, disabled: gaps.length === 0 },
                { value: 'plan', label: 'Plan', icon: <span className="text-base">📅</span>, disabled: !plan }
              ]}
              value={tab}
              onValueChange={setTab}
              fullWidth
              variant="default"
              size="md"
            />

            <TabsContent value="analyze" className="mt-6">
              <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-gold/40 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gold-400">Step 1: Upload Your Study Materials</CardTitle>
                  <CardDescription>Add your notes, syllabus, or textbook content for AI analysis.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="w-full min-w-0">
                      <Label htmlFor="subject" className="text-sm">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Physics, Math"
                        value={currentMaterial.subject}
                        onChange={(event) => setCurrentMaterial({ ...currentMaterial, subject: event.target.value })}
                        className="bg-card border-border w-full text-sm sm:text-base"
                      />
                    </div>
                    <div className="w-full min-w-0">
                      <Label htmlFor="type" className="text-sm">
                        Type
                      </Label>
                      <Select
                        value={currentMaterial.type}
                        onValueChange={(value) => setCurrentMaterial({ ...currentMaterial, type: value })}
                      >
                        <SelectTrigger className="bg-card border-border w-full text-sm sm:text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notes">Notes</SelectItem>
                          <SelectItem value="syllabus">Syllabus</SelectItem>
                          <SelectItem value="textbook">Textbook</SelectItem>
                          <SelectItem value="lecture">Lecture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Paste your study content here..."
                      rows={6}
                      value={currentMaterial.content}
                      onChange={(event) => setCurrentMaterial({ ...currentMaterial, content: event.target.value })}
                      className="bg-card border-border font-mono text-sm"
                    />
                  </div>

                  <Button
                    onClick={handleAddMaterial}
                    className="w-full bg-gradient-to-r from-gold-500 to-orange-500 hover:from-gold-600 hover:to-orange-600 text-black font-semibold"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add Material
                  </Button>

                  {materials.length > 0 && (
                    <div className="space-y-2">
                      <Label>Added Materials ({materials.length})</Label>
                      {materials.map((material, index) => (
                        <div
                          key={`${material.subject}-${index}`}
                          className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gold-400" />
                            <span className="text-sm font-medium">{material.subject}</span>
                            <Badge variant="outline" className="text-xs">
                              {material.type}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setMaterials(materials.filter((_, i) => i !== index))}>
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyzeGaps}
                    disabled={materials.length === 0 || loading}
                    className="w-full bg-gradient-to-r from-gold-500 to-orange-500 hover:from-gold-600 hover:to-orange-600 text-black font-semibold"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    {loading ? 'Analyzing...' : 'Analyze Knowledge Gaps'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gaps" className="mt-6">
              <Card className="bg-card/50 border-gold-500/30">
                <CardHeader>
                  <CardTitle className="text-gold-400">Step 2: Knowledge Gap Analysis</CardTitle>
                  <CardDescription>{summary || 'Review identified gaps and generate your study plan.'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {gaps.map((gap, index) => (
                    <div key={`${gap.topic}-${index}`} className="p-4 bg-card rounded-lg border border-border">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-foreground">{gap.topic}</h3>
                        <Badge className={getImportanceColor(gap.importance)}>{gap.importance}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">⏱️ {gap.estimatedTime} • Priority: {gap.priority}</p>
                      {gap.dependencies && gap.dependencies.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-muted-foreground">Prerequisites: </span>
                          <span className="text-xs text-muted-foreground">{gap.dependencies.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/30">
                    <div>
                      <Label>Hours/Day</Label>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        value={constraints.availableHoursPerDay}
                        onChange={(event) => setConstraints({ ...constraints, availableHoursPerDay: parseInt(event.target.value, 10) })}
                        className="bg-card border-border"
                      />
                    </div>
                    <div>
                      <Label>Urgency</Label>
                      <Select
                        value={constraints.urgency}
                        onValueChange={(value: 'low' | 'medium' | 'high') => setConstraints({ ...constraints, urgency: value })}
                      >
                        <SelectTrigger className="bg-card border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Learning Style</Label>
                      <Select
                        value={constraints.preferredLearningStyle}
                        onValueChange={(value) => setConstraints({ ...constraints, preferredLearningStyle: value })}
                      >
                        <SelectTrigger className="bg-card border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mixed">Mixed</SelectItem>
                          <SelectItem value="visual">Visual</SelectItem>
                          <SelectItem value="reading">Reading</SelectItem>
                          <SelectItem value="practice">Practice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleGeneratePlan}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-gold-500 to-orange-500 hover:from-gold-600 hover:to-orange-600 text-black font-semibold"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {loading ? 'Generating Plan...' : 'Generate 7-Day Study Plan'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plan" className="mt-6">
              {plan && (
                <div className="space-y-6">
                  <Card className="bg-gradient-to-br from-gold-500/10 to-orange-500/10 border-gold-500/30">
                    <CardHeader>
                      <CardTitle className="text-gold-400">🎯 Expected Outcome</CardTitle>
                      <CardDescription>{plan.expectedOutcome}</CardDescription>
                    </CardHeader>
                  </Card>

                  {plan.topics.map((day, index) => (
                    <Card key={`plan-day-${day.day}-${index}`} className="bg-card/50 border-gold-500/30">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-gold-400">Day {day.day}</CardTitle>
                          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">
                            <Clock className="w-3 h-3 mr-1" />
                            {day.timeRequired}
                          </Badge>
                        </div>
                        <CardDescription>{day.focus}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <Label className="text-sm font-semibold mb-2 block">Topics to Cover</Label>
                          <div className="flex flex-wrap gap-2">
                            {day.topics.map((topic, topicIndex) => (
                              <Badge key={`${topic}-${topicIndex}`} variant="outline" className="bg-card">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {day.resources.length > 0 && (
                          <div>
                            <Label className="text-sm font-semibold mb-2 block">📚 Recommended Resources</Label>
                            <div className="space-y-2">
                              {day.resources.map((resource, resourceIndex) => (
                                <div
                                  key={`${resource.title}-${resourceIndex}`}
                                  className="flex items-center gap-2 p-2 bg-card rounded border border-border"
                                >
                                  <FileText className="w-4 h-4 text-gold-400" />
                                  <span className="text-sm">{resource.title}</span>
                                  {resource.url && (
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-auto text-gold-400 hover:text-gold-300 text-xs"
                                    >
                                      View →
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  <Card className="bg-card/50 border-gold-500/30">
                    <CardHeader>
                      <CardTitle className="text-gold-400">💡 Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        {plan.recommendations.map((recommendation, index) => (
                          <li key={`${recommendation}-${index}`} className="text-sm">
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Card className="mt-8 bg-card/60 border-gold-500/20">
            <CardHeader>
              <CardTitle className="text-gold-400">Need deeper analytics?</CardTitle>
              <CardDescription>
                Visit the Study Analyzer for live signals, session logging, and AI recommendations tailored to your current path.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground flex-1 min-w-[200px]">
                Log deep-work blocks, monitor mastery trends, and let Mentark suggest your next move.
              </p>
              <Link href="/dashboard/student/study-analyzer">
                <Button className="bg-gradient-to-r from-gold-500 to-orange-500 text-black font-semibold hover:from-gold-400 hover:to-orange-400">
                  Open Study Analyzer
                </Button>
              </Link>
            </CardContent>
          </Card>
        </PageContainer>
      </motion.div>
    </PageLayout>
  );
}
