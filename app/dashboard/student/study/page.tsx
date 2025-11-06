'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Upload, FileText, Calendar, TrendingUp, Brain, Download, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

export default function StudyAnalyzerPage() {
  const [tab, setTab] = useState('analyze');
  const [loading, setLoading] = useState(false);
  
  // Analyze state
  const [materials, setMaterials] = useState<Array<{ content: string; type: string; subject: string }>>([]);
  const [currentMaterial, setCurrentMaterial] = useState({ content: '', type: 'notes', subject: '' });
  const [gaps, setGaps] = useState<KnowledgeGap[]>([]);
  const [summary, setSummary] = useState('');
  
  // Plan state
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [constraints, setConstraints] = useState({
    availableHoursPerDay: 4,
    urgency: 'medium' as 'low' | 'medium' | 'high',
    preferredLearningStyle: 'mixed',
  });

  const handleAddMaterial = () => {
    if (currentMaterial.content && currentMaterial.subject) {
      setMaterials([...materials, currentMaterial]);
      setCurrentMaterial({ content: '', type: 'notes', subject: '' });
    }
  };

  const handleAnalyzeGaps = async () => {
    if (materials.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/study-analyzer/gaps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materials }),
      });
      
      const data = await response.json();
      if (data.success) {
        setGaps(data.data.gaps);
        setSummary(data.data.summary);
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (gaps.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/study-analyzer/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gaps, constraints }),
      });
      
      const data = await response.json();
      if (data.success) {
        setPlan(data.data);
        setTab('plan');
      }
    } catch (error) {
      console.error('Plan generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
              <Target className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                Study Analyzer
              </h1>
              <p className="text-slate-400">AI-powered gap detection & personalized study plans</p>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 border border-yellow-500/30">
              <TabsTrigger value="analyze">📝 Upload Materials</TabsTrigger>
              <TabsTrigger value="gaps" disabled={gaps.length === 0}>
                🎯 Knowledge Gaps
              </TabsTrigger>
              <TabsTrigger value="plan" disabled={!plan}>
                📅 Study Plan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analyze" className="mt-6">
              <Card className="bg-slate-900/50 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Step 1: Upload Your Study Materials</CardTitle>
                  <CardDescription>Add your notes, syllabus, or textbook content for AI analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="e.g., Physics, Math"
                        value={currentMaterial.subject}
                        onChange={(e) => setCurrentMaterial({ ...currentMaterial, subject: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select
                        value={currentMaterial.type}
                        onValueChange={(value) => setCurrentMaterial({ ...currentMaterial, type: value })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700">
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
                      onChange={(e) => setCurrentMaterial({ ...currentMaterial, content: e.target.value })}
                      className="bg-slate-800 border-slate-700 font-mono text-sm"
                    />
                  </div>

                  <Button
                    onClick={handleAddMaterial}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add Material
                  </Button>

                  {materials.length > 0 && (
                    <div className="space-y-2">
                      <Label>Added Materials ({materials.length})</Label>
                      {materials.map((mat, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm font-medium">{mat.subject}</span>
                            <Badge variant="outline" className="text-xs">
                              {mat.type}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setMaterials(materials.filter((_, i) => i !== idx))}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={handleAnalyzeGaps}
                    disabled={materials.length === 0 || loading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    {loading ? 'Analyzing...' : 'Analyze Knowledge Gaps'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gaps" className="mt-6">
              <Card className="bg-slate-900/50 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Step 2: Knowledge Gap Analysis</CardTitle>
                  <CardDescription>{summary || 'Review identified gaps and generate your study plan'}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {gaps.map((gap, idx) => (
                    <div key={idx} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-lg text-white">{gap.topic}</h3>
                        <Badge className={getImportanceColor(gap.importance)}>
                          {gap.importance}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-400 mb-2">
                        ⏱️ {gap.estimatedTime} • Priority: {gap.priority}
                      </p>
                      {gap.dependencies && gap.dependencies.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-slate-500">Prerequisites: </span>
                          <span className="text-xs text-slate-400">{gap.dependencies.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/30">
                    <div>
                      <Label>Hours/Day</Label>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        value={constraints.availableHoursPerDay}
                        onChange={(e) => setConstraints({ ...constraints, availableHoursPerDay: parseInt(e.target.value) })}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <Label>Urgency</Label>
                      <Select
                        value={constraints.urgency}
                        onValueChange={(value: any) => setConstraints({ ...constraints, urgency: value })}
                      >
                        <SelectTrigger className="bg-slate-800 border-slate-700">
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
                        <SelectTrigger className="bg-slate-800 border-slate-700">
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
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
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
                  <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-yellow-400">🎯 Expected Outcome</CardTitle>
                      <CardDescription>{plan.expectedOutcome}</CardDescription>
                    </CardHeader>
                  </Card>

                  {plan.topics.map((day, idx) => (
                    <Card key={idx} className="bg-slate-900/50 border-yellow-500/30">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-yellow-400">Day {day.day}</CardTitle>
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
                            {day.topics.map((topic, tIdx) => (
                              <Badge key={tIdx} variant="outline" className="bg-slate-800">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {day.resources.length > 0 && (
                          <div>
                            <Label className="text-sm font-semibold mb-2 block">📚 Recommended Resources</Label>
                            <div className="space-y-2">
                              {day.resources.map((resource, rIdx) => (
                                <div
                                  key={rIdx}
                                  className="flex items-center gap-2 p-2 bg-slate-800 rounded border border-slate-700"
                                >
                                  <FileText className="w-4 h-4 text-yellow-400" />
                                  <span className="text-sm">{resource.title}</span>
                                  {resource.url && (
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-auto text-yellow-400 hover:text-yellow-300 text-xs"
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

                  <Card className="bg-slate-900/50 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-yellow-400">💡 Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="list-disc list-inside space-y-2 text-slate-300">
                        {plan.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm">{rec}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

