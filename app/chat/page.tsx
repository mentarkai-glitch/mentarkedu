"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Heart, 
  Brain, 
  Zap, 
  Moon, 
  Lightbulb,
  Star,
  MessageCircle,
  Settings,
  Home,
  ArrowLeft,
  Loader2,
  Mic,
  Paperclip,
  Smile,
  Target,
  Plus,
  ArrowRight,
  Calendar,
  TrendingUp,
  BookOpen,
  Rocket,
  Shield,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Activity,
  Grid3X3,
  BarChart3,
  Clock,
  Award,
  Flame,
  Cpu,
  Database,
  Network,
  Wifi,
  WifiOff
} from "lucide-react";
import type { MentorPersona } from "@/lib/types";
import { ImageUploadButton } from "@/components/chat/ImageUploadButton";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  persona?: MentorPersona;
  imageUrl?: string;
  imageAnalysis?: {
    extracted_text?: string;
    labels?: string[];
    objects?: Array<{ name: string; confidence: number }>;
  };
}

const LOCAL_STORAGE_KEY = "mentark-chat-history-v1";

interface StoredMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  persona?: MentorPersona;
  imageUrl?: string;
  imageAnalysis?: Message["imageAnalysis"];
}

type PersonaHistory = Record<string, StoredMessage[]>;


// Enhanced persona data with icons and colors
const mentorPersonas = [
  {
    id: 'friendly',
    name: 'Friendly Guide',
    emoji: '😊',
    icon: Heart,
    description: 'Warm and encouraging',
    color: 'pink',
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    greeting: "Hey there! I'm here to support you with a warm heart and encouraging words. What's on your mind today? 💕"
  },
  {
    id: 'strict',
    name: 'Disciplined Coach',
    emoji: '💪',
    icon: Zap,
    description: 'Direct and results-focused',
    color: 'orange',
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    greeting: "Let's get serious about your goals. I'm here to push you to achieve your full potential. Ready to work hard? 💪"
  },
  {
    id: 'calm',
    name: 'Mindful Mentor',
    emoji: '🧘',
    icon: Moon,
    description: 'Patient and centered',
    color: 'blue',
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    greeting: "Take a deep breath. I'm here to help you find clarity and peace in your journey. What brings you here today? 🌙"
  },
  {
    id: 'logical',
    name: 'Analytical Advisor',
    emoji: '🤔',
    icon: Brain,
    description: 'Systematic and data-driven',
    color: 'purple',
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    greeting: "Let's approach this logically. I'll help you analyze situations and make informed decisions. What challenge are we solving? 🧠"
  },
  {
    id: 'spiritual',
    name: 'Wisdom Keeper',
    emoji: '✨',
    icon: Star,
    description: 'Philosophical and purpose-driven',
    color: 'emerald',
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    greeting: "Welcome, seeker. Let's explore the deeper meaning behind your journey and discover your true purpose. What wisdom do you seek? ✨"
  }
];


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState(mentorPersonas[0]);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [historyReady, setHistoryReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const supabase = createClient();
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Initialize with persona greeting
  useEffect(() => {
    if (typeof window === "undefined") return;

    let parsed: PersonaHistory = {};
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        parsed = JSON.parse(stored) as PersonaHistory;
      }
    } catch (parseError) {
      console.warn("Failed to parse chat history", parseError);
    }

    const personaHistory = parsed[selectedPersona.id] ?? [];
    if (personaHistory.length > 0) {
      setMessages(
        personaHistory.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      );
    } else {
      setMessages([
        {
          role: "assistant",
          content: selectedPersona.greeting,
          timestamp: new Date(),
          persona: selectedPersona.id as MentorPersona,
        },
      ]);
    }

    setHistoryReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPersona]);

  useEffect(() => {
    if (!historyReady || typeof window === "undefined") return;
    let parsed: PersonaHistory = {};
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        parsed = JSON.parse(stored) as PersonaHistory;
      }
    } catch {
      parsed = {};
    }

    parsed[selectedPersona.id] = messages.map(({ timestamp, ...rest }) => ({
      ...rest,
      timestamp: timestamp.toISOString(),
    }));

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
    } catch (storageError) {
      console.warn("Failed to persist chat history", storageError);
    }
  }, [messages, selectedPersona.id, historyReady]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateStatus = () => setIsConnected(typeof navigator === "undefined" ? true : navigator.onLine);
    updateStatus();

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);
 
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
 
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    if (!isConnected) {
      setError("You appear to be offline. Reconnect to upload images.");
      setUploadingImage(false);
      return;
    }

    setError(null);
    
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const base64Data = base64.split(',')[1];

      const response = await fetch("/api/vision/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          imageBase64: base64Data,
          features: ["text", "labels", "objects"],
        }),
      });

      if (!response.ok) {
        throw new Error(`Vision service returned ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const userMessage: Message = {
          role: "user",
          content: "I've uploaded an image for you to analyze.",
          timestamp: new Date(),
          imageUrl: base64,
          imageAnalysis: data.data,
        };

        setMessages((prev) => [...prev, userMessage]);

        const chatResponse = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            message: `I've uploaded an image. Here's what was detected: ${data.data.extracted_text || 'No text detected'}. Labels: ${data.data.labels?.join(', ') || 'No labels'}. Please analyze this image and provide insights.`,
            persona: selectedPersona.id,
            session_id: user?.id || "demo-session",
            user_id: user?.id,
          }),
        });

        if (!chatResponse.ok) {
          throw new Error(`Chat service returned ${chatResponse.status}`);
        }

        const chatData = await chatResponse.json();

        if (chatData.success) {
          const aiMessage: Message = {
            role: "assistant",
            content: chatData.data.response,
            timestamp: new Date(),
            persona: selectedPersona.id as MentorPersona
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
      } else {
        throw new Error(data.error || "Failed to analyze image");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      setError("Couldn't analyze that image just yet. Please try again or upload a clearer shot.");
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I couldn't analyze the image. Please try uploading a clearer image or try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setUploadingImage(false);
    }
  };

  const sendMessage = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || loading || uploadingImage) return;

    if (!isConnected) {
      setError("You're offline. We'll send this once you're back online.");
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: text,
          persona: selectedPersona.id,
          session_id: user?.id || "demo-session",
          user_id: user?.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat service returned ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        const aiMessage: Message = {
          role: "assistant",
          content: data.data.response,
          timestamp: new Date(),
          persona: selectedPersona.id as MentorPersona
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error) {
      console.error("Chat error:", error);
      setError("Sorry, I'm having trouble connecting right now. Please try again in a moment.");
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    { text: "How can I improve my study habits?", emoji: "📚" },
    { text: "I'm feeling stressed about exams", emoji: "😰" },
    { text: "Help me create a learning plan", emoji: "🎯" },
    { text: "What career should I pursue?", emoji: "💼" },
    { text: "I need motivation", emoji: "🔥" },
    { text: "How to manage time better?", emoji: "⏰" }
  ];

  const handleQuickQuestion = (text: string) => {
    if (loading || uploadingImage) return;
    setInput(text);
    sendMessage(text);
  };

  return (
    <div className="flex min-h-screen flex-col bg-black">
      {/* Enhanced Header */}
      <header className="border-b border-yellow-500/20 glass backdrop-blur-xl overflow-hidden">
        <div className="w-full max-w-full mx-auto flex h-16 items-center justify-between px-2 sm:px-4 overflow-x-auto">
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 min-w-0 flex-shrink-0">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-yellow-400 hover:bg-yellow-500/10 border-yellow-500/20 p-1.5 sm:p-2 md:px-3 flex-shrink-0">
                <ArrowLeft className="w-4 h-4 sm:mr-1 md:mr-2" />
                <span className="hidden sm:inline text-xs md:text-sm">Dashboard</span>
              </Button>
            </Link>
            
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 min-w-0">
              <div className="relative flex-shrink-0">
                <img src="/logo.png" alt="Mentark" className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-lg" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="hidden sm:block min-w-0">
                <span className="font-display text-sm sm:text-base md:text-lg lg:text-xl font-bold text-white truncate block">
                  AI Mentor Chat
                </span>
                <div className="flex items-center gap-1 sm:gap-2 text-xs text-slate-400">
                  {isConnected ? (
                    <>
                      <Wifi className="w-3 h-3 text-green-500 flex-shrink-0" />
                      <span className="hidden md:inline">Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3 text-red-500 flex-shrink-0" />
                      <span className="hidden md:inline">Connecting...</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-4 flex-shrink-0">
            <Link href="/dashboard/student/arks" className="flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 p-1.5 sm:p-2 md:px-3 text-xs flex-shrink-0"
              >
                <Target className="w-3 h-3 sm:w-4 sm:h-4 md:mr-2" />
                <span className="hidden sm:inline text-xs">My ARKs</span>
              </Button>
            </Link>

            <Button
              onClick={() => setShowPersonaSelector(!showPersonaSelector)}
              variant="outline"
              size="sm"
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 p-1.5 sm:p-2 md:px-3 text-xs flex-shrink-0"
            >
              <selectedPersona.icon className="w-3 h-3 sm:w-4 sm:h-4 md:mr-2" />
              <span className="hidden lg:inline text-xs">{selectedPersona.name}</span>
            </Button>

            <Link href="/ark/create" className="hidden md:block flex-shrink-0">
              <Button className="bg-gradient-cyan-blue hover:opacity-90 text-black font-semibold text-xs sm:text-sm neon-glow px-2 sm:px-3">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden xl:inline">Create ARK</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {error && (
        <div className="border-b border-red-500/30 bg-red-500/10">
          <div className="container mx-auto px-3 sm:px-4 py-2 text-center text-xs sm:text-sm text-red-200">
            {error}
          </div>
        </div>
      )}

      {/* Persona Selector */}
      <AnimatePresence>
        {showPersonaSelector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-yellow-500/20 glass backdrop-blur-xl"
          >
            <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Choose Your Mentor</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                {mentorPersonas.map((persona) => (
                  <motion.div
                    key={persona.id}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      setSelectedPersona(persona);
                      setShowPersonaSelector(false);
                    }}
                    className="cursor-pointer"
                  >
                    <Card className={`h-full border-2 transition-all ${
                      selectedPersona.id === persona.id
                        ? `border-${persona.color}-500 bg-${persona.color}-500/10`
                        : 'glass border-yellow-500/20 hover:border-yellow-500/50'
                    }`}>
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${persona.gradient} flex items-center justify-center text-2xl mb-2 mx-auto shadow-lg`}>
                          {persona.emoji}
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">
                          {persona.name}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {persona.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="container mx-auto max-w-4xl space-y-4 sm:space-y-6">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <Card className={`max-w-[85%] sm:max-w-[80%] ${
                  message.role === "user"
                    ? "bg-gradient-cyan-blue border-0 neon-glow"
                    : "glass border-yellow-500/20 backdrop-blur-sm"
                }`}>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      {message.role === "assistant" && (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${selectedPersona.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {message.role === "user" ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <selectedPersona.icon className="w-4 h-4 text-slate-400" />
                          )}
                          <span className={`text-sm font-semibold ${
                            message.role === "user" ? "text-white" : "text-slate-200"
                          }`}>
                            {message.role === "user" ? "You" : selectedPersona.name}
                          </span>
                          <span className={`text-xs ${
                            message.role === "user" ? "text-yellow-100" : "text-slate-500"
                          }`}>
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        
                        <div className="space-y-3">
                          {message.imageUrl && (
                            <div className="relative">
                              <img
                                src={message.imageUrl}
                                alt="Uploaded image"
                                className="max-w-full h-auto rounded-lg border border-yellow-500/20"
                              />
                              {message.imageAnalysis && (
                                <div className="mt-2 p-2 glass rounded text-xs text-slate-300">
                                  {message.imageAnalysis.extracted_text && (
                                    <p><strong>Text:</strong> {message.imageAnalysis.extracted_text}</p>
                                  )}
                                  {message.imageAnalysis.labels && message.imageAnalysis.labels.length > 0 && (
                                    <p><strong>Labels:</strong> {message.imageAnalysis.labels.join(', ')}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          <p className={`whitespace-pre-wrap leading-relaxed ${
                            message.role === "user" ? "text-white" : "text-slate-200"
                          }`}>
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <Card className="max-w-[80%] glass border-yellow-500/20 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${selectedPersona.gradient} flex items-center justify-center shadow-lg`}>
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-200">
                        {selectedPersona.name} is thinking...
                      </span>
                      <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <Card className="max-w-[80%] glass border-red-500/20 backdrop-blur-sm">
                <CardContent className="p-4 text-center text-red-400">
                  <AlertCircle className="w-6 h-6 mb-2" />
                  {error}
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="border-t border-yellow-500/20 glass backdrop-blur-xl"
        >
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <p className="text-xs sm:text-sm text-slate-400 mb-2 sm:mb-3 text-center">Try asking:</p>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
              {quickQuestions.map((q, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Badge
                    variant="outline"
                    className="cursor-pointer border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/50 transition-all text-xs"
                    onClick={() => handleQuickQuestion(q.text)}
                  >
                    {q.emoji} <span className="hidden sm:inline">{q.text}</span>
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Input Area */}
      <div className="border-t border-yellow-500/20 glass backdrop-blur-xl">
        <div className="container mx-auto max-w-4xl p-3 sm:p-4">
          <div className="flex gap-2 sm:gap-3">
            <div className="flex gap-1 sm:gap-2">
              <ImageUploadButton 
                onImageUpload={handleImageUpload}
                disabled={loading || uploadingImage}
              />
              <Button
                variant="outline"
                size="sm"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 p-2 sm:px-3"
                disabled={true}
              >
                <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
            
            <Input
              placeholder="Ask your mentor..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1 glass border-yellow-500/20 text-white placeholder:text-slate-400 focus:border-yellow-500/50 h-10 sm:h-12 text-sm sm:text-base"
            />
            
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading || uploadingImage}
              className="bg-gradient-cyan-blue text-black hover:opacity-90 disabled:opacity-50 h-10 sm:h-12 px-3 sm:px-6 neon-glow"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : uploadingImage ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline">Powered by AI • Your conversations are private and secure</span>
              <span className="sm:hidden">AI Powered</span>
              <div className="flex items-center gap-1">
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-500" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-red-500" />
                    <span>Connecting...</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-3 h-3" />
              <span>Mentark AI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}