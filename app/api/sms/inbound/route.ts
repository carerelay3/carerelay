import { NextResponse } from "next/server";
import { addDemoMessage, demoStore } from "@/lib/demo/data";
import { normalizePhone } from "@/lib/utils/phone";
import { appConfig } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase/client";
import { parseCareMessage } from "@/lib/parser/careMessageParser";
import type { ParsedCareMessage } from "@/lib/types";

const xml = (text: string) =>
  `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${text}</Message></Response>`;

async function handleLiveSms(from: string, to: string, body: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase admin client not available");

  // 1. Find Care Circle
  const { data: circle } = await supabase
    .from("care_circles")
    .select("id")
    .eq("shared_phone_number", normalizePhone(to))
    .single();

  if (!circle) {
    return {
      status: 404,
      message: "This CareRelay number is not connected to an active care circle.",
    };
  }

  const careCircleId = circle.id;

  // 2. Find Family Member
  const { data: memberData } = await supabase
    .from("family_members")
    .select("id, name")
    .eq("care_circle_id", careCircleId)
    .eq("phone_number", normalizePhone(from))
    .single();

  // 3. Parse Message
  const parsed = parseCareMessage(body);
  
  // 4. Handle specific command query logic if needed (like summary counts)
  let responseText = "";
  
  if (parsed.command === "request_summary") {
    const [{ count: openTasks }, { count: supplies }, { count: concerns }] = await Promise.all([
      supabase.from("tasks").select("*", { count: "exact", head: true }).eq("care_circle_id", careCircleId).eq("status", "open"),
      supabase.from("supplies").select("*", { count: "exact", head: true }).eq("care_circle_id", careCircleId).eq("status", "needed"),
      supabase.from("concerns").select("*", { count: "exact", head: true }).eq("care_circle_id", careCircleId).eq("acknowledged", false)
    ]);
    responseText = `CareRelay summary: ${openTasks || 0} open tasks, ${supplies || 0} supplies needed, ${concerns || 0} unreviewed concerns. CareRelay does not provide medical advice. For emergencies, call 911.`;
  } else if (parsed.command === "request_help") {
    responseText = "CareRelay commands: Task: [description], Need: [item], Appointment: [details], Meds: [note], Done: [task], Bought: [item], Delivered: [item], Assign: [name] [task], Summary, Help. Reply STOP to opt out.";
  } else if (parsed.command === "opt_out") {
    if (memberData) await supabase.from("family_members").update({ invite_status: "opted_out" }).eq("id", memberData.id);
    responseText = "You have opted out of CareRelay messages. Reply YES to rejoin. CareRelay does not provide medical advice.";
  } else if (parsed.command === "opt_in") {
    if (memberData) await supabase.from("family_members").update({ invite_status: "joined" }).eq("id", memberData.id);
    responseText = "Welcome back to CareRelay. You can text updates, tasks, needs, and appointments to this number. Reply HELP for commands.";
  } else if (parsed.command === "complete_task") {
    responseText = `CareRelay marked a task as done. Reply STOP to opt out.`;
  } else if (parsed.command === "update_supply") {
    responseText = `CareRelay updated a supply item. Reply STOP to opt out.`;
  } else if (parsed.command === "assign_task") {
    responseText = `CareRelay assigned a task. Reply STOP to opt out.`;
  } else if (parsed.concernFlag) {
    responseText = "CareRelay flagged this for family attention. CareRelay does not provide medical advice. For emergencies, call 911 or your local emergency number.";
  } else if (memberData) {
    responseText = `CareRelay logged this as: ${parsed.category}. Reply STOP to opt out.`;
  } else {
    responseText = "CareRelay received this message, but this phone number is not listed in the care circle.";
  }

  // 5. Insert inbound_message
  const { data: inboundMsg } = await supabase
    .from("inbound_messages")
    .insert({
      care_circle_id: careCircleId,
      family_member_id: memberData?.id || null,
      from_phone: normalizePhone(from),
      to_phone: normalizePhone(to),
      body: body,
      category: parsed.category,
      confidence: parsed.confidence,
      concern_flag: parsed.concernFlag,
      processed: true
    })
    .select()
    .single();

  const msgId = inboundMsg?.id;

  // 6. Insert corresponding record
  if (msgId) {
    let createdRecordType = null;
    let createdRecordId = null;

    if (parsed.suggestedRecord?.type === "task") {
      const { data: t } = await supabase.from("tasks").insert({
        care_circle_id: careCircleId,
        title: parsed.suggestedRecord.title as string,
        source_message_id: msgId
      }).select().single();
      if (t) { createdRecordType = "tasks"; createdRecordId = t.id; }
    } else if (parsed.suggestedRecord?.type === "supply") {
      const { data: s } = await supabase.from("supplies").insert({
        care_circle_id: careCircleId,
        item: parsed.suggestedRecord.item as string,
        source_message_id: msgId
      }).select().single();
      if (s) { createdRecordType = "supplies"; createdRecordId = s.id; }
    } else if (parsed.suggestedRecord?.type === "appointment") {
      const { data: a } = await supabase.from("appointments").insert({
        care_circle_id: careCircleId,
        title: parsed.suggestedRecord.title as string,
        source_message_id: msgId
      }).select().single();
      if (a) { createdRecordType = "appointments"; createdRecordId = a.id; }
    } else if (parsed.suggestedRecord?.type === "medication_log") {
      const { data: m } = await supabase.from("medication_logs").insert({
        care_circle_id: careCircleId,
        confirmation_text: parsed.suggestedRecord.confirmationText as string,
        source_message_id: msgId,
        confirmed_by: memberData?.id || null,
        confirmed_at: new Date().toISOString()
      }).select().single();
      if (m) { createdRecordType = "medication_logs"; createdRecordId = m.id; }
    } else if (parsed.suggestedRecord?.type === "concern" || parsed.concernFlag) {
      const { data: c } = await supabase.from("concerns").insert({
        care_circle_id: careCircleId,
        concern_text: (parsed.suggestedRecord?.concernText as string) || body,
        source_message_id: msgId
      }).select().single();
      if (c) { createdRecordType = "concerns"; createdRecordId = c.id; }
    }

    if (createdRecordId) {
      await supabase.from("inbound_messages").update({
        created_record_type: createdRecordType,
        created_record_id: createdRecordId
      }).eq("id", msgId);
    }
  }

  return {
    status: 200,
    result: parsed,
    message: responseText
  };
}

function buildDemoSmsResponse(result: { parsed: ParsedCareMessage; sender: string }, member?: { name: string }) {
  const { parsed } = result;

  if (parsed.command === "request_summary") {
    const open = demoStore.tasks.filter((t) => t.status === "open").length;
    const supplies = demoStore.supplies.filter((s) => s.status === "needed").length;
    const concerns = demoStore.concerns.filter((c) => !c.acknowledged).length;
    return `CareRelay summary: ${open} open tasks, ${supplies} supplies needed, ${concerns} unreviewed concerns. CareRelay does not provide medical advice. For emergencies, call 911.`;
  }
  if (parsed.command === "request_help") return "CareRelay commands: Task: [description], Need: [item], Appointment: [details], Meds: [note], Done: [task], Bought: [item], Delivered: [item], Assign: [name] [task], Summary, Help. Reply STOP to opt out.";
  if (parsed.command === "opt_out") return "You have opted out of CareRelay messages. Reply YES to rejoin. CareRelay does not provide medical advice.";
  if (parsed.command === "opt_in") return "Welcome back to CareRelay. You can text updates, tasks, needs, and appointments to this number. Reply HELP for commands.";
  if (parsed.command === "complete_task") return `CareRelay marked a task as done. Reply STOP to opt out.`;
  if (parsed.command === "update_supply") return `CareRelay updated a supply item. Reply STOP to opt out.`;
  if (parsed.command === "assign_task") return `CareRelay assigned a task. Reply STOP to opt out.`;
  if (parsed.concernFlag) return "CareRelay flagged this for family attention. CareRelay does not provide medical advice. For emergencies, call 911 or your local emergency number.";
  if (member) return `CareRelay logged this as: ${parsed.category}. Reply STOP to opt out.`;
  return "CareRelay received this message, but this phone number is not listed in the care circle.";
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type") || "";
  let from = "";
  let to = "";
  let body = "";
  
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await req.formData();
    from = String(form.get("From") || "");
    to = String(form.get("To") || "");
    body = String(form.get("Body") || "");
  } else {
    const json = await req.json().catch(() => ({}));
    from = json.From || json.from || "";
    to = json.To || json.to || "";
    body = json.Body || json.body || "";
  }
  
  if (!body.trim()) return NextResponse.json({ error: "Body is required" }, { status: 400 });

  if (appConfig.supabaseConfigured) {
    const { status, result, message } = await handleLiveSms(from, to, body);
    if (status !== 200) {
      return contentType.includes("application/x-www-form-urlencoded")
        ? new Response(xml(message), { headers: { "Content-Type": "text/xml" } })
        : NextResponse.json({ message }, { status });
    }
    return contentType.includes("application/x-www-form-urlencoded")
      ? new Response(xml(message), { headers: { "Content-Type": "text/xml" } })
      : NextResponse.json({ result, message });
  }

  // Fallback to Demo Mode
  if (normalizePhone(to) !== normalizePhone(demoStore.sharedPhone)) {
    const message = "This CareRelay number is not connected to an active care circle.";
    return contentType.includes("application/x-www-form-urlencoded")
      ? new Response(xml(message), { headers: { "Content-Type": "text/xml" } })
      : NextResponse.json({ message }, { status: 404 });
  }

  const member = demoStore.members.find((m) => normalizePhone(m.phone) === normalizePhone(from));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = addDemoMessage({ sender: member?.name || "Unknown sender", fromPhone: from, body }) as any;
  const responseText = buildDemoSmsResponse(result, member);

  return contentType.includes("application/x-www-form-urlencoded")
    ? new Response(xml(responseText), { headers: { "Content-Type": "text/xml" } })
    : NextResponse.json({ result: result.parsed, message: responseText });
}
