export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'unknown';

export const PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: 'Менструация',
  follicular: 'Фолликулярная фаза',
  ovulatory: 'Овуляция',
  luteal: 'Лютеиновая фаза',
  unknown: 'Нет данных',
};

export const PHASE_COLORS: Record<CyclePhase, string> = {
  menstrual: '#F09595',
  follicular: '#FAC775',
  ovulatory: '#9FE1CB',
  luteal: '#D3D1C7',
  unknown: '#F1EFE8',
};

const LUTEAL_PHASE_DAYS = 14;

export function getCycleDay(lastPeriodDate: Date, today: Date = new Date()): number {
  const diffMs = today.getTime() - lastPeriodDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

export function getCyclePhase(cycleDay: number, avgCycleLength: number): CyclePhase {
  if (cycleDay < 1) return 'unknown';
  if (cycleDay <= 5) return 'menstrual';

  const ovulationDay = avgCycleLength - LUTEAL_PHASE_DAYS;
  if (cycleDay <= ovulationDay - 2) return 'follicular';
  if (cycleDay <= ovulationDay + 1) return 'ovulatory';
  if (cycleDay <= avgCycleLength) return 'luteal';

  return 'unknown';
}

export function getDaysUntilOvulation(cycleDay: number, avgCycleLength: number): number | null {
  const ovulationDay = avgCycleLength - LUTEAL_PHASE_DAYS;
  const diff = ovulationDay - cycleDay;
  if (diff < 0 || diff > 20) return null;
  return diff;
}

export function getDaysUntilPeriod(cycleDay: number, avgCycleLength: number): number | null {
  const diff = avgCycleLength - cycleDay;
  if (diff < 0) return null;
  return diff;
}

export function isIrregularCycle(cycleLengths: number[]): boolean {
  if (cycleLengths.length < 2) return false;
  const min = Math.min(...cycleLengths);
  const max = Math.max(...cycleLengths);
  return max - min > 7;
}

export function averageCycleLength(cycleLengths: number[]): number {
  if (cycleLengths.length === 0) return 28;
  const sum = cycleLengths.reduce((a, b) => a + b, 0);
  return Math.round(sum / cycleLengths.length);
}
