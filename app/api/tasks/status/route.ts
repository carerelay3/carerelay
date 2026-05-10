import { NextResponse } from "next/server";
import { updateTaskStatus } from "@/lib/demo/data";
import { updateTaskStatusSchema } from "@/lib/validation/schemas";
import { appConfig } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { authErrorResponse, requireRecordMembership, requireUser } from "@/lib/supabase/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = updateTaskStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const isLiveMode = appConfig.supabaseConfigured && !appConfig.demoMode;

    if (isLiveMode) {
      const admin = getSupabaseAdmin();
      if (!admin) {
        return NextResponse.json({ error: "Live data is not configured." }, { status: 503 });
      }

      const user = await requireUser(req);
      await requireRecordMembership(user.id, "tasks", parsed.data.taskId);
      const { error } = await admin
        .from("tasks")
        .update({
          status: parsed.data.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", parsed.data.taskId);
      if (error) return NextResponse.json({ error: "Task could not be updated." }, { status: 500 });
      return NextResponse.json({ ok: true });
    }

    const snapshot = updateTaskStatus(parsed.data.taskId, parsed.data.status, parsed.data.by);
    if (!snapshot) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }
    return NextResponse.json({ snapshot });
  } catch (error) {
    return authErrorResponse(error);
  }
}
