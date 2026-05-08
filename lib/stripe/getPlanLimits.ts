import { PlanId } from "@/lib/stripe/plans";

export interface PlanLimits {
  maxCareCircles: number;
  maxFamilyMembers: number;
  dailySummaries: boolean;
  weeklySummaries: boolean;
  exportTimeline: boolean;
  multipleCareCircles: boolean;
}

export function getPlanLimits(planId: PlanId | null | undefined): PlanLimits {
  switch (planId) {
    case "family_plus":
      return {
        maxCareCircles: 5,
        maxFamilyMembers: 50,
        dailySummaries: true,
        weeklySummaries: true,
        exportTimeline: true,
        multipleCareCircles: true,
      };
    case "family":
      return {
        maxCareCircles: 1,
        maxFamilyMembers: 8,
        dailySummaries: true,
        weeklySummaries: true,
        exportTimeline: false,
        multipleCareCircles: false,
      };
    case "starter":
    case "demo":
    default:
      return {
        maxCareCircles: 1,
        maxFamilyMembers: 3,
        dailySummaries: true,
        weeklySummaries: false,
        exportTimeline: false,
        multipleCareCircles: false,
      };
  }
}