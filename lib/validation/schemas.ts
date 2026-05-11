import { z } from "zod";

export const parseMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export const smsMockSchema = z
  .object({
    careCircleId: z.string().min(1).optional(),
    demoId: z.string().min(1).optional(),
    fromName: z.string().min(1).optional(),
    senderName: z.string().min(1).optional(),
    fromPhone: z.string().min(7).optional(),
    senderPhone: z.string().min(7).optional(),
    body: z.string().min(1).optional(),
    message: z.string().min(1).optional(),
    smsKeyword: z.string().min(1).optional(),
  })
  .transform((value) => ({
    careCircleId: value.careCircleId || value.demoId || "circle-demo-1",
    fromName: value.fromName || value.senderName || "Demo User",
    fromPhone: value.fromPhone || value.senderPhone || "",
    body: [value.smsKeyword, value.body || value.message || ""].filter(Boolean).join(" "),
  }))
  .refine((value) => value.fromPhone.length >= 7, {
    message: "Sender phone is required",
    path: ["senderPhone"],
  })
  .refine((value) => value.body.trim().length > 0, {
    message: "Message is required",
    path: ["message"],
  });

export const summaryGenerateSchema = z.object({
  careCircleId: z.string().min(1),
});

export const checkoutSchema = z.object({
  planId: z.enum(["starter", "family", "family_plus"]),
});

export const acknowledgeConcernSchema = z.object({
  concernId: z.string().min(1),
  by: z.string().min(1),
  note: z.string().optional(),
});

export const assignTaskSchema = z.object({
  taskId: z.string().min(1),
  memberId: z.string().nullable(),
  memberName: z.string().optional(),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().min(1),
  status: z.enum(["open", "done", "needs_attention"]),
  by: z.string().optional(),
});

export const updateSupplyStatusSchema = z.object({
  supplyId: z.string().min(1),
  status: z.enum(["needed", "purchased", "delivered"]),
  by: z.string().optional(),
});

export const generateHandoffSchema = z.object({
  careCircleId: z.string().min(1),
});

export const reviewHandoffSchema = z.object({
  handoffId: z.string().min(1),
});

export const exportTimelineSchema = z.object({
  careCircleId: z.string().min(1),
  format: z.enum(["json", "csv"]).default("json"),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

export const weeklySummarySchema = z.object({
  careCircleId: z.string().min(1),
});

export const inviteMemberSchema = z.object({
  memberId: z.string().min(1),
});

export const addMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email().optional(),
  permissionLevel: z.enum(["admin", "contributor", "viewer"]),
});

export const updatePreferencesSchema = z.object({
  summaryTime: z.string().optional(),
  timezone: z.string().optional(),
  sendSummaryToAdmins: z.boolean().optional(),
  sendSummaryToFamily: z.boolean().optional(),
  notifyConcerns: z.boolean().optional(),
  notifyTasks: z.boolean().optional(),
  notifyAppointments: z.boolean().optional(),
  notifySupplies: z.boolean().optional(),
});
