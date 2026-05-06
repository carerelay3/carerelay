import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/messages/parse/route";

describe("POST /api/messages/parse", () => {
  it("rejects empty message", async () => {
    const req = new Request("http://localhost/api/messages/parse", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message: "" }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
