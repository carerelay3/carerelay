import { NextResponse } from "next/server";
import { addDemoMessage, demoStore } from "@/lib/demo/data";
import { normalizePhone } from "@/lib/utils/phone";

const xml = (text: string) =>
  `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${text}</Message></Response>`;

function buildSmsResponse(result: { parsed: { concernFlag: boolean; category: string; command?: string | null }; sender: string }, member?: { name: string }) {
  const { parsed } = result;

  // Command responses take priority
  if (parsed.command === "request_summary") {
    const open = demoStore.tasks.filter((t) => t.status === "open").length;
    const supplies = demoStore.supplies.filter((s) => s.status === "needed").length;
    const concerns = demoStore.concerns.filter((c) => !c.acknowledged).length;
    return `CareRelay summary: ${open} open tasks, ${supplies} supplies needed, ${concerns} unreviewed concerns. CareRelay does not provide medical advice. For emergencies, call 911.`;
  }

  if (parsed.command === "request_help") {
    return "CareRelay commands: Task: [description], Need: [item], Appointment: [details], Meds: [note], Done: [task], Bought: [item], Delivered: [item], Assign: [name] [task], Summary, Help. Reply STOP to opt out.";
  }

  if (parsed.command === "opt_out") {
    return "You have opted out of CareRelay messages. Reply YES to rejoin. CareRelay does not provide medical advice.";
  }

  if (parsed.command === "opt_in") {
    return "Welcome back to CareRelay. You can text updates, tasks, needs, and appointments to this number. Reply HELP for commands.";
  }

  if (parsed.command === "complete_task") {
    return `CareRelay marked a task as done. Reply STOP to opt out.`;
  }

  if (parsed.command === "update_supply") {
    return `CareRelay updated a supply item. Reply STOP to opt out.`;
  }

  if (parsed.command === "assign_task") {
    return `CareRelay assigned a task. Reply STOP to opt out.`;
  }

  if (parsed.concernFlag) {
    return "CareRelay flagged this for family attention. CareRelay does not provide medical advice. For emergencies, call 911 or your local emergency number.";
  }

  if (member) {
    return `CareRelay logged this as: ${parsed.category}. Reply STOP to opt out.`;
  }

  return "CareRelay received this message, but this phone number is not listed in the care circle.";
}

export async function POST(req: Request) {
  // Production hardening note: add durable rate limiting and signature validation.
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

  if (normalizePhone(to) !== normalizePhone(demoStore.sharedPhone)) {
    const message = "This CareRelay number is not connected to an active care circle.";
    return contentType.includes("application/x-www-form-urlencoded")
      ? new Response(xml(message), { headers: { "Content-Type": "text/xml" } })
      : NextResponse.json({ message }, { status: 404 });
  }

  const member = demoStore.members.find((m) => normalizePhone(m.phone) === normalizePhone(from));
  const result = addDemoMessage({ sender: member?.name || "Unknown sender", fromPhone: from, body });
  const responseText = buildSmsResponse(result as unknown as { parsed: { concernFlag: boolean; category: string; command?: string | null }; sender: string }, member);

  return contentType.includes("application/x-www-form-urlencoded")
    ? new Response(xml(responseText), { headers: { "Content-Type": "text/xml" } })
    : NextResponse.json({ result: result.parsed, message: responseText });
}
