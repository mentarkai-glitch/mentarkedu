'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  Sparkles,
  Image as ImageIcon,
  TrendingUp,
  Layers,
  Zap,
  Copy,
  History,
  Info,
  Wifi,
  WifiOff,
  Download,
  Play,
  Pause,
  Square,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OfflineBanner } from '@/components/ui/offline-banner';

interface VisualExplanation {
  description: string;
  diagramPrompt: string;
  mermaidDiagram?: string;
  imageUrl?: string;
  keyPoints: string[];
  type: 'flowchart' | 'concept_map' | 'hierarchy' | 'timeline' | 'comparison';
  concept?: string;
  subject?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

const HISTORY_KEY = 'mentark-visual-history-v1';
const MAX_HISTORY = 5;

const CONCEPT_TEMPLATES: Array<{ title: string; concept: string; subject: string; level: 'beginner' | 'intermediate' | 'advanced' }> = [
  {
    title: 'Photosynthesis flowchart',
    concept: 'Photosynthesis process in plants including light-dependent and Calvin cycle',
    subject: 'Biology',
    level: 'beginner',
  },
  {
    title: 'Newton laws concept map',
    concept: 'Relationship between Newton`s three laws of motion with examples and formulas',
    subject: 'Physics',
    level: 'intermediate',
  },
  {
    title: 'Database normalization hierarchy',
    concept: 'Visualize database normalization forms 1NF to 3NF with examples',
    subject: 'Computer Science',
    level: 'advanced',
  },
];

export default function VisualExplainerPage() {
  const [loading, setLoading] = useState(false);
  const [concept, setConcept] = useState('');
  const [subject, setSubject] = useState('general');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [explanation, setExplanation] = useState<VisualExplanation | null>(null);
  const [history, setHistory] = useState<VisualExplanation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [exporting, setExporting] = useState(false);

  const displayHistory = useMemo(() => history.slice(0, MAX_HISTORY), [history]);

  const applyTemplate = (template: (typeof CONCEPT_TEMPLATES)[number]) => {
    setConcept(template.concept);
    setSubject(template.subject);
    setLevel(template.level);
    setError(null);
  };

  const handleHistorySelect = (item: VisualExplanation) => {
    setConcept(item.concept ?? '');
    setSubject(item.subject ?? 'general');
    setLevel(item.level ?? 'intermediate');
    setExplanation(item);
    setError(null);
  };

  const handleCopyMermaid = async (diagram?: string) => {
    if (!diagram || typeof navigator === 'undefined') return;
    try {
      await navigator.clipboard.writeText(diagram);
      setError(null);
    } catch (err) {
      console.warn('Failed to copy mermaid', err);
      setError('Copy failed. Please select and copy manually.');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored) as VisualExplanation[]);
      }
    } catch (err) {
      console.warn('Failed to restore visual history', err);
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
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
    } catch (err) {
      console.warn('Failed to persist visual history', err);
    }
  }, [history]);

  const handleGenerate = async () => {
    if (!concept) return;
    if (!isOnline) {
      setError('You appear to be offline. Reconnect to generate visuals.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/visual-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ concept, subject, level }),
      });
      
      if (!response.ok) {
        throw new Error(`Visual service returned ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const enriched: VisualExplanation = {
          ...data.data,
          concept,
          subject,
          level,
        };
        setExplanation(enriched);
        setHistory((prev) => [enriched, ...prev.filter((item) => item.concept !== concept)]);
      }
    } catch (error) {
      console.error('Visual explanation error:', error);
      setError('Unable to generate a visual explanation right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flowchart': return <Zap className="w-4 h-4" />;
      case 'concept_map': return <Layers className="w-4 h-4" />;
      case 'hierarchy': return <TrendingUp className="w-4 h-4" />;
      case 'timeline': return <TrendingUp className="w-4 h-4" />;
      case 'comparison': return <TrendingUp className="w-4 h-4" />;
      default: return <ImageIcon className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'flowchart': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
      case 'concept_map': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'hierarchy': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'timeline': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'comparison': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <OfflineBanner
            isOnline={isOnline}
            message="You are offline. Visual explanations will generate once you reconnect."
            className="mb-4"
          />
          <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                <Lightbulb className="w-8 h-8 text-yellow-400" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                  Visual Explainer
                </h1>
                <p className="text-slate-400">AI-powered diagrams & visual explanations</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-400" />
                  <span>Connected for visual generation</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-400" />
                  <span className="text-red-300">Offline &mdash; edit concept and retry when online</span>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="bg-slate-900/50 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-400">What Would You Like to Visualize?</CardTitle>
                <CardDescription>Enter a concept and get an AI-generated visual explanation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {CONCEPT_TEMPLATES.map((template) => (
                    <Button
                      key={template.title}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="border-yellow-500/30 bg-slate-900/60 text-yellow-300 hover:bg-yellow-500/10 flex items-center gap-2"
                      onClick={() => applyTemplate(template)}
                    >
                      <Sparkles className="h-3 w-3" />
                      <span className="text-xs text-left">{template.title}</span>
                    </Button>
                  ))}
                </div>

                <div>
                  <Label htmlFor="concept">Concept</Label>
                  <Textarea
                    id="concept"
                    placeholder="e.g., Photosynthesis, Newton's Laws, DNA replication..."
                    rows={4}
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    className="bg-slate-800 border-slate-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="e.g., Biology, Physics"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select value={level} onValueChange={(value) => setLevel(value as 'beginner' | 'intermediate' | 'advanced')}>
                      <SelectTrigger className="bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!concept || loading || !isOnline}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {loading ? 'Generating Visual Explanation...' : isOnline ? 'Generate Explanation' : 'Reconnect to generate'}
                </Button>

                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400">
                    💡 <strong>Tip:</strong> Be specific! Instead of &quot;Math&quot;, try &quot;Quadratic Equations&quot; or &quot;Integration by Parts&quot;
                  </p>
                  {history.length > 0 && (
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                      <History className="h-3 w-3" /> Last generated concept: {history[0].concept}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Output Section */}
            <div className="space-y-6">
              {explanation ? (
                <>
                  <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-yellow-400">Visual Explanation</CardTitle>
                        <Badge className={getTypeColor(explanation.type)}>
                          {getTypeIcon(explanation.type)}
                          <span className="ml-1 capitalize">{explanation.type.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                      <CardDescription>{explanation.description}</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="bg-slate-900/50 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-yellow-400">Key Visual Elements</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {explanation.keyPoints.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <span className="text-yellow-400 mt-1">✓</span>
                            <span className="text-sm">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/50 border-yellow-500/30">
                    <CardHeader>
                      <CardTitle className="text-yellow-400">AI Diagram Prompt</CardTitle>
                      <CardDescription>Use this prompt with your favourite image or diagram tool.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 text-sm text-slate-300 whitespace-pre-wrap">
                        {explanation.diagramPrompt}
                      </div>
                    </CardContent>
                  </Card>

                  {explanation.mermaidDiagram && (
                    <Card className="bg-slate-900/50 border-yellow-500/30">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-yellow-400">Interactive Diagram</CardTitle>
                            <CardDescription>Mermaid diagram code (render in Mermaid live editor)</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10"
                              onClick={() => handleCopyMermaid(explanation.mermaidDiagram)}
                            >
                              <Copy className="h-4 w-4 mr-2" /> Copy
                            </Button>
                            <Select
                              value={animationSpeed.toString()}
                              onValueChange={(v) => setAnimationSpeed(parseFloat(v))}
                            >
                              <SelectTrigger className="w-24 h-8 border-yellow-500/40 bg-slate-800 text-yellow-300">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0.5">0.5x</SelectItem>
                                <SelectItem value="1">1x</SelectItem>
                                <SelectItem value="1.5">1.5x</SelectItem>
                                <SelectItem value="2">2x</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10"
                              onClick={() => setIsAnimating(!isAnimating)}
                            >
                              {isAnimating ? (
                                <>
                                  <Pause className="h-4 w-4 mr-2" /> Pause
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" /> Play
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                          <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-all">
                            {explanation.mermaidDiagram}
                          </pre>
                        </div>
                        {/* Export Options */}
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-blue-500/40 text-blue-300 hover:bg-blue-500/10"
                            onClick={async () => {
                              setExporting(true);
                              try {
                                // Export as PNG
                                const canvas = document.createElement('canvas');
                                canvas.width = 800;
                                canvas.height = 600;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  ctx.fillStyle = '#0f172a';
                                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                                  ctx.fillStyle = '#eab308';
                                  ctx.font = '20px Arial';
                                  ctx.fillText(explanation.concept || 'Diagram', 20, 40);
                                }
                                canvas.toBlob((blob) => {
                                  if (blob) {
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `${explanation.concept?.replace(/\s+/g, '-') || 'diagram'}.png`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                  }
                                }, 'image/png');
                              } catch (err) {
                                console.error('Export failed:', err);
                              } finally {
                                setExporting(false);
                              }
                            }}
                            disabled={exporting}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            {exporting ? 'Exporting...' : 'PNG'}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-green-500/40 text-green-300 hover:bg-green-500/10"
                            onClick={() => {
                              const conceptText = explanation.concept || 'Diagram';
                              const mermaidText = explanation.mermaidDiagram || '';
                              const svgContent = '<?xml version="1.0" encoding="UTF-8"?>\n' +
                                '<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">\n' +
                                '  <rect width="800" height="600" fill="#0f172a"/>\n' +
                                '  <text x="20" y="40" fill="#eab308" font-size="20" font-family="Arial">' + conceptText + '</text>\n' +
                                '  <text x="20" y="80" fill="#cbd5e1" font-size="14" font-family="monospace">' + mermaidText + '</text>\n' +
                                '</svg>';
                              const blob = new Blob([svgContent], { type: 'image/svg+xml' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = (conceptText.replace(/\s+/g, '-') || 'diagram') + '.svg';
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            SVG
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="border-red-500/40 text-red-300 hover:bg-red-500/10"
                            onClick={async () => {
                              try {
                                const { default: jsPDF } = await import('jspdf');
                                const pdf = new jsPDF();
                                pdf.setFontSize(20);
                                pdf.text(explanation.concept || 'Diagram', 20, 20);
                                pdf.setFontSize(12);
                                const lines = pdf.splitTextToSize(explanation.description || '', 170);
                                pdf.text(lines, 20, 40);
                                pdf.save(`${explanation.concept?.replace(/\s+/g, '-') || 'diagram'}.pdf`);
                              } catch (err) {
                                console.error('PDF export failed:', err);
                              }
                            }}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            PDF
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {!explanation.mermaidDiagram && (
                    <Card className="bg-slate-900/50 border-yellow-500/30">
                      <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center mb-4">
                            <ImageIcon className="w-12 h-12 text-yellow-400" />
                          </div>
                          <p className="text-slate-400 text-sm">
                            💡 Use the visual description above to sketch or create your own diagram
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    onClick={() => setExplanation(null)}
                    variant="outline"
                    className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    Generate Another Explanation
                  </Button>
                </>
              ) : (
                <Card className="bg-slate-900/50 border-yellow-500/30">
                  <CardContent className="pt-12 pb-12">
                    <div className="flex flex-col items-center justify-center text-center space-y-4">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
                        <Lightbulb className="w-12 h-12 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">No Explanation Yet</h3>
                        <p className="text-slate-400 text-sm">
                          Enter a concept on the left and generate a visual explanation
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>

        {displayHistory.length > 0 && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <History className="h-4 w-4 text-yellow-300" />
              <h2 className="text-lg font-semibold">Recent visualizations</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayHistory.map((item, idx) => (
                <Card key={`${item.concept}-${idx}`} className="bg-slate-900/60 border-slate-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-slate-200 line-clamp-2">{item.concept}</CardTitle>
                      <Badge className={getTypeColor(item.type)}>{item.type.replace('_', ' ')}</Badge>
                    </div>
                    <CardDescription className="text-xs text-slate-500">
                      {item.subject} • {item.level}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-slate-400 line-clamp-3">{item.description}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      onClick={() => handleHistorySelect(item)}
                    >
                      Reuse this visual
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

