'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileQuestion, Plus, Trash2, Sparkles, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Mistake {
  topic: string;
  question: string;
  attemptedAnswer: string;
  correctAnswer: string;
}

interface PracticeQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
}

export default function PracticeQuestionsPage() {
  const [tab, setTab] = useState('mistakes');
  const [loading, setLoading] = useState(false);
  
  // Mistakes state
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [currentMistake, setCurrentMistake] = useState<Mistake>({
    topic: '',
    question: '',
    attemptedAnswer: '',
    correctAnswer: '',
  });
  
  // Questions state
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAddMistake = () => {
    if (currentMistake.topic && currentMistake.question && currentMistake.correctAnswer) {
      setMistakes([...mistakes, currentMistake]);
      setCurrentMistake({ topic: '', question: '', attemptedAnswer: '', correctAnswer: '' });
    }
  };

  const handleGenerateQuestions = async () => {
    if (mistakes.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/study-analyzer/practice-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mistakes, count: 5 }),
      });
      
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data.questions);
        setTab('practice');
        setSelectedAnswers({});
        setShowResults(false);
      }
    } catch (error) {
      console.error('Question generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswers = () => {
    setShowResults(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
              <FileQuestion className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                Practice Questions
              </h1>
              <p className="text-slate-400">AI-generated targeted practice from your mistakes</p>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-yellow-500/30">
              <TabsTrigger value="mistakes">📝 Record Mistakes</TabsTrigger>
              <TabsTrigger value="practice" disabled={questions.length === 0}>
                🎯 Practice
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mistakes" className="mt-6">
              <Card className="bg-slate-900/50 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-yellow-400">Step 1: Record Your Mistakes</CardTitle>
                  <CardDescription>Add questions you got wrong to generate targeted practice questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Quadratic Equations, Photosynthesis"
                      value={currentMistake.topic}
                      onChange={(e) => setCurrentMistake({ ...currentMistake, topic: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>

                  <div>
                    <Label htmlFor="question">Question (What was the question?)</Label>
                    <Textarea
                      id="question"
                      placeholder="e.g., What is the derivative of x²?"
                      rows={2}
                      value={currentMistake.question}
                      onChange={(e) => setCurrentMistake({ ...currentMistake, question: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="attempted">Your Answer</Label>
                      <Input
                        id="attempted"
                        placeholder="What you wrote"
                        value={currentMistake.attemptedAnswer}
                        onChange={(e) => setCurrentMistake({ ...currentMistake, attemptedAnswer: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                    <div>
                      <Label htmlFor="correct">Correct Answer</Label>
                      <Input
                        id="correct"
                        placeholder="Right answer"
                        value={currentMistake.correctAnswer}
                        onChange={(e) => setCurrentMistake({ ...currentMistake, correctAnswer: e.target.value })}
                        className="bg-slate-800 border-slate-700"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleAddMistake}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Mistake
                  </Button>

                  {mistakes.length > 0 && (
                    <div className="space-y-2">
                      <Label>Recorded Mistakes ({mistakes.length})</Label>
                      {mistakes.map((mistake, idx) => (
                        <Card key={idx} className="bg-slate-800 border-slate-700">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant="outline" className="mb-2">{mistake.topic}</Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setMistakes(mistakes.filter((_, i) => i !== idx))}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <p className="text-sm text-slate-300 mb-2">{mistake.question}</p>
                            <div className="flex gap-2 text-xs">
                              <span className="text-red-400">❌ You: {mistake.attemptedAnswer}</span>
                              <span className="text-green-400">✓ Correct: {mistake.correctAnswer}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={handleGenerateQuestions}
                    disabled={mistakes.length === 0 || loading}
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {loading ? 'Generating Practice Questions...' : 'Generate Practice Questions'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="practice" className="mt-6">
              {questions.length > 0 && (
                <div className="space-y-6">
                  {questions.map((q, idx) => (
                    <Card key={idx} className="bg-slate-900/50 border-yellow-500/30">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-yellow-400">Question {idx + 1}</CardTitle>
                          <Badge className={getDifficultyColor(q.difficulty)}>
                            {q.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-white text-lg">{q.question}</p>
                        
                        <div className="space-y-2">
                          {q.options.map((option, optIdx) => (
                            <button
                              key={optIdx}
                              onClick={() => {
                                if (!showResults) {
                                  setSelectedAnswers({ ...selectedAnswers, [idx]: optIdx });
                                }
                              }}
                              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                                showResults && optIdx === q.correctAnswer
                                  ? 'bg-green-500/20 border-green-500'
                                  : showResults && optIdx === selectedAnswers[idx] && optIdx !== q.correctAnswer
                                  ? 'bg-red-500/20 border-red-500'
                                  : selectedAnswers[idx] === optIdx
                                  ? 'bg-yellow-500/20 border-yellow-500'
                                  : 'bg-slate-800 border-slate-700 hover:border-yellow-500/50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {showResults && optIdx === q.correctAnswer && (
                                  <CheckCircle className="w-5 h-5 text-green-400" />
                                )}
                                {showResults && optIdx === selectedAnswers[idx] && optIdx !== q.correctAnswer && (
                                  <XCircle className="w-5 h-5 text-red-400" />
                                )}
                                <span className="text-white">{String.fromCharCode(65 + optIdx)}. {option}</span>
                              </div>
                            </button>
                          ))}
                        </div>

                        {showResults && (
                          <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                            <div className="flex items-start gap-2">
                              <Lightbulb className="w-5 h-5 text-yellow-400 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-yellow-400 mb-1">Explanation</p>
                                <p className="text-sm text-slate-300">{q.explanation}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {!showResults && (
                    <Button
                      onClick={handleSubmitAnswers}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                    >
                      Submit Answers
                    </Button>
                  )}

                  {showResults && (
                    <div className="text-center space-y-4">
                      <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
                        <CardContent className="pt-6">
                          <p className="text-2xl font-bold text-yellow-400 mb-2">
                            Score: {Object.values(selectedAnswers).filter((ans, idx) => ans === questions[idx].correctAnswer).length} / {questions.length}
                          </p>
                          <p className="text-slate-400">
                            Keep practicing to master these concepts!
                          </p>
                        </CardContent>
                      </Card>
                      <Button
                        onClick={() => {
                          setQuestions([]);
                          setMistakes([]);
                          setTab('mistakes');
                          setShowResults(false);
                        }}
                        variant="outline"
                        className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                      >
                        Generate New Questions
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

