import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { HormoneChart } from '@/components/patient/hormone-chart';

interface Props {
  params: Promise<{ code: string }>;
}

export default async function HormoneDetailPage({ params }: Props) {
  const { code } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: marker } = await supabase
    .from('markers')
    .select('code, name_ru, name_en, default_unit, category')
    .eq('code', code)
    .single();

  if (!marker) redirect('/labs');

  const { data: values } = await supabase
    .from('lab_values')
    .select('value, unit, reference_low, reference_high, lab_result_id, lab_results!inner(taken_at, cycle_day)')
    .eq('marker_code', code);

  const sorted = (values ?? []).sort((a, b) => {
    const aDate = (a.lab_results as unknown as { taken_at: string }).taken_at;
    const bDate = (b.lab_results as unknown as { taken_at: string }).taken_at;
    return aDate.localeCompare(bDate);
  });

  const chartData = sorted.map((v) => {
    const lr = v.lab_results as unknown as { taken_at: string; cycle_day: number | null };
    const date = new Date(lr.taken_at + 'T00:00:00');
    return {
      date: lr.taken_at,
      value: v.value,
      label: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
    };
  });

  const { data: refs } = await supabase
    .from('marker_references')
    .select('condition, reference_low, reference_high')
    .eq('marker_id', (await supabase.from('markers').select('id').eq('code', code).single()).data!.id);

  const references = (refs ?? []).map((r) => ({
    condition: r.condition,
    low: r.reference_low,
    high: r.reference_high,
  }));

  const lastValue = chartData.length > 0 ? chartData[chartData.length - 1] : null;

  let trend: string | null = null;
  if (chartData.length >= 3) {
    const last3 = chartData.slice(-3).map((d) => d.value);
    const avg = last3.reduce((a, b) => a + b, 0) / 3;
    const variance = last3.reduce((a, b) => a + Math.abs(b - avg), 0) / 3;
    const relVariance = avg > 0 ? variance / avg : 0;
    if (relVariance < 0.1) trend = 'стабильно';
    else if (last3[2] > last3[0]) trend = 'растёт';
    else trend = 'снижается';
  }

  return (
    <div className="px-4 pb-4">
      <header className="flex items-center gap-3 py-3">
        <Link href="/labs" className="text-muted-foreground">
          ←
        </Link>
        <div>
          <h1 className="text-lg font-medium">{marker.name_ru}</h1>
          <p className="text-xs text-muted-foreground">
            {marker.default_unit} · {chartData.length} измерений
          </p>
        </div>
      </header>

      <HormoneChart data={chartData} unit={marker.default_unit} references={references} />

      {/* Сводка */}
      <div className="mt-4 space-y-2 rounded-lg bg-muted p-3 text-xs">
        {lastValue && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Последнее значение</span>
            <span className="font-medium">
              {lastValue.value} {marker.default_unit}
            </span>
          </div>
        )}
        {trend && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Тренд за 3 измерения</span>
            <span
              className={`font-medium ${
                trend === 'стабильно'
                  ? 'text-success'
                  : trend === 'растёт'
                    ? 'text-warning'
                    : 'text-destructive'
              }`}
            >
              {trend}
            </span>
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-[10px] text-muted-foreground">
        Не является диагностикой, обсудите с врачом.
      </p>
    </div>
  );
}
