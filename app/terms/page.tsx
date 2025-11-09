"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CLAUSES = [
  {
    title: "Using Mentark",
    body: [
      "Mentark provides academic roadmaps (ARKs), AI mentors, analytics dashboards, and integrations for students, parents, and institutes.",
      "By creating an account or accessing dashboards, you confirm you are authorised to act for yourself or your organisation.",
      "Institutes are responsible for ensuring their usage complies with local regulations and institutional policies."
    ],
  },
  {
    title: "Accounts & access",
    body: [
      "Keep login credentials secure and notify us immediately of any unauthorised access.",
      "Student accounts may be provisioned by institutes or self-registered with an email/phone OTP.",
      "Mentark may suspend or terminate accounts that violate acceptable use, security, or payment terms."
    ],
  },
  {
    title: "Payments",
    body: [
      "Paid plans (Neuro, Quantum) are billed monthly or annually in Indian rupees via Razorpay.",
      "Institute partnerships operate on custom Statements of Work approved through the partnerships desk.",
      "Refunds follow RBI and Razorpay guidelines; contact partnerships@mentark.com for assistance."
    ],
  },
  {
    title: "Intellectual property",
    body: [
      "Mentark retains ownership of the platform, AI models, UI, and documentation.",
      "Institutes retain ownership of their raw data. Mentark receives a limited licence to process it for service delivery.",
      "You may not reverse engineer, resell, or copy Mentark without written consent."
    ],
  },
  {
    title: "AI outputs",
    body: [
      "AI-generated recommendations are intended to guide—not replace—human judgement from mentors and counsellors.",
      "We log AI prompts and outputs to improve quality, mitigate bias, and meet audit obligations.",
      "High-stakes alerts (dropout, burnout) are always paired with human review workflows."
    ],
  },
  {
    title: "Limitation of liability",
    body: [
      "Mentark is provided " + "\"as is\"" + " without warranties. We are not liable for indirect or consequential losses.",
      "Total liability for any claim is capped at the fees paid for the preceding three months.",
      "Some jurisdictions do not allow certain limitations, so these may not apply to you."
    ],
  },
  {
    title: "Governing law",
    body: [
      "These terms are governed by the laws of India. Disputes will be resolved in Mumbai, Maharashtra.",
      "We follow India&apos;s DPDP Act and sector-specific education guidance for compliance.",
      "Institutes outside India may request region-specific addendums."
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto max-w-4xl px-4 py-16 space-y-10">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-yellow-300">Terms of Service</p>
          <h1 className="font-display text-4xl sm:text-5xl">Welcome to Mentark.</h1>
          <p className="text-slate-300 text-base sm:text-lg">
            These terms explain how you can access Mentark&apos;s products, what to expect from us, and how to stay compliant.
            By using Mentark, you agree to this agreement as well as our <Link href="/privacy" className="text-yellow-300">Privacy Notice</Link>.
          </p>
        </motion.header>

        {CLAUSES.map((clause) => (
          <Card key={clause.title} className="bg-slate-900/40 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-2xl">{clause.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-slate-300 text-sm sm:text-base">
              {clause.body.map((item) => (
                <p key={item}>{item}</p>
              ))}
            </CardContent>
          </Card>
        ))}

        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Contact</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-3 text-sm sm:text-base">
            <p>
              For questions about these terms, email <Link href="mailto:legal@mentark.com" className="text-yellow-300">legal@mentark.com</Link> or
              write to Mentark Labs Private Limited, Mumbai, Maharashtra, India.
            </p>
            <p>Effective date: {new Date().toLocaleDateString("en-IN")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
