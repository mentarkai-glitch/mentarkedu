// @ts-nocheck

import { NextRequest } from "next/server";
import { POST as predictDifficulty } from "@/app/api/ml/predict-difficulty/route";
import { createClient } from "@/lib/supabase/server";

jest.mock("@/lib/supabase/server");

const mockedCreateClient = createClient as jest.Mock;

const createSupabaseStub = () => {
  const studentSelect = {
    eq: jest.fn(() => ({
      single: jest.fn().mockResolvedValue({
        data: { user_id: "student-123" },
        error: null,
      }),
    })),
  };

  const featureSelect = {
    eq: jest.fn(() => ({
      order: jest.fn(() => ({
        limit: jest.fn(() => ({
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              features: {
                performance: {
                  ark_progress_rate_30d: 0.6,
                  xp_earning_rate: 120,
                },
                profile: {
                  motivation_level: 8,
                  confidence_level: 7,
                  hours_per_week: 12,
                },
              },
              feature_version: "1.0.0",
              extraction_timestamp: "2024-01-01T00:00:00Z",
            },
            error: null,
          }),
        })),
      })),
    })),
  };

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: "student-123" } },
        error: null,
      }),
    },
    from: jest.fn((table: string) => {
      if (table === "students") {
        return { select: jest.fn(() => studentSelect) };
      }
      if (table === "ml_feature_store") {
        return { select: jest.fn(() => featureSelect) };
      }
      throw new Error(`Unexpected table ${table}`);
    }),
  };
};

describe("POST /api/ml/predict-difficulty", () => {
  const originalServingUrl = process.env.ML_SERVING_URL;

  afterEach(() => {
    process.env.ML_SERVING_URL = originalServingUrl;
    mockedCreateClient.mockReset();
  });

  it("returns 400 when student_id is missing", async () => {
    const supabase = createSupabaseStub();
    mockedCreateClient.mockResolvedValue(supabase);

    const request = new NextRequest("http://localhost/api/ml/predict-difficulty", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    });

    const response = await predictDifficulty(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.success).toBe(false);
    expect(payload.error).toMatch(/student_id is required/i);
  });

  it("falls back gracefully when ML serving endpoint is not configured", async () => {
    const supabase = createSupabaseStub();
    mockedCreateClient.mockResolvedValue(supabase);
    process.env.ML_SERVING_URL = "";

    const request = new NextRequest("http://localhost/api/ml/predict-difficulty", {
      method: "POST",
      body: JSON.stringify({ student_id: "student-123" }),
      headers: { "content-type": "application/json" },
    });

    const response = await predictDifficulty(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data?.fallback).toBe(true);
    expect(payload.data?.prediction?.recommended_level).toBeDefined();
  });
});


