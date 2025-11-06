import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify admin
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin) {
      return errorResponse("Admin access required", 403);
    }

    // Get institute_id
    const { data: userData } = await supabase
      .from("users")
      .select("institute_id")
      .eq("id", user.id)
      .single();

    // Get institute billing
    const { data: institute } = await supabase
      .from("institutes")
      .select("*")
      .eq("id", userData?.institute_id)
      .single();

    // Get actual student count in institute
    const { count: actualStudents } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("institute_id", userData?.institute_id)
      .eq("role", "student");

    const planType = institute?.plan_type || "neuro";
    
    const pricing = {
      neuro: { base_price: 4999, per_student: 99, limit: 100 },
      quantum: { base_price: 9999, per_student: 79, limit: 500 },
    };

    const currentPlan = pricing[planType as keyof typeof pricing];

    const billing = {
      billing: {
        plan_type: planType,
        total_students: actualStudents || 0,
        current_amount: (actualStudents || 0) * currentPlan.per_student + currentPlan.base_price,
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      },
      actual_student_count: actualStudents || 0,
      pricing: pricing,
      payment_history: [],
    };

    return successResponse(billing);
  } catch (error: any) {
    console.error("Billing fetch error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify admin
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin) {
      return errorResponse("Admin access required", 403);
    }

    const body = await request.json();
    const { plan_type } = body;

    if (!plan_type || !["neuro", "quantum"].includes(plan_type)) {
      return errorResponse("Invalid plan_type", 400);
    }

    // Get institute_id
    const { data: userData } = await supabase
      .from("users")
      .select("institute_id")
      .eq("id", user.id)
      .single();

    // Update institute plan
    const { error } = await supabase
      .from("institutes")
      .update({ plan_type })
      .eq("id", userData?.institute_id);

    if (error) {
      return errorResponse(error.message, 500);
    }

    return successResponse({ message: "Plan updated successfully", plan_type });
  } catch (error: any) {
    console.error("Plan update error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}
