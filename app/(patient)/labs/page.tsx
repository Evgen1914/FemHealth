import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

function getTag(value: number, low: number | null, high: number | null) {
  if (low === null || high === null) return null;
  if (value < low) return { label: '↓', style: 'bg-danger-bg text-destructive' };
  if (value > high) return { label: '↑', style: 'bg-danger-bg text-destructive' };
  const margin = (high - low) * 0.1;
  if (value < low + margin || value > high - margin) {
    return { label: 'погр.', style: 'bg-warning-bg text-warning' };
  }
  return { label: 'норма', style: 'bg-success-bg text-success' };
}

export default async function LabsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: results } = await supabase
    .from('lab_results')
    .select('id, taken_at, lab_name, cycle_day')
    .eq('patient_id', user.id)
    .order('taken_at', { ascending: false });

  const { data: markers } = await supabase.from('markers').select('code, name_ru');
  const markerNames = new Map(markers?.map((m) => [m.code, m.name_ru]) ?? []);

  const resultIds = results?.map((r) => r.id) ?? [];
  const { data: allValues } = resultIds.length > 0
    ? await supabase
        .from('lab_values')
        .select('lab_result_id, marker_code, value, unit, reference_low, reference_high')
        .in('lab_result_id', resultIds)
    : { data: [] };

  const valuesByResult = new Map<string, typeof allValues>();
  for (const v of allValues ?? []) {
    const list = valuesByResult.get(v.lab_result_id) ?? [];
    list.push(v);
    valuesByResult.set(v.lab_result_id, list);
  }

  return (
    <div className="px-4 pb-4">
      <header className="flex items-center justify-between py-3">
        <h1 className="text-lg font-medium">Анализы</h1>
        <Link
          href="/labs/add"
          className="inline-flex items-center rounded-full bg-primary px-3 py-1.5 text-xs text-primary-foreground"
        >
          + Добавить
        </Link>
      </header>

      {(!results || results.length === 0) && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">Пока нет анализов</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Нажмите «+ Добавить» чтобы внести результаты
          </p>
        </div>
      )}

      <div className="space-y-4">
        {results?.map((result) => {
          const vals = valuesByResult.get(result.id) ?? [];
          const dateStr = new Date(result.taken_at + 'T00:00:00').toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
          });
          return (
            <div key={result.id}>
              <p className="mb-1 text-xs text-muted-foreground">
                {dateStr}
                {result.lab_name ? ` · ${result.lab_name}` : ''}
                {result.cycle_day ? ` · день цикла ${result.cycle_day}` : ''}
              </p>
              <div className="divide-y divide-border text-xs">
                {vals.map((v) => {
                  const tag = getTag(v.value, v.reference_low, v.reference_high);
                  return (
                    <div key={v.marker_code} className="flex items-center justify-between py-2.5">
                      <span>{markerNames.get(v.marker_code) ?? v.marker_code}</span>
                      <span className="flex items-center gap-1.5">
                        <span className="font-medium">
                          {v.value} {v.unit}
                        </span>
                        {tag && (
                          <span className={`rounded px-1.5 py-0.5 text-[10px] ${tag.style}`}>
                            {tag.label}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[10px] text-muted-foreground">
        Не является диагностикой, обсудите с врачом.
      </p>
    </div>
  );
}
