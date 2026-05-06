import { NextResponse } from "next/server";
import { updateTaskStatus } from "@/lib/demo/data";
import { updateTaskStatusSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = updateTaskStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const snapshot = updateTaskStatus(parsed.data.taskId, parsed.data.status, parsed.data.by);
  if (!snapshot) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }
  return NextResponse.json({ snapshot });
}
