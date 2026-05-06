export type CareCategory =
  | "medication"
  | "appointment"
  | "task"
  | "supply"
  | "general_update"
  | "concern";

export type SmsCommand =
  | "complete_task"
  | "update_supply"
  | "assign_task"
  | "request_summary"
  | "request_help"
  | "opt_out"
  | "opt_in"
  | null;

export type ParsedCareMessage = {
  category: CareCategory;
  confidence: number;
  extractedTitle: string;
  extractedDetails?: string;
  concernFlag: boolean;
  matchedKeywords: string[];
  suggestedRecord: Record<string, string | boolean | null>;
  command?: SmsCommand;
  commandTarget?: string;
  commandAssignee?: string;
  commandNewStatus?: string;
};

export type DemoMessage = {
  id: string;
  sender: string;
  fromPhone: string;
  toPhone: string;
  body: string;
  createdAt: string;
  category: CareCategory;
  confidence: number;
  concernFlag: boolean;
  linkedRecord?: { type: string; id: string };
  command?: SmsCommand;
};

export type TaskStatus = "open" | "done" | "needs_attention";
export type SupplyStatus = "needed" | "purchased" | "delivered";
export type InviteStatus = "not_invited" | "invited" | "joined" | "opted_out";
export type PermissionLevel = "admin" | "contributor" | "viewer";

export type DemoMember = {
  id: string;
  name: string;
  role: string;
  phone: string;
  email?: string;
  permissionLevel: PermissionLevel;
  inviteStatus: InviteStatus;
  joinedAt?: string;
  optedOutAt?: string;
  lastActiveAt?: string;
};

export type DemoTask = {
  id: string;
  title: string;
  status: TaskStatus;
  assignedTo?: string;
  assignedToName?: string;
  completedBy?: string;
  completedAt?: string;
  createdAt?: string;
};

export type DemoAppointment = {
  id: string;
  title: string;
  at: string;
  transportationConfirmed: boolean;
  assignedDriver?: string;
  assignedDriverName?: string;
};

export type DemoSupply = {
  id: string;
  item: string;
  status: SupplyStatus;
  requestedBy?: string;
};

export type DemoConcern = {
  id: string;
  text: string;
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  acknowledgementNote?: string;
};

export type DemoActivity = {
  id: string;
  type: string;
  description: string;
  actor?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type DemoHandoff = {
  id: string;
  date: string;
  summaryText: string;
  reviewed: boolean;
  reviewedAt?: string;
};

export type DemoPreferences = {
  summaryTime: string;
  timezone: string;
  sendSummaryToAdmins: boolean;
  sendSummaryToFamily: boolean;
  notifyConcerns: boolean;
  notifyTasks: boolean;
  notifyAppointments: boolean;
  notifySupplies: boolean;
};
