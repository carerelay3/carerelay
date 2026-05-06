import type { ParsedCareMessage } from "@/lib/types";

const concernKeywords = [
  "confused",
  "fell",
  "fall",
  "dizzy",
  "fainted",
  "weak",
  "pain",
  "chest pain",
  "short of breath",
  "bleeding",
  "worse",
  "fever",
  "vomiting",
  "not eating",
  "not drinking",
  "disoriented",
  "shaking",
  "swelling",
  "emergency",
  "911",
];

const medicationKeywords = [
  "meds:",
  "medication:",
  "took",
  "pill",
  "dose",
  "meds done",
  "medication taken",
  "morning meds",
  "evening meds",
];

const appointmentKeywords = [
  "appointment:",
  "doctor",
  "cardiology",
  "dentist",
  "therapy",
  "clinic",
  "today",
  "tomorrow",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  "am",
  "pm",
  "at 2",
  "at 3:30",
];

const taskKeywords = [
  "task:",
  "can someone",
  "please",
  "need someone",
  "who can",
  "pick up",
  "call",
  "check on",
  "drop off",
];

const supplyKeywords = [
  "need:",
  "supplies:",
  "need",
  "milk",
  "soup",
  "bread",
  "wipes",
  "paper towels",
  "toilet paper",
  "gloves",
  "prescription refill",
  "refill",
  "groceries",
  "water",
  "pads",
  "batteries",
];

const doneKeywords = ["done:", "completed:", "finished:"];
const boughtKeywords = ["bought:", "purchased:", "got:"];
const deliveredKeywords = ["delivered:", "dropped off:", "brought:"];
const assignKeywords = ["assign:", "give to", "@"];

function matchKeywords(source: string, keywords: string[]) {
  return keywords.filter((k) => source.includes(k));
}

function detectCommand(text: string, raw: string): Pick<ParsedCareMessage, "command" | "commandTarget" | "commandAssignee" | "commandNewStatus"> {
  const lower = text.toLowerCase();

  // Exact match commands
  if (lower.trim() === "summary") {
    return { command: "request_summary" };
  }
  if (lower.trim() === "help") {
    return { command: "request_help" };
  }
  if (lower.trim() === "stop") {
    return { command: "opt_out" };
  }
  if (lower.trim() === "yes" || lower.trim() === "start") {
    return { command: "opt_in" };
  }

  // Done/complete task
  const doneMatch = doneKeywords.find((k) => lower.startsWith(k));
  if (doneMatch) {
    const target = raw.slice(doneMatch.length).trim();
    return { command: "complete_task", commandTarget: target };
  }

  // Bought/purchased supply
  const boughtMatch = boughtKeywords.find((k) => lower.startsWith(k));
  if (boughtMatch) {
    const target = raw.slice(boughtMatch.length).trim();
    return { command: "update_supply", commandTarget: target, commandNewStatus: "purchased" };
  }

  // Delivered/drop-off supply
  const deliveredMatch = deliveredKeywords.find((k) => lower.startsWith(k));
  if (deliveredMatch) {
    const target = raw.slice(deliveredMatch.length).trim();
    return { command: "update_supply", commandTarget: target, commandNewStatus: "delivered" };
  }

  // Assign task to someone
  const assignMatch = assignKeywords.find((k) => lower.startsWith(k));
  if (assignMatch) {
    const remainder = raw.slice(assignMatch.length).trim();
    // Try to extract a name at the beginning: "Jake pick up prescription"
    const words = remainder.split(/\s+/);
    const possibleName = words[0];
    const target = words.slice(1).join(" ");
    if (possibleName && target) {
      return { command: "assign_task", commandAssignee: possibleName, commandTarget: target };
    }
    return { command: "assign_task", commandTarget: remainder };
  }

  // Transportation assignment: "Sarah will take Dad to cardiology"
  if (lower.includes("will take") || lower.includes("driving") || lower.includes("can drive")) {
    const words = raw.split(/\s+/);
    const possibleDriver = words[0];
    return { command: "assign_task", commandAssignee: possibleDriver, commandTarget: raw };
  }

  return {};
}

export function parseCareMessage(message: string): ParsedCareMessage {
  const raw = `${message || ""}`.trim();
  const text = raw.toLowerCase();
  if (!raw) {
    return {
      category: "general_update",
      confidence: 0.2,
      extractedTitle: "General update",
      concernFlag: false,
      matchedKeywords: [],
      suggestedRecord: { type: "note", text: "" },
    };
  }

  // Detect SMS commands first
  const commandData = detectCommand(text, raw);

  const concernMatches = matchKeywords(text, concernKeywords);
  const medicationMatches = matchKeywords(text, medicationKeywords);
  const appointmentMatches = matchKeywords(text, appointmentKeywords);
  const taskMatches = matchKeywords(text, taskKeywords);
  const supplyMatches = matchKeywords(text, supplyKeywords);

  const strongConcern =
    concernMatches.length > 0 &&
    !(
      concernMatches.length === 1 &&
      concernMatches[0] === "dizzy" &&
      (text.includes("pick up") || text.includes("prescription") || text.includes("meds") || text.includes("medication"))
    );

  // If there is a command AND it's not a strong concern override, keep command context
  const hasCommand = !!commandData.command;

  if (strongConcern) {
    return {
      category: "concern",
      confidence: 0.92,
      extractedTitle: "Concern flagged",
      extractedDetails: raw,
      concernFlag: true,
      matchedKeywords: concernMatches,
      suggestedRecord: { type: "concern", concernText: raw, severity: "flagged" },
      ...commandData,
    };
  }

  if (medicationMatches.length > 0) {
    return {
      category: "medication",
      confidence: 0.89,
      extractedTitle: raw.split(".")[0],
      extractedDetails: raw,
      concernFlag: concernMatches.length > 0,
      matchedKeywords: [...medicationMatches, ...concernMatches],
      suggestedRecord: { type: "medication_log", confirmationText: raw },
      ...commandData,
    };
  }

  if (appointmentMatches.length > 0 && text.includes("appointment")) {
    return {
      category: "appointment",
      confidence: 0.86,
      extractedTitle: raw.split(".")[0],
      extractedDetails: raw,
      concernFlag: concernMatches.length > 0,
      matchedKeywords: [...appointmentMatches, ...concernMatches],
      suggestedRecord: { type: "appointment", title: raw },
      ...commandData,
    };
  }

  if (taskMatches.length > 0 || hasCommand) {
    return {
      category: "task",
      confidence: 0.84,
      extractedTitle: raw.split("?")[0],
      extractedDetails: raw,
      concernFlag: concernMatches.length > 0,
      matchedKeywords: [...taskMatches, ...concernMatches],
      suggestedRecord: { type: "task", title: raw },
      ...commandData,
    };
  }

  if (supplyMatches.length > 0) {
    return {
      category: "supply",
      confidence: 0.83,
      extractedTitle: raw.split(".")[0],
      extractedDetails: raw,
      concernFlag: concernMatches.length > 0,
      matchedKeywords: [...supplyMatches, ...concernMatches],
      suggestedRecord: { type: "supply", item: raw },
      ...commandData,
    };
  }

  return {
    category: "general_update",
    confidence: 0.6,
    extractedTitle: raw.split(".")[0],
    extractedDetails: raw,
    concernFlag: concernMatches.length > 0,
    matchedKeywords: concernMatches,
    suggestedRecord: { type: "general_note", text: raw },
    ...commandData,
  };
}
