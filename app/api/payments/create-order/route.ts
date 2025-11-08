import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import {
  type BillingCycle,
  type PricingPlanId,
  calculatePlanPrice,
  getPlanById,
} from "@/lib/payments/pricing";

const SERVER_KEY_ID = process.env.RAZORPAY_KEY_ID;
const SERVER_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const PUBLIC_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? SERVER_KEY_ID;

export async function POST(request: Request) {
  if (!SERVER_KEY_ID || !SERVER_KEY_SECRET || !PUBLIC_KEY_ID) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Razorpay environment variables are missing. Please set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and NEXT_PUBLIC_RAZORPAY_KEY_ID.",
      },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const planId = body.planId as PricingPlanId;
    const billingCycle = (body.billingCycle as BillingCycle) ?? "monthly";
    const quantity = Number(body.quantity ?? 1);

    if (!planId || !getPlanById(planId)) {
      return NextResponse.json(
        { success: false, error: "Invalid plan selected." },
        { status: 400 },
      );
    }

    if (billingCycle !== "monthly" && billingCycle !== "yearly") {
      return NextResponse.json(
        { success: false, error: "Invalid billing cycle." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: "Quantity must be greater than zero." },
        { status: 400 },
      );
    }

    const plan = getPlanById(planId);
    if (!plan || plan.contactOnly) {
      return NextResponse.json(
        { success: false, error: "Selected plan requires a custom partnership. Please contact sales." },
        { status: 400 },
      );
    }

    const amountInRupees = calculatePlanPrice(planId, billingCycle) * quantity;
    const amountInPaise = amountInRupees * 100;

    const razorpay = new Razorpay({
      key_id: SERVER_KEY_ID,
      key_secret: SERVER_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `mentark_${planId}_${Date.now()}`,
      notes: {
        planId,
        billingCycle,
        quantity: String(quantity),
        name: body.name ?? "",
        email: body.email ?? "",
        organisation: body.organisation ?? "",
        phone: body.phone ?? "",
      },
    });

    return NextResponse.json({
      success: true,
      order,
      keyId: PUBLIC_KEY_ID,
    });
  } catch (error: any) {
    console.error("[payments-create-order]", error);
    return NextResponse.json(
      { success: false, error: error?.message ?? "Failed to create order." },
      { status: 500 },
    );
  }
}

