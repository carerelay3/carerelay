import type { DemoSnapshot } from "./types";
import type { DemoMember, SupplyStatus, TaskStatus } from "@/lib/types";

const now = () => new Date().toISOString();
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3600000).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

function createInitialSnapshot(): DemoSnapshot {
  return {
    careCircleId: "circle-demo-1",
    careCircleName: "Rivera Family Care Circle",
    circleType: "care",
    recipientName: "Elena Rivera",
    sharedPhone: "+15559990000",
    members: [
      {
        id: "fm-1",
        name: "Sarah",
        role: "Daughter",
        phone: "+15550001111",
        email: "sarah@example.com",
        permissionLevel: "admin",
        inviteStatus: "joined",
        joinedAt: daysAgo(14),
        lastActiveAt: now(),
      },
      {
        id: "fm-2",
        name: "Jake",
        role: "Son",
        phone: "+15550002222",
        email: "jake@example.com",
        permissionLevel: "contributor",
        inviteStatus: "joined",
        joinedAt: daysAgo(10),
        lastActiveAt: hoursAgo(1),
      },
      {
        id: "fm-3",
        name: "Mark",
        role: "Neighbor",
        phone: "+15550003333",
        email: "mark@example.com",
        permissionLevel: "contributor",
        inviteStatus: "not_invited",
      },
    ],
    messages: [
      {
        id: "msg-1",
        sender: "Sarah",
        fromPhone: "+15550001111",
        toPhone: "+15559990000",
        body: "Mom took her morning pills and feels fine.",
        createdAt: hoursAgo(3),
        category: "medication",
        confidence: 0.95,
        concernFlag: false,
      },
      {
        id: "msg-2",
        sender: "Jake",
        fromPhone: "+15550002222",
        toPhone: "+15559990000",
        body: "Need more milk and bread.",
        createdAt: hoursAgo(2),
        category: "supply",
        confidence: 0.9,
        concernFlag: false,
      },
    ],
    tasks: [
      {
        id: "task-1",
        title: "Call insurance company",
        status: "open",
        createdAt: hoursAgo(4),
      },
    ],
    appointments: [
      {
        id: "appt-1",
        title: "Dr. Smith checkup",
        at: new Date(Date.now() + 86400000).toISOString(),
        transportationConfirmed: false,
      },
    ],
    supplies: [
      { id: "sup-1", item: "Milk", status: "needed", requestedBy: "Jake" },
      { id: "sup-2", item: "Bread", status: "needed", requestedBy: "Jake" },
    ],
    medicationLogs: [
      {
        id: "med-1",
        text: "Morning blood pressure pill taken",
        by: "Sarah",
        at: hoursAgo(3),
      },
    ],
    concerns: [
      {
        id: "con-1",
        text: "Mom felt dizzy earlier but is resting now.",
        createdAt: hoursAgo(1),
        acknowledged: false,
      },
    ],
    activity: [
      {
        id: "activity-1",
        type: "message_logged",
        description: "Morning medication update logged",
        actor: "Sarah",
        createdAt: hoursAgo(3),
      },
    ],
    handoffs: [
      {
        id: "handoff-1",
        date: now(),
        summaryText: "Medication was logged this morning. Supplies still need pickup.",
        reviewed: false,
      },
    ],
    preferences: {
      summaryTime: "19:00",
      timezone: "America/Chicago",
      sendSummaryToAdmins: true,
      sendSummaryToFamily: true,
      notifyConcerns: true,
      notifyTasks: true,
      notifyAppointments: true,
      notifySupplies: true,
    },
  };
}

const snapshot = createInitialSnapshot();

export const demoStore = snapshot;

export function getDemoSnapshot(): DemoSnapshot {
  return snapshot;
}

export function addDemoMessage(msg: {
  sender: string;
  fromPhone: string;
  body: string;
  category?: DemoSnapshot["messages"][number]["category"];
  concernFlag?: boolean;
}) {
  const id = `msg-${Date.now()}`;
  snapshot.messages.unshift({
    id,
    sender: msg.sender,
    fromPhone: msg.fromPhone,
    toPhone: snapshot.sharedPhone,
    body: msg.body,
    createdAt: now(),
    category: msg.category || "general_update",
    confidence: 0.75,
    concernFlag: !!msg.concernFlag,
  });
  if (msg.category === "medication") {
    snapshot.medicationLogs.unshift({ id: `med-${Date.now()}`, text: msg.body, by: msg.sender, at: now() });
  } else if (msg.category === "appointment") {
    snapshot.appointments.unshift({ id: `appt-${Date.now()}`, title: msg.body, at: now(), transportationConfirmed: false });
  } else if (msg.category === "task") {
    snapshot.tasks.unshift({ id: `task-${Date.now()}`, title: msg.body, status: "open", createdAt: now() });
  } else if (msg.category === "supply") {
    snapshot.supplies.unshift({ id: `sup-${Date.now()}`, item: msg.body, status: "needed", requestedBy: msg.sender });
  }
  if (msg.category === "concern" || msg.concernFlag) {
    snapshot.concerns.unshift({ id: `con-${Date.now()}`, text: msg.body, createdAt: now(), acknowledged: false });
  }
  snapshot.activity.unshift({
    id: `activity-${Date.now()}`,
    type: "message_logged",
    description: `${msg.sender} sent a ${msg.category || "general"} update.`,
    actor: msg.sender,
    createdAt: now(),
    metadata: { inboundMessageId: id },
  });
  return snapshot;
}

export function acknowledgeConcern(id: string, by: string, notes?: string) {
  const concern = snapshot.concerns.find((item) => item.id === id);
  if (!concern || concern.acknowledged) return null;

  concern.acknowledged = true;
  concern.acknowledgedBy = by;
  concern.acknowledgedAt = now();
  concern.acknowledgementNote = notes;
  return snapshot;
}

export function addHandoff(summaryText: string) {
  snapshot.handoffs.unshift({
    id: `handoff-${Date.now()}`,
    date: now(),
    summaryText,
    reviewed: false,
  });
  return snapshot;
}

export function addMember(member: Omit<DemoMember, "id" | "inviteStatus">) {
  snapshot.members.push({
    ...member,
    id: `fm-${snapshot.members.length + 1}`,
    inviteStatus: "invited",
  });
  return snapshot;
}

export function exportTimeline(format: "json" | "csv", from?: string, to?: string) {
  const exportedAt = now();
  if (format === "csv") {
    const rows = [
      "Type,ID,Date,Actor,Details",
      ...snapshot.messages.map((message) => `Message,${message.id},${message.createdAt},${message.sender},"${message.body}"`),
      ...snapshot.activity.map((item) => `Activity,${item.id},${item.createdAt},${item.actor ?? ""},"${item.description}"`),
      `Disclaimer,,${exportedAt},CircleRelay,"CircleRelay Care Mode is for family coordination only and does not provide medical advice."`,
    ];
    return { format, from, to, exportedAt, content: rows.join("\n") };
  }

  return {
    format,
    from,
    to,
    exportedAt,
    content: JSON.stringify(
      {
        careCircleName: snapshot.careCircleName,
        disclaimer: "CircleRelay Care Mode is for family coordination only and does not provide medical advice.",
        snapshot,
      },
      null,
      2,
    ),
  };
}

export function inviteMember(id: string) {
  const member = snapshot.members.find((item) => item.id === id);
  if (!member) return null;

  member.inviteStatus = "invited";
  return snapshot;
}

export function reviewHandoff(id: string) {
  const handoff = snapshot.handoffs.find((item) => item.id === id);
  if (!handoff) return null;

  handoff.reviewed = true;
  handoff.reviewedAt = now();
  return snapshot;
}

export function updatePreferences(prefs: Partial<DemoSnapshot["preferences"]>) {
  snapshot.preferences = { ...snapshot.preferences, ...prefs };
  return snapshot;
}

export function updateSupplyStatus(id: string, status: SupplyStatus, by?: string) {
  const supply = snapshot.supplies.find((item) => item.id === id);
  if (!supply) return null;

  supply.status = status;
  snapshot.activity.unshift({
    id: `activity-${Date.now()}`,
    type: "supply_updated",
    description: `${supply.item} marked ${status}.`,
    actor: by,
    createdAt: now(),
  });
  return snapshot;
}

export function updateTaskAssignee(id: string, assignee: string | null, assigneeName?: string) {
  const task = snapshot.tasks.find((item) => item.id === id);
  if (!task) return null;

  task.assignedTo = assignee ?? undefined;
  task.assignedToName = assigneeName;
  return snapshot;
}

export function updateTaskStatus(id: string, status: TaskStatus, by?: string) {
  const task = snapshot.tasks.find((item) => item.id === id);
  if (!task) return null;

  task.status = status;
  if (status === "done") {
    task.completedBy = by;
    task.completedAt = now();
  }
  return snapshot;
}
