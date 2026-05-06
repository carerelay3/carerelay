import { describe, expect, it } from "vitest";
import { parseCareMessage } from "@/lib/parser/careMessageParser";

describe("care message parser", () => {
  it("categorizes medication messages", () => {
    const r1 = parseCareMessage("Meds: Mom took blood pressure pill at 8:15 AM");
    expect(r1.category).toBe("medication");
    expect(r1.concernFlag).toBe(false);

    const r2 = parseCareMessage("Evening meds done");
    expect(r2.category).toBe("medication");

    const r3 = parseCareMessage("Medication taken");
    expect(r3.category).toBe("medication");

    const r4 = parseCareMessage("Morning meds");
    expect(r4.category).toBe("medication");
  });

  it("categorizes appointment messages", () => {
    const r1 = parseCareMessage("Appointment: Dad cardiology Tuesday 2 PM");
    expect(r1.category).toBe("appointment");
    expect(r1.concernFlag).toBe(false);

    const r2 = parseCareMessage("Doctor appointment today at 10am");
    expect(r2.category).toBe("appointment");
  });

  it("categorizes supply messages", () => {
    const r1 = parseCareMessage("Need: soup, wipes, paper towels");
    expect(r1.category).toBe("supply");
    expect(r1.concernFlag).toBe(false);

    const r2 = parseCareMessage("Need refill on Losartan");
    expect(r2.category).toBe("supply");
    expect(r2.concernFlag).toBe(false);

    const r3 = parseCareMessage("Groceries delivered");
    expect(r3.category).toBe("supply");
  });

  it("categorizes task messages", () => {
    const r1 = parseCareMessage("Task: Jake pick up prescription tomorrow");
    expect(r1.category).toBe("task");
    expect(r1.concernFlag).toBe(false);

    const r2 = parseCareMessage("Can someone check on her before bed?");
    expect(r2.category).toBe("task");

    const r3 = parseCareMessage("Please call the pharmacy");
    expect(r3.category).toBe("task");
  });

  it("categorizes concern messages and flags them", () => {
    const r1 = parseCareMessage("Mom seemed confused tonight");
    expect(r1.category).toBe("concern");
    expect(r1.concernFlag).toBe(true);

    const r2 = parseCareMessage("She fell in the bathroom");
    expect(r2.category).toBe("concern");
    expect(r2.concernFlag).toBe(true);

    const r3 = parseCareMessage("She said she felt dizzy earlier but is resting now");
    expect(r3.category).toBe("concern");
    expect(r3.concernFlag).toBe(true);
  });

  it("flags concern on non-concern categories when keywords appear", () => {
    // "pain" is a strong concern keyword and overrides task category
    const r = parseCareMessage("Can someone check on her pain before bed?");
    expect(r.category).toBe("concern");
    expect(r.concernFlag).toBe(true);
    expect(r.matchedKeywords).toContain("pain");
  });

  it("defaults to general_update for unknown messages", () => {
    const r = parseCareMessage("Quick update only");
    expect(r.category).toBe("general_update");
    expect(r.concernFlag).toBe(false);
  });

  it("handles empty or whitespace-only input gracefully", () => {
    const r1 = parseCareMessage("");
    expect(r1.category).toBe("general_update");
    expect(r1.confidence).toBe(0.2);

    const r2 = parseCareMessage("   ");
    expect(r2.category).toBe("general_update");
  });

  it("handles weird input without crashing", () => {
    const r = parseCareMessage("!!! ??? 123");
    expect(r.category).toBe("general_update");
    expect(r.concernFlag).toBe(false);
  });

  it("documents refill choice as supply, not medication", () => {
    const r = parseCareMessage("Need refill on Losartan");
    expect(r.category).toBe("supply");
    expect(r.concernFlag).toBe(false);
  });

  it("documents 'Sarah dropped off groceries' as supply or general_update consistently", () => {
    const r = parseCareMessage("Sarah dropped off groceries");
    // "groceries" is in supplyKeywords, so this is categorized as supply
    expect(r.category).toBe("supply");
  });

  it("does not misclassify 'dizzy' in prescription context as concern when strongly task-oriented", () => {
    // The parser has a guard: if concern is only "dizzy" and text includes "pick up" or "prescription",
    // it does NOT treat it as a strong concern. It should fall through to medication/supply/task.
    const r = parseCareMessage("Pick up dizzy spell meds: ready");
    // Since "dizzy" is the only concern keyword and text includes "pick up", strongConcern is false
    // Then it should match medication keywords ("meds:") => medication
    expect(r.category).toBe("medication");
    // concernFlag is still true because "dizzy" was matched, even though category was not overridden
    expect(r.concernFlag).toBe(true);
  });

  // SMS Command tests
  it("detects 'Done:' command", () => {
    const r = parseCareMessage("Done: pick up prescription");
    expect(r.command).toBe("complete_task");
    expect(r.commandTarget).toBe("pick up prescription");
  });

  it("detects 'Bought:' command", () => {
    const r = parseCareMessage("Bought: paper towels");
    expect(r.command).toBe("update_supply");
    expect(r.commandTarget).toBe("paper towels");
    expect(r.commandNewStatus).toBe("purchased");
  });

  it("detects 'Delivered:' command", () => {
    const r = parseCareMessage("Delivered: groceries");
    expect(r.command).toBe("update_supply");
    expect(r.commandTarget).toBe("groceries");
    expect(r.commandNewStatus).toBe("delivered");
  });

  it("detects 'Assign:' command", () => {
    const r = parseCareMessage("Assign: Jake pick up prescription");
    expect(r.command).toBe("assign_task");
    expect(r.commandAssignee).toBe("Jake");
    expect(r.commandTarget).toBe("pick up prescription");
  });

  it("detects 'Summary' command", () => {
    const r = parseCareMessage("Summary");
    expect(r.command).toBe("request_summary");
  });

  it("detects 'Help' command", () => {
    const r = parseCareMessage("Help");
    expect(r.command).toBe("request_help");
  });

  it("detects 'Stop' command", () => {
    const r = parseCareMessage("Stop");
    expect(r.command).toBe("opt_out");
  });

  it("detects 'Yes' command", () => {
    const r = parseCareMessage("Yes");
    expect(r.command).toBe("opt_in");
  });

  it("handles transportation assignment language", () => {
    const r = parseCareMessage("Sarah will take Dad to cardiology Tuesday");
    expect(r.command).toBe("assign_task");
    expect(r.commandAssignee).toBe("Sarah");
  });

  it("never provides medical advice in parser output", () => {
    const r = parseCareMessage("Mom has chest pain and shortness of breath");
    expect(r.category).toBe("concern");
    expect(r.concernFlag).toBe(true);
    expect(r.extractedTitle).toBe("Concern flagged");
    // No diagnosis or treatment recommendation
    expect(r.suggestedRecord).not.toHaveProperty("diagnosis");
    expect(r.suggestedRecord).not.toHaveProperty("treatment");
  });
});
