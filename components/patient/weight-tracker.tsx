'use client';

import { useState, useTransition } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { logWeight } from '@/app/(patient)/profile/actions';

interface WeightPoint {
  date: string;
  label: string;
  weight: number;
}

interface WeightTrackerProps {
  data: WeightPoint[];
  currentWeight: number | null;
}

export function WeightTracker({ data, currentWeight }: WeightTrackerProps) {
  const today = new Date().toISOString().split('T')[0];
  const [weight, setWeight] = useState(currentWeight?.toString() ?? '');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleLog() {
    const parsed = parseFloat(weight.replace(',', '.'));
    if (isNaN(parsed) || parsed < 20 || parsed > 300) {
      setError('Введите корректный вес');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await logWeight(today, parsed);
      if (result.error) setError(result.error);
    });
  }

  const allWeights = data.map((d) => d.weight);
  const minY = allWeights.length > 0 ? Math.floor(Math.min(...allWeights) - 2) : 40;
  const maxY = allWeights.length > 0 ? Math.ceil(Math.max(...allWeights) + 2) : 100;

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <p className="text-xs font-medium">Вес</p>

      <div className="flex gap-2">
        <Input
          type="text"
          inputMode="decimal"
          placeholder="58.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="text-sm"
        />
        <Button onClick={handleLog} disabled={pending} size="sm">
          {pending ? '...' : 'Записать'}
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}

      {data.length >= 2 ? (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
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
              unit=" кг"
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--background)',
              }}
              formatter={(value) => [`${value} кг`, 'Вес']}
              labelFormatter={(label) => String(label)}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#993556"
              strokeWidth={2}
              dot={{ r: 3, fill: '#993556' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      ) : data.length === 1 ? (
        <p className="py-4 text-center text-xs text-muted-foreground">
          {data[0].weight} кг · нужна ещё одна запись для графика
        </p>
      ) : (
        <p className="py-4 text-center text-xs text-muted-foreground">
          Записывайте вес, чтобы видеть динамику
        </p>
      )}

      {data.length >= 2 && (
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>
            Изменение: {(data[data.length - 1].weight - data[0].weight) > 0 ? '+' : ''}
            {(data[data.length - 1].weight - data[0].weight).toFixed(1)} кг
          </span>
          <span>Записей: {data.length}</span>
        </div>
      )}
    </div>
  );
}
