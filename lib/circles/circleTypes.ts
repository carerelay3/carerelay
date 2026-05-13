export const circleTypes = ["care", "family", "household", "team", "group"] as const;

export type CircleType = (typeof circleTypes)[number];

export type CircleTypeCategory = {
  key: string;
  label: string;
};

export const circleTypeLabels: Record<CircleType, string> = {
  care: "Care Mode",
  family: "Family Mode",
  household: "Household Mode",
  team: "Team Mode",
  group: "Group Mode",
};

export const circleTypeDescriptions: Record<CircleType, string> = {
  care: "For caregiving coordination.",
  family: "For chores, errands, groceries, appointments, school notes, and household reminders.",
  household: "For roommates, dorms, chores, supplies, bills, maintenance, and house updates.",
  team: "For practices, games, rides, equipment, volunteer tasks, announcements, and reminders.",
  group: "For trips, clubs, events, frats, friend groups, shared responsibilities, and decisions.",
};

export const circleTypeCategoryPresets: Record<CircleType, CircleTypeCategory[]> = {
  care: [
    { key: "medication_confirmations", label: "Medication confirmations" },
    { key: "appointments", label: "Appointments" },
    { key: "supplies", label: "Supplies" },
    { key: "tasks", label: "Tasks" },
    { key: "concerns", label: "Concerns" },
    { key: "updates", label: "Updates" },
    { key: "daily_summaries", label: "Daily summaries" },
  ],
  family: [
    { key: "chores", label: "Chores" },
    { key: "errands", label: "Errands" },
    { key: "groceries", label: "Groceries" },
    { key: "appointments", label: "Appointments" },
    { key: "school_notes", label: "School notes" },
    { key: "reminders", label: "Reminders" },
    { key: "updates", label: "Updates" },
    { key: "summaries", label: "Summaries" },
  ],
  household: [
    { key: "chores", label: "Chores" },
    { key: "groceries", label: "Groceries" },
    { key: "supplies", label: "Supplies" },
    { key: "bills", label: "Bills" },
    { key: "maintenance", label: "Maintenance" },
    { key: "house_updates", label: "House updates" },
    { key: "reminders", label: "Reminders" },
    { key: "summaries", label: "Summaries" },
  ],
  team: [
    { key: "practices", label: "Practices" },
    { key: "games_events", label: "Games/events" },
    { key: "rides", label: "Rides" },
    { key: "equipment", label: "Equipment" },
    { key: "announcements", label: "Announcements" },
    { key: "volunteer_tasks", label: "Volunteer tasks" },
    { key: "reminders", label: "Reminders" },
    { key: "summaries", label: "Summaries" },
  ],
  group: [
    { key: "events", label: "Events" },
    { key: "tasks", label: "Tasks" },
    { key: "supplies", label: "Supplies" },
    { key: "announcements", label: "Announcements" },
    { key: "votes_decisions", label: "Votes/decisions" },
    { key: "reminders", label: "Reminders" },
    { key: "responsibilities", label: "Responsibilities" },
    { key: "summaries", label: "Summaries" },
  ],
};

export function isCircleType(value: unknown): value is CircleType {
  return typeof value === "string" && circleTypes.includes(value as CircleType);
}

export function normalizeCircleType(value: unknown): CircleType {
  return isCircleType(value) ? value : "care";
}

export function getCircleTypeLabel(type: CircleType | string | null | undefined) {
  return circleTypeLabels[normalizeCircleType(type)];
}

export function getCircleTypeDescription(type: CircleType | string | null | undefined) {
  return circleTypeDescriptions[normalizeCircleType(type)];
}

export function getCategoriesForCircleType(type: CircleType | string | null | undefined) {
  return circleTypeCategoryPresets[normalizeCircleType(type)];
}

export function isCareMode(type: CircleType | string | null | undefined) {
  return normalizeCircleType(type) === "care";
}

export function isTeamMode(type: CircleType | string | null | undefined) {
  return normalizeCircleType(type) === "team";
}

export function isGroupMode(type: CircleType | string | null | undefined) {
  return normalizeCircleType(type) === "group";
}
