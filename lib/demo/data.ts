import { parseCareMessage } from "@/lib/parser/careMessageParser";
import type { DemoSnapshot } from "@/lib/demo/types";
import type { DemoMessage, DemoActivity } from "@/lib/types";
import { DEMO_SHARED_PHONE } from "@/lib/demo/constants";
import { normalizePhone } from "@/lib/utils/phone";

type Store = {
  careCircleId: string;
  careCircleName: string;
  recipientName: string;
  sharedPhone: string;
  members: Array<{
    id: string;
    name: string;
    role: string;
    phone: string;
    email?: string;
    permissionLevel: "admin" | "contributor" | "viewer";
    inviteStatus: "not_invited" | "invited" | "joined" | "opted_out";
    joinedAt?: string;
    optedOutAt?: string;
    lastActiveAt?: string;
  }>;
  messages: DemoMessage[];
  tasks: Array<{
    id: string;
    title: string;
    status: "open" | "done" | "needs_attention";
    assignedTo?: string;
    assignedToName?: string;
    completedBy?: string;
    completedAt?: string;
    createdAt?: string;
  }>;
  appointments: Array<{
    id: string;
    title: string;
    at: string;
    transportationConfirmed: boolean;
    assignedDriver?: string;
    assignedDriverName?: string;
  }>;
  supplies: Array<{
    id: string;
    item: string;
    status: "needed" | "purchased" | "delivered";
    requestedBy?: string;
  }>;
  meds: Array<{ id: string; text: string; by: string; at: string }>;
  concerns: Array<{
    id: string;
    text: string;
    createdAt: string;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: string;
    acknowledgementNote?: string;
  }>;
  activity: DemoActivity[];
  handoffs: Array<{
    id: string;
    date: string;
    summaryText: string;
    reviewed: boolean;
    reviewedAt?: string;
  }>;
  preferences: {
    summaryTime: string;
    timezone: string;
    sendSummaryToAdmins: boolean;
    sendSummaryToFamily: boolean;
    notifyConcerns: boolean;
    notifyTasks: boolean;
    notifyAppointments: boolean;
    notifySupplies: boolean;
  };
};

const now = new Date();
const seedMessages = [
  ["Sarah", "+15550000001", "Meds: Mom took blood pressure pill at 8:15 AM."],
  ["Jake", "+15550000002", "Need: soup, paper towels, adult wipes."],
  ["Mark", "+15550000003", "Appointment: Cardiology Tuesday at 2 PM."],
  ["Sarah", "+15550000001", "Task: Jake pick up prescription tomorrow."],
  ["Jake", "+15550000002", "Mom seemed confused tonight."],
  ["Mark", "+15550000003", "Can someone check on her before bed?"],
  ["Sarah", "+15550000001", "Evening meds done at 7:45."],
  ["Jake", "+15550000002", "She said she felt dizzy earlier but is resting now."],
  ["Mark", "+15550000003", "Need refill on Losartan."],
  ["Sarah", "+15550000001", "Groceries delivered."],
] as const;

export const demoStore: Store = {
  careCircleId: "circle-demo-1",
  careCircleName: "Linda's Care Circle",
  recipientName: "Linda Matthews",
  sharedPhone: DEMO_SHARED_PHONE,
  members: [
    { id: "fm-1", name: "Sarah", role: "Daughter", phone: "+15550000001", email: "sarah@example.com", permissionLevel: "admin", inviteStatus: "joined", joinedAt: new Date(now.getTime() - 30 * 86400000).toISOString(), lastActiveAt: new Date(now.getTime() - 1 * 3600000).toISOString() },
    { id: "fm-2", name: "Jake", role: "Son", phone: "+15550000002", email: "jake@example.com", permissionLevel: "contributor", inviteStatus: "joined", joinedAt: new Date(now.getTime() - 25 * 86400000).toISOString(), lastActiveAt: new Date(now.getTime() - 3 * 3600000).toISOString() },
    { id: "fm-3", name: "Mark", role: "Brother", phone: "+15550000003", email: "mark@example.com", permissionLevel: "contributor", inviteStatus: "invited", joinedAt: undefined, lastActiveAt: undefined },
  ],
  messages: seedMessages.map((entry, i) => {
    const parsed = parseCareMessage(entry[2]);
    return {
      id: `msg-${i + 1}`,
      sender: entry[0],
      fromPhone: entry[1],
      toPhone: DEMO_SHARED_PHONE,
      body: entry[2],
      createdAt: new Date(now.getTime() - (10 - i) * 30 * 60 * 1000).toISOString(),
      category: parsed.category,
      confidence: parsed.confidence,
      concernFlag: parsed.concernFlag,
      command: parsed.command || undefined,
    };
  }),
  tasks: [
    { id: "task-1", title: "Pick up prescription", status: "open", assignedTo: "fm-2", assignedToName: "Jake", createdAt: new Date(now.getTime() - 2 * 86400000).toISOString() },
    { id: "task-2", title: "Confirm transportation for cardiology", status: "needs_attention", assignedTo: undefined, assignedToName: undefined, createdAt: new Date(now.getTime() - 3 * 86400000).toISOString() },
    { id: "task-3", title: "Check on Linda before bed", status: "open", assignedTo: undefined, assignedToName: undefined, createdAt: new Date(now.getTime() - 1 * 86400000).toISOString() },
  ],
  appointments: [
    { id: "appt-1", title: "Cardiology Tuesday at 2 PM", at: new Date(now.getTime() + 1 * 86400000).toISOString(), transportationConfirmed: false, assignedDriver: undefined, assignedDriverName: undefined },
    { id: "appt-2", title: "Primary care follow-up next Friday at 10 AM", at: new Date(now.getTime() + 4 * 86400000).toISOString(), transportationConfirmed: false, assignedDriver: undefined, assignedDriverName: undefined },
  ],
  supplies: [
    { id: "sup-1", item: "Soup", status: "needed", requestedBy: "fm-2" },
    { id: "sup-2", item: "Paper towels", status: "needed", requestedBy: "fm-2" },
    { id: "sup-3", item: "Adult wipes", status: "needed", requestedBy: "fm-2" },
    { id: "sup-4", item: "Losartan refill", status: "needed", requestedBy: "fm-3" },
  ],
  meds: [
    { id: "med-1", text: "Blood pressure pill confirmed at 8:15 AM", by: "Sarah", at: new Date(now.getTime() - 8 * 3600000).toISOString() },
    { id: "med-2", text: "Evening meds confirmed at 7:45 PM", by: "Sarah", at: new Date(now.getTime() - 2 * 3600000).toISOString() },
  ],
  concerns: [
    { id: "con-1", text: "Mom seemed confused tonight.", createdAt: new Date(now.getTime() - 4 * 3600000).toISOString(), acknowledged: false },
    { id: "con-2", text: "She said she felt dizzy earlier but is resting now.", createdAt: new Date(now.getTime() - 3 * 3600000).toISOString(), acknowledged: false },
  ],
  activity: [
    { id: "act-1", type: "message_received", description: "Sarah sent a medication confirmation", actor: "Sarah", createdAt: new Date(now.getTime() - 8 * 3600000).toISOString() },
    { id: "act-2", type: "supply_added", description: "Jake added 4 supply items", actor: "Jake", createdAt: new Date(now.getTime() - 7 * 3600000).toISOString() },
    { id: "act-3", type: "appointment_created", description: "Mark added a cardiology appointment", actor: "Mark", createdAt: new Date(now.getTime() - 6 * 3600000).toISOString() },
    { id: "act-4", type: "task_created", description: "Sarah created a task for Jake", actor: "Sarah", createdAt: new Date(now.getTime() - 5 * 3600000).toISOString() },
    { id: "act-5", type: "concern_flagged", description: "A concern was flagged for family review", actor: "Jake", createdAt: new Date(now.getTime() - 4 * 3600000).toISOString() },
    { id: "act-6", type: "task_created", description: "Mark created a check-in task", actor: "Mark", createdAt: new Date(now.getTime() - 3 * 3600000).toISOString() },
    { id: "act-7", type: "concern_flagged", description: "A concern was flagged for family review", actor: "Jake", createdAt: new Date(now.getTime() - 3 * 3600000).toISOString() },
    { id: "act-8", type: "medication_log", description: "Sarah confirmed evening meds", actor: "Sarah", createdAt: new Date(now.getTime() - 2 * 3600000).toISOString() },
    { id: "act-9", type: "supply_delivered", description: "Sarah confirmed groceries delivered", actor: "Sarah", createdAt: new Date(now.getTime() - 1 * 3600000).toISOString() },
  ],
  handoffs: [],
  preferences: {
    summaryTime: "18:00",
    timezone: "America/New_York",
    sendSummaryToAdmins: true,
    sendSummaryToFamily: false,
    notifyConcerns: true,
    notifyTasks: true,
    notifyAppointments: true,
    notifySupplies: true,
  },
};

export function getDemoSnapshot(): DemoSnapshot {
  return {
    careCircleId: demoStore.careCircleId,
    careCircleName: demoStore.careCircleName,
    recipientName: demoStore.recipientName,
    sharedPhone: demoStore.sharedPhone,
    members: demoStore.members.map((m) => ({ ...m })),
    messages: demoStore.messages.map((m) => ({ ...m })),
    tasks: demoStore.tasks.map((t) => ({ ...t })),
    appointments: demoStore.appointments.map((a) => ({ ...a })),
    supplies: demoStore.supplies.map((s) => ({ ...s })),
    medicationLogs: demoStore.meds.map((x) => ({ ...x })),
    concerns: demoStore.concerns.map((c) => ({ ...c })),
    activity: demoStore.activity.map((a) => ({ ...a })),
    handoffs: demoStore.handoffs.map((h) => ({ ...h })),
    preferences: { ...demoStore.preferences },
  };
}

function addActivity(activity: Omit<DemoActivity, "id">) {
  demoStore.activity.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ...activity,
  });
}

export function addDemoMessage(input: { sender: string; fromPhone: string; body: string }) {
  const parsed = parseCareMessage(input.body);
  const id = `msg-${demoStore.messages.length + 1}`;
  const message: DemoMessage = {
    id,
    sender: input.sender || "Unknown sender",
    fromPhone: normalizePhone(input.fromPhone || ""),
    toPhone: demoStore.sharedPhone,
    body: input.body,
    createdAt: new Date().toISOString(),
    category: parsed.category,
    confidence: parsed.confidence,
    concernFlag: parsed.concernFlag,
    command: parsed.command || undefined,
  };
  demoStore.messages.unshift(message);

  // Track activity
  addActivity({
    type: "message_received",
    description: `${input.sender} sent a ${parsed.category.replace(/_/g, " ")} message`,
    actor: input.sender,
    createdAt: message.createdAt,
    metadata: { category: parsed.category, concernFlag: parsed.concernFlag },
  });

  // Handle commands
  if (parsed.command === "complete_task" && parsed.commandTarget) {
    const target = parsed.commandTarget.toLowerCase();
    const task = demoStore.tasks.find((t) => t.status === "open" && t.title.toLowerCase().includes(target));
    if (task) {
      task.status = "done";
      task.completedBy = input.sender;
      task.completedAt = message.createdAt;
      addActivity({
        type: "task_completed",
        description: `${input.sender} completed "${task.title}"`,
        actor: input.sender,
        createdAt: message.createdAt,
        metadata: { taskId: task.id },
      });
    } else {
      // Create a completed task if no match
      const newTask = { id: `task-${Date.now()}`, title: parsed.commandTarget, status: "done" as const, completedBy: input.sender, completedAt: message.createdAt, createdAt: message.createdAt };
      demoStore.tasks.unshift(newTask);
      addActivity({ type: "task_created", description: `Task created from SMS command: ${parsed.commandTarget}`, actor: input.sender, createdAt: message.createdAt });
      addActivity({ type: "task_completed", description: `${input.sender} completed "${newTask.title}"`, actor: input.sender, createdAt: message.createdAt, metadata: { taskId: newTask.id } });
    }
  }

  if (parsed.command === "update_supply" && parsed.commandTarget && parsed.commandNewStatus) {
    const target = parsed.commandTarget.toLowerCase();
    const supply = demoStore.supplies.find((s) => s.status === "needed" && s.item.toLowerCase().includes(target));
    if (supply) {
      supply.status = parsed.commandNewStatus as "needed" | "purchased" | "delivered";
      addActivity({
        type: parsed.commandNewStatus === "delivered" ? "supply_delivered" : "supply_purchased",
        description: `${input.sender} marked ${supply.item} as ${parsed.commandNewStatus}`,
        actor: input.sender,
        createdAt: message.createdAt,
        metadata: { supplyId: supply.id, newStatus: parsed.commandNewStatus },
      });
    } else {
      const newSupply = { id: `sup-${Date.now()}`, item: parsed.commandTarget, status: parsed.commandNewStatus as "needed" | "purchased" | "delivered", requestedBy: input.sender };
      demoStore.supplies.unshift(newSupply);
      addActivity({ type: "supply_added", description: `${input.sender} added ${parsed.commandTarget}`, actor: input.sender, createdAt: message.createdAt });
    }
  }

  if (parsed.command === "assign_task" && parsed.commandTarget) {
    const assigneeName = parsed.commandAssignee || input.sender;
    const member = demoStore.members.find((m) => m.name.toLowerCase() === assigneeName.toLowerCase());
    const newTask = { id: `task-${Date.now()}`, title: parsed.commandTarget, status: "open" as const, assignedTo: member?.id, assignedToName: member?.name || assigneeName, createdAt: message.createdAt };
    demoStore.tasks.unshift(newTask);
    addActivity({ type: "task_created", description: `Task assigned to ${member?.name || assigneeName}: ${parsed.commandTarget}`, actor: input.sender, createdAt: message.createdAt, metadata: { taskId: newTask.id, assignedTo: member?.id } });
    // Also handle transportation assignment if it mentions driving/taking
    const lowerBody = input.body.toLowerCase();
    if (lowerBody.includes("take") || lowerBody.includes("drive") || lowerBody.includes("cardiology") || lowerBody.includes("appointment")) {
      const appt = demoStore.appointments.find((a) => !a.transportationConfirmed);
      if (appt && member) {
        appt.assignedDriver = member.id;
        appt.assignedDriverName = member.name;
        appt.transportationConfirmed = true;
        addActivity({ type: "appointment_created", description: `${member.name} confirmed transportation for ${appt.title}`, actor: input.sender, createdAt: message.createdAt, metadata: { appointmentId: appt.id } });
      }
    }
  }

  // Normal category handling (only if not already handled by command)
  if (!parsed.command) {
    if (parsed.category === "task") {
      demoStore.tasks.unshift({ id: `task-${Date.now()}`, title: parsed.extractedTitle, status: "open", createdAt: message.createdAt });
      addActivity({ type: "task_created", description: `New task: ${parsed.extractedTitle}`, actor: input.sender, createdAt: message.createdAt });
    }
    if (parsed.category === "appointment") {
      demoStore.appointments.unshift({ id: `appt-${Date.now()}`, title: parsed.extractedTitle, at: new Date().toISOString(), transportationConfirmed: false });
      addActivity({ type: "appointment_created", description: `New appointment: ${parsed.extractedTitle}`, actor: input.sender, createdAt: message.createdAt });
    }
    if (parsed.category === "supply") {
      demoStore.supplies.unshift({ id: `sup-${Date.now()}`, item: parsed.extractedTitle, status: "needed", requestedBy: input.sender });
      addActivity({ type: "supply_added", description: `New supply needed: ${parsed.extractedTitle}`, actor: input.sender, createdAt: message.createdAt });
    }
    if (parsed.category === "medication") {
      demoStore.meds.unshift({ id: `med-${Date.now()}`, text: parsed.extractedTitle, by: input.sender, at: message.createdAt });
      addActivity({ type: "medication_log", description: `Medication confirmation from ${input.sender}`, actor: input.sender, createdAt: message.createdAt });
    }
  }

  if (parsed.concernFlag) {
    demoStore.concerns.unshift({
      id: `con-${Date.now()}`,
      text: input.body,
      createdAt: message.createdAt,
      acknowledged: false,
    });
    addActivity({ type: "concern_flagged", description: `Concern flagged by ${input.sender}`, actor: input.sender, createdAt: message.createdAt });
  }

  return { message, parsed, snapshot: getDemoSnapshot() };
}

export function acknowledgeConcern(concernId: string, by: string, note?: string) {
  const concern = demoStore.concerns.find((c) => c.id === concernId);
  if (!concern || concern.acknowledged) return null;
  concern.acknowledged = true;
  concern.acknowledgedBy = by;
  concern.acknowledgedAt = new Date().toISOString();
  concern.acknowledgementNote = note;
  addActivity({ type: "concern_acknowledged", description: `${by} acknowledged a concern`, actor: by, createdAt: concern.acknowledgedAt, metadata: { concernId, note } });
  return getDemoSnapshot();
}

export function updateTaskAssignee(taskId: string, memberId: string | null, memberName?: string) {
  const task = demoStore.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  task.assignedTo = memberId || undefined;
  task.assignedToName = memberName || undefined;
  if (task.status === "open") {
    task.status = "open"; // ensure stays open
  }
  addActivity({ type: "task_assigned", description: `Task "${task.title}" assigned to ${memberName || "Unassigned"}`, actor: "Coordinator", createdAt: new Date().toISOString(), metadata: { taskId, assignedTo: memberId } });
  return getDemoSnapshot();
}

export function updateTaskStatus(taskId: string, status: "open" | "done" | "needs_attention", by?: string) {
  const task = demoStore.tasks.find((t) => t.id === taskId);
  if (!task) return null;
  const oldStatus = task.status;
  task.status = status;
  if (status === "done" && oldStatus !== "done") {
    task.completedBy = by;
    task.completedAt = new Date().toISOString();
    addActivity({ type: "task_completed", description: `Task "${task.title}" marked done by ${by || "Coordinator"}`, actor: by || "Coordinator", createdAt: new Date().toISOString(), metadata: { taskId } });
  }
  return getDemoSnapshot();
}

export function updateSupplyStatus(supplyId: string, status: "needed" | "purchased" | "delivered", by?: string) {
  const supply = demoStore.supplies.find((s) => s.id === supplyId);
  if (!supply) return null;
  supply.status = status;
  addActivity({ type: status === "delivered" ? "supply_delivered" : "supply_purchased", description: `${supply.item} marked ${status} by ${by || "Coordinator"}`, actor: by || "Coordinator", createdAt: new Date().toISOString(), metadata: { supplyId, status } });
  return getDemoSnapshot();
}

export function addHandoff(summaryText: string) {
  const handoff = { id: `handoff-${Date.now()}`, date: new Date().toISOString(), summaryText, reviewed: false };
  demoStore.handoffs.unshift(handoff);
  addActivity({ type: "handoff_generated", description: "Daily handoff generated", actor: "System", createdAt: handoff.date });
  return getDemoSnapshot();
}

export function reviewHandoff(handoffId: string) {
  const handoff = demoStore.handoffs.find((h) => h.id === handoffId);
  if (!handoff) return null;
  handoff.reviewed = true;
  handoff.reviewedAt = new Date().toISOString();
  addActivity({ type: "handoff_reviewed", description: "Daily handoff reviewed", actor: "Coordinator", createdAt: handoff.reviewedAt });
  return getDemoSnapshot();
}

export function updatePreferences(prefs: Partial<typeof demoStore.preferences>) {
  demoStore.preferences = { ...demoStore.preferences, ...prefs };
  return getDemoSnapshot();
}

export function inviteMember(memberId: string) {
  const member = demoStore.members.find((m) => m.id === memberId);
  if (!member) return null;
  member.inviteStatus = "invited";
  addActivity({ type: "family_member_invited", description: `${member.name} was invited to the care circle`, actor: "Coordinator", createdAt: new Date().toISOString(), metadata: { memberId } });
  return getDemoSnapshot();
}

export function addMember(member: { name: string; role: string; phone: string; email?: string; permissionLevel: "admin" | "contributor" | "viewer" }) {
  const id = `fm-${demoStore.members.length + 1}`;
  const newMember = { id, ...member, inviteStatus: "not_invited" as const };
  demoStore.members.push(newMember);
  addActivity({ type: "family_member_invited", description: `${member.name} added to care circle`, actor: "Coordinator", createdAt: new Date().toISOString(), metadata: { memberId: id } });
  return getDemoSnapshot();
}

export function exportTimeline(format: "json" | "csv", fromDate?: string, toDate?: string) {
  const from = fromDate ? new Date(fromDate).getTime() : 0;
  const to = toDate ? new Date(toDate).getTime() : Date.now();

  const inWindow = (value: string) => {
    const t = new Date(value).getTime();
    return t >= from && t <= to;
  };

  const data = {
    careCircleName: demoStore.careCircleName,
    exportedAt: new Date().toISOString(),
    disclaimer: "This export is a family coordination record, not a medical record.",
    messages: demoStore.messages.filter((m) => inWindow(m.createdAt)),
    tasks: demoStore.tasks.filter((t) => t.createdAt && inWindow(t.createdAt)),
    appointments: demoStore.appointments.filter((a) => inWindow(a.at)),
    supplies: demoStore.supplies,
    medicationLogs: demoStore.meds.filter((m) => inWindow(m.at)),
    concerns: demoStore.concerns.filter((c) => inWindow(c.createdAt)),
    activity: demoStore.activity.filter((a) => inWindow(a.createdAt)),
    handoffs: demoStore.handoffs.filter((h) => inWindow(h.date)),
  };

  addActivity({ type: "export_created", description: `Timeline exported as ${format.toUpperCase()}`, actor: "Coordinator", createdAt: new Date().toISOString(), metadata: { format } });

  if (format === "csv") {
    const escapeCsv = (val: string) => '"' + val.replace(/"/g, '""') + '"';
    const rows = [
      ["Type", "ID", "Date", "Actor", "Details"].join(","),
      ...data.messages.map((m) => ["Message", m.id, m.createdAt, m.sender, escapeCsv(m.body)].join(",")),
      ...data.tasks.map((t) => ["Task", t.id, t.createdAt || "", t.assignedToName || "Unassigned", escapeCsv(t.title)].join(",")),
      ...data.appointments.map((a) => ["Appointment", a.id, a.at, a.assignedDriverName || "Unassigned", escapeCsv(a.title)].join(",")),
      ...data.supplies.map((s) => ["Supply", s.id, "", s.requestedBy || "", escapeCsv(s.item)].join(",")),
      ...data.medicationLogs.map((m) => ["Medication", m.id, m.at, m.by, escapeCsv(m.text)].join(",")),
      ...data.concerns.map((c) => ["Concern", c.id, c.createdAt, c.acknowledgedBy || "Unacknowledged", escapeCsv(c.text)].join(",")),
    ];
    return { format, content: rows.join("\n") };
  }

  return { format, content: JSON.stringify(data, null, 2) };
}
