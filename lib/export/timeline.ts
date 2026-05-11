import "server-only";

import { AuthError } from "@/lib/supabase/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const EXPORT_DISCLAIMER = "CareRelay is for family coordination only and does not provide medical advice.";

type TimelineFormat = "json" | "csv";

type ExportOptions = {
  careCircleId: string;
  format: TimelineFormat;
  fromDate?: string;
  toDate?: string;
};

type TimelineSection = Record<string, unknown>[];

type TimelinePayload = {
  careCircleId: string;
  exportedAt: string;
  disclaimer: string;
  dateRange: {
    fromDate: string | null;
    toDate: string | null;
  };
  records: {
    inboundMessages: TimelineSection;
    tasks: TimelineSection;
    supplies: TimelineSection;
    medicationLogs: TimelineSection;
    appointments: TimelineSection;
    concerns: TimelineSection;
    dailySummaries: TimelineSection;
  };
};

function escapeCsv(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function applyDateRange(builder: unknown, column: string, fromDate?: string, toDate?: string) {
  let query = builder as {
    gte?: (column: string, value: string) => unknown;
    lte?: (column: string, value: string) => unknown;
  };
  if (fromDate && query.gte) query = query.gte(column, fromDate) as typeof query;
  if (toDate && query.lte) query = query.lte(column, toDate) as typeof query;
  return query;
}

async function selectRows(
  table: string,
  columns: string,
  careCircleId: string,
  dateColumn: string,
  fromDate?: string,
  toDate?: string,
) {
  const admin = getSupabaseAdmin();
  if (!admin) throw new AuthError("Database admin client is not configured", 503);

  const base = admin
    .from(table)
    .select(columns)
    .eq("care_circle_id", careCircleId);

  const ranged = applyDateRange(base, dateColumn, fromDate, toDate) as {
    order: (column: string, options?: { ascending?: boolean; nullsFirst?: boolean }) => Promise<{ data: TimelineSection | null; error: unknown }>;
  };

  const { data, error } = await ranged.order(dateColumn, { ascending: true, nullsFirst: false });
  if (error) throw new AuthError(`Could not export ${table}.`, 500);
  return data || [];
}

function toCsv(payload: TimelinePayload) {
  const rows = [
    ["record_type", "id", "date", "title", "details"].map(escapeCsv).join(","),
  ];

  const pushRows = (recordType: string, records: TimelineSection, dateKey: string, titleKeys: string[], detailKeys: string[]) => {
    for (const record of records) {
      const title = titleKeys.map((key) => record[key]).find(Boolean);
      const details = detailKeys.map((key) => record[key]).find(Boolean);
      rows.push([
        recordType,
        record.id,
        record[dateKey] || record.created_at,
        title,
        details,
      ].map(escapeCsv).join(","));
    }
  };

  pushRows("inbound_message", payload.records.inboundMessages, "created_at", ["category", "sender_name"], ["cleaned_body", "raw_body"]);
  pushRows("task", payload.records.tasks, "created_at", ["title"], ["details", "status"]);
  pushRows("supply", payload.records.supplies, "created_at", ["title"], ["details", "status"]);
  pushRows("medication_log", payload.records.medicationLogs, "logged_at", ["medication_name"], ["confirmation_text", "notes"]);
  pushRows("appointment", payload.records.appointments, "appointment_at", ["title"], ["details", "status"]);
  pushRows("concern", payload.records.concerns, "created_at", ["title", "severity"], ["details", "status"]);
  pushRows("daily_summary", payload.records.dailySummaries, "summary_date", ["source"], ["summary_text"]);

  rows.push(["disclaimer", "", payload.exportedAt, "", payload.disclaimer].map(escapeCsv).join(","));
  return rows.join("\n");
}

export async function buildLiveTimelineExport({ careCircleId, format, fromDate, toDate }: ExportOptions) {
  const exportedAt = new Date().toISOString();
  const [
    inboundMessages,
    tasks,
    supplies,
    medicationLogs,
    appointments,
    concerns,
    dailySummaries,
  ] = await Promise.all([
    selectRows("inbound_messages", "id, sender_name, cleaned_body, raw_body, category, confidence, concern_flag, created_at", careCircleId, "created_at", fromDate, toDate),
    selectRows("tasks", "id, title, details, status, due_at, completed_at, created_at", careCircleId, "created_at", fromDate, toDate),
    selectRows("supplies", "id, title, details, status, created_at", careCircleId, "created_at", fromDate, toDate),
    selectRows("medication_logs", "id, medication_name, confirmation_text, logged_at, notes, created_at", careCircleId, "created_at", fromDate, toDate),
    selectRows("appointments", "id, title, details, appointment_at, status, transportation_confirmed, created_at", careCircleId, "created_at", fromDate, toDate),
    selectRows("concerns", "id, title, details, severity, status, acknowledged_at, acknowledgement_note, created_at", careCircleId, "created_at", fromDate, toDate),
    selectRows("daily_summaries", "id, summary_date, summary_text, source, created_at", careCircleId, "created_at", fromDate, toDate),
  ]);

  const payload: TimelinePayload = {
    careCircleId,
    exportedAt,
    disclaimer: EXPORT_DISCLAIMER,
    dateRange: { fromDate: fromDate || null, toDate: toDate || null },
    records: {
      inboundMessages,
      tasks,
      supplies,
      medicationLogs,
      appointments,
      concerns,
      dailySummaries,
    },
  };

  return {
    format,
    from: fromDate,
    to: toDate,
    exportedAt,
    disclaimer: EXPORT_DISCLAIMER,
    content: format === "csv" ? toCsv(payload) : JSON.stringify(payload, null, 2),
  };
}
