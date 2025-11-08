export type BillingCycle = "monthly" | "yearly";
export type PricingPlanId = "neuro" | "quantum" | "institutes";

export interface PricingPlan {
  id: PricingPlanId;
  title: string;
  subheading: string;
  description: string;
  unit: string;
  monthlyPrice?: number;
  bullets: string[];
  highlighted?: boolean;
  cta?: { label: string; href: string };
  contactOnly?: boolean;
}

export const ANNUAL_DISCOUNT_RATE = 0.1;

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "neuro",
    title: "Mentark Neuro",
    subheading: "For students & families",
    description: "Everything a learner needs—ARKs, mentors, emotion care, job prep—in one adaptive hub.",
    unit: "per student",
    monthlyPrice: 1499,
    bullets: [
      "Full Mentark Neuro mentor suite with daily nudges",
      "Study Analyzer, Daily Assistant, Career DNA & Job Matcher",
      "Parent digest emails and wellbeing checkpoints",
      "Scholarship, finance, and internship recommendations",
    ],
    highlighted: true,
    cta: { label: "Checkout Mentark Neuro", href: "/payments?plan=neuro" },
  },
  {
    id: "quantum",
    title: "Mentark Quantum",
    subheading: "For institutes & networks",
    description: "Institution-wide OS covering cohort ARKs, leadership analytics, and risk intelligence.",
    unit: "per institute user",
    monthlyPrice: 1999,
    bullets: [
      "Cohort ARKs with institute templates and governance",
      "Risk predictions, burnout alerts, and intervention workflows",
      "Reports for deans, trustees, and investors with audit logs",
      "Priority onboarding, success partner, and API access",
    ],
    cta: { label: "Schedule an institute onboarding", href: "/payments?plan=quantum" },
  },
  {
    id: "institutes",
    title: "Mentark Institutes",
    subheading: "For university groups & systems",
    description:
      "End-to-end partnerships for multi-campus networks with governance, data rooms, and white-labeled mentors.",
    unit: "per campus",
    bullets: [
      "Dedicated success squad with 24-hour SLA",
      "ERP/SIS integrations and secure data rooms",
      "Compliance, MSA, and procurement ready documentation",
      "White-labeled mentor marketplace & co-branded journeys",
    ],
    cta: { label: "Consult the partnerships desk", href: "mailto:partnerships@mentark.com" },
    contactOnly: true,
  },
];

export function getPlanById(id: PricingPlan["id"]) {
  return PRICING_PLANS.find((plan) => plan.id === id);
}

export function calculatePlanPrice(planId: PricingPlan["id"], billingCycle: BillingCycle) {
  const plan = getPlanById(planId);
  if (!plan) {
    throw new Error(`Unknown plan: ${planId}`);
  }

  if (plan.contactOnly || typeof plan.monthlyPrice === "undefined") {
    throw new Error(`Plan ${planId} does not have public pricing`);
  }

  if (billingCycle === "monthly") {
    return plan.monthlyPrice;
  }

  const annualPrice = plan.monthlyPrice * 12 * (1 - ANNUAL_DISCOUNT_RATE);
  return Math.round(annualPrice);
}

export function getCadenceLabel(plan: PricingPlan, billingCycle: BillingCycle) {
  if (plan.contactOnly || typeof plan.monthlyPrice === "undefined") {
    return "Custom partnership pricing";
  }

  if (billingCycle === "monthly") {
    return `${plan.unit} / month`;
  }
  return `${plan.unit} / year · billed annually (10% savings)`;
}

