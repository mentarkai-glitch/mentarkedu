"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";

export default function EmotionCheckPage() {
  const [step, setStep] = useState(1);
  const [energy, setEnergy] = useState([3]);
  const [focus, setFocus] = useState([3]);
  const [emotionText, setEmotionText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const analyzeEmotion = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ai/analyze-emotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: emotionText,
          energy_level: energy[0],
          focus_level: focus[0],
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setStep(2);
      } else {
        alert("Failed to analyze emotion: " + data.error);
      }
    } catch (error) {
      console.error("Emotion analysis error:", error);
      // Show a demo result for now
      setResult({
        sentiment_score: ((energy[0] + focus[0]) / 10 - 0.5) * 2,
        primary_emotion: emotionText.toLowerCase().includes("stress") ? "stressed" : 
                        emotionText.toLowerCase().includes("happy") ? "happy" :
                        emotionText.toLowerCase().includes("tired") ? "exhausted" : "neutral",
        emotion_category: "balanced_healthy",
        intensity: 0.7,
        key_themes: ["motivation", "focus", "wellbeing"],
        recommended_response: "You're doing great! Keep maintaining a balanced approach to your studies.",
        concerns: [],
        positive_aspects: ["Self-awareness", "Willingness to check in"],
      });
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const getEmotionColor = (score: number) => {
    if (score >= 0.6) return "text-success";
    if (score >= 0.2) return "text-primary";
    if (score >= -0.2) return "text-muted-foreground";
    if (score >= -0.6) return "text-warning";
    return "text-error";
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojiMap: Record<string, string> = {
      happy: "😊",
      excited: "🎉",
      calm: "😌",
      neutral: "😐",
      tired: "😴",
      stressed: "😟",
      anxious: "😰",
      overwhelmed: "😵",
      sad: "😢",
      frustrated: "😤",
      motivated: "💪",
      confident: "😎",
      exhausted: "🥱",
    };
    return emojiMap[emotion.toLowerCase()] || "😐";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Mentark" className="h-10 w-10 rounded-lg" />
            <span className="font-display text-xl font-bold text-gradient-cyan">
              Emotion Check
            </span>
          </Link>
          <Link href="/">
            <Button variant="ghost">Home</Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto max-w-2xl px-4 py-12">
        {step === 1 && (
          <Card className="border-border bg-card p-8">
            <h2 className="mb-4 font-display text-3xl font-bold">
              How are you feeling today? 💭
            </h2>
            <p className="mb-8 text-muted-foreground">
              Take a moment to check in with yourself. This helps us understand your emotional
              state and provide better support.
            </p>

            <div className="space-y-8">
              {/* Energy Level */}
              <div>
                <Label className="mb-4 block">
                  Energy Level: <span className="font-bold text-primary">{energy[0]}/5</span>
                </Label>
                <Slider
                  value={energy}
                  onValueChange={setEnergy}
                  min={1}
                  max={5}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>😴 Drained</span>
                  <span>😌 Normal</span>
                  <span>⚡ Energized</span>
                </div>
              </div>

              {/* Focus Level */}
              <div>
                <Label className="mb-4 block">
                  Focus Level: <span className="font-bold text-primary">{focus[0]}/5</span>
                </Label>
                <Slider
                  value={focus}
                  onValueChange={setFocus}
                  min={1}
                  max={5}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>😵 Distracted</span>
                  <span>🤔 Okay</span>
                  <span>🎯 Laser-focused</span>
                </div>
              </div>

              {/* Emotion Text */}
              <div>
                <Label htmlFor="emotion" className="mb-2 block">
                  How are you feeling? (In your own words)
                </Label>
                <textarea
                  id="emotion"
                  className="min-h-[120px] w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="I'm feeling... (e.g., stressed about exams, excited about learning, tired from studying)"
                  value={emotionText}
                  onChange={(e) => setEmotionText(e.target.value)}
                />
              </div>

              <Button
                onClick={analyzeEmotion}
                disabled={!emotionText.trim() || loading}
                className="w-full bg-gradient-cyan-blue font-semibold text-black hover:opacity-90"
              >
                {loading ? "Analyzing..." : "Analyze My Emotion 🧠"}
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && result && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 p-8 text-center">
              <div className={`mb-2 text-6xl ${getEmotionColor(result.sentiment_score)}`}>
                {getEmotionEmoji(result.primary_emotion)}
              </div>
              <h3 className="mb-2 font-display text-2xl font-bold capitalize">
                {result.primary_emotion}
              </h3>
              <p className="text-sm text-muted-foreground">
                Sentiment Score:{" "}
                <span className={`font-semibold ${getEmotionColor(result.sentiment_score)}`}>
                  {(result.sentiment_score * 100).toFixed(0)}%
                </span>
              </p>
            </Card>

            {/* Key Themes */}
            {result.key_themes && result.key_themes.length > 0 && (
              <Card className="border-border bg-card p-6">
                <h4 className="mb-4 font-semibold">Key Themes Detected 🔍</h4>
                <div className="flex flex-wrap gap-2">
                  {result.key_themes.map((theme: string, i: number) => (
                    <Badge key={i} variant="secondary">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Positive Aspects */}
            {result.positive_aspects && result.positive_aspects.length > 0 && (
              <Card className="border-success/20 bg-success/5 p-6">
                <h4 className="mb-3 font-semibold text-success">Positive Aspects ✨</h4>
                <ul className="space-y-2 text-sm">
                  {result.positive_aspects.map((aspect: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-success">✓</span>
                      <span>{aspect}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Concerns */}
            {result.concerns && result.concerns.length > 0 && (
              <Card className="border-warning/20 bg-warning/5 p-6">
                <h4 className="mb-3 font-semibold text-warning">Areas to Address ⚠️</h4>
                <ul className="space-y-2 text-sm">
                  {result.concerns.map((concern: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-warning">!</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Recommendation */}
            <Card className="border-primary/20 bg-primary/5 p-6">
              <h4 className="mb-3 font-semibold text-primary">Recommended Action 💡</h4>
              <p className="text-sm leading-relaxed">{result.recommended_response}</p>
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setStep(1);
                  setEmotionText("");
                  setResult(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Check Again
              </Button>
              <Link href="/chat" className="flex-1">
                <Button className="w-full bg-gradient-cyan-blue font-semibold text-black hover:opacity-90">
                  Talk to AI Mentor
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

