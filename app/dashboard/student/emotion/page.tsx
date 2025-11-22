'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HeartPulse,
  Smile,
  Frown,
  Activity,
  CloudLightning,
  ShieldAlert,
  Sparkles,
  Brain,
  Download,
  History,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { OfflineBanner } from '@/components/ui/offline-banner';
import { PageLayout, PageHeader, PageContainer } from '@/components/layout/PageLayout';
import { Spinner, CardSkeleton } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';

interface EmotionResult {
  sentiment_score: number;
  primary_emotion: string;
  emotion_category: string;
  intensity: number;
  concerns: string[];
  positive_aspects: string[];
  recommended_response: string;
  risk_flags: string[];
}

const HISTORY_KEY = 'mentark-emotion-check-history-v1';
const MAX_HISTORY = 5;

export default function EmotionCheckPage() {
  const [journalText, setJournalText] = useState('');
  const [energy, setEnergy] = useState(6);
  const [focus, setFocus] = useState(6);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmotionResult | null>(null);
  const [history, setHistory] = useState<Array<{ timestamp: string; summary: string; result: EmotionResult }>>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('Failed to restore emotion history', err);
    }
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
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  }, [history]);

  const emotionIcon = useMemo(() => {
    if (!result) return <Activity className="h-6 w-6 text-muted-foreground" />;
    if (result.sentiment_score >= 0.4) return <Smile className="h-6 w-6 text-green-400" />;
    if (result.sentiment_score <= -0.4) return <Frown className="h-6 w-6 text-red-400" />;
    return <Activity className="h-6 w-6 text-yellow-400" />;
  }, [result]);

  const handleAnalyze = async () => {
    if (!journalText.trim()) {
      setError('Share a short reflection first.');
      return;
    }
    if (!isOnline) {
      setError('You are offline. Reconnect to analyze emotions.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ai/analyze-emotion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          text: journalText,
          energy_level: energy,
          focus_level: focus,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        setHistory((prev) => [
          {
            timestamp: new Date().toISOString(),
            summary: data.data.primary_emotion,
            result: data.data,
          },
          ...prev,
        ]);
        toast.success('Emotion snapshot ready');
      } else {
        setError(data.message || 'Failed to analyze emotions.');
      }
    } catch (err) {
      console.error('Emotion analysis failed', err);
      setError('An unexpected error occurred. Please try again.');
      toast.error('Emotion analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const exportResult = () => {
    if (!result) {
      toast('Run an analysis first');
      return;
    }
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        journalText,
        energy,
        focus,
        result,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'emotion-check.json';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
      toast.success('Emotion snapshot exported');
    } catch (err) {
      console.error('Export error', err);
      toast.error('Failed to export emotion snapshot');
    }
  };

  return (
    <PageLayout containerWidth="wide" padding="desktop" maxWidth="5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <OfflineBanner
          isOnline={isOnline}
          message="You are offline. Draft journal entries will be stored locally until you reconnect."
          className="mb-4"
        />
        
        <PageHeader
          title="Emotion Check"
          description="Gauge your current emotional state and recommended next steps"
          icon={<HeartPulse className="w-8 h-8 text-gold" />}
          actions={
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              {isOnline ? (
                <span className="inline-flex items-center gap-1"><Wifi className="h-4 w-4 text-green-400" /> <span className="text-muted-foreground">Online</span></span>
              ) : (
                <span className="inline-flex items-center gap-1 text-red-300"><WifiOff className="h-4 w-4 text-red-400" /> Offline</span>
              )}
              <Button
                variant="outline"
                size="sm"
                className="border-gold/40 text-gold hover:bg-gold/10"
                onClick={exportResult}
                disabled={!result}
              >
                <Download className="h-3 w-3 mr-1" /> Export
              </Button>
            </div>
          }
        />

        <PageContainer spacing="md">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-gradient-to-br from-slate-900/80 to-slate-800/60 border-gold/40 shadow-lg">
              <CardHeader>
                <CardTitle className="text-pink-300 flex items-center gap-2">
                  <Brain className="h-5 w-5" /> Reflect & Analyze
                </CardTitle>
                <CardDescription>Share what&apos;s on your mind for a quick emotional read.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert className="bg-red-500/10 border-red-500/30">
                    <AlertDescription className="text-red-300">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="journal">What happened today?</Label>
                  <Textarea
                    id="journal"
                    value={journalText}
                    onChange={(event) => setJournalText(event.target.value)}
                    placeholder="I felt..."
                    rows={6}
                    className="bg-card border-border text-muted-foreground"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Energy Level</Label>
                    <Slider
                      value={[energy]}
                      onValueChange={(value) => setEnergy(value[0] ?? 6)}
                      max={10}
                      min={0}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{energy} / 10</p>
                  </div>
                  <div>
                    <Label>Focus Level</Label>
                    <Slider
                      value={[focus]}
                      onValueChange={(value) => setFocus(value[0] ?? 6)}
                      max={10}
                      min={0}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{focus} / 10</p>
                  </div>
                </div>

                <Button
                  onClick={handleAnalyze}
                  disabled={loading || !journalText.trim()}
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-black font-semibold"
                >
                  {loading ? 'Listening...' : 'Analyze Emotions'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-pink-300 flex items-center gap-2">
                  {emotionIcon}
                  Current Snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Primary Emotion</p>
                      <p className="text-lg font-semibold text-foreground capitalize">{result.primary_emotion}</p>
                      <Badge className="mt-1 bg-pink-500/20 text-pink-200 border-pink-500/40">
                        {result.emotion_category}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Sentiment Score</span>
                      <span className="text-sm font-semibold text-foreground">{result.sentiment_score.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Intensity</span>
                      <span className="text-sm font-semibold text-foreground">{(result.intensity * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Recommended Response</p>
                      <p className="text-sm text-muted-foreground">{result.recommended_response}</p>
                    </div>
                    {result.risk_flags.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-red-300 mb-2 flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4" /> Risk Flags
                        </p>
                        <div className="space-y-1">
                          {result.risk_flags.map((flag) => (
                            <div key={flag} className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded px-2 py-1">
                              {flag.replace(/_/g, ' ')}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Share how you&apos;re feeling to see a quick emotional snapshot.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <Card className="bg-card/50 border-pink-500/20">
              <CardHeader>
                <CardTitle className="text-pink-300 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> Uplifts
                </CardTitle>
                <CardDescription>Positive signals your journal highlighted.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {result && result.positive_aspects.length > 0 ? (
                  result.positive_aspects.map((item) => (
                    <div key={item} className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-sm text-green-200">
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No positive highlights yet — share a win to capture it here.</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-pink-500/20">
              <CardHeader>
                <CardTitle className="text-pink-300 flex items-center gap-2">
                  <CloudLightning className="h-5 w-5" /> Watch Outs
                </CardTitle>
                <CardDescription>The AI noticed these patterns to keep an eye on.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {result && result.concerns.length > 0 ? (
                  result.concerns.map((item) => (
                    <div key={item} className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-sm text-yellow-200">
                      {item}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No concerns flagged. Keep listening to how you feel.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {history.length > 0 && (
            <Card className="mt-8 bg-card/60 border-pink-500/20">
              <CardHeader>
                <CardTitle className="text-pink-300 flex items-center gap-2">
                  <History className="h-5 w-5" /> Recent Snapshots
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {history.slice(0, MAX_HISTORY).map((entry) => (
                  <div
                    key={entry.timestamp}
                    className="p-3 border border-border rounded-lg flex flex-wrap items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground capitalize truncate">{entry.summary}</p>
                      <p className="text-xs text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</p>
                    </div>
                    <Badge className="bg-pink-500/20 text-pink-200 border-pink-500/40">
                      {(entry.result.sentiment_score * 100).toFixed(0)} mood
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </PageContainer>
      </motion.div>
    </PageLayout>
  );
}

