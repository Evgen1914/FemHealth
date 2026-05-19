import { type CyclePhase, PHASE_LABELS, PHASE_COLORS } from '@/lib/medical/cycle';

export interface CycleRingProps {
  cycleDay: number | null;
  phase: CyclePhase;
  avgCycleLength: number;
}

export function CycleRing({ cycleDay, phase, avgCycleLength }: CycleRingProps) {
  const R = 92;
  const CX = 130;
  const CY = 110;
  const C = 2 * Math.PI * R;

  const menstrualFrac = 5 / avgCycleLength;
  const ovulatoryFrac = 3 / avgCycleLength;
  const lutealFrac = 14 / avgCycleLength;
  const follicularFrac = 1 - menstrualFrac - ovulatoryFrac - lutealFrac;

  const segments = [
    { frac: menstrualFrac, color: PHASE_COLORS.menstrual },
    { frac: follicularFrac, color: PHASE_COLORS.follicular },
    { frac: ovulatoryFrac, color: PHASE_COLORS.ovulatory },
    { frac: lutealFrac, color: PHASE_COLORS.luteal },
  ];

  let offset = 0;
  const arcs = segments.map((seg, i) => {
    const dashArray = `${seg.frac * C} ${C}`;
    const rotation = offset * 360 - 90;
    offset += seg.frac;
    return (
      <circle
        key={i}
        cx={CX}
        cy={CY}
        r={R}
        fill="none"
        stroke={seg.color}
        strokeWidth="14"
        strokeDasharray={dashArray}
        strokeDashoffset="0"
        strokeLinecap="round"
        transform={`rotate(${rotation} ${CX} ${CY})`}
      />
    );
  });

  return (
    <svg viewBox="0 0 260 220" className="w-full max-w-[260px]">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#F1EFE8" strokeWidth="14" />
      {arcs}
      <text x={CX} y="100" textAnchor="middle" fontSize="13" fill="var(--muted-foreground)">
        День цикла
      </text>
      <text
        x={CX}
        y="130"
        textAnchor="middle"
        fontSize="34"
        fontWeight="500"
        fill="var(--foreground)"
      >
        {cycleDay ?? '—'}
      </text>
      <text x={CX} y="150" textAnchor="middle" fontSize="11" fill="var(--primary)">
        {PHASE_LABELS[phase]}
      </text>
    </svg>
  );
}
