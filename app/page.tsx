'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedText, CountUp } from "@/components/ui/AnimatedText";
import { MobileNav } from "@/components/layout/MobileNav";
import {
  Brain,
  Compass,
  HeartPulse,
  IndianRupee,
  Lightbulb,
  LineChart,
  MapPin,
  Rocket,
  ShieldCheck,
  Target,
  Users,
  Sparkles,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const impactStats = [
  { label: "Learners supported", value: 50000, suffix: "+" },
  { label: "Institutions onboarded", value: 325, suffix: "+" },
  { label: "Dropout risk reduction", value: 37, suffix: "%" },
  { label: "Daily insights processed", value: 4, suffix: "M" },
];

const manifestoSections = [
  {
    title: "Vision",
    text: "Mentorship is infrastructure. Every learner, parent, and professional deserves clarity, courage, and calm. AI should revive humanity, not replace it.",
  },
  {
    title: "Mission",
    text: "Mentark builds adaptive ARKs—living roadmaps refined daily by intelligence that listens and learns. We guide academic, professional, emotional, and financial journeys with mentors that think with reason, feel with empathy, and act with purpose.",
  },
  {
    title: "Belief",
    text: "People do not fail for lack of capability; they fail for lack of direction, discipline, and emotional balance. Mentark exists to restore that guidance.",
  },
  {
    title: "Philosophy",
    text: "Clarity before chaos. Emotion before execution. Progress before perfection. Purpose before performance. Every feature, model, and policy honours this order.",
  },
  {
    title: "Promise",
    text: "We will not exploit confusion—we remove it. We will not amplify anxiety—we listen to it. We will not design addiction—we design awareness. We build for people, not profiles; for meaning, not metrics.",
  },
  {
    title: "Vision in action",
    text: "Mentark becomes the AI operating system for human growth. From choosing a career to healing burnout, from building wealth to rediscovering purpose—your mentor is present, adaptive, and human at heart.",
  },
];

const featureHighlights = [
  {
    icon: Brain,
    title: "Adaptive Roadmaps (ARKs)",
    description:
      "Personalised plans aligned to Indian academic calendars, competitive exams, and psychology signals. ARKs evolve daily as students grow.",
    bullets: [
      "Board, semester, and entrance-exam aware timeframes",
      "Daily micro-milestones with human + AI accountability",
      "Institute templates with instant customisation",
    ],
    cta: { label: "Build an ARK", href: "/ark/create" },
  },
  {
    icon: Lightbulb,
    title: "Mentark AI Mentors",
    description:
      "Five mentor personas (guide, analyst, motivator, calm, spiritual) powered by GPT-4o, Claude 3.5, and Gemini. They read emotion, coach habits, and recommend next actions.",
    bullets: [
      "Context-aware chat with institute safeguards",
      "Real-time emotional tone detection",
      "Audit trails for teachers and parents",
    ],
    cta: { label: "Chat with Mentark", href: "/chat" },
  },
  {
    icon: ShieldCheck,
    title: "Risk & Wellbeing Intelligence",
    description:
      "Dropout, burnout, and disengagement indices generated from 30+ behavioural signals. Mentark flags risk 2–4 weeks early and prescribes interventions.",
    bullets: [
      "Feature store syncing daily check-ins, ARK progress, and chat sentiment",
      "Auto-alerts for teachers and counsellors",
      "ML + rule-based fallbacks to ensure zero blind spots",
    ],
    cta: { label: "See live dashboards", href: "/dashboard/admin" },
  },
  {
    icon: HeartPulse,
    title: "Emotion & Energy Timeline",
    description:
      "Daily wellness check-ins, AI-generated coping strategies, and anomaly detection for sudden dips in morale.",
    bullets: [
      "Sentiment history correlated with academic events",
      "Offline-ready daily assistant with momentum coaching",
      "Parents receive balanced reports without panic",
    ],
    cta: { label: "Log a check-in", href: "/daily-checkin" },
  },
  {
    icon: GraduationCap,
    title: "Train Mentark AI",
    description:
      "Learners teach Mentark about their graduation path, budget in ₹, and competitive exams (JEE, NEET, AIIMS, CUET). The AI adapts schedules, recommendations, and scholarships around that reality.",
    bullets: [
      "Course & semester aware planning",
      "Rupee-based budget intelligence",
      "Family dashboards with human-friendly language",
    ],
    cta: { label: "Personalise my AI", href: "/dashboard/student/train-ai" },
  },
  {
    icon: LineChart,
    title: "Institution OS",
    description:
      "Executive dashboards for heads, deans, and investors: adoption, engagement, outcomes, and projected risk in a single pane of glass.",
    bullets: [
      "Cohort-level ARK completion and time-in-app",
      "Income, scholarship, and placement tracking",
      "API hooks into MIS/ERP for automated reporting",
    ],
    cta: { label: "Book an institute demo", href: "/auth/register" },
  },
];

const stakeholderTiles = [
  {
    title: "Why institutes and investors lean in",
    icon: Users,
    points: [
      "Reduce attrition 30–40% with proactive ML alerts",
      "Unlock new premium revenue via AI mentorship tiers",
      "Proof-ready data room: feature store, model registry, audit logs",
      "No shadow IT—compliant with UGC/AICTE and SOC2-ready architecture",
    ],
    cta: { label: "Download investor brief", href: "/docs/MENTARK_INVESTOR.pdf" },
  },
  {
    title: "Why parents trust Mentark",
    icon: MapPin,
    points: [
      "Transparent rupee budgets for courses, coaching, and wellness",
      "Entrance-exam aware planning for JEE, NEET, AIIMS, CUET, UPSC",
      "Emotion alerts without fearmongering—data with context",
      "Mentor loops that include teachers, counsellors, and families",
    ],
    cta: { label: "Explore family features", href: "/dashboard/student" },
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-30 border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-3 sm:px-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Mentark" className="h-9 w-9 rounded-lg" />
            <span className="font-display text-lg sm:text-xl font-bold text-gradient-cyan">Mentark</span>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <Link href="#manifesto"><Button variant="ghost">Manifesto</Button></Link>
            <Link href="#features"><Button variant="ghost">Platform</Button></Link>
            <Link href="#stakeholders"><Button variant="ghost">For stakeholders</Button></Link>
            <Link href="/auth/login"><Button variant="ghost">Login</Button></Link>
            <Link href="/auth/register">
              <Button className="bg-gradient-cyan-blue font-semibold text-black hover:opacity-90">
                Request demo
              </Button>
            </Link>
          </div>
          <MobileNav />
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 text-center">
        <AnimatedText delay={0.2}>
          <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300">AI Operating System for Human Growth</Badge>
        </AnimatedText>
        <AnimatedText delay={0.4}>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            Mentorship is not a luxury.
            <br />
            <span className="text-gradient-cyan">It&apos;s infrastructure.</span>
          </h1>
        </AnimatedText>
        <AnimatedText delay={0.6}>
          <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg md:text-xl text-slate-300">
            Mentark blends adaptive AI roadmaps, behavioural ML, and human empathy so institutes, parents, and investors can scale the type of mentorship that changes lives.
          </p>
        </AnimatedText>
        <AnimatedText delay={0.8}>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/auth/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-gradient-cyan-blue text-black font-semibold shadow-lg shadow-cyan-500/25">
                  Book an institute session
                </Button>
              </motion.div>
            </Link>
            <Link href="/dashboard/student">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="border-yellow-500/40 text-yellow-300 hover:border-yellow-500/60">
                  See learner experience
                </Button>
              </motion.div>
            </Link>
            <Link href="/docs/MENTARK_INVESTOR.pdf" target="_blank" rel="noopener noreferrer">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="ghost" className="text-slate-200 hover:text-white">
                  📄 Investor memo
                </Button>
              </motion.div>
            </Link>
          </div>
        </AnimatedText>

        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
          {impactStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1, type: "spring", stiffness: 200 }}
              className="text-left sm:text-center"
            >
              <div className="font-display text-2xl sm:text-3xl md:text-4xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="mt-1 text-xs sm:text-sm text-slate-400 uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Manifesto */}
      <section id="manifesto" className="container mx-auto px-4 py-16 border-t border-slate-800">
        <div className="text-center mb-10">
          <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 mb-4">Mentark Manifesto</Badge>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl">Guiding minds. Growing humans.</h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto">
            This is the covenant that anchors every model release, every feature ship, every partnership.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {manifestoSections.map((item) => (
            <Card key={item.title} className="border-slate-700/60 bg-slate-900/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-xl">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base leading-relaxed text-slate-300">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-16 border-t border-slate-800">
        <div className="text-center mb-12">
          <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 mb-4">Platform pillars</Badge>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl">From AI mentors to ML observability—everything connects.</h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto">
            Mentark unifies adaptive planning, daily assistance, emotional wellbeing, and executive intelligence into one operating system.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureHighlights.map((feature) => (
            <Card key={feature.title} className="group border-slate-700/70 bg-slate-900/40 hover:border-yellow-500/40 transition-colors">
              <CardHeader>
                <feature.icon className="h-10 w-10 text-yellow-300 mb-4" />
                <CardTitle className="text-white text-2xl">{feature.title}</CardTitle>
                <CardDescription className="text-slate-300 text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-slate-300">
                  {feature.bullets.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-yellow-400 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <Link href={feature.cta.href}>
                  <Button className="mt-4 bg-gradient-cyan-blue text-black font-semibold w-full sm:w-auto group-hover:translate-x-1 transition-transform">
                    {feature.cta.label}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stakeholders */}
      <section id="stakeholders" className="container mx-auto px-4 py-16 border-t border-slate-800">
        <div className="text-center mb-12">
          <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 mb-4">For every stakeholder</Badge>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl">Value that compounds for institutes, investors, parents, and learners.</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {stakeholderTiles.map((tile) => (
            <Card key={tile.title} className="border-slate-700/70 bg-slate-900/40">
              <CardHeader>
                <tile.icon className="h-8 w-8 text-yellow-300 mb-3" />
                <CardTitle className="text-white text-2xl">{tile.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-slate-300">
                  {tile.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-300 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                {tile.cta && (
                  <Link href={tile.cta.href}>
                    <Button variant="outline" className="mt-4 border-yellow-500/40 text-yellow-300 hover:border-yellow-500/60">
                      {tile.cta.label}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Promise CTA */}
      <section className="container mx-auto px-4 py-16 border-t border-slate-800">
        <Card className="border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 via-transparent to-transparent">
          <CardHeader className="space-y-4 text-center">
            <Badge className="border-yellow-500/40 bg-yellow-500/20 text-yellow-100">Our Motto</Badge>
            <CardTitle className="font-display text-3xl sm:text-4xl text-white">
              “We don’t tell you who to be. We help you become who you already are.”
            </CardTitle>
            <CardDescription className="text-slate-200 text-base sm:text-lg max-w-3xl mx-auto">
              Join the ecosystem that is re-defining mentorship for India and beyond—evidence-first, empathy-led, revenue-positive.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-gradient-cyan-blue text-black font-semibold">
                Partner with Mentark
              </Button>
            </Link>
            <Link href="mailto:hello@mentark.ai">
              <Button size="lg" variant="ghost" className="text-slate-200 hover:text-white">
                Speak with the founders
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-slate-800 bg-black/80 py-8 text-sm text-slate-500">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Rocket className="h-4 w-4" />
            <span>© {new Date().getFullYear()} Mentark. Built in India for the world.</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/docs/MENTARK_MANIFESTO.pdf" target="_blank" className="hover:text-yellow-300">Manifesto (PDF)</Link>
            <Link href="/privacy" className="hover:text-yellow-300">Privacy</Link>
            <Link href="/terms" className="hover:text-yellow-300">Terms</Link>
            <Link href="https://www.linkedin.com/company/mentark" target="_blank" className="hover:text-yellow-300">LinkedIn</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
