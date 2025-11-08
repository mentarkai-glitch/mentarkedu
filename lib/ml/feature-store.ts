/**
 * Feature Store
 * Stores and retrieves computed ML features for fast inference
 */

import { createClient } from "@/lib/supabase/server";
import type { MLFeatureVector } from "./data-collection/feature-extractor";

/**
 * Store feature vector in feature store
 */
export async function storeFeatureVector(
  featureVector: MLFeatureVector
): Promise<void> {
  const supabase = await createClient();

  try {
    await supabase.from("ml_feature_store").upsert({
      student_id: featureVector.student_id,
      feature_version: featureVector.metadata.feature_version,
      features: featureVector.features,
      extraction_timestamp: featureVector.timestamp.toISOString(),
    }, {
      onConflict: 'student_id,feature_version,extraction_timestamp'
    });
  } catch (error) {
    console.error("Error storing feature vector:", error);
    throw error;
  }
}

/**
 * Get latest feature vector for a student
 */
export async function getLatestFeatureVector(
  studentId: string,
  featureVersion: string = "1.0.0"
): Promise<MLFeatureVector | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ml_feature_store")
    .select("*")
    .eq("student_id", studentId)
    .eq("feature_version", featureVersion)
    .order("extraction_timestamp", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    student_id: data.student_id,
    timestamp: new Date(data.extraction_timestamp),
    features: data.features as MLFeatureVector["features"],
    metadata: {
      feature_version: data.feature_version,
      extraction_timestamp: new Date(data.extraction_timestamp),
    },
  };
}

/**
 * Get feature vectors for multiple students
 */
export async function getFeatureVectors(
  studentIds: string[],
  featureVersion: string = "1.0.0"
): Promise<Map<string, MLFeatureVector>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ml_feature_store")
    .select("*")
    .in("student_id", studentIds)
    .eq("feature_version", featureVersion)
    .order("extraction_timestamp", { ascending: false });

  if (error || !data) {
    return new Map();
  }

  const featureMap = new Map<string, MLFeatureVector>();

  // Get latest feature vector for each student
  const studentMap = new Map<string, typeof data[0]>();
  data.forEach((row) => {
    const existing = studentMap.get(row.student_id);
    if (!existing || new Date(row.extraction_timestamp) > new Date(existing.extraction_timestamp)) {
      studentMap.set(row.student_id, row);
    }
  });

  studentMap.forEach((row) => {
    featureMap.set(row.student_id, {
      student_id: row.student_id,
      timestamp: new Date(row.extraction_timestamp),
      features: row.features as MLFeatureVector["features"],
      metadata: {
        feature_version: row.feature_version,
        extraction_timestamp: new Date(row.extraction_timestamp),
      },
    });
  });

  return featureMap;
}

/**
 * Backfill feature vectors for all students
 */
export async function backfillFeatureVectors(
  featureVersion: string = "1.0.0",
  batchSize: number = 100
): Promise<void> {
  const supabase = await createClient();
  const { extractFeatures } = await import("./data-collection/feature-extractor");
  const { aggregateBehavioralPatterns } = await import("./data-collection/aggregator");

  // Get all students
  const { data: students } = await supabase
    .from("students")
    .select("user_id");

  if (!students) return;

  // Process in batches
  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (student) => {
        try {
          // Get behavioral patterns
          const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const now = new Date();
          const patterns = await aggregateBehavioralPatterns(
            student.user_id,
            thirtyDaysAgo,
            now
          );

          // Get student profile
          const { data: studentData } = await supabase
            .from("students")
            .select("*")
            .eq("user_id", student.user_id)
            .single();

          if (!studentData) return;

          // Extract features
          const featureVector = await extractFeatures(
            student.user_id,
            patterns,
            studentData
          );

          // Store feature vector
          await storeFeatureVector(featureVector);
        } catch (error) {
          console.error(`Error processing student ${student.user_id}:`, error);
        }
      })
    );
  }
}


