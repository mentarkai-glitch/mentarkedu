// @ts-nocheck

import { NextRequest } from "next/server";
import { GET as getAgenda } from "@/app/api/daily-assistant/agenda/route";
import { createClient } from "@/lib/supabase/server";

jest.mock("@/lib/supabase/server");

const mockedCreateClient = createClient as jest.Mock;

const createDailyAssistantStub = () => {
  const agendaItems = [
    {
      id: "agenda-1",
      student_id: "student-123",
      title: "Deep work",
      description: "Finish physics worksheet",
      start_at: "2024-01-01T09:00:00Z",
      end_at: "2024-01-01T10:00:00Z",
      energy_target: "high",
      priority: 1,
      status: "planned",
      source: "manual",
    },
  ];

  const dependencies = [
    {
      id: "dep-1",
      agenda_item_id: "agenda-1",
      depends_on_item_id: "agenda-0",
      dependency_type: "blocking",
    },
  ];

  const orderResult = {
    limit: jest.fn(async () => ({ data: agendaItems, error: null })),
    then: (onFulfilled: any) => Promise.resolve({ data: agendaItems, error: null }).then(onFulfilled),
  };

  const supabase = {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: "student-123" } },
        error: null,
      }),
    },
    from: jest.fn((table: string) => {
      if (table === "daily_agenda_items") {
        return {
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              order: jest.fn(() => orderResult),
            })),
          })),
        };
      }

      if (table === "daily_task_dependencies") {
        return {
          select: jest.fn(() => ({
            in: jest.fn(async () => ({ data: dependencies, error: null })),
          })),
        };
      }

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

      throw new Error(`Unexpected table: ${table}`);
    }),
  };

  return { supabase, agendaItems, dependencies };
};

describe("GET /api/daily-assistant/agenda", () => {
  afterEach(() => {
    mockedCreateClient.mockReset();
  });

  it("returns agenda items and dependencies for authenticated student", async () => {
    const { supabase, agendaItems, dependencies } = createDailyAssistantStub();
    mockedCreateClient.mockResolvedValue(supabase);

    const request = new NextRequest("http://localhost/api/daily-assistant/agenda");
    const response = await getAgenda(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(payload.data.items).toEqual(agendaItems);
    expect(payload.data.dependencies).toEqual(dependencies);
  });

  it("returns 404 when student profile cannot be resolved", async () => {
    const { supabase } = createDailyAssistantStub();
    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    mockedCreateClient.mockResolvedValue(supabase);

    const request = new NextRequest("http://localhost/api/daily-assistant/agenda");
    const response = await getAgenda(request);
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.success).toBe(false);
    expect(payload.error).toMatch(/Student profile not found/i);
  });
});


