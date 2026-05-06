import type {
  DemoMessage,
  DemoMember,
  DemoTask,
  DemoAppointment,
  DemoSupply,
  DemoConcern,
  DemoActivity,
  DemoHandoff,
  DemoPreferences,
} from "@/lib/types";

export type DemoSnapshot = {
  careCircleId: string;
  careCircleName: string;
  recipientName: string;
  sharedPhone: string;
  members: DemoMember[];
  messages: DemoMessage[];
  tasks: DemoTask[];
  appointments: DemoAppointment[];
  supplies: DemoSupply[];
  medicationLogs: Array<{ id: string; text: string; by: string; at: string }>;
  concerns: DemoConcern[];
  activity: DemoActivity[];
  handoffs: DemoHandoff[];
  preferences: DemoPreferences;
};
