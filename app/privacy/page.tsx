"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const sections: Array<{ title: string; points: string[] }> = [
    {
      title: "1. How we collect information",
      points: [
        "Profile data you share during onboarding (academic goals, support needs, location).",
        "Session activity from ARKs, Daily Assistant, Study Analyzer, and other dashboards.",
        "Optional uploads like notes, assignments, or voice messages used for analytics.",
        "Telemetry for product reliability (anonymised events, error logs, performance metrics).",
      ],
    },
    {
      title: "2. Why we use your information",
      points: [
        "To generate and improve personalised ARKs, nudges, and mentor insights.",
        "To surface wellbeing signals so counsellors and parents intervene calmly.",
        "To run ML models that forecast risk, burnout, and career fit for Indian students.",
        "To fulfil purchases, send transactional communications, and comply with Indian regulations.",
      ],
    },
    {
      title: "3. How we store and secure it",
      points: [
        "Data lives in Supabase (India region) with row-level security and access logs.",
        "Secrets and model artefacts stay in encrypted storage with rotation policies.",
        "Access is role-based; only vetted Mentark operators can view learner records.",
        "We retain history so you can audit interventions; you can request deletion anytime.",
      ],
    },
    {
      title: "4. Sharing and integrations",
      points: [
        "We only share data with institute administrators, counsellors, or mentors linked to your account.",
        "Third-party integrations (Razorpay, EmailJS, RunPod, Google Cloud, Semantic Scholar) receive minimum required fields.",
        "We never sell learner data, advertising slots, or anonymised data lakes.",
        "International transfers follow GDPR and Indian PDP Bill provisions when applicable.",
      ],
    },
    {
      title: "5. Your choices",
      points: [
        "You can update or export your data from the student profile dashboard.",
        "Request account deletion by writing to connect@mentark.com; we respond within seven working days.",
        "Opt out of non-essential emails or WhatsApp nudges while retaining platform access.",
        "Raise privacy questions anytime at privacy@mentark.com.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="container mx-auto max-w-4xl px-4 py-16 space-y-12">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <Link href="/" className="inline-block">
            <Button variant="outline" className="border-slate-700 text-slate-200 hover:text-yellow-200">
              ← Back to home
            </Button>
          </Link>
          <p className="text-xs uppercase tracking-[0.4em] text-yellow-300">Privacy Policy</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl">
            Protecting every learner&apos;s data, dignity, and direction.
          </h1>
          <p className="text-slate-300 sm:text-lg">
            Mentark operates as an Indian-first mentorship OS. This policy covers how we collect, use, and safeguard
            personal information across Mentark Neuro, Mentark Quantum, and related AI agents.
          </p>
          <p className="text-sm text-slate-500">
            Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </motion.header>

        <div className="space-y-10">
          {sections.map((section) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8 space-y-4"
            >
              <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
              <ul className="space-y-3 text-sm sm:text-base text-slate-300">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-yellow-400" />
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 sm:p-8 space-y-4"
        >
          <h2 className="text-2xl font-semibold text-white">Need a data processing agreement?</h2>
          <p className="text-slate-200">
            Institutes, network partners, and investors can request a DPA or detailed security dossier by writing to
            partnerships@mentark.com. We respond with artefacts (RLS policies, penetration test summaries, observability
            diagrams) within five working days.
          </p>
          <Button
            asChild
            className="bg-gradient-cyan-blue text-black font-semibold hover:opacity-90"
          >
            <Link href="mailto:privacy@mentark.com">Contact the privacy desk</Link>
          </Button>
        </motion.section>
      </div>
    </div>
  );
}
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const SECTIONS = [
  {
    title: "Information we collect",
    points: [
      "Account details such as name, institute affiliation, and contact information provided during onboarding.",
      "Academic context including ARK inputs, study preferences, and Mentark AI training responses.",
      "Usage signals from dashboards, daily assistant check-ins, and chat interactions for analytics and ML improvement.",
      "Payment details processed securely through Razorpay for subscriptions and partnerships."
    ],
  },
  {
    title: "How we use your information",
    points: [
      "Personalise ARKs, risk alerts, and recommendations for students, parents, and institutes.",
      "Operate Mentark services, including WhatsApp notifications, email digests, and AI mentor experiences.",
      "Maintain security, debug incidents, and analyse product usage via PostHog and Sentry.",
      "Comply with legal requirements and enforce our Terms of Service."
    ],
  },
  {
    title: "Your controls",
    points: [
      "Download or delete personal data by emailing connect@mentark.com.",
      "Opt out of marketing emails or WhatsApp notifications directly from each channel.",
      "Request manual review of ML-driven insights and alerts through the admin dashboard.",
      "Designate a data protection representative for institute deployments."
    ],
  },
  {
    title: "Data retention",
    points: [
      "Student learning records are retained while the account remains active to support longitudinal guidance.",
      "ML training data is pseudonymised and rotated regularly to honour consent and accuracy.",
      "Financial records are stored for at least seven years to satisfy Indian compliance obligations.",
      "Backups are stored in encrypted form within India-first cloud regions where available."
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto max-w-4xl px-4 py-16 space-y-10">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-yellow-300">Privacy Notice</p>
          <h1 className="font-display text-4xl sm:text-5xl">Built for trust across Indian education.</h1>
          <p className="text-slate-300 text-base sm:text-lg">
            Mentark protects student journeys, institute operations, and family conversations with layered security and
            consent. This page explains what we collect, why, and how you stay in control.
          </p>
        </motion.header>

        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">At a glance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-300">
            <p>
              Mentark complies with India&apos;s DPDP Act guidance, uses secure Supabase storage, and limits access to
              verified mentors and institute admins. Sensitive datasets—mental wellbeing, financial planning, exam prep—are
              encrypted at rest and in transit.
            </p>
            <p>
              Queries or requests? Write to <Link href="mailto:connect@mentark.com" className="text-yellow-300">connect@mentark.com</Link>
              {" "}or, for partnerships, <Link href="mailto:partnerships@mentark.com" className="text-yellow-300">partnerships@mentark.com</Link>.
            </p>
          </CardContent>
        </Card>

        {SECTIONS.map((section) => (
          <Card key={section.title} className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-2xl">{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-slate-300 text-sm sm:text-base">
                {section.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="text-yellow-300">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}

        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Third-party services</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-3 text-sm sm:text-base">
            <p>
              Mentark uses Supabase for authentication and databases, RunPod for ML workloads, Razorpay for payments, and
              EmailJS or Resend for communications. Each provider is under contract to process data solely for Mentark
              purposes.
            </p>
            <p>
              When integrating institute-specific services (ERP, SIS, LMS), we sign mutual NDAs and Data Processing
              Agreements before migration.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Contact & updates</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-3 text-sm sm:text-base">
            <p>
              For privacy requests, email <Link href="mailto:dpo@mentark.com" className="text-yellow-300">dpo@mentark.com</Link>.
              We respond within seven working days.
            </p>
            <Separator className="bg-slate-700" />
            <p>
              We review this notice quarterly. Significant changes will be highlighted inside the product and via email to
              primary contacts.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
