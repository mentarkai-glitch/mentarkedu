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
