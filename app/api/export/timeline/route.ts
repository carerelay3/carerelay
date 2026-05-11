import { NextResponse } from "next/server";
import { exportTimeline } from "@/lib/demo/data";
import { buildLiveTimelineExport } from "@/lib/export/timeline";
import { exportTimelineSchema } from "@/lib/validation/schemas";
import { authErrorResponse, requireCareCircleAdminOrOwner, requireUser } from "@/lib/supabase/auth";
import { getCurrentUserPlan } from "@/lib/stripe/getCurrentUserPlan";
import { getPlanLimits } from "@/lib/stripe/getPlanLimits";
import { getCareCircleOwnerId } from "@/lib/team/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = exportTimelineSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    if (parsed.data.careCircleId === "circle-demo-1") {
      const result = exportTimeline(parsed.data.format, parsed.data.fromDate, parsed.data.toDate);
      return NextResponse.json(result);
    }

    const user = await requireUser(req);
    await requireCareCircleAdminOrOwner(user.id, parsed.data.careCircleId);

    const ownerId = await getCareCircleOwnerId(parsed.data.careCircleId);
    const plan = await getCurrentUserPlan(ownerId);
    const limits = getPlanLimits(plan.planId);
    if (!limits.exportTimeline) {
      return NextResponse.json(
        {
          code: "plan_upgrade_required",
          error: "Timeline export is available on Family Plus. Upgrade to export a care circle timeline.",
          planId: plan.planId,
        },
        { status: 403 },
      );
    }

    const result = await buildLiveTimelineExport(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    return authErrorResponse(error);
  }
}
