"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import {
  Brain,
  Sparkles,
  MessageCircle,
  Briefcase,
  GraduationCap,
  FileText,
  Calculator,
  Search,
  BookOpen,
  Target,
  TrendingUp,
  Lightbulb,
  HelpCircle,
  Mic,
  Volume2,
  VolumeX,
  Settings,
} from "lucide-react";

const agents = [
  {
    id: "mentor",
    name: "Mentor Agent",
    description: "Your emotional coach, conversation & reflection partner",
    icon: MessageCircle,
    color: "from-pink-500 to-purple-500",
    bgColor: "bg-pink-500/10 border-pink-500/30",
    badge: "Hume + Claude",
    features: ["Daily check-ins", "Emotional support", "Motivation"],
    href: "/chat",
  },
  {
    id: "learn",
    name: "Learn Agent",
    description: "Builds adaptive study plans & fetches personalized content",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10 border-blue-500/30",
    badge: "Gemini + Wolfram + YouTube",
    features: ["Study plans", "Content discovery", "Resource recommendations"],
    href: "/dashboard/student/study",
  },
  {
    id: "edu",
    name: "Edu Agent",
    description: "Finds right colleges, predicts cutoffs & fills forms",
    icon: GraduationCap,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10 border-green-500/30",
    badge: "NIRF + Govt Data + GPT-4o",
    features: ["College matching", "Admission predictions", "Auto form filling"],
    href: "/dashboard/student/colleges",
  },
  {
    id: "career",
    name: "Career Agent",
    description: "Matches jobs, internships & creates resumes",
    icon: Briefcase,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10 border-orange-500/30",
    badge: "LinkedIn + JSearch",
    features: ["Job matching", "Resume building", "Career paths"],
    href: "/dashboard/student/jobs",
  },
  {
    id: "search",
    name: "Search Agent",
    description: "Replaces Google with context-aware, actionable results",
    icon: Sparkles,
    color: "from-yellow-500 to-amber-500",
    bgColor: "bg-yellow-500/10 border-yellow-500/30",
    badge: "Perplexity + Semantic Scholar",
    features: ["Smart answers", "Verified sources", "Related actions"],
    href: "/search",
  },
  {
    id: "doubt",
    name: "Doubt Agent",
    description: "Verified answers via Wolfram + AI hybrid approach",
    icon: HelpCircle,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10 border-emerald-500/30",
    badge: "Wolfram + Perplexity",
    features: ["Step-by-step solutions", "Verified calculations", "Concept explanations"],
    href: "/dashboard/student/doubt-solver",
  },
  {
    id: "study",
    name: "Study Agent",
    description: "Analyzes gaps, generates questions & creates visualizations",
    icon: Brain,
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10 border-purple-500/30",
    badge: "GPT-4o + Gemini",
    features: ["Gap detection", "Practice questions", "Visual explainer"],
    href: "/dashboard/student/study",
  },
];

export default function AgentsHubPage() {
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState({
    language: 'en',
    autoTranscribe: true,
    respondWithVoice: false
  });

  const handleToggleVoice = () => {
    setVoiceMode(!voiceMode);
    if (!voiceMode) {
      toast.success('Voice mode enabled. Click the mic button to start speaking.');
    } else {
      setIsListening(false);
    }
  };

  const handleStartListening = () => {
    if (!voiceMode) {
      toast.error('Enable voice mode first');
      return;
    }
    setIsListening(true);
    // In a real implementation, this would use Web Speech API
    toast.info('Listening... (Voice recognition coming soon)');
    setTimeout(() => {
      setIsListening(false);
      toast.success('Voice input received');
    }, 3000);
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="border-b border-slate-700 bg-slate-900/50">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">AI Agents Hub</h1>
                <p className="text-slate-400 text-lg">Choose the right agent for your task</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-4">
              <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <Switch
                  checked={voiceMode}
                  onCheckedChange={handleToggleVoice}
                  id="voice-mode"
                />
                <Label htmlFor="voice-mode" className="text-slate-300 cursor-pointer">
                  Voice Mode
                </Label>
                {voiceMode && (
                  <Button
                    size="sm"
                    variant={isListening ? "destructive" : "outline"}
                    className={isListening ? "bg-red-500 text-white" : "border-green-500/40 text-green-400"}
                    onClick={handleStartListening}
                  >
                    {isListening ? (
                      <>
                        <VolumeX className="w-4 h-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Start Speaking
                      </>
                    )}
                  </Button>
                )}
              </div>
              {voiceMode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-400"
                  onClick={() => {
                    // Voice settings dialog would go here
                    toast.info('Voice settings coming soon');
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <p className="text-slate-400 text-center max-w-2xl mx-auto">
            Each agent is specialized for a specific task, powered by cutting-edge AI models and
            integrated with your ARK for personalized results.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {agents.map((agent, idx) => (
            <Link key={agent.id} href={agent.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="h-full"
              >
                <Card className={`${agent.bgColor} hover:border-opacity-60 transition-all h-full cursor-pointer group`}>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                      >
                        <agent.icon className="w-7 h-7 text-white" />
                      </div>
                      <Badge className="bg-slate-800/50 text-slate-300 text-xs border-slate-600">
                        {agent.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl text-white mb-2">{agent.name}</CardTitle>
                    <CardDescription className="text-slate-300 text-sm">
                      {agent.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {agent.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                          <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                          {feature}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="flex items-center gap-2 text-sm font-medium text-white group-hover:text-yellow-400 transition-colors">
                        Try Agent <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Unified Agent Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-2 border-cyan-500/30 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"></div>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-white mb-1">Analyze Agent</CardTitle>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                    All-in-One Intelligence Platform
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 mb-6">
                Our most powerful agent that combines all capabilities. Feed it any task, and it will
                intelligently route to the right specialized agent, combine results, and deliver
                comprehensive answers.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Multi-agent orchestration", "Context awareness", "ARK integration", "Memory learning"].map(
                  (feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                      {feature}
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

