"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import {
  type BillingCycle,
  type PricingPlanId,
  PRICING_PLANS,
  calculatePlanPrice,
  getCadenceLabel,
  getPlanById,
  ANNUAL_DISCOUNT_RATE,
} from "@/lib/payments/pricing";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, IndianRupee, Loader2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: any) => any;
  }
}

const INR_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

interface FormState {
  name: string;
  email: string;
  phone: string;
  organisation: string;
  notes: string;
}

const DEFAULT_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  organisation: "",
  notes: "",
};

const BILLING_OPTIONS: { value: BillingCycle; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly · save 10%" },
];

async function ensureRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return;
  if (window.Razorpay) return;
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay script"));
    document.body.appendChild(script);
  });
}

export default function PaymentsPage() {
  const searchParams = useSearchParams();
  const eligiblePlans = useMemo(() => PRICING_PLANS.filter((plan) => !plan.contactOnly), []);
  const initialPlanParam = searchParams.get("plan") as PricingPlanId | null;
  const initialPlan = eligiblePlans.some((plan) => plan.id === initialPlanParam) ? initialPlanParam! : eligiblePlans[0].id;
  const initialCycle = (searchParams.get("cycle") as BillingCycle) ?? "monthly";

  const [planId, setPlanId] = useState<PricingPlanId>(initialPlan);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialCycle);
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const plan = useMemo(() => getPlanById(planId), [planId]);
  const discountPercent = Math.round(ANNUAL_DISCOUNT_RATE * 100);

  useEffect(() => {
    // Preload Razorpay script for faster checkout
    void ensureRazorpayScript().catch((error) => {
      console.error("Failed to preload Razorpay script", error);
    });
  }, []);

  useEffect(() => {
    if (searchParams.get("cycle")) {
      const value = searchParams.get("cycle");
      if (value === "monthly" || value === "yearly") {
        setBillingCycle(value);
      }
    }
  }, [searchParams]);

  const handleInputChange =
    (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleCheckout = async () => {
    if (!plan) return;
    if (!formState.name || !formState.email || !formState.organisation) {
      setStatusMessage({
        type: "error",
        text: "Please fill in your name, work email, and organisation so we can issue the invoice.",
      });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await ensureRazorpayScript();

      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          billingCycle,
          quantity: 1,
          ...formState,
        }),
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error ?? "Unable to create Razorpay order");
      }

      const RazorpayCheckout = window.Razorpay;
      if (!RazorpayCheckout) {
        throw new Error("Razorpay SDK not available in browser");
      }

      const razorpay = new RazorpayCheckout({
        key: json.keyId,
        amount: json.order.amount,
        currency: json.order.currency,
        order_id: json.order.id,
        name: "Mentark",
        description: `${plan.title} · ${billingCycle === "monthly" ? "Monthly" : "Yearly"} billing`,
        prefill: {
          name: formState.name,
          email: formState.email,
          contact: formState.phone,
        },
        notes: {
          organisation: formState.organisation,
          plan: plan.title,
          billing_cycle: billingCycle,
          additional_notes: formState.notes,
        },
        theme: {
          color: "#facc15",
        },
        handler: async (paymentResponse: any) => {
          try {
            const verify = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: json.order.id,
                paymentId: paymentResponse.razorpay_payment_id,
                signature: paymentResponse.razorpay_signature,
              }),
            });
            const verifyJson = await verify.json();
            if (!verify.ok || !verifyJson.success) {
              throw new Error(verifyJson.error ?? "Payment verification failed");
            }

            setStatusMessage({
              type: "success",
              text: "Payment verified. Our partnerships team will reach out within 24 hours with onboarding instructions.",
            });
            setFormState(DEFAULT_FORM);
          } catch (error: any) {
            console.error("Verification failed", error);
            setStatusMessage({
              type: "error",
              text:
                error?.message ??
                "We received the payment but could not verify the signature automatically. Please contact support.",
            });
          }
        },
        modal: {
          ondismiss: () => {
            setStatusMessage({
              type: "error",
              text: "Checkout closed before completing payment. You can try again.",
            });
          },
        },
      });

      razorpay.open();
    } catch (error: any) {
      console.error("Checkout error", error);
      setStatusMessage({
        type: "error",
        text: error?.message ?? "Something went wrong while starting the payment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Invalid plan selected.</p>
      </div>
    );
  }

  const price = calculatePlanPrice(planId, billingCycle);
  const cadence = getCadenceLabel(plan, billingCycle);
  const monthlyReference =
    billingCycle === "yearly" ? `Equivalent to ${INR_FORMATTER.format(plan.monthlyPrice)} / month` : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="container mx-auto max-w-5xl px-4 py-16 space-y-12">
        <header className="space-y-4 text-center">
          <Badge className="border-yellow-500/30 bg-yellow-500/10 text-yellow-300">
            Secure checkout powered by Razorpay
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl">Complete your Mentark subscription</h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Choose the plan that fits your context. Annual billing includes an automatic {discountPercent}% savings. All
            prices are in INR and exclude GST.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Plan configuration</CardTitle>
              <CardDescription className="text-slate-400">
                Select the plan and billing cadence. You can change this later by contacting partnerships@mentark.com.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <section className="space-y-3">
                <Label className="text-slate-200">Plan</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {eligiblePlans.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPlanId(option.id)}
                      className={[
                        "rounded-xl border px-4 py-4 text-left transition-all",
                        planId === option.id
                          ? "border-yellow-400 bg-yellow-500/10 shadow-lg shadow-yellow-500/20"
                          : "border-slate-700 bg-black/30 hover:border-yellow-400/60",
                      ].join(" ")}
                    >
                      <p className="text-xs uppercase tracking-[0.2em] text-yellow-300">{option.subheading}</p>
                      <p className="mt-1 text-lg font-semibold text-white">{option.title}</p>
                      <p className="mt-2 text-sm text-slate-400">{option.description}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <Label className="text-slate-200">Billing cadence</Label>
                <div className="inline-flex rounded-full border border-slate-700 bg-slate-900/60 p-1">
                  {BILLING_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setBillingCycle(option.value)}
                      className={[
                        "px-4 py-2 text-sm font-medium rounded-full transition-all",
                        billingCycle === option.value
                          ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/30"
                          : "text-slate-300 hover:text-white",
                      ].join(" ")}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <Label className="text-slate-200">Billing contact</Label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">
                      Full name
                    </Label>
                    <Input
                      id="name"
                      value={formState.name}
                      onChange={handleInputChange("name")}
                      placeholder="E.g. Rhea Sharma"
                      required
                      className="bg-black/40 border-slate-700 text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">
                      Work email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formState.email}
                      onChange={handleInputChange("email")}
                      placeholder="you@organisation.in"
                      required
                      className="bg-black/40 border-slate-700 text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-300">
                      Phone (optional)
                    </Label>
                    <Input
                      id="phone"
                      value={formState.phone}
                      onChange={handleInputChange("phone")}
                      placeholder="+91 98765 43210"
                      className="bg-black/40 border-slate-700 text-slate-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organisation" className="text-slate-300">
                      Institute / organisation
                    </Label>
                    <Input
                      id="organisation"
                      value={formState.organisation}
                      onChange={handleInputChange("organisation")}
                      placeholder="College, school, or company name"
                      required
                      className="bg-black/40 border-slate-700 text-slate-100"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-slate-300">
                    Notes for the partnerships team (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={formState.notes}
                    onChange={handleInputChange("notes")}
                    rows={4}
                    placeholder="Share cohort size, deployment timeline, or integration needs."
                    className="bg-black/40 border-slate-700 text-slate-100"
                  />
                </div>
              </section>

              <Button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full bg-gradient-cyan-blue text-black font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initiating Razorpay checkout...
                  </>
                ) : (
                  "Proceed to secure payment"
                )}
              </Button>

              {statusMessage ? (
                <div
                  className={[
                    "rounded-lg border px-4 py-3 text-sm",
                    statusMessage.type === "success"
                      ? "border-green-500/40 bg-green-500/10 text-green-200"
                      : "border-red-500/40 bg-red-500/10 text-red-200",
                  ].join(" ")}
                >
                  {statusMessage.text}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800 h-fit">
            <CardHeader>
              <CardTitle className="text-white text-2xl">Order summary</CardTitle>
              <CardDescription className="text-slate-400">
                Review what&apos;s included with your Mentark subscription.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1">
                <p className="text-sm uppercase tracking-[0.25em] text-yellow-300">{plan.subheading}</p>
                <p className="text-xl font-semibold text-white">{plan.title}</p>
                <p className="text-sm text-slate-400">{plan.description}</p>
              </div>
              <div className="rounded-xl border border-slate-700/70 bg-black/30 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>
                    Plan fee ({billingCycle === "monthly" ? "monthly" : "annual"} billing)
                  </span>
                  <span className="font-semibold text-white">{INR_FORMATTER.format(price)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{cadence}</span>
                  {monthlyReference ? <span>{monthlyReference}</span> : null}
                </div>
                <div className="flex items-center gap-2 text-xs text-yellow-300">
                  <IndianRupee className="h-3 w-3" />
                  <span>GST will be added at checkout. Annual billing auto-applies a {discountPercent}% discount.</span>
                </div>
              </div>

              <ul className="space-y-3 text-sm text-slate-300">
                {plan.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-300 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="rounded-xl border border-slate-700/60 bg-black/20 p-4 space-y-2 text-sm text-slate-300">
                <p className="font-semibold text-white">Need procurement support?</p>
                <p>
                  We can issue customised quotes, PO approvals, or bank transfer invoices for large deployments. Reach us
                  at{" "}
                  <a href="mailto:partnerships@mentark.com" className="text-yellow-300 underline">
                    partnerships@mentark.com
                  </a>{" "}
                  with your requirements.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

