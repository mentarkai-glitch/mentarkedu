'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles, Image as ImageIcon, TrendingUp, Layers, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VisualExplanation {
  description: string;
  diagramPrompt: string;
  mermaidDiagram?: string;
  imageUrl?: string;
  keyPoints: string[];
  type: 'flowchart' | 'concept_map' | 'hierarchy' | 'timeline' | 'comparison';
}

export default function VisualExplainerPage() {
  const [loading, setLoading] = useState(false);
  const [concept, setConcept] = useState('');
  const [subject, setSubject] = useState('general');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [explanation, setExplanation] = useState<VisualExplanation | null>(null);

  const handleGenerate = async () => {
    if (!concept) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/visual-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, subject, level }),
      });
      
      const data = await response.json();
      if (data.success) {
        setExplanation(data.data);
      }
    } catch (error) {
      console.error('Visual explanation error:', error);
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
          <div className="flex items-center gap-3 mb-6">
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

          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card className="bg-slate-900/50 border-yellow-500/30">
              <CardHeader>
                <CardTitle className="text-yellow-400">What Would You Like to Visualize?</CardTitle>
                <CardDescription>Enter a concept and get an AI-generated visual explanation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <Select value={level} onValueChange={(value: any) => setLevel(value)}>
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
                  disabled={!concept || loading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {loading ? 'Generating Visual Explanation...' : 'Generate Explanation'}
                </Button>

                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <p className="text-xs text-slate-400">
                    💡 <strong>Tip:</strong> Be specific! Instead of "Math", try "Quadratic Equations" or "Integration by Parts"
                  </p>
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

                  {explanation.mermaidDiagram && (
                    <Card className="bg-slate-900/50 border-yellow-500/30">
                      <CardHeader>
                        <CardTitle className="text-yellow-400">Interactive Diagram</CardTitle>
                        <CardDescription>Mermaid diagram code (can be rendered in supported viewers)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                          <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-all">
                            {explanation.mermaidDiagram}
                          </pre>
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
      </div>
    </div>
  );
}

