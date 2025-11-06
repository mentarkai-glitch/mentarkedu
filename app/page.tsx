'use client';

import Link from "next/link";
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedText, CountUp } from "@/components/ui/AnimatedText";
import { MobileNav } from "@/components/layout/MobileNav";
import { 
  Brain, 
  Target, 
  Heart, 
  TrendingUp, 
  Users, 
  Award, 
  BarChart3, 
  Zap,
  MessageCircle,
  Calendar,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="border-b border-border bg-background/50 backdrop-blur-xl sticky top-0 z-30 w-full overflow-x-hidden">
        <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4 w-full max-w-full">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Mentark Quantum" className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg" />
            <span className="font-display text-lg sm:text-xl font-bold text-gradient-cyan">
              Mentark Quantum
            </span>
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/search">
              <Button variant="ghost" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="hidden lg:inline">Smart Search</span>
              </Button>
            </Link>
            <Link href="/chat">
              <Button variant="ghost" className="hidden lg:inline-flex">Try AI Chat</Button>
            </Link>
            <Link href="#features">
              <Button variant="ghost" className="hidden lg:inline-flex">Features</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button className="bg-gradient-cyan-blue font-semibold text-black hover:opacity-90 text-sm sm:text-base">
                Get Started
              </Button>
            </Link>
          </div>
          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20 text-center w-full max-w-full overflow-x-hidden">
        <AnimatedText delay={0.2}>
          <Badge className="mb-4 border-yellow-500/30 bg-yellow-500/10 text-yellow-400 neon-glow">
            AI-Powered B2B Mentorship Platform
          </Badge>
        </AnimatedText>
        <AnimatedText delay={0.4}>
          <h1 className="font-display text-5xl font-bold leading-tight md:text-7xl">
            Beyond Marks.
            <br />
            <span className="text-gradient-cyan">Toward Meaning.</span>
          </h1>
        </AnimatedText>
        <AnimatedText delay={0.6}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-400 md:text-xl">
            Transform your institute with AI-powered mentorship that goes beyond academics —
            nurturing emotional intelligence, personalized growth, and lifelong clarity.
          </p>
        </AnimatedText>
        <AnimatedText delay={0.8}>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/chat">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-gradient-cyan-blue font-semibold text-black hover:opacity-90 neon-glow"
                >
                  🤖 Try AI Chat Now
                </Button>
              </motion.div>
            </Link>
            <Link href="/dashboard/student">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="border-yellow-500/30 text-yellow-400 hover:border-yellow-500/50">
                  📊 Student Dashboard
                </Button>
              </motion.div>
            </Link>
          </div>
        </AnimatedText>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { label: "Institutes", value: 500, suffix: "+" },
            { label: "Students", value: 50, suffix: "K+" },
            { label: "Success Rate", value: 95, suffix: "%" },
            { label: "AI Models", value: 5, suffix: "+" },
          ].map((stat, index) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + index * 0.1, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.1 }}
            >
              <div className="font-display text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-1 text-xs sm:text-sm text-slate-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20 w-full max-w-full overflow-x-hidden">
        <div className="mb-12 sm:mb-16 text-center">
          <AnimatedText delay={1.4}>
            <Badge className="mb-4 border-yellow-500/30 bg-yellow-500/10 text-yellow-400 neon-glow text-xs sm:text-sm">
              Premium Features
            </Badge>
          </AnimatedText>
          <AnimatedText delay={1.6}>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white px-4">
              Everything Your Institute Needs
            </h2>
          </AnimatedText>
          <AnimatedText delay={1.8}>
            <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto px-4">
              Powered by GPT-4o, Claude 3.5, Gemini 1.5 Pro, and Perplexity — 
              The most advanced AI mentorship platform for institutes
            </p>
          </AnimatedText>
        </div>

        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1: AI Mentor Chat */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="group relative overflow-hidden glass border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
              <CardHeader>
                <motion.div 
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <MessageCircle className="h-7 w-7 text-black" />
                </motion.div>
                <CardTitle className="text-2xl text-white">AI Mentor Chat</CardTitle>
                <CardDescription className="text-slate-400">
                  Multi-persona AI mentors powered by GPT-4o and Claude
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400 text-sm leading-relaxed">
                  5 AI personas that understand emotions, provide personalized guidance, and adapt to each student&apos;s learning style and emotional state.
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "Friendly, Calm, Analytical, Motivational, Spiritual modes",
                    "Context-aware responses using student profile",
                    "Real-time conversation with fallback models"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/chat">
                  <Button className="w-full bg-gradient-cyan-blue font-semibold text-black hover:opacity-90 group-hover:scale-105 transition-transform neon-glow">
                    Try AI Chat
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Feature 2: Adaptive Roadmaps */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="group relative overflow-hidden glass border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
              <CardHeader>
                <motion.div 
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Target className="h-7 w-7 text-black" />
                </motion.div>
                <CardTitle className="text-2xl text-white">Adaptive Roadmaps (ARKs)</CardTitle>
                <CardDescription className="text-slate-400">
                  AI-generated personalized learning paths
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-400 text-sm leading-relaxed">
                  Create customized learning journeys aligned with academic calendars, student psychology, and institute templates.
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "Academic calendar-based timeframes (exams, semesters)",
                    "6 student categories with grade-specific content",
                    "Psychology-aware pacing (motivation, stress, confidence)"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/ark/create">
                  <Button className="w-full bg-gradient-cyan-blue font-semibold text-black hover:opacity-90 group-hover:scale-105 transition-transform neon-glow">
                    Build My ARK
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Feature 3: ML Dropout Prediction */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="group relative overflow-hidden glass border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
              <CardHeader>
                <motion.div 
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                <Shield className="h-7 w-7 text-black" />
              </motion.div>
              <CardTitle className="text-2xl text-white">ML Dropout Predictor</CardTitle>
              <CardDescription className="text-slate-400">
                Early warning system with AI-powered risk analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-400 text-sm leading-relaxed">
                Machine learning analyzes 30+ behavioral signals to predict dropout, burnout, and disengagement risk 2-4 weeks early.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "3 risk scores: Dropout, Burnout, Disengagement",
                  "Auto-alerts for teachers with intervention suggestions",
                  "Pattern recognition using Claude AI + ML models"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/student">
                <Button className="w-full bg-gradient-cyan-blue font-semibold text-black hover:opacity-90 group-hover:scale-105 transition-transform neon-glow">
                  View Risk Analysis
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          </motion.div>

          {/* Feature 4: Sentiment Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="group relative overflow-hidden glass border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
              <CardHeader>
                <motion.div 
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                <Heart className="h-7 w-7 text-black" />
              </motion.div>
              <CardTitle className="text-2xl text-white">Sentiment Timeline</CardTitle>
              <CardDescription className="text-slate-400">
                Emotion tracking with event correlation powered by Gemini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-400 text-sm leading-relaxed">
                Track daily emotions across 6 dimensions, discover what events trigger stress or joy, and detect anomalies instantly.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "6 emotions analyzed: Joy, Sadness, Fear, Anger, Surprise, Trust",
                  "Event-emotion correlation discovery",
                  "Anomaly detection for sudden mood changes"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/daily-checkin">
                <Button className="w-full bg-gradient-cyan-blue font-semibold text-black hover:opacity-90 group-hover:scale-105 transition-transform neon-glow">
                  Daily Check-in
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          </motion.div>

          {/* Feature 5: Career DNA Mapping */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="group relative overflow-hidden glass border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
              <CardHeader>
                <motion.div 
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                <Brain className="h-7 w-7 text-black" />
              </motion.div>
              <CardTitle className="text-2xl text-white">Career DNA Mapping</CardTitle>
              <CardDescription className="text-slate-400">
                AI-powered career discovery and peer matching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-400 text-sm leading-relaxed">
                Analyze student interests and generate affinity scores for 10 career categories. Find study buddies with similar goals.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "10 career categories with affinity scoring",
                  "Smart peer matching (study buddies, complementary)",
                  "Personalized career path recommendations"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/career-dna/analyze">
                <Button className="w-full bg-gradient-cyan-blue font-semibold text-black hover:opacity-90 group-hover:scale-105 transition-transform neon-glow">
                  Discover Career DNA
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          </motion.div>

          {/* Feature 6: Gamification */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="group relative overflow-hidden glass border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
              <CardHeader>
                <motion.div 
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                <Award className="h-7 w-7 text-black" />
              </motion.div>
              <CardTitle className="text-2xl text-white">Gamification Engine</CardTitle>
              <CardDescription className="text-slate-400">
                XP, levels, badges, and leaderboards for motivation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-400 text-sm leading-relaxed">
                Earn XP from daily activities, unlock achievement badges, compete on leaderboards, and maintain learning streaks.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "Dynamic XP system with leveling (√(XP/100) formula)",
                  "8 achievement badges (streaks, completions, engagement)",
                  "Institute-wide leaderboards by batch"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/student">
                <Button className="w-full bg-gradient-cyan-blue font-semibold text-black hover:opacity-90 group-hover:scale-105 transition-transform neon-glow">
                  View Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          </motion.div>

          {/* Feature 7: Teacher Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="group relative overflow-hidden glass border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
              <CardHeader>
                <motion.div
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-4"
                whileHover={{ scale: 1.2, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Users className="h-7 w-7 text-black" />
              </motion.div>
              <CardTitle className="text-2xl text-white">Teacher Insights</CardTitle>
              <CardDescription className="text-slate-400">
                Monitor students with AI-powered analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-400 text-sm leading-relaxed">
                Real-time student monitoring, batch analytics, intervention tools, and at-risk student alerts with recommended actions.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "View all assigned students with risk scores",
                  "Batch analytics with psychology charts",
                  "Create interventions with tracking"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
          </li>
                ))}
              </ul>
              <Link href="/dashboard/teacher">
                <Button className="w-full bg-gradient-cyan-blue font-semibold text-black hover:opacity-90 group-hover:scale-105 transition-transform neon-glow">
                  Teacher Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          </motion.div>

          {/* Feature 8: Admin Management */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="group relative overflow-hidden glass border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
              <CardHeader>
                <motion.div
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <BarChart3 className="h-7 w-7 text-black" />
                </motion.div>
              <CardTitle className="text-2xl text-white">Institute Analytics</CardTitle>
              <CardDescription className="text-slate-400">
                Complete admin dashboard with billing management
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-400 text-sm leading-relaxed">
                Manage teachers, create ARK templates, track institute-wide KPIs, and handle billing for Neuro/Quantum plans.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "KPI tracking: Students, ARKs, engagement, growth",
                  "Teacher management and batch assignment",
                  "Billing: ₹8,999 (Neuro) | ₹11,999 (Quantum)"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
          </li>
                ))}
              </ul>
              <Link href="/dashboard/admin">
                <Button className="w-full bg-gradient-cyan-blue font-semibold text-black hover:opacity-90 group-hover:scale-105 transition-transform neon-glow">
                  Admin Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          </motion.div>

          {/* Feature 9: Peer Matching */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="group relative overflow-hidden glass border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
              <CardHeader>
                <motion.div
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                <Users className="h-7 w-7 text-black" />
              </motion.div>
              <CardTitle className="text-2xl text-white">Peer Matching</CardTitle>
              <CardDescription className="text-slate-400">
                AI-powered study buddy recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-400 text-sm leading-relaxed">
                Smart algorithm matches students based on interests (40%), goals (30%), and career profiles (30%) for optimal study partnerships.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "3 match types: Study Buddy, Complementary, Similar Interests",
                  "Compatibility scores with detailed reasons",
                  "Connect and message matched peers"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/student?tab=peer-matching">
                <Button className="w-full bg-gradient-cyan-blue font-semibold text-black hover:opacity-90 group-hover:scale-105 transition-transform neon-glow">
                  Find Study Buddies
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          </motion.div>

          {/* Feature 10: Daily Check-ins */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="group relative overflow-hidden glass border-yellow-500/20 hover:border-yellow-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-yellow-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
              <CardHeader>
                <motion.div
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center mb-4"
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Calendar className="h-7 w-7 text-black" />
              </motion.div>
              <CardTitle className="text-2xl text-white">Daily Check-ins</CardTitle>
              <CardDescription className="text-slate-400">
                3 micro-questions for weekly ARK adaptation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-400 text-sm leading-relaxed">
                Quick daily reflection on energy, progress, and emotions. AI uses responses to adjust ARK pacing weekly.
              </p>
              <ul className="space-y-2 text-sm">
                {[
                  "Energy level tracking (0-10 scale)",
                  "Progress self-rating and reflections",
                  "Emotion scoring with AI analysis"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/daily-checkin">
                <Button className="w-full bg-gradient-cyan-blue font-semibold text-black hover:opacity-90 group-hover:scale-105 transition-transform neon-glow">
                  Start Check-in
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20 w-full max-w-full overflow-x-hidden">
        <div className="mb-8 sm:mb-12 text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-slate-400">Choose the plan that fits your institute</p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-4 sm:gap-6 md:grid-cols-2">
          {/* Neuro Plan */}
          <Card className="border-border bg-card p-6 sm:p-8">
            <h3 className="font-display text-xl sm:text-2xl font-bold">Neuro</h3>
            <div className="mt-4">
              <span className="font-display text-3xl sm:text-4xl font-bold">₹8,999</span>
              <span className="text-slate-400 text-sm sm:text-base">/student/year</span>
            </div>
            <ul className="mt-6 space-y-3 text-xs sm:text-sm">
              {[
                "Unlimited ARKs",
                "Focus analytics",
                "Daily motivation",
                "Core AI mentor",
                "Email support",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="text-primary">✓</span> {feature}
          </li>
              ))}
            </ul>
            <Button className="mt-8 w-full" variant="outline">
              Get Started
            </Button>
          </Card>

          {/* Quantum Plan */}
          <Card className="relative border-primary/50 bg-gradient-to-br from-card to-primary/5 p-6 sm:p-8">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border-primary/20 bg-primary/10 text-primary text-xs sm:text-sm">
              Popular
            </Badge>
            <h3 className="font-display text-xl sm:text-2xl font-bold">Quantum</h3>
            <div className="mt-4">
              <span className="font-display text-3xl sm:text-4xl font-bold">₹11,999</span>
              <span className="text-slate-400 text-sm sm:text-base">/student/year</span>
            </div>
            <ul className="mt-6 space-y-3 text-xs sm:text-sm">
              {[
                "Everything in Neuro",
                "Emotion graph & timeline",
                "Burnout prediction",
                "Custom AI personas",
                "Hybrid human–AI mentorship",
                "Career DNA mapping",
                "Priority support",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="text-primary">✓</span> {feature}
          </li>
              ))}
            </ul>
            <Button className="mt-8 w-full bg-gradient-cyan-blue font-semibold text-black hover:opacity-90">
              Get Started
            </Button>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20 text-center w-full max-w-full overflow-x-hidden">
        <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5 p-6 sm:p-8 md:p-12">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold px-2">
            Ready to Transform Your Institute?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 px-4">
            Join leading educational institutions using Mentark Quantum
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 px-4">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-cyan-blue font-semibold text-black hover:opacity-90 text-sm sm:text-base"
              >
                Start Free Trial
              </Button>
            </Link>
            <Link href="mailto:contact@mentark.ai" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
                Contact Sales
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 w-full overflow-x-hidden">
        <div className="container mx-auto px-3 sm:px-4 text-center text-sm text-slate-400 w-full max-w-full">
          <p>© 2025 Mentark Quantum. All rights reserved.</p>
          <p className="mt-2">Beyond marks. Toward meaning. 💙</p>
        </div>
      </footer>
    </div>
  );
}
