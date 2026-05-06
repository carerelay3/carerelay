import { z } from "zod";

export const parseMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export const smsMockSchema = z.object({
  careCircleId: z.string().min(1),
  fromName: z.string().min(1),
  fromPhone: z.string().min(7),
  body: z.string().min(1),
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
  format: z.enum(["json", "csv"]),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
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
