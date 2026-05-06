import { describe, expect, it } from "vitest";
import { generateDailySummary } from "@/lib/summaries/generateDailySummary";
import { createOpenAiSummary } from "@/lib/openai/createSummary";

describe("summary fallback", () => {
  it("returns deterministic fallback summary", async () => {
    const summary = await generateDailySummary({ careCircleId: "circle-demo-1" });
    expect(summary.summaryText).toContain("Open tasks:");
    expect(Array.isArray(summary.concernsMentioned)).toBe(true);
    expect(Array.isArray(summary.completed)).toBe(true);
    expect(Array.isArray(summary.upcoming)).toBe(true);
    expect(Array.isArray(summary.suppliesNeeded)).toBe(true);
    expect(Array.isArray(summary.medicationConfirmations)).toBe(true);
  });

  it("does not crash when no openai key", async () => {
    delete process.env.OPENAI_API_KEY;
    const summary = await generateDailySummary({ careCircleId: "circle-demo-1" });
    expect(summary).toBeTruthy();
  });

  it("returns empty summary for unknown care circle", async () => {
    const summary = await generateDailySummary({ careCircleId: "unknown" });
    expect(summary.summaryText).toContain("No records were found");
    expect(summary.openTasks.length).toBe(0);
  });

  it("includes concern disclaimer text when concerns exist", async () => {
    const summary = await generateDailySummary({ careCircleId: "circle-demo-1" });
    if (summary.concernsMentioned.length > 0) {
      expect(summary.summaryText).toContain("CareRelay does not provide medical advice");
    }
  });
});

describe("createOpenAiSummary", () => {
  it("returns null when OpenAI is not configured", async () => {
    delete process.env.OPENAI_API_KEY;
    const result = await createOpenAiSummary({ notes: ["test"], concerns: [], context: "test" });
    expect(result).toBeNull();
  });

  it("returns null gracefully on error without throwing", async () => {
    // Force an error by using an invalid key format if needed, but the function catches all errors
    const originalKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = "invalid-key-for-testing";
    const result = await createOpenAiSummary({ notes: ["test"], concerns: [], context: "test" });
    expect(result).toBeNull();
    process.env.OPENAI_API_KEY = originalKey || "";
  });
});
