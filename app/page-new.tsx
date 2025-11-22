"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  ArrowRight,
  CheckCircle2,
  Route,
  GraduationCap,
  FileText,
  MessageSquare,
  BarChart3,
  Brain,
  Sparkles,
  Target,
} from "lucide-react";

const productPreviews = [
  {
    title: "Roadmap",
    description: "Personalized adaptive roadmaps that evolve with your progress",
    icon: Route,
  },
  {
    title: "Daily Mentor",
    description: "AI-powered daily guidance and motivation",
    icon: MessageSquare,
  },
  {
    title: "College Matcher",
    description: "Smart college recommendations based on your profile",
    icon: GraduationCap,
  },
  {
    title: "Document AI",
    description: "Generate resumes, SOPs, and professional documents",
    icon: FileText,
  },
  {
    title: "B2B Analytics Dashboard",
    description: "Real-time insights for institutes and educators",
    icon: BarChart3,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="pt-16">
        {/* Hero Section */}
        <motion.section
          className="container mx-auto px-4 pt-20 pb-12 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 mb-4">
            India&apos;s First AI-Powered Personal Mentorship Engine
          </Badge>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
            India&apos;s First AI-Powered Personal Mentorship Engine
          </h1>
          <p className="mx-auto mt-6 max-w-4xl text-base sm:text-lg md:text-xl text-slate-300">
            Mentark guides students and institutes with hyper-personalized learning, career, and psychology-driven recommendations.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                size="lg"
                className="bg-gradient-cyan-blue text-black font-semibold shadow-lg shadow-cyan-500/25"
              >
                <Link href="/product">
                  Explore Product
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-yellow-500/40 text-yellow-300 hover:border-yellow-500/60"
              >
                <Link href="/demo">Request Demo</Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Problem Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-slate-800"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 mb-4">
                The Problem
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6">
                Millions of Indian Students Face the Same Challenges
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Lack of Guidance",
                  description:
                    "Most students don&apos;t have access to quality mentorship. They rely on generic advice from friends, family, or outdated online resources that don&apos;t understand their unique context.",
                },
                {
                  title: "Career Confusion",
                  description:
                    "Students struggle to choose the right career path, college, or course. With thousands of options and limited information, decision-making becomes overwhelming and stressful.",
                },
                {
                  title: "Outdated Systems",
                  description:
                    "Traditional education systems don&apos;t adapt to individual learning styles or provide personalized guidance. One-size-fits-all approaches fail to address unique student needs.",
                },
                {
                  title: "Emotional Wellbeing",
                  description:
                    "Academic pressure, competitive exams, and uncertainty about the future lead to stress, anxiety, and burnout. Students need support beyond just academic guidance.",
                },
              ].map((problem, index) => (
                <motion.div
                  key={problem.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className="border-slate-700/70 bg-slate-900/40 h-full">
                    <CardHeader>
                      <CardTitle className="text-white text-xl">{problem.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm leading-relaxed">{problem.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Solution Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-slate-800"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 mb-4">
                The Solution
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6">
                Introducing ARK – Adaptive Roadmap Kernel
              </h2>
            </div>
            <Card className="border-slate-700/70 bg-slate-900/40 mb-8">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                      <Route className="h-8 w-8 text-yellow-300" />
                      Personalized Roadmap
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      ARK generates a personalized learning path tailored to your goals, current level, and constraints. 
                      It understands Indian education systems, competitive exams like JEE and NEET, and adapts daily based 
                      on your progress.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                      <Brain className="h-8 w-8 text-yellow-300" />
                      Intelligent Guidance
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      Our AI mentors provide 24/7 guidance that feels human. They understand your emotional state, 
                      workload, and motivation levels to offer the right support at the right time.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                      <Target className="h-8 w-8 text-yellow-300" />
                      Real Assessments
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      Beyond generic advice, Mentark uses real data—college cutoffs, placement records, career outcomes—to 
                      help you make informed decisions. Every recommendation is backed by evidence.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Product Preview Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-slate-800"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 mb-4">
                Product Preview
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6">
                Everything You Need in One Platform
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productPreviews.map((product, index) => (
                <motion.div
                  key={product.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                >
                  <Card className="border-slate-700/70 bg-slate-900/40 h-full hover:border-yellow-500/40 transition-colors">
                    <CardContent className="p-6">
                      <div className="h-48 bg-slate-800/50 rounded-lg flex items-center justify-center mb-4 border-2 border-dashed border-slate-700">
                        <product.icon className="h-12 w-12 text-yellow-300" />
                      </div>
                      <h3 className="text-white font-semibold text-lg mb-2">{product.title}</h3>
                      <p className="text-slate-300 text-sm">{product.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Why Mentark Works Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-slate-800"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 mb-4">
                Why Mentark Works
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6">
                Built on Three Core Principles
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "AI + Psychology + Real Assessments",
                  description:
                    "We combine cutting-edge AI with psychological insights and real-world data. Our recommendations aren&apos;t generic—they&apos;re based on your actual profile, goals, and the latest information about colleges, careers, and opportunities.",
                  icon: Brain,
                },
                {
                  title: "Multi-Model Engine",
                  description:
                    "We use GPT-4, Claude, Gemini, and specialized models for different tasks. The right AI handles each interaction, ensuring accuracy, empathy, and relevance. If one model fails, we seamlessly fail over to backups.",
                  icon: Sparkles,
                },
                {
                  title: "Measurable Outcomes",
                  description:
                    "Every feature is designed to deliver measurable results. Students see clear progress, institutes get data-driven insights, and parents receive transparent updates. We track what matters and prove our impact.",
                  icon: Target,
                },
              ].map((principle, index) => (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className="border-slate-700/70 bg-slate-900/40 h-full">
                    <CardHeader>
                      <principle.icon className="h-10 w-10 text-yellow-300 mb-4" />
                      <CardTitle className="text-white text-xl">{principle.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300 text-sm leading-relaxed">{principle.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-slate-800"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-4">Ready to Transform Your Journey?</h2>
            <p className="text-slate-300 mb-8">
              Join thousands of students and institutes using Mentark to achieve better outcomes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-gradient-cyan-blue text-black font-semibold">
                <Link href="/product">
                  Explore Product
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-yellow-500/40 text-yellow-300">
                <Link href="/demo">Request Demo</Link>
              </Button>
            </div>
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
}





