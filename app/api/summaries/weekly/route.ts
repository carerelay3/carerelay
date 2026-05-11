import { NextResponse } from "next/server";
import { generateWeeklySummary } from "@/lib/summaries/generateWeeklySummary";
import { buildPrintableWeeklySummaryHtml, WEEKLY_SUMMARY_DISCLAIMER } from "@/lib/summaries/weeklyPrintable";
import { weeklySummarySchema } from "@/lib/validation/schemas";
import { authErrorResponse, requireCareCircleMembership, requireUser } from "@/lib/supabase/auth";
import { getCurrentUserPlan } from "@/lib/stripe/getCurrentUserPlan";
import { getPlanLimits } from "@/lib/stripe/getPlanLimits";
import { getCareCircleOwnerId } from "@/lib/team/server";

export async function POST(req: Request) {
  try {
    const user = await requireUser(req);
    const body = await req.json().catch(() => ({}));
    const parsed = weeklySummarySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { code: "validation_failed", error: "Weekly summary request is invalid.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await requireCareCircleMembership(user.id, parsed.data.careCircleId);

    const ownerId = await getCareCircleOwnerId(parsed.data.careCircleId);
    const plan = await getCurrentUserPlan(ownerId);
    const limits = getPlanLimits(plan.planId);
    if (!limits.weeklySummaries) {
      return NextResponse.json(
        {
          code: "plan_upgrade_required",
          error: "Weekly summaries are available on Family and Family Plus plans.",
          planId: plan.planId,
          pdfAvailable: false,
        },
        { status: 403 },
      );
    }

    const summary = await generateWeeklySummary(parsed.data.careCircleId);
    const summaryText = `${summary.summaryText}\n\n${WEEKLY_SUMMARY_DISCLAIMER}`;
    const html = buildPrintableWeeklySummaryHtml({
      careCircleId: parsed.data.careCircleId,
      summaryText,
      source: summary.source,
    });

    return NextResponse.json({
      format: "html",
      pdfAvailable: false,
      pdfMessage: "PDF generation is not enabled yet. Use the printable HTML weekly summary.",
      disclaimer: WEEKLY_SUMMARY_DISCLAIMER,
      summaryText,
      source: summary.source,
      html,
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}
