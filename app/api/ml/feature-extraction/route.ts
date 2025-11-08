/**
 * Feature Extraction API
 * Endpoint to trigger feature extraction for students
 */

import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/utils/api-helpers";
import { extractFeatures } from "@/lib/ml/data-collection/feature-extractor";
import { aggregateBehavioralPatterns } from "@/lib/ml/data-collection/aggregator";
import { storeFeatureVector } from "@/lib/ml/feature-store";

/**
 * POST /api/ml/feature-extraction
 * Extract and store features for a student or all students
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return errorResponse("Unauthorized", 401);
    }

    // Verify admin or system
    const { data: admin } = await supabase
      .from("admins")
      .select("user_id")
      .eq("user_id", user.id)
      .single();

    if (!admin) {
      return errorResponse("Admin access required", 403);
    }

    const body = await request.json();
    const { student_id, batch_size = 10 } = body;

    if (student_id) {
      // Extract features for a specific student
      const result = await extractFeaturesForStudent(student_id);
      return successResponse(result);
    } else {
      // Extract features for all students (batch processing)
      const result = await extractFeaturesForAllStudents(batch_size);
      return successResponse(result);
    }
  } catch (error: any) {
    console.error("Feature extraction error:", error);
    return errorResponse(error.message || "Internal server error", 500);
  }
}

/**
 * Extract features for a specific student
 */
async function extractFeaturesForStudent(studentId: string) {
  const supabase = await createClient();

  // Get behavioral patterns
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const patterns = await aggregateBehavioralPatterns(
    studentId,
    thirtyDaysAgo,
    now
  );

  // Get student profile
  const { data: studentData } = await supabase
    .from("students")
    .select("*")
    .eq("user_id", studentId)
    .single();

  if (!studentData) {
    throw new Error("Student not found");
  }

  // Extract features
  const featureVector = await extractFeatures(
    studentId,
    patterns,
    studentData
  );

  // Store feature vector
  await storeFeatureVector(featureVector);

  return {
    student_id: studentId,
    features_extracted: true,
    feature_count: Object.keys(featureVector.features).length,
    timestamp: featureVector.timestamp,
  };
}

/**
 * Extract features for all students in batches
 */
async function extractFeaturesForAllStudents(batchSize: number = 10) {
  const supabase = await createClient();

  // Get all students
  const { data: students } = await supabase
    .from("students")
    .select("user_id");

  if (!students || students.length === 0) {
    return {
      processed: 0,
      total: 0,
      errors: [],
    };
  }

  const results = {
    processed: 0,
    total: students.length,
    errors: [] as Array<{ student_id: string; error: string }>,
  };

  // Process in batches
  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (student) => {
        try {
          await extractFeaturesForStudent(student.user_id);
          results.processed++;
        } catch (error: any) {
          results.errors.push({
            student_id: student.user_id,
            error: error.message,
          });
        }
      })
    );
  }

  return results;
}


