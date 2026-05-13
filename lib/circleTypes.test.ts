import { describe, it, expect } from 'vitest';
import { getModeLabels } from './circleTypes';
import {
  getCategoriesForCircleType,
  getCircleTypeDescription,
  getCircleTypeLabel,
  isCareMode,
  isGroupMode,
  isTeamMode,
  normalizeCircleType,
} from './circles/circleTypes';

describe('getModeLabels', () => {
  it('should return Care Mode as default when no type is provided', () => {
    const labels = getModeLabels(null);
    expect(labels.name).toBe('Care Mode');
    expect(labels.showMedicalDisclaimer).toBe(true);
  });

  it('should return Care Mode properties correctly', () => {
    const labels = getModeLabels('care');
    expect(labels.name).toBe('Care Mode');
    expect(labels.updatesLabel).toBe('Care Updates');
    expect(labels.showMedicalDisclaimer).toBe(true);
  });

  it('should return Team Mode properties correctly', () => {
    const labels = getModeLabels('team');
    expect(labels.name).toBe('Team Mode');
    expect(labels.updatesLabel).toBe('Team Announcements');
    expect(labels.showMedicalDisclaimer).toBe(false);
  });

  it('should fallback to Care Mode for unknown types', () => {
    const labels = getModeLabels('unknown_type_123');
    expect(labels.name).toBe('Care Mode');
    expect(labels.showMedicalDisclaimer).toBe(true);
  });

  it('provides category presets and safe defaults', () => {
    expect(normalizeCircleType(undefined)).toBe('care');
    expect(getCircleTypeLabel('household')).toBe('Household Mode');
    expect(getCircleTypeDescription('team')).toContain('practices');
    expect(getCategoriesForCircleType('family').map((category) => category.key)).toContain('groceries');
    expect(getCategoriesForCircleType('unknown').map((category) => category.key)).toContain('medication_confirmations');
  });

  it('identifies Care Mode as the only medical-disclaimer mode', () => {
    expect(isCareMode('care')).toBe(true);
    expect(isCareMode('family')).toBe(false);
    expect(isCareMode('team')).toBe(false);
    expect(isTeamMode('team')).toBe(true);
    expect(isTeamMode('group')).toBe(false);
    expect(isGroupMode('group')).toBe(true);
    expect(isGroupMode('care')).toBe(false);
  });
});
