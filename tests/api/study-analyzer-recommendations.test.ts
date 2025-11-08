// @ts-nocheck

import { NextRequest } from "next/server";
import { GET as getRecommendations } from "@/app/api/study-analyzer/recommendations/route";
import { createClient } from "@/lib/supabase/server";

jest.mock("@/lib/supabase/server");

const mockedCreateClient = createClient as jest.Mock;

const createStudySupabaseStub = () => {
  const learningPath = [
    { id: "node-1", student_id: "student-123", topic_id: "math", mastery_level: 0.75 },
  ];
  const recommendations = [
    {
      id: "rec-1",
      student_id: "student-123",
      resource_id: "video-1",
      resource_type: "video",
      score: 0.9,
    },
  ];
  const queueItems = [
    {
      id: "card-1",
      student_id: "student-123",
      card_identifier: "derivatives",
      due_at: "2024-01-01T12:00:00Z",
      interval_days: 3,
      ease_factor: 2.5,
      success_streak: 2,
    },
  ];
  const masteryRaw = [
    {
      topicId: "math",
      topicName: "Mathematics",
      masteryLevel: 0.75,
      lastAssessedAt: "2024-01-01T00:00:00Z",
      recommendedNext: { nextResources: ["advanced-math"] },
    },
  ];

  const createOrderResult = (data: any[]) => ({
    limit: jest.fn(async () => ({ data, error: null })),
    then: (onFulfilled: any) => Promise.resolve({ data, error: null }).then(onFulfilled),
  });

  const learningPathOrder = createOrderResult(learningPath);
  const recommendationsOrder = createOrderResult(recommendations);
  const queueOrder = createOrderResult(queueItems);

  const supabase = {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: "student-123" } },
        error: null,
      }),
    },
    from: jest.fn((table: string) => {
      if (table === "students") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn().mockResolvedValue({
                data: { user_id: "student-123" },
                error: null,
              }),
            })),
          })),
        };
      }

      if (table === "learning_path_nodes") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => learningPathOrder),
            })),
          })),
        };
      }
      if (table === "content_recommendations") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => recommendationsOrder),
            })),
          })),
        };
      }
      if (table === "spaced_repetition_queue") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => queueOrder),
            })),
          })),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    }),
    rpc: jest.fn().mockResolvedValue({ data: masteryRaw, error: null }),
  };

  return { supabase, learningPath, recommendations, queueItems, masteryRaw };
};

describe("GET /api/study-analyzer/recommendations", () => {
  afterEach(() => {
    mockedCreateClient.mockReset();
  });

  it("returns learning path, recommendations, queue and mastery summary", async () => {
    const { supabase, learningPath, recommendations, queueItems, masteryRaw } = createStudySupabaseStub();
    mockedCreateClient.mockResolvedValue(supabase);

    const request = new NextRequest("http://localhost/api/study-analyzer/recommendations");
    const response = await getRecommendations(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.learning_path).toEqual(learningPath);
    expect(payload.data.recommendations).toEqual(recommendations);
    expect(payload.data.spaced_repetition_queue).toEqual(queueItems);
    expect(payload.data.mastery_summary).toEqual(
      masteryRaw.map((entry) => ({
        topicId: entry.topicId,
        topicName: entry.topicName,
        masteryLevel: entry.masteryLevel,
        lastAssessedAt: entry.lastAssessedAt,
        recommendedNext: entry.recommendedNext,
      }))
    );
  });

  it("returns 404 when student cannot be resolved", async () => {
    const { supabase } = createStudySupabaseStub();
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    mockedCreateClient.mockResolvedValue(supabase);

    const request = new NextRequest("http://localhost/api/study-analyzer/recommendations");
    const response = await getRecommendations(request);
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.success).toBe(false);
    expect(payload.error).toMatch(/Student profile not found/i);
  });
});


