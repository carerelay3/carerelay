import { getPlanLimits } from "./getPlanLimits";
import { PlanId } from "@/lib/stripe/plans";

export function checkFamilyMemberLimit(planId: PlanId | null | undefined, currentMembers: number): boolean {
  const limits = getPlanLimits(planId);
  return currentMembers < limits.maxFamilyMembers;
}

export function checkCareCircleLimit(planId: PlanId | null | undefined, currentCircles: number): boolean {
  const limits = getPlanLimits(planId);
  return currentCircles < limits.maxCareCircles;
}

export function canExportTimeline(planId: PlanId | null | undefined): boolean {
  return getPlanLimits(planId).exportTimeline;
}

export function canHaveWeeklySummaries(planId: PlanId | null | undefined): boolean {
  return getPlanLimits(planId).weeklySummaries;
}