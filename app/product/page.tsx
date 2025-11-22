"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  Route,
  GraduationCap,
  FileText,
  MessageSquare,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Brain,
  Search,
  Sparkles,
} from "lucide-react";

export default function ProductPage() {
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
          <Badge className="border-primary500/30 bg-primary500/10 text-primary mb-4">
            Product Showcase
          </Badge>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl mb-6 text-foreground">
            Everything You Need for Student Success
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            From personalized roadmaps to AI-powered mentorship, Mentark provides a complete platform 
            for students, parents, and institutes.
          </p>
          <Button asChild size="lg" className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold">
            <Link href="/demo">
              Book a Demo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.section>

        {/* ARK Engine Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Route className="h-10 w-10 text-primary" />
              <div>
                <h2 className="font-display text-3xl md:text-4xl text-foreground">Roadmap Generation (ARK Engine)</h2>
                <p className="text-muted-foreground mt-2">Adaptive Roadmap Kernel - Your personalized learning path</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">How ARK Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {[
                      "Students answer a few questions about their goals, current level, and constraints",
                      "ARK Engine analyzes responses using multi-model AI (GPT-4, Claude, Gemini)",
                      "Generates a personalized roadmap with milestones, timelines, and resources",
                      "Roadmap adapts daily based on student progress and feedback",
                      "Provides actionable steps with clear deadlines and accountability",
                    ].map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-muted-foreground text-sm">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">ARK Pipeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-card800/50 border border-border700">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-5 w-5 text-cyan-400" />
                        <span className="text-card-foreground font-semibold">Goal Analysis</span>
                      </div>
                      <p className="text-muted-foreground text-sm">AI understands student objectives and context</p>
                    </div>
                    <div className="p-4 rounded-lg bg-card800/50 border border-border700">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-5 w-5 text-yellow-400" />
                        <span className="text-card-foreground font-semibold">Path Generation</span>
                      </div>
                      <p className="text-muted-foreground text-sm">Creates optimized learning path with milestones</p>
                    </div>
                    <div className="p-4 rounded-lg bg-card800/50 border border-border700">
                      <div className="flex items-center gap-2 mb-2">
                        <Route className="h-5 w-5 text-green-400" />
                        <span className="text-card-foreground font-semibold">Adaptive Updates</span>
                      </div>
                      <p className="text-muted-foreground text-sm">Roadmap evolves based on progress and feedback</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </motion.section>

        {/* College Matcher Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <GraduationCap className="h-10 w-10 text-primary" />
              <div>
                <h2 className="font-display text-3xl md:text-4xl text-foreground">College Matcher</h2>
                <p className="text-muted-foreground mt-2">Find the perfect college match based on your profile</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Matching Algorithm</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    Our algorithm analyzes thousands of data points to find the best college matches for each student:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <span>Academic performance and exam scores</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <span>Cutoff trends and admission probability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <span>Course preferences and career alignment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <span>Location, fees, and financial constraints</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <span>Placement records and ROI analysis</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Data Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Cutoffs",
                      "Fees",
                      "Placements",
                      "Rankings",
                      "Courses",
                      "Location",
                      "Infrastructure",
                      "Alumni Network",
                    ].map((category) => (
                      <div
                        key={category}
                        className="p-3 rounded-lg bg-card800/50 border border-border700 text-center"
                      >
                        <p className="text-muted-foreground text-sm">{category}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.section>

        {/* Document AI Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <FileText className="h-10 w-10 text-primary" />
              <div>
                <h2 className="font-display text-3xl md:text-4xl text-foreground">Document AI</h2>
                <p className="text-muted-foreground mt-2">Generate professional documents with AI assistance</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                {
                  title: "Resume Builder",
                  description: "Create ATS-friendly resumes tailored to job descriptions",
                  features: ["Multiple templates", "Skills matching", "Format optimization"],
                },
                {
                  title: "SOP Generator",
                  description: "Write compelling Statements of Purpose for college applications",
                  features: ["Personalized content", "Structure guidance", "Grammar check"],
                },
                {
                  title: "Cover Letters",
                  description: "Generate professional cover letters for job applications",
                  features: ["Company research", "Customization", "Tone adjustment"],
                },
                {
                  title: "Project Reports",
                  description: "Create structured project reports with proper formatting",
                  features: ["Auto-formatting", "Citation support", "Template library"],
                },
                {
                  title: "Academic Letters",
                  description: "Generate recommendation and application letters",
                  features: ["Formal tone", "Custom content", "Multiple formats"],
                },
                {
                  title: "Study Notes",
                  description: "Convert lectures and materials into organized notes",
                  features: ["Auto-summarization", "Key points extraction", "Visual formatting"],
                },
              ].map((doc, index) => (
                <motion.div
                  key={doc.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className="border-border bg-card h-full">
                    <CardHeader>
                      <CardTitle className="text-card-foreground text-lg">{doc.title}</CardTitle>
                      <CardDescription className="text-muted-foreground text-sm">{doc.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {doc.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Daily Mentor Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare className="h-10 w-10 text-primary" />
              <div>
                <h2 className="font-display text-3xl md:text-4xl text-foreground">Daily Mentor</h2>
                <p className="text-muted-foreground mt-2">Your AI companion for daily guidance and motivation</p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Daily Insights",
                  description: "Receive personalized one-line insights every morning based on your progress and goals",
                  icon: Sparkles,
                },
                {
                  title: "Study Planner",
                  description: "Get smart study schedules that adapt to your energy levels and commitments",
                  icon: Brain,
                },
                {
                  title: "Mood-Based Adjustment",
                  description: "Your mentor adjusts recommendations based on your emotional state and stress levels",
                  icon: MessageSquare,
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Card className="border-border bg-card h-full">
                    <CardHeader>
                      <feature.icon className="h-10 w-10 text-primary mb-4" />
                      <CardTitle className="text-card-foreground text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* B2B Dashboard Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="h-10 w-10 text-primary" />
              <div>
                <h2 className="font-display text-3xl md:text-4xl text-foreground">B2B Institute Dashboard</h2>
                <p className="text-muted-foreground mt-2">Real-time analytics and insights for educational institutes</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Student Progress Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <span>Real-time progress monitoring across all students</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <span>Completion rates and milestone achievements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <span>Engagement metrics and activity tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <span>Cohort-level analytics and comparisons</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-card-foreground">Drop-off Risk Model</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <span>ML-powered risk prediction for at-risk students</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <span>Early warning signals and intervention alerts</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <span>Burnout and disengagement detection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                      <span>Automated escalation workflows</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border bg-card mb-8">
              <CardHeader>
                <CardTitle className="text-card-foreground">Analytics Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    "Retention Analytics",
                    "Performance Trends",
                    "Engagement Heatmaps",
                    "Intervention Success Rates",
                    "ROI Metrics",
                    "Tableau Integration",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="p-3 rounded-lg bg-card800/50 border border-border700 text-center"
                    >
                      <p className="text-muted-foreground text-sm">{feature}</p>
                    </div>
                  ))}
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
            <h2 className="font-display text-3xl md:text-4xl mb-4 text-foreground">Ready to Transform Student Success?</h2>
            <p className="text-muted-foreground mb-8">
              Schedule a personalized demo to see how Mentark can help your students or institute achieve better outcomes.
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold">
              <Link href="/demo">
                Book a Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
}

