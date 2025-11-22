'use client';

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import emailjs from "@emailjs/browser";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  HeartPulse,
  IndianRupee,
  LayoutGrid,
  LineChart,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  Route,
  GraduationCap,
  FileText,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import {
  ANNUAL_DISCOUNT_RATE,
  PRICING_PLANS,
  calculatePlanPrice,
  getCadenceLabel,
  type BillingCycle,
} from "@/lib/payments/pricing";

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

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
    text: "People don't fail for lack of capability; they fail for lack of direction, discipline, and emotional balance. Mentark exists to restore that guidance.",
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
    text: "Mentark is the AI operating system for human growth. From choosing a career to healing burnout, from building wealth to rediscovering purpose—your mentor is present, adaptive, and human at heart.",
  },
];

const quantumFeatures = [
  {
    icon: LayoutGrid,
    title: "ARK Command Center",
    description:
      "Auto-builds living ARKs for every cohort, aligned to Indian boards, semesters, and accreditation timelines so faculty can deliver clarity, fast.",
    bullets: [
      "Institute templates with guardrails and approvals",
      "Shared progress radar for deans, heads, counsellors",
      "Instant timeline recalibration when reality shifts",
    ],
    cta: { label: "Explore Mentark Quantum", href: "/dashboard/student" },
  },
  {
    icon: ShieldCheck,
    title: "Risk & Outcomes Intelligence",
    description:
      "Behavioural ML watches 30+ signals to predict burnout, dropouts, and placement drift before they happen—backed by rule-based fallbacks.",
    bullets: [
      "Escalations with human playbooks for counsellors",
      "Heatmaps by course, batch, and mentor",
      "Audit-ready logs for AICTE/UGC compliance reviews",
    ],
    cta: { label: "See leadership dashboards", href: "/dashboard/admin" },
  },
  {
    icon: LineChart,
    title: "Executive Reporting",
    description:
      "Board-ready dashboards translate student data into revenue, retention, and wellbeing insights investors and trustees can act on.",
    bullets: [
      "Outcome forecasts with confidence ranges",
      "API bridge to ERP / MIS and fundraising decks",
      "Evidence locker for NAAC/NBA accreditation cycles",
    ],
    cta: { label: "Book a strategy call", href: "mailto:partnerships@mentark.com" },
  },
];

const neuroFeatures = [
  {
    icon: Brain,
    title: "Mentark Neuro Mentors",
    description:
      "Five AI mentors listen like humans, think like strategists, and coach daily routines—anchored in the student's goals, culture, and context.",
    bullets: [
      "Persona blend for motivation, calm, analysis, spirituality",
      "Understands ARKs, timetables, and exam calendars",
      "Seamless handoff notes to teachers or counsellors",
    ],
    cta: { label: "Talk to Mentark Neuro", href: "/chat" },
  },
  {
    icon: HeartPulse,
    title: "Emotion & Energy Timeline",
    description:
      "Daily check-ins, burnout detection, and coping nudges keep learners steady; parents see balanced updates instead of panic alerts.",
    bullets: [
      "Mood + workload correlation with recommended actions",
      "Offline-friendly Daily Assistant with streak protection",
      "Family digest mails in plain language, not dashboards",
    ],
    cta: { label: "Try the Daily Assistant", href: "/daily-checkin" },
  },
  {
    icon: IndianRupee,
    title: "Train Mentark AI",
    description:
      "Students share graduation targets, household budget bands, and competitive exams so every plan, scholarship, and reminder stays grounded in Indian realities.",
    bullets: [
      "Course + semester aware nudges and revision loops",
      "Local cost guidance across coaching, content, and travel",
      "Career milestones with parental visibility & consent",
    ],
    cta: { label: "Personalise my AI", href: "/dashboard/student/train-ai" },
  },
];

const audienceBenefits = [
  {
    title: "For students",
    subtitle: "Clarity replaces chaos",
    points: [
      "One destination for ARKs, daily assistant, doubt solver, projects, and emotion tracking",
      "Adaptive guidance respects workload, mental energy, and personal ambition",
      "Scholarship, internship, and content recommendations tuned to Indian realities",
    ],
  },
  {
    title: "For parents",
    subtitle: "Visibility without micromanagement",
    points: [
      "Weekly digest reports highlight wins, risks, and next steps in simple language",
      "Budget-aware suggestions ensure every recommendation fits Indian families",
      "Emotion timelines surface early signs of burnout or disengagement",
    ],
  },
  {
    title: "For institutes",
    subtitle: "Impact you can prove",
    points: [
      "Reduce dropouts and anxiety with human-in-the-loop interventions",
      "Provide investors and trustees with credible, always-on reporting",
      "Launch new premium mentorship offerings with zero extra headcount",
    ],
  },
];

const stakeholderHighlights = [
  {
    title: "Institutes & Investors",
    icon: Target,
    points: [
      "30–40% attrition reduction with proactive ML alerts",
      "New premium revenue streams via AI mentorship tiers",
      "Audit-ready data rooms (feature store, model versioning, governance)",
      "SOC2-ready architecture with UGC/AICTE compliance",
    ],
  },
  {
    title: "Families & Learners",
    icon: MapPin,
    points: [
      "Transparent Indian budgeting across coaching, content, and wellness",
      "Entrance-exam aware planning for JEE, NEET, AIIMS, CUET, UPSC",
      "Emotion alerts with human-in-the-loop interventions",
      "Mentor loops that involve teachers, counsellors, and parents",
    ],
  },
];

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

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    organisation: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const discountPercent = Math.round(ANNUAL_DISCOUNT_RATE * 100);
  const emailJsServiceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const emailJsTemplateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const emailJsPublicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const isEmailJsConfigured = Boolean(emailJsServiceId && emailJsTemplateId && emailJsPublicKey);

  const handleChange = (field: keyof typeof formState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (formStatus !== "idle") {
        setFormStatus("idle");
        setFormMessage(null);
      }
      setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus("submitting");
    setFormMessage(null);

    if (!isEmailJsConfigured) {
      console.error("EmailJS environment variables are missing.");
      setFormStatus("error");
      setFormMessage(
        "We couldn't send your message because email delivery is not configured yet. Please write to partnerships@mentark.com."
      );
      return;
    }

    try {
      await emailjs.send(
        emailJsServiceId!,
        emailJsTemplateId!,
        {
          name: formState.name,
          email: formState.email,
          organisation: formState.organisation,
          message: formState.message,
        },
        emailJsPublicKey
      );

      setFormStatus("success");
      setFormMessage("Your message has been sent! We'll get back to you within one business day.");
      setFormState({ name: "", email: "", organisation: "", message: "" });
    } catch (error) {
      console.error("EmailJS send failed", error);
      setFormStatus("error");
      setFormMessage("Failed to send message. Please try again or email partnerships@mentark.com.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="pt-16">
        <motion.section
          className="container mx-auto px-4 pt-20 pb-12 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatedText delay={0.2}>
            <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300">
              One command center for student success
            </Badge>
          </AnimatedText>
          <AnimatedText delay={0.4}>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
              Every learner guided. Every parent reassured.
              <br />
              <span className="text-gradient-cyan">Every institute future-ready.</span>
            </h1>
          </AnimatedText>
          <AnimatedText delay={0.6}>
            <p className="mx-auto mt-6 max-w-4xl text-base sm:text-lg md:text-xl text-muted-foreground">
              Mentark is India&apos;s all-in-one destination for clarity across academics, careers, emotions, and finances.
              ARKs evolve daily, AI mentors stay compassionate, and leadership dashboards prove impact to investors and regulators.
            </p>
          </AnimatedText>
          <motion.div
            className="mt-10 grid gap-4 sm:grid-cols-3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {[
              {
                title: "Students",
                text: "Crystal-clear roadmaps, momentum insights, and burnout safeguards in one place.",
              },
              {
                title: "Parents",
                text: "Weekly confidence briefings so they support without stress or surveillance.",
              },
              {
                title: "Institutes",
                text: "Live risk intel, accreditation evidence, and premium mentorship revenue.",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ scale: 1.02 }}
                className="rounded-xl border border-border bg-card px-5 py-6"
              >
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">{item.title}</p>
                <p className="mt-2 text-sm sm:text-base text-muted-foreground">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
          <AnimatedText delay={0.8}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold shadow-lg shadow-cyan-500/25"
                >
                  <Link href="/demo">Request an enterprise walkthrough</Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-yellow-500/40 text-yellow-300 hover:border-yellow-500/60"
                >
                  <Link href="#pricing">View plans</Link>
                </Button>
              </motion.div>
            </div>
          </AnimatedText>
        </motion.section>

        {/* New: Problem Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 mb-4">
                The Challenge
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6 text-foreground">
                Millions of Indian Students Face the Same Challenges
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Lack of Guidance",
                  description:
                    "Most students don't have access to quality mentorship. They rely on generic advice from friends, family, or outdated online resources that don't understand their unique context.",
                },
                {
                  title: "Career Confusion",
                  description:
                    "Students struggle to choose the right career path, college, or course. With thousands of options and limited information, decision-making becomes overwhelming and stressful.",
                },
                {
                  title: "Outdated Systems",
                  description:
                    "Traditional education systems don't adapt to individual learning styles or provide personalized guidance. One-size-fits-all approaches fail to address unique student needs.",
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
                  <Card className="border-border bg-card h-full">
                    <CardHeader>
                      <CardTitle className="text-card-foreground text-xl">{problem.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed">{problem.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* New: Solution Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
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
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6 text-foreground">
                Introducing ARK – Adaptive Roadmap Kernel
              </h2>
            </div>
            <Card className="border-border bg-card mb-8">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                      <Route className="h-8 w-8 text-primary" />
                      Personalized Roadmap
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      ARK generates a personalized learning path tailored to your goals, current level, and constraints. 
                      It understands Indian education systems, competitive exams like JEE and NEET, and adapts daily based 
                      on your progress.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                      <Brain className="h-8 w-8 text-primary" />
                      Intelligent Guidance
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Our AI mentors provide 24/7 guidance that feels human. They understand your emotional state, 
                      workload, and motivation levels to offer the right support at the right time.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-card-foreground mb-4 flex items-center gap-3">
                      <Target className="h-8 w-8 text-primary" />
                      Real Assessments
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Beyond generic advice, Mentark uses real data—college cutoffs, placement records, career outcomes—to 
                      help you make informed decisions. Every recommendation is backed by evidence.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* New: Product Preview Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
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
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6 text-foreground">
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
                  <Card className="border-border bg-card h-full hover:border-primary/40 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <product.icon className="h-12 w-12 text-primary" />
                        <h3 className="text-card-foreground font-semibold text-lg">{product.title}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm">{product.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* New: Why Mentark Works Section */}
        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border"
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
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mb-6 text-foreground">
                Built on Three Core Principles
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "AI + Psychology + Real Assessments",
                  description:
                    "We combine cutting-edge AI with psychological insights and real-world data. Our recommendations aren't generic—they're based on your actual profile, goals, and the latest information about colleges, careers, and opportunities.",
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
                  <Card className="border-border bg-card h-full">
                    <CardHeader>
                      <principle.icon className="h-10 w-10 text-primary mb-4" />
                      <CardTitle className="text-card-foreground text-xl">{principle.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed">{principle.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id="why-mentark"
          className="container mx-auto px-4 py-16 border-t border-border scroll-mt-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-12">
            <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 mb-4">
              Built for the whole ecosystem
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground">One destination. Three promises.</h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              When Mentark is deployed, students stop second-guessing, parents stop worrying, and institutes stop firefighting.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {audienceBenefits.map((audience) => (
              <motion.div
                key={audience.title}
                className="rounded-2xl border border-border bg-card p-6"
                whileHover={{ y: -6 }}
              >
                <p className="text-xs uppercase tracking-[0.2em] text-primary">{audience.subtitle}</p>
                <h3 className="mt-2 text-2xl font-semibold text-foreground">{audience.title}</h3>
                <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                  {audience.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 text-teal-300" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="manifesto"
          className="container mx-auto px-4 py-16 border-t border-border scroll-mt-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-10">
            <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 mb-4">Mentark Manifesto</Badge>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground">Guiding minds. Growing humans.</h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              This is the covenant that anchors every model release, every feature ship, every partnership.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {manifestoSections.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.05, duration: 0.6 }}
              >
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground text-xl">
                      <Sparkles className="h-5 w-5 text-primary" />
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">{item.text}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="quantum"
          className="container mx-auto px-4 py-16 border-t border-border scroll-mt-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-12">
            <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 mb-4">Mentark Quantum</Badge>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground">The institute OS for clarity, compliance, and ROI.</h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              Adaptive roadmaps, leadership dashboards, and ML observability built for schools, colleges, and skilling academies.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {quantumFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.08, duration: 0.6 }}
                whileHover={{ y: -6 }}
              >
                <Card className="group border-border bg-card hover:border-primary/40 transition-colors">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-primary mb-4" />
                    <CardTitle className="text-card-foreground text-2xl">{feature.title}</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {feature.bullets.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>{point}</span>
          </li>
                      ))}
                    </ul>
                    <Link href={feature.cta.href}>
                      <Button className="mt-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold w-full sm:w-auto group-hover:translate-x-1 transition-transform">
                        {feature.cta.label}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="neuro"
          className="container mx-auto px-4 py-16 border-t border-border scroll-mt-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-12">
            <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 mb-4">Mentark Neuro</Badge>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground">Humanised AI mentors for every learner and family.</h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              Emotional intelligence, daily assistance, and personalised guidance tuned to India&apos;s exams, budget, and cultural context.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {neuroFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.08, duration: 0.6 }}
                whileHover={{ y: -6 }}
              >
                <Card className="group border-border bg-card hover:border-primary/40 transition-colors">
                  <CardHeader>
                    <feature.icon className="h-10 w-10 text-primary mb-4" />
                    <CardTitle className="text-card-foreground text-2xl">{feature.title}</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {feature.bullets.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                          <span>{point}</span>
          </li>
                      ))}
                    </ul>
                    <Link href={feature.cta.href}>
                      <Button className="mt-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold w-full sm:w-auto group-hover:translate-x-1 transition-transform">
                        {feature.cta.label}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="pricing"
          className="container mx-auto px-4 py-16 border-t border-border scroll-mt-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-12">
            <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 mb-4">Pricing</Badge>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground">Designed to grow with your ecosystem.</h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              Pricing stays transparent for Indian campuses and scales with usage. Talk to us for multi-campus or network rates.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 mb-10">
            <div className="inline-flex items-center rounded-full border border-border bg-card p-1">
              {(["monthly", "yearly"] as BillingCycle[]).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={[
                    "px-4 py-2 text-sm font-medium rounded-full transition-all",
                    billingCycle === cycle
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                  suppressHydrationWarning
                >
                  {cycle === "monthly" ? "Monthly" : "Yearly"}
                </button>
              ))}
            </div>
            <p className="text-xs uppercase tracking-wide text-yellow-300">
              Save {discountPercent}% with annual billing
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PRICING_PLANS.map((plan) => {
              const isContactOnly = plan.contactOnly || typeof plan.monthlyPrice === "undefined";
              const price = !isContactOnly ? calculatePlanPrice(plan.id, billingCycle) : null;
              const cadence = getCadenceLabel(plan, billingCycle);
              const monthlyReference =
                !isContactOnly && billingCycle === "yearly"
                  ? `≈ ${INR_FORMATTER.format(plan.monthlyPrice!)} / month`
                  : null;
              const ctaHref =
                plan.cta?.href ??
                (isContactOnly
                  ? "mailto:partnerships@mentark.com"
                  : `/payments?plan=${plan.id}&cycle=${billingCycle}`);

              return (
                <Card
                  key={plan.id}
                  className={[
                    "border-border",
                    "bg-card",
                    plan.highlighted ? "ring-2 ring-primary/70 shadow-lg shadow-primary/10" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <CardHeader>
                    <p className="text-xs uppercase tracking-[0.2em] text-primary">{plan.subheading}</p>
                    <CardTitle className="text-card-foreground text-2xl">{plan.title}</CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      {price !== null ? (
                        <div className="text-3xl font-semibold text-primary">
                          {INR_FORMATTER.format(price)}
                        </div>
                      ) : (
                        <div className="text-3xl font-semibold text-primary">Let's design it together</div>
                      )}
                      <div className="text-sm text-muted-foreground">{cadence}</div>
                      {monthlyReference ? <div className="text-xs text-muted-foreground/70">{monthlyReference}</div> : null}
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {plan.bullets.map((bullet) => (
                        <li key={bullet} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-teal-300 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={ctaHref}>
                      <Button className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold">
                        {plan.cta?.label ?? (isContactOnly ? "Contact partnerships" : "Talk to sales")}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          className="container mx-auto px-4 py-16 border-t border-border scroll-mt-24"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="grid gap-6 md:grid-cols-2">
            {stakeholderHighlights.map((item) => (
              <Card key={item.title} className="border-border bg-card">
                <CardHeader>
                  <item.icon className="h-8 w-8 text-primary mb-3" />
                  <CardTitle className="text-card-foreground text-2xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {item.points.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-teal-300 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
        </div>
        </motion.section>

        <motion.section
          id="contact"
          className="container mx-auto px-4 py-16 border-t border-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-12">
            <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300 mb-4">Connect with us</Badge>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground">Let's co-create the next chapter of mentorship.</h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              Partnerships & sales: <Link href="mailto:partnerships@mentark.com" className="text-primary hover:underline">partnerships@mentark.com</Link> · General enquiries: <Link href="mailto:connect@mentark.com" className="text-primary hover:underline">connect@mentark.com</Link>
            </p>
          </div>
          <Card className="max-w-3xl mx-auto border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground text-2xl">Send us a note</CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                We typically reply within one business day. Messages are delivered via EmailJS straight to the Mentark partnerships desk.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                  <label htmlFor="name" className="text-sm text-muted-foreground">
                    Name
                  </label>
                  <input
                    id="name"
                    value={formState.name}
                    onChange={handleChange("name")}
                    className="rounded-md border border-border bg-card/70 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                    suppressHydrationWarning
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm text-muted-foreground">
                    Work email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formState.email}
                    onChange={handleChange("email")}
                    className="rounded-md border border-border bg-card/70 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                    suppressHydrationWarning
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="organisation" className="text-sm text-muted-foreground">
                    Institute / organisation
                  </label>
                  <input
                    id="organisation"
                    value={formState.organisation}
                    onChange={handleChange("organisation")}
                    className="rounded-md border border-border bg-card/70 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                    suppressHydrationWarning
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="message" className="text-sm text-muted-foreground">
                    How can we help?
                  </label>
                  <textarea
                    id="message"
                    value={formState.message}
                    onChange={handleChange("message")}
                    className="min-h-[120px] rounded-md border border-border bg-card/70 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                    suppressHydrationWarning
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                  disabled={formStatus === "submitting"}
                  suppressHydrationWarning
                >
                  {formStatus === "submitting" ? "Sending..." : "Submit"}
                </Button>
                {formStatus === "success" && (
                  <p className="text-sm text-green-400">
                    {formMessage ?? "Thanks! We received your message and will reply from connect@mentark.com."}
                  </p>
                )}
                {formStatus === "error" && (
                  <p className="text-sm text-red-400">
                    {formMessage ?? "Failed to send message. Please try again or contact us directly."}
                  </p>
                )}
                {!isEmailJsConfigured && (
                  <p className="text-xs text-yellow-300">
                    Email delivery credentials are not configured yet. Messages will not be sent until they are added.
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.section>
      </div>
      <Footer />
    </div>
  );
}
