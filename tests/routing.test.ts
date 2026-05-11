import { describe, expect, it, vi, beforeEach } from "vitest";
import { resolveCareCircleFromSender } from "@/lib/routing/resolveCareCircleFromSender";

// Mock the Supabase client so we can test routing logic without a real DB
const mockEq = vi.fn();
const mockNeq = vi.fn();
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdmin: vi.fn(() => ({
    from: mockFrom,
  })),
}));

describe("resolveCareCircleFromSender", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEq.mockReturnValue({ neq: mockNeq });
  });

  it("handles invalid phone numbers", async () => {
    const result = await resolveCareCircleFromSender("abc", "Hello");
    expect(result.routingStatus).toBe("invalid_phone");
  });

  it("handles demo mode explicitly without DB lookup", async () => {
    const result = await resolveCareCircleFromSender("+15550000000", "Hello", undefined, { isDemo: true, careCircleId: "demo-1", familyMemberId: "fm-1" });
    expect(result.routingStatus).toBe("matched_single_circle");
    expect(result.careCircleId).toBe("demo-1");
    expect(result.familyMemberId).toBe("fm-1");
    expect(result.cleanedBody).toBe("Hello");
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("strips keyword in demo mode if present", async () => {
    const result = await resolveCareCircleFromSender("+15550000000", "GRANDMA I took meds", undefined, { isDemo: true });
    expect(result.routingStatus).toBe("matched_single_circle");
    expect(result.cleanedBody).toBe("I took meds");
    expect(result.smsKeywordUsed).toBe("GRANDMA");
  });

  it("handles unknown sender (no match in DB)", async () => {
    mockNeq.mockResolvedValue({ data: [], error: null });
    const result = await resolveCareCircleFromSender("+15551234567", "Hello");
    expect(result.routingStatus).toBe("unknown_sender");
  });

  it("routes automatically for a single matched circle", async () => {
    mockNeq.mockResolvedValue({
      data: [{ id: "fm-1", care_circle_id: "circle-1", care_circles: { id: "circle-1", sms_keyword: "DAD" } }],
      error: null,
    });
    const result = await resolveCareCircleFromSender("+15551234567", "Hello");
    expect(result.routingStatus).toBe("matched_single_circle");
    expect(result.careCircleId).toBe("circle-1");
    expect(result.familyMemberId).toBe("fm-1");
    expect(result.cleanedBody).toBe("Hello");
  });

  it("requests keyword if multiple circles match and no keyword provided", async () => {
    mockNeq.mockResolvedValue({
      data: [
        { id: "fm-1", care_circle_id: "circle-1", care_circles: { id: "circle-1", sms_keyword: "DAD" } },
        { id: "fm-2", care_circle_id: "circle-2", care_circles: { id: "circle-2", sms_keyword: "MOM" } }
      ],
      error: null,
    });
    const result = await resolveCareCircleFromSender("+15551234567", "Hello");
    expect(result.routingStatus).toBe("matched_multiple_needs_keyword");
  });

  it("resolves multiple circles if valid keyword is provided, stripping keyword", async () => {
    mockNeq.mockResolvedValue({
      data: [
        { id: "fm-1", care_circle_id: "circle-1", care_circles: { id: "circle-1", sms_keyword: "DAD" } },
        { id: "fm-2", care_circle_id: "circle-2", care_circles: { id: "circle-2", sms_keyword: "MOM" } }
      ],
      error: null,
    });
    const result = await resolveCareCircleFromSender("+15551234567", "MOM Hello there");
    expect(result.routingStatus).toBe("matched_multiple_keyword_resolved");
    expect(result.careCircleId).toBe("circle-2");
    expect(result.familyMemberId).toBe("fm-2");
    expect(result.cleanedBody).toBe("Hello there");
    expect(result.smsKeywordUsed).toBe("MOM");
  });

  it("handles keyword in brackets", async () => {
    mockNeq.mockResolvedValue({
      data: [
        { id: "fm-1", care_circle_id: "circle-1", care_circles: { id: "circle-1", sms_keyword: "DAD" } },
        { id: "fm-2", care_circle_id: "circle-2", care_circles: { id: "circle-2", sms_keyword: "MOM" } }
      ],
      error: null,
    });
    const result = await resolveCareCircleFromSender("+15551234567", "[MOM] Hello there");
    expect(result.routingStatus).toBe("matched_multiple_keyword_resolved");
    expect(result.cleanedBody).toBe("Hello there");
    expect(result.smsKeywordUsed).toBe("MOM");
  });
});
