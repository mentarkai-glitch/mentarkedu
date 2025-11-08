import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (adminError || !admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("students")
      .select("user_id, profile_data")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch (error: any) {
    console.error("Failed to fetch admin student list", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
