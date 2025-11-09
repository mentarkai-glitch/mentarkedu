"use client";

import { motion } from "framer-motion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

const SEGMENTS = [
  {
    id: "students",
    title: "Students",
    subtitle: "Clarity, motivation, and personalised growth.",
    description:
      "Mentark Neuro gives every learner a living ARK, five compassionate mentor personas, and a daily assistant that balances academics, wellbeing, and budgets in Indian rupees.",
    highlights: [
      "Adaptive ARKs aligned to school boards, semesters, and entrance exams.",
      "Daily Assistant with energy tracking, smart reminders, and offline resilience.",
      "Career DNA, job matcher, and scholarship nudges grounded in the Indian market.",
      "Emotion Check, burnout detection, and mentor escalations with human oversight.",
    ],
  },
  {
    id: "institutes",
    title: "Institutes",
    subtitle: "Operational excellence and measurable outcomes.",
    description:
      "Mentark Quantum is the institutional OS—giving deans, counsellors, and trustees a single command center for ARKs, ML risk intelligence, and accreditation-ready reporting.",
    highlights: [
      "Cohort ARKs with governance, approvals, and template libraries for every faculty.",
      "Dropout, burnout, and placement risk alerts across cohorts with rule-based fallbacks.",
      "Executive dashboards for retention, revenue, wellbeing, and ROI—with exportable data rooms.",
      "PostHog/Sentry-grade observability, compliance logs, and direct integrations with ERP/SIS stacks.",
    ],
  },
  {
    id: "parents",
    title: "Parents",
    subtitle: "Peace of mind without micromanagement.",
    description:
      "Families see the right level of detail—celebrations, concerns, and upcoming milestones—so they can support without adding pressure.",
    highlights: [
      "Weekly digest emails translating AI signals into plain-language updates.",
      "Budget-aware recommendations for coaching, subscriptions, and scholarships priced for India.",
      "Emotion & energy timelines with suggested conversation starters and coping playbooks.",
      "Instant escalation paths to counsellors or mentors when high-risk signals appear.",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto max-w-6xl px-4 py-16 space-y-12">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4 text-center"
        >
          <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300">
            One platform. Three promises.
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl">
            Features tailored for every stakeholder.
          </h1>
          <p className="text-slate-300 max-w-3xl mx-auto">
            Mentark is the destination for Indian learners, institutes, and families to collaborate.
            Explore the capabilities that keep everyone aligned and confident.
          </p>
        </motion.header>

        <Tabs defaultValue="students" className="space-y-8">
          <TabsList className="flex flex-col sm:flex-row gap-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-2 overflow-hidden">
            {SEGMENTS.map((segment) => (
              <TabsTrigger
                key={segment.id}
                value={segment.id}
                className="w-full sm:w-auto rounded-xl text-sm sm:text-base data-[state=active]:bg-yellow-400 data-[state=active]:text-black data-[state=active]:shadow-lg data-[state=active]:shadow-yellow-400/40"
              >
                {segment.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {SEGMENTS.map((segment) => (
            <TabsContent value={segment.id} key={segment.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-slate-900/40 border-slate-800">
                  <CardHeader>
                    <CardTitle className="text-3xl text-white">{segment.title}</CardTitle>
                    <p className="text-slate-300">{segment.subtitle}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-slate-300 text-base leading-relaxed">{segment.description}</p>
                    <ul className="grid gap-4 md:grid-cols-2 text-sm text-slate-200">
                      {segment.highlights.map((point) => (
                        <li key={point} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-yellow-300 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

