import { NextResponse } from "next/server";
import { updateTaskAssignee } from "@/lib/demo/data";
import { assignTaskSchema } from "@/lib/validation/schemas";
import { appConfig } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { authErrorResponse, requireRecordMembership, requireUser } from "@/lib/supabase/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = assignTaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (admin && !appConfig.demoMode) {
      const user = await requireUser(req);
      await requireRecordMembership(user.id, "tasks", parsed.data.taskId);
      const { error } = await admin
        .from("tasks")
        .update({
          assigned_to: parsed.data.memberId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", parsed.data.taskId);
      if (error) return NextResponse.json({ error: "Task could not be assigned." }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    const snapshot = updateTaskAssignee(parsed.data.taskId, parsed.data.memberId, parsed.data.memberName);
    if (!snapshot) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }
    return NextResponse.json({ snapshot });
  } catch (error) {
    return authErrorResponse(error);
  }
}
