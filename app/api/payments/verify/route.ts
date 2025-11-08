import { NextResponse } from "next/server";
import crypto from "crypto";

const SERVER_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: Request) {
  if (!SERVER_KEY_SECRET) {
    return NextResponse.json(
      {
        success: false,
        error: "Razorpay server secret missing. Set RAZORPAY_KEY_SECRET.",
      },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const { orderId, paymentId, signature } = body ?? {};

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { success: false, error: "Missing payment verification payload." },
        { status: 400 },
      );
    }

    const digest = crypto
      .createHmac("sha256", SERVER_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (digest !== signature) {
      return NextResponse.json(
        { success: false, error: "Invalid Razorpay signature." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      orderId,
      paymentId,
      verified: true,
    });
  } catch (error: any) {
    console.error("[payments-verify]", error);
    return NextResponse.json(
      { success: false, error: error?.message ?? "Failed to verify payment." },
      { status: 500 },
    );
  }
}

