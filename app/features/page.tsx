"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Route,
  MessageSquare,
  GraduationCap,
  Briefcase,
  Brain,
  FileText,
  HelpCircle,
  BookOpen,
  BarChart3,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

const allFeatures = [
  {
    icon: Route,
    title: "ARK (Adaptive Roadmap Kernel)",
    description:
      "Personalized learning roadmaps that adapt daily based on your progress, goals, and constraints. ARK understands Indian education systems and competitive exams.",
  },
  {
    icon: MessageSquare,
    title: "Daily Mentor",
    description:
      "AI-powered daily guidance and motivation. Get personalized insights, study plans, and emotional support from mentors that understand your context.",
  },
  {
    icon: GraduationCap,
    title: "College Matcher",
    description:
      "Smart college recommendations based on your academic profile, preferences, and constraints. Analyzes cutoffs, placements, fees, and location to find your best matches.",
  },
  {
    icon: Briefcase,
    title: "Job Matcher",
    description:
      "Coming soon. Match with job opportunities that align with your skills, interests, and career goals. Get personalized job recommendations and application guidance.",
  },
  {
    icon: Brain,
    title: "Emotional Intelligence Assessment",
    description:
      "Understand your emotional state, stress levels, and wellbeing. Get personalized coping strategies and early warnings for burnout or disengagement.",
  },
  {
    icon: FileText,
    title: "Document Generator",
    description:
      "Generate professional documents including resumes, SOPs, cover letters, project reports, and academic letters. All tailored to your profile and requirements.",
  },
  {
    icon: HelpCircle,
    title: "Doubt Solver",
    description:
      "Get instant answers to your academic questions. Our AI-powered doubt solver provides explanations, examples, and related resources to help you learn better.",
  },
  {
    icon: BookOpen,
    title: "Structured Learning Plans",
    description:
      "Follow organized learning paths with clear milestones, deadlines, and resources. Plans adapt to your pace and learning style for optimal progress.",
  },
  {
    icon: BarChart3,
    title: "Institute Dashboard",
    description:
      "B2B analytics dashboard for institutes. Track student progress, predict dropout risks, monitor engagement, and get actionable insights for better outcomes.",
  },
  {
    icon: CreditCard,
    title: "Fee Payment Integration",
    description:
      "Optional future feature. Seamless fee payment integration for institutes, making it easier for students and administrators to manage financial transactions.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-card-foreground">
      <Header />
      <div className="pt-16">
        <motion.section
          className="container mx-auto px-4 py-20 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge className="border-primary500/30 bg-primary500/10 text-primary mb-4">
            Complete Feature Library
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl mb-6">
            Everything You Need for Student Success
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore all the features that make Mentark India&apos;s most comprehensive AI-powered mentorship platform.
          </p>
        </motion.section>

        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {allFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
              >
                <Card className="border-border bg-card h-full hover:border-primary500/40 transition-colors">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-primary mb-4" />
                    <CardTitle className="text-card-foreground text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-6">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Explore our product or request a demo to see how these features can help you achieve your goals.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.a
                href="/product"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <button className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold rounded-lg hover:opacity-90 transition-opacity">
                  Explore Product
                </button>
              </motion.a>
              <motion.a
                href="/demo"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <button className="px-6 py-3 border border-primary500/40 text-primary rounded-lg hover:border-primary500/60 transition-colors">
                  Request Demo
                </button>
              </motion.a>
            </div>
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
}
