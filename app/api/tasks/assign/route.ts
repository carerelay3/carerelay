import { NextResponse } from "next/server";
import { updateTaskAssignee } from "@/lib/demo/data";
import { assignTaskSchema } from "@/lib/validation/schemas";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = assignTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const snapshot = updateTaskAssignee(parsed.data.taskId, parsed.data.memberId, parsed.data.memberName);
  if (!snapshot) {
    return NextResponse.json({ error: "Task not found." }, { status: 404 });
  }
  return NextResponse.json({ snapshot });
}
