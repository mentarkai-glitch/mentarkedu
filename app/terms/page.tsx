"use client";

import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CORE_TERMS: Array<{ title: string; clauses: string[] }> = [
  {
    title: "1. Acceptance of terms",
    clauses: [
      "By using Mentark platforms (web, mobile, AI agents) you agree to these terms and our privacy policy.",
      "Institutes signing Master Service Agreements may receive additional annexures; the stricter clause prevails.",
      "Users must be 13+ or have verified guardian consent for junior cohorts.",
    ],
  },
  {
    title: "2. Accounts and access",
    clauses: [
      "Students receive login credentials via their institute or direct sign-up; protect your password at all times.",
      "Institutes are responsible for provisioning and revoking faculty/admin access.",
      "Misuse (impersonation, unauthorised scraping, tampering with ARK outcomes) leads to suspension.",
    ],
  },
  {
    title: "3. Services we provide",
    clauses: [
      "ARK generation, Daily Assistant, Study Analyzer, risk dashboards, and AI mentors operate as guidance tools.",
      "Model outputs are recommendations, not guarantees; final academic decisions remain yours.",
      "We continuously iterate ML models—performance metrics and version notes are available on request.",
    ],
  },
  {
    title: "4. Payment, trials, and refunds",
    clauses: [
      "Paid plans (Mentark Neuro, Mentark Quantum) renew on the cadence you select during checkout.",
      "Invoices are issued in INR with GST where applicable; Razorpay manages card/UPI collection.",
      "Contact partnerships@mentark.com within seven days for billing disputes; we follow a fair-use refund policy.",
    ],
  },
  {
    title: "5. Content and conduct",
    clauses: [
      "Do not upload abusive, discriminatory, or copyrighted material without permission.",
      "AI assistants may refuse prompts that violate safety policies.",
      "Human mentors can review flagged conversations to ensure wellbeing and compliance.",
    ],
  },
  {
    title: "6. Data rights",
    clauses: [
      "You retain ownership of your content; you grant Mentark a licence to process it for guidance, analytics, and product improvement.",
      "We maintain detailed audit logs for regulators; see the privacy policy for retention timelines.",
      "Deletion requests are honoured unless a law or institute agreement requires temporary retention.",
    ],
  },
  {
    title: "7. Service availability",
    clauses: [
      "Mentark strives for 99.5% uptime, but maintenance or third-party outages may occur.",
      "We provide status updates via status.mentark.com and email/WhatsApp alerts for critical downtime.",
      "Beta features may change or sunset without notice; we communicate major roadmap shifts in advance.",
    ],
  },
  {
    title: "8. Liability",
    clauses: [
      "Mentark is not liable for indirect, incidental, or consequential damages arising from platform usage.",
      "For paying institutions, total liability is capped at the fees paid in the preceding six months.",
      "Nothing in these terms limits consumer rights available under Indian law.",
    ],
  },
  {
    title: "9. Governing law and dispute resolution",
    clauses: [
      "These terms are governed by the laws of India with courts in Bengaluru holding exclusive jurisdiction.",
      "Disputes first undergo mediation; if unresolved within 30 days, parties may pursue arbitration or court proceedings.",
    ],
  },
];

const EXPANDED_CLAUSES: Array<{ title: string; body: string[] }> = [
  {
    title: "Using Mentark",
    body: [
      "Mentark provides academic roadmaps (ARKs), AI mentors, analytics dashboards, and integrations for students, parents, and institutes.",
      "By creating an account or accessing dashboards, you confirm you are authorised to act for yourself or your organisation.",
      "Institutes are responsible for ensuring their usage complies with local regulations and institutional policies.",
    ],
  },
  {
    title: "Accounts & access",
    body: [
      "Keep login credentials secure and notify us immediately of any unauthorised access.",
      "Student accounts may be provisioned by institutes or self-registered with an email/phone OTP.",
      "Mentark may suspend or terminate accounts that violate acceptable use, security, or payment terms.",
    ],
  },
  {
    title: "Payments",
    body: [
      "Paid plans (Neuro, Quantum) are billed monthly or annually in Indian rupees via Razorpay.",
      "Institute partnerships operate on custom Statements of Work approved through the partnerships desk.",
      "Refunds follow RBI and Razorpay guidelines; contact partnerships@mentark.com for assistance.",
    ],
  },
  {
    title: "Intellectual property",
    body: [
      "Mentark retains ownership of the platform, AI models, UI, and documentation.",
      "Institutes retain ownership of their raw data. Mentark receives a limited licence to process it for service delivery.",
      "You may not reverse engineer, resell, or copy Mentark without written consent.",
    ],
  },
  {
    title: "AI outputs",
    body: [
      "AI-generated recommendations are intended to guide—not replace—human judgement from mentors and counsellors.",
      "We log AI prompts and outputs to improve quality, mitigate bias, and meet audit obligations.",
      "High-stakes alerts (dropout, burnout) are always paired with human review workflows.",
    ],
  },
  {
    title: "Limitation of liability",
    body: [
      'Mentark is provided "as is" without warranties. We are not liable for indirect or consequential losses.',
      "Total liability for any claim is capped at the fees paid for the preceding three months.",
      "Some jurisdictions do not allow certain limitations, so these may not apply to you.",
    ],
  },
  {
    title: "Governing law",
    body: [
      "These terms are governed by the laws of India. Disputes will be resolved in Mumbai, Maharashtra.",
      "We follow India&apos;s DPDP Act and sector-specific education guidance for compliance.",
      "Institutes outside India may request region-specific addendums.",
    ],
  },
];

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const lastUpdated = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="container mx-auto max-w-4xl px-4 py-16 space-y-12">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <Button
            asChild
            variant="outline"
            className="border-slate-700 text-slate-200 hover:text-yellow-200 w-max"
          >
            <Link href="/">← Back to home</Link>
          </Button>
          <p className="text-xs uppercase tracking-[0.4em] text-yellow-300">Terms of Service</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl">
            Building the national mentorship OS with clarity and trust.
          </h1>
          <p className="text-slate-300 sm:text-lg">
            These terms outline the relationship between Mentark, Indian institutes, mentors, families, and learners. They
            apply across Mentark Neuro, Mentark Quantum, the AI mentor suite, and allied services.
          </p>
          <p className="text-sm text-slate-500">Last updated: {lastUpdated}</p>
        </motion.header>

        <div className="space-y-10">
          {CORE_TERMS.map((section) => (
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
                {section.clauses.map((clause) => (
                  <li key={clause} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-yellow-400" />
                    <span className="leading-relaxed">{clause}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          ))}
        </div>

        <div className="space-y-6">
          {EXPANDED_CLAUSES.map((clause) => (
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
        </div>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-6 sm:p-8 space-y-4"
        >
          <h2 className="text-2xl font-semibold text-white">Questions about these terms?</h2>
          <p className="text-slate-200">
            Reach out at partnerships@mentark.com for institute agreements or connect@mentark.com for personal accounts.
            We aim to respond within three working days.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="bg-gradient-cyan-blue text-black font-semibold hover:opacity-90">
              <Link href="mailto:partnerships@mentark.com">Contact partnerships</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-600 text-slate-200 hover:text-yellow-200">
              <Link href="mailto:connect@mentark.com">Write to support</Link>
            </Button>
          </div>
        </motion.section>

        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Contact</CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-3 text-sm sm:text-base">
            <p>
              For questions about these terms, email{" "}
              <Link href="mailto:legal@mentark.com" className="text-yellow-300">
                legal@mentark.com
              </Link>{" "}
              or write to Mentark Labs Private Limited, Mumbai, Maharashtra, India.
            </p>
            <p>Effective date: {new Date().toLocaleDateString("en-IN")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
