import { DemoSnapshot } from "../types";

export function getDemoSnapshot(): DemoSnapshot {
  return {
    messages: [
      {
        id: "msg-1",
        sender: "Mom",
        fromPhone: "+15550001111",
        toPhone: "+15559990000",
        body: "I took my morning pills and feel fine.",
        createdAt: new Date().toISOString(),
        category: "medication",
        confidence: 0.95,
        concernFlag: false
      },
      {
        id: "msg-2",
        sender: "Dad",
        fromPhone: "+15550002222",
        toPhone: "+15559990000",
        body: "We need more milk and bread.",
        createdAt: new Date().toISOString(),
        category: "supply",
        confidence: 0.9,
        concernFlag: false
      }
    ],
    tasks: [
      {
        id: "task-1",
        title: "Call insurance company",
        status: "open",
        createdAt: new Date().toISOString()
      }
    ],
    appointments: [
      {
        id: "appt-1",
        title: "Dr. Smith Checkup",
        at: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        transportationConfirmed: false
      }
    ],
    supplies: [
      { id: "sup-1", item: "Milk", status: "needed" },
      { id: "sup-2", item: "Bread", status: "needed" }
    ],
    concerns: []
  };
}