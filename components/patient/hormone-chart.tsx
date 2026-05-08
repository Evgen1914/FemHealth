'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  CartesianGrid,
} from 'recharts';

interface DataPoint {
  date: string;
  value: number;
  label: string;
}

interface RefRange {
  condition: string;
  low: number | null;
  high: number | null;
}

interface HormoneChartProps {
  data: DataPoint[];
  unit: string;
  references: RefRange[];
}

export function HormoneChart({ data, unit, references }: HormoneChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Недостаточно данных для графика
      </p>
    );
  }

  const allValues = data.map((d) => d.value);
  const refLows = references.map((r) => r.low).filter((v): v is number => v !== null);
  const refHighs = references.map((r) => r.high).filter((v): v is number => v !== null);
  const allNums = [...allValues, ...refLows, ...refHighs];
  const minY = Math.floor(Math.min(...allNums) * 0.8);
  const maxY = Math.ceil(Math.max(...allNums) * 1.2);

  const defaultRef = references.find((r) => r.condition === 'default');
  const follicularRef = references.find((r) => r.condition === 'follicular');
  const ovulatoryRef = references.find((r) => r.condition === 'ovulatory');
  const lutealRef = references.find((r) => r.condition === 'luteal');

  const mainRef = defaultRef ?? follicularRef;

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          {mainRef?.low != null && mainRef?.high != null && (
            <ReferenceArea
              y1={mainRef.low}
              y2={mainRef.high}
              fill="#E1F5EE"
              fillOpacity={0.5}
              label=""
            />
          )}
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[minY, maxY]}
            tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            unit={` ${unit}`}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--background)',
            }}
            formatter={(value) => [`${value} ${unit}`, 'Значение']}
            labelFormatter={(label) => String(label)}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#993556"
            strokeWidth={2}
            dot={{ r: 4, fill: '#993556' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Легенда референсов */}
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        {mainRef && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-success-bg" />
            Норма {mainRef.low}–{mainRef.high}
          </span>
        )}
        {follicularRef && !defaultRef && (
          <span>Фоллик. {follicularRef.low}–{follicularRef.high}</span>
        )}
        {ovulatoryRef && (
          <span>Овул. {ovulatoryRef.low}–{ovulatoryRef.high}</span>
        )}
        {lutealRef && (
          <span>Лютеин. {lutealRef.low}–{lutealRef.high}</span>
        )}
      </div>
    </div>
  );
}
