import { NextResponse } from "next/server";
import { exportTimeline } from "@/lib/demo/data";
import { exportTimelineSchema } from "@/lib/validation/schemas";
import { appConfig } from "@/lib/config";
import { authErrorResponse, requireCareCircleMembership, requireUser } from "@/lib/supabase/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = exportTimelineSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    if (!appConfig.demoMode && parsed.data.careCircleId !== "circle-demo-1") {
      const user = await requireUser(req);
      await requireCareCircleMembership(user.id, parsed.data.careCircleId);
      return NextResponse.json({
        error: "Live export is not enabled yet. Use the dashboard timeline while export formatting is connected.",
      }, { status: 501 });
    }

    const result = exportTimeline(parsed.data.format, parsed.data.fromDate, parsed.data.toDate);
    return NextResponse.json(result);
  } catch (error) {
    return authErrorResponse(error);
  }
}
