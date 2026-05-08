import { describe, expect, it } from "vitest";
import { normalizePhone } from "@/lib/phone/normalizePhone";

describe("normalizePhone", () => {
  it("normalizes standard US 10-digit numbers", () => {
    expect(normalizePhone("5551234567")).toBe("+15551234567");
    expect(normalizePhone("(555) 123-4567")).toBe("+15551234567");
    expect(normalizePhone("555-123-4567")).toBe("+15551234567");
    expect(normalizePhone("555.123.4567")).toBe("+15551234567");
  });

  it("normalizes US 11-digit numbers starting with 1", () => {
    expect(normalizePhone("15551234567")).toBe("+15551234567");
    expect(normalizePhone("1 (555) 123-4567")).toBe("+15551234567");
  });

  it("leaves already normalized numbers alone", () => {
    expect(normalizePhone("+15551234567")).toBe("+15551234567");
    expect(normalizePhone("+442071234567")).toBe("+442071234567");
  });

  it("handles malformed or invalid input safely", () => {
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone("123")).toBeNull(); // Too short
    expect(normalizePhone("abc")).toBeNull(); // No digits
    expect(normalizePhone("12345678901234567890")).toBeNull(); // Too long
  });
});
