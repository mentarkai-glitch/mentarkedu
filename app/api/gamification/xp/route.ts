import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse, handleApiError } from "@/lib/utils/api-helpers";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Get student's XP transactions
    const { data: transactions, error } = await supabase
      .from('xp_transactions')
      .select('*')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Calculate total XP
    const totalXp = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0;
    
    // Calculate level
    const level = Math.floor(Math.sqrt(totalXp / 100)) + 1;
    const xpToNextLevel = Math.pow(level, 2) * 100 - totalXp;

    return successResponse({
      totalXp,
      level,
      xpToNextLevel,
      transactions: transactions || []
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const { amount, source, description, metadata } = body;

    if (!amount || !source) {
      return errorResponse("Amount and source are required", 400);
    }

    // Insert XP transaction
    const { data: transaction, error } = await supabase
      .from('xp_transactions')
      .insert({
        student_id: user.id,
        amount,
        source,
        description,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;

    return successResponse(transaction);
  } catch (error) {
    return handleApiError(error);
  }
}
