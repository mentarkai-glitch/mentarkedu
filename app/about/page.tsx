"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Target,
  Lightbulb,
  Rocket,
  Brain,
  Database,
  FileText,
  Sparkles,
  ArrowRight,
} from "lucide-react";

// Metadata is handled via layout or head tags in client components

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="pt-16">
        {/* Hero Section */}
        <motion.section
          className="container mx-auto px-4 py-20 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge className="border-primary/30 bg-primary/10 text-primary mb-4">
            Our Story
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl mb-6 text-foreground">
            Building India&apos;s largest AI mentorship engine
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            We&apos;re replacing randomness with clarity, one student at a time.
          </p>
        </motion.section>

        {/* Mission Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Target className="h-8 w-8 text-primary" />
              <h2 className="font-display text-3xl md:text-4xl text-foreground">Our Mission</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Make high-quality mentorship accessible to every student in India.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              We believe that every learner deserves personalized guidance, regardless of their background, location, or financial situation. 
              In a country where millions of students face career confusion and lack proper mentorship, we&apos;re building technology that 
              democratizes access to expert guidance. Our AI mentors understand the unique challenges Indian students face—from JEE and NEET 
              preparation to college selection, from skill development to emotional wellbeing.
            </p>
          </div>
        </motion.section>

        {/* Vision Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="h-8 w-8 text-primary" />
              <h2 className="font-display text-3xl md:text-4xl text-foreground">Our Vision</h2>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              To build India&apos;s largest AI mentorship engine—replacing randomness with clarity.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              Imagine a future where no student has to navigate their academic or career journey alone. Where AI-powered mentors 
              understand each learner&apos;s unique context, goals, and challenges. Where institutes have real-time visibility into 
              student progress and can intervene before problems escalate. Where parents feel confident and informed without being 
              overwhelmed. That&apos;s the future we&apos;re building—one where technology amplifies human potential rather than 
              replacing it.
            </p>
          </div>
        </motion.section>

        {/* Story Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Rocket className="h-8 w-8 text-primary" />
              <h2 className="font-display text-3xl md:text-4xl text-foreground">How Mentark Started</h2>
            </div>
            <div className="space-y-4 text-base text-muted-foreground leading-relaxed">
              <p>
                Mentark was born from a simple observation: millions of Indian students struggle with the same fundamental questions. 
                What should I study? Which college should I choose? How do I prepare for competitive exams? What career path fits 
                my interests and circumstances?
              </p>
              <p>
                Traditional mentorship is expensive, scarce, and often inaccessible. Most students rely on generic advice from friends, 
                family, or outdated online resources. Institutes struggle to provide personalized guidance at scale. Parents worry 
                without having clear visibility into their child&apos;s progress.
              </p>
              <p>
                We saw an opportunity to solve this at scale using AI. Not AI that replaces human mentors, but AI that amplifies 
                their impact. AI that understands Indian education systems, competitive exams, cultural contexts, and financial 
                realities. AI that learns from each interaction and gets better over time.
              </p>
              <p>
                Today, Mentark serves students across India, helping them create personalized roadmaps, stay motivated, and make 
                informed decisions. We work with institutes to reduce dropout rates, improve outcomes, and provide data-driven insights 
                to leadership teams. We&apos;re just getting started.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Technology Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="border-primary/30 bg-primary/10 text-primary mb-4">
                Technology
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl mb-4 text-foreground">How We Build</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform combines cutting-edge AI with deep understanding of Indian education systems.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Brain,
                  title: "ARK Engine",
                  description:
                    "Adaptive Roadmap Kernel that generates personalized learning paths based on student goals, current level, and constraints. It evolves daily as students progress.",
                },
                {
                  icon: Database,
                  title: "Multi-Model LLM Pipeline",
                  description:
                    "We use GPT-4, Claude, Gemini, and specialized models for different tasks—ensuring the right AI handles each interaction with precision and empathy.",
                },
                {
                  icon: Sparkles,
                  title: "Emotion Analysis",
                  description:
                    "Advanced sentiment analysis and burnout detection help us understand not just what students are learning, but how they&apos;re feeling about it.",
                },
                {
                  icon: Database,
                  title: "Big Data Matching",
                  description:
                    "Our college and job matching algorithms analyze thousands of data points—cutoffs, placements, fees, location—to recommend the best fits for each student.",
                },
                {
                  icon: FileText,
                  title: "Document AI",
                  description:
                    "Intelligent document generation for resumes, SOPs, cover letters, and reports. Our AI understands context and generates professional, personalized documents.",
                },
                {
                  icon: Rocket,
                  title: "Real-Time Analytics",
                  description:
                    "Institutes get live dashboards showing student progress, risk signals, and intervention opportunities. All backed by ML models that predict outcomes.",
                },
              ].map((tech, index) => (
                <motion.div
                  key={tech.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className="border-border bg-card h-full">
                    <CardHeader>
                      <tech.icon className="h-10 w-10 text-primary mb-4" />
                      <CardTitle className="text-card-foreground text-xl">{tech.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tech.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Press-Ready Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-4xl mx-auto">
            <Card className="border-primary/30 bg-primary/10">
              <CardHeader>
                <CardTitle className="text-card-foreground text-2xl mb-4">Press-Ready Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div>
                  <h3 className="text-primary font-semibold mb-2">Short Version (50 words)</h3>
                  <p className="text-sm leading-relaxed">
                    Mentark is India&apos;s first AI-powered personal mentorship engine, guiding students and institutes 
                    with hyper-personalized learning, career, and psychology-driven recommendations. Our platform helps 
                    students create adaptive roadmaps, stay motivated, and make informed decisions while giving institutes 
                    real-time visibility into student progress and outcomes.
                  </p>
                </div>
                <div className="border-t border-primary/20 pt-4">
                  <h3 className="text-primary font-semibold mb-2">Long Version (150 words)</h3>
                  <p className="text-sm leading-relaxed">
                    Mentark is India&apos;s first AI-powered personal mentorship engine, designed to make high-quality 
                    mentorship accessible to every student. Our platform combines cutting-edge AI technology with deep 
                    understanding of Indian education systems to provide hyper-personalized guidance across academics, 
                    careers, and emotional wellbeing.
                  </p>
                  <p className="text-sm leading-relaxed mt-3">
                    For students, Mentark creates adaptive roadmaps (ARKs) that evolve daily based on progress, generates 
                    personalized study plans, matches colleges and jobs, and provides 24/7 AI mentorship through multiple 
                    persona-based mentors. For institutes, we offer real-time analytics dashboards, dropout risk prediction, 
                    and intervention workflows that help reduce attrition and improve outcomes.
                  </p>
                  <p className="text-sm leading-relaxed mt-3">
                    Built with a multi-model LLM pipeline, emotion analysis, and big data matching algorithms, Mentark serves 
                    students across India, helping them navigate their academic and career journeys with clarity and confidence. 
                    We&apos;re headquartered in Pune, Maharashtra, and are committed to building India&apos;s largest AI 
                    mentorship ecosystem.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-4 text-foreground">Join Us on This Journey</h2>
            <p className="text-muted-foreground mb-8">
              Whether you&apos;re a student, parent, institute, or investor, we&apos;d love to hear from you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold">
                <Link href="/contact">
                  Get in Touch
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

