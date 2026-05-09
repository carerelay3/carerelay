import type { CareCategory } from "@/lib/types";

const styles: Record<CareCategory, string> = {
  medication: "badge-sage",
  appointment: "badge-blue",
  task: "badge-purple",
  supply: "badge-warm",
  concern: "badge-warm",
  general_update: "badge-teal",
};

const labels: Record<CareCategory, string> = {
  medication: "Medication",
  appointment: "Appointment",
  task: "Task",
  supply: "Supply",
  concern: "Concern",
  general_update: "Note",
};

export function CategoryBadge({ category }: { category: CareCategory }) {
  return <span className={`badge-pill ${styles[category]}`}>{labels[category]}</span>;
}
