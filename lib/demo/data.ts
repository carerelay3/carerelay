import { DemoSnapshot } from "../types";

export const demoStore = {
  careCircleId: "demo-circle-123",
  messages: [] as any[],
};

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

export function addDemoMessage(msg: any) {
  demoStore.messages.push(msg);
}

export function acknowledgeConcern(id: string, notes?: string) {}
export function addHandoff(handoff: any) {}
export function addMember(member: any) {}
export function exportTimeline(format: string, from?: string, to?: string) { 
  return { format, content: "Mock timeline data" }; 
}
export function inviteMember(id: string) {}
export function reviewHandoff(id: string) {}
export function updatePreferences(prefs: any) {}
export function updateSupplyStatus(id: string, status: string) {}
export function updateTaskAssignee(id: string, assignee: string) {}
export function updateTaskStatus(id: string, status: string) {}