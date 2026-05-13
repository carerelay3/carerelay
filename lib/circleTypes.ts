import {
  type CircleType,
  getCircleTypeDescription,
  getCircleTypeLabel,
  isCareMode,
  normalizeCircleType,
} from "@/lib/circles/circleTypes";

export type { CircleType } from "@/lib/circles/circleTypes";

export interface ModeLabels {
  name: string;
  description: string;
  memberLabel: string;
  updatesLabel: string;
  scheduleLabel: string;
  showMedicalDisclaimer: boolean;
}

export function getModeLabels(circleType: CircleType | string | null | undefined): ModeLabels {
  const type = normalizeCircleType(circleType);
  
  switch (type) {
    case 'family':
      return {
        name: getCircleTypeLabel('family'),
        description: getCircleTypeDescription('family'),
        memberLabel: 'Family Member',
        updatesLabel: 'Family Updates',
        scheduleLabel: 'Calendar',
        showMedicalDisclaimer: false,
      };
    case 'household':
      return {
        name: getCircleTypeLabel('household'),
        description: getCircleTypeDescription('household'),
        memberLabel: 'Roommate',
        updatesLabel: 'House Updates',
        scheduleLabel: 'Chores & Schedule',
        showMedicalDisclaimer: false,
      };
    case 'team':
      return {
        name: getCircleTypeLabel('team'),
        description: getCircleTypeDescription('team'),
        memberLabel: 'Team Member',
        updatesLabel: 'Team Announcements',
        scheduleLabel: 'Season Schedule',
        showMedicalDisclaimer: false,
      };
    case 'group':
      return {
        name: getCircleTypeLabel('group'),
        description: getCircleTypeDescription('group'),
        memberLabel: 'Group Member',
        updatesLabel: 'Group Updates',
        scheduleLabel: 'Itinerary',
        showMedicalDisclaimer: false,
      };
    case 'care':
    default:
      return {
        name: getCircleTypeLabel('care'),
        description: getCircleTypeDescription('care'),
        memberLabel: 'Caregiver',
        updatesLabel: 'Care Updates',
        scheduleLabel: 'Care Schedule',
        showMedicalDisclaimer: isCareMode('care'),
      };
  }
}
