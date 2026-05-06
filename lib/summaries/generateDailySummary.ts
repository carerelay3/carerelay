import { demoStore } from "@/lib/demo/data";

type Params = {
  careCircleId: string;
  from?: Date;
  to?: Date;
};

export async function generateDailySummary({ careCircleId, from, to }: Params) {
  const start = from ?? new Date(Date.now() - 24 * 60 * 60 * 1000);
  const end = to ?? new Date();
  const inWindow = (value: string) => {
    const t = new Date(value).getTime();
    return t >= start.getTime() && t <= end.getTime();
  };

  if (careCircleId !== demoStore.careCircleId) {
    return {
      completed: [],
      upcoming: [],
      openTasks: [],
      suppliesNeeded: [],
      medicationConfirmations: [],
      concernsMentioned: [],
      generalNotes: [],
      summaryText: "No records were found for this care circle.",
    };
  }

  const completed = demoStore.tasks.filter((t) => t.status === "done").map((t) => t.title);
  const upcoming = demoStore.appointments.filter((a) => inWindow(a.at)).map((a) => a.title);
  const openTasks = demoStore.tasks.filter((t) => t.status !== "done").map((t) => t.title);
  const suppliesNeeded = demoStore.supplies.filter((s) => s.status === "needed").map((s) => s.item);
  const medicationConfirmations = demoStore.meds.filter((m) => inWindow(m.at)).map((m) => m.text);
  const concernsMentioned = demoStore.concerns.filter((c) => inWindow(c.createdAt)).map((c) => c.text);
  const generalNotes = demoStore.messages
    .filter((m) => m.category === "general_update" && inWindow(m.createdAt))
    .map((m) => `${m.sender}: ${m.body}`);

  const concernLine = concernsMentioned
    .map(
      (text) =>
        `Concern mentioned: ${text}. Family may want to review this update. CareRelay does not provide medical advice.`,
    )
    .join(" ");

  const summaryText = [
    `Completed items: ${completed.length ? completed.join("; ") : "none reported"}.`,
    `Open tasks: ${openTasks.length ? openTasks.join("; ") : "none currently open"}.`,
    `Upcoming appointments: ${upcoming.length ? upcoming.join("; ") : "none in this period"}.`,
    `Supplies needed: ${suppliesNeeded.length ? suppliesNeeded.join("; ") : "none reported"}.`,
    `Medication confirmations: ${
      medicationConfirmations.length ? medicationConfirmations.join("; ") : "none logged"
    }.`,
    concernLine || "No concerns were mentioned.",
  ].join(" ");

  return {
    completed,
    upcoming,
    openTasks,
    suppliesNeeded,
    medicationConfirmations,
    concernsMentioned,
    generalNotes,
    summaryText,
  };
}
