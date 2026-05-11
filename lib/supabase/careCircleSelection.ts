import "server-only";

import { getUserCareCircles } from "@/lib/supabase/dashboardRecords";

export type SelectableCareCircle = {
  id: string;
  name: string;
  owner_id?: string | null;
  shared_phone_number?: string | null;
  sms_keyword?: string | null;
};

function asCircle(row: Record<string, unknown>): SelectableCareCircle | null {
  if (typeof row.id !== "string" || !row.id) return null;
  return {
    id: row.id,
    name: typeof row.name === "string" && row.name ? row.name : "Care circle",
    owner_id: typeof row.owner_id === "string" ? row.owner_id : null,
    shared_phone_number: typeof row.shared_phone_number === "string" ? row.shared_phone_number : null,
    sms_keyword: typeof row.sms_keyword === "string" ? row.sms_keyword : null,
  };
}

export async function getSelectedCareCircleForUser(userId: string, requestedCareCircleId?: string | null) {
  const circles = ((await getUserCareCircles(userId)) as Record<string, unknown>[])
    .map(asCircle)
    .filter((circle): circle is SelectableCareCircle => Boolean(circle));

  const requestedCircle = requestedCareCircleId
    ? circles.find((circle) => circle.id === requestedCareCircleId)
    : undefined;

  return {
    circles,
    selectedCircle: requestedCircle || circles[0] || null,
    requestedCareCircleDenied: Boolean(requestedCareCircleId && !requestedCircle),
  };
}
