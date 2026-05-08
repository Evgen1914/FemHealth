import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCycleDay, getCyclePhase, PHASE_LABELS, PHASE_COLORS } from '@/lib/medical/cycle';
import { SYMPTOM_OPTIONS } from '@/lib/medical/symptoms';
import { CommentForm } from '@/components/doctor/comment-form';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PatientCardPage({ params }: Props) {
  const { id: patientId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: link } = await supabase
    .from('patient_links')
    .select('status, permissions')
    .eq('doctor_id', user.id)
    .eq('patient_id', patientId)
    .eq('status', 'active')
    .maybeSingle();

  if (!link) redirect('/patients');

  await supabase.from('audit_log').insert({
    actor_id: user.id,
    patient_id: patientId,
    action: 'view_patient_card',
    target_type: 'patient',
    target_id: patientId,
  });

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', patientId)
    .single();

  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('birth_date, height_cm, weight_kg, primary_diagnoses, avg_cycle_length')
    .eq('user_id', patientId)
    .single();

  const email = profile?.email ?? '';
  const name = email.split('@')[0] ?? 'Пациентка';
  const avgCycle = patientProfile?.avg_cycle_length ?? 28;

  const today = new Date();
  let age: number | null = null;
  if (patientProfile?.birth_date) {
    const birth = new Date(patientProfile.birth_date);
    age = today.getFullYear() - birth.getFullYear();
    const md = today.getMonth() - birth.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age--;
  }

  const { data: lastPeriodEntry } = await supabase
    .from('cycle_entries')
    .select('date')
    .eq('patient_id', patientId)
    .gt('period_flow', 0)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastPeriodDate = lastPeriodEntry?.date ? new Date(lastPeriodEntry.date) : null;
  const cycleDay = lastPeriodDate ? getCycleDay(lastPeriodDate, today) : null;
  const phase = cycleDay ? getCyclePhase(cycleDay, avgCycle) : 'unknown';

  const { data: recentSymptoms } = await supabase
    .from('symptoms')
    .select('type, severity, cycle_entries!inner(date)')
    .eq('patient_id', patientId)
    .limit(50);

  const sortedRaw = (recentSymptoms ?? []).sort((a, b) => {
    const aDate = (a.cycle_entries as unknown as { date: string }).date;
    const bDate = (b.cycle_entries as unknown as { date: string }).date;
    return bDate.localeCompare(aDate);
  });

  const symptomMap = new Map(SYMPTOM_OPTIONS.map((s) => [s.value, s]));

  const symptomsByDate = new Map<string, typeof sortedRaw>();
  for (const s of sortedRaw) {
    const date = (s.cycle_entries as unknown as { date: string }).date;
    const list = symptomsByDate.get(date) ?? [];
    list.push(s);
    symptomsByDate.set(date, list);
  }
  const sortedSymptomDates = [...symptomsByDate.keys()].sort().reverse().slice(0, 5);

  const { data: labResults } = await supabase
    .from('lab_results')
    .select('id, taken_at, lab_name, cycle_day')
    .eq('patient_id', patientId)
    .order('taken_at', { ascending: false })
    .limit(5);

  const resultIds = labResults?.map((r) => r.id) ?? [];
  const { data: labValues } =
    resultIds.length > 0
      ? await supabase
          .from('lab_values')
          .select('lab_result_id, marker_code, value, unit, reference_low, reference_high')
          .in('lab_result_id', resultIds)
      : { data: [] };

  const { data: markers } = await supabase.from('markers').select('code, name_ru');
  const markerNames = new Map(markers?.map((m) => [m.code, m.name_ru]) ?? []);

  const valuesByResult = new Map<string, typeof labValues>();
  for (const v of labValues ?? []) {
    const list = valuesByResult.get(v.lab_result_id) ?? [];
    list.push(v);
    valuesByResult.set(v.lab_result_id, list);
  }

  const { data: comments } = await supabase
    .from('doctor_comments')
    .select('id, text, target_type, created_at')
    .eq('doctor_id', user.id)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(10);

  function getTag(value: number, low: number | null, high: number | null) {
    if (low === null || high === null) return null;
    if (value < low) return { label: '↓', style: 'bg-danger-bg text-destructive' };
    if (value > high) return { label: '↑', style: 'bg-danger-bg text-destructive' };
    return { label: 'норма', style: 'bg-success-bg text-success' };
  }

  return (
    <div className="p-4 lg:p-6">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/patients" className="text-muted-foreground">
          ←
        </Link>
        <div>
          <h1 className="text-lg font-medium">{name}</h1>
          <p className="text-xs text-muted-foreground">
            {age !== null ? `${age} лет` : ''}
            {patientProfile?.height_cm ? ` · ${patientProfile.height_cm} см` : ''}
            {patientProfile?.weight_kg ? ` · ${patientProfile.weight_kg} кг` : ''}
          </p>
        </div>
      </header>

      {/* Диагнозы */}
      {patientProfile?.primary_diagnoses && patientProfile.primary_diagnoses.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {patientProfile.primary_diagnoses.map((d) => (
            <span key={d} className="rounded-full bg-accent px-2 py-0.5 text-[11px] text-accent-foreground">
              {d}
            </span>
          ))}
        </div>
      )}

      {/* Цикл */}
      <section className="mb-4 rounded-lg border border-border p-3">
        <h2 className="mb-2 text-sm font-medium">Цикл</h2>
        {cycleDay !== null ? (
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: PHASE_COLORS[phase] }}
            >
              {cycleDay}
            </div>
            <div className="text-xs">
              <p className="font-medium">{PHASE_LABELS[phase]}</p>
              <p className="text-muted-foreground">День {cycleDay} · цикл ~{avgCycle} дн.</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Нет данных о цикле</p>
        )}
      </section>

      {/* Симптомы */}
      <section className="mb-4 rounded-lg border border-border p-3">
        <h2 className="mb-2 text-sm font-medium">Последние симптомы</h2>
        {sortedSymptomDates.length === 0 ? (
          <p className="text-xs text-muted-foreground">Нет записей</p>
        ) : (
          <div className="space-y-2">
            {sortedSymptomDates.map((date) => {
              const items = symptomsByDate.get(date) ?? [];
              const dateStr = new Date(date + 'T00:00:00').toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
              });
              return (
                <div key={date}>
                  <p className="mb-0.5 text-[11px] text-muted-foreground">{dateStr}</p>
                  <div className="flex flex-wrap gap-1">
                    {items.map((s) => {
                      const opt = symptomMap.get(s.type);
                      return (
                        <span
                          key={s.type}
                          className="rounded-full bg-muted px-2 py-0.5 text-[11px]"
                        >
                          {opt?.emoji} {opt?.label ?? s.type}
                          {s.severity > 0 ? ` ${s.severity}/10` : ''}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Анализы */}
      <section className="mb-4 rounded-lg border border-border p-3">
        <h2 className="mb-2 text-sm font-medium">Последние анализы</h2>
        {(!labResults || labResults.length === 0) ? (
          <p className="text-xs text-muted-foreground">Нет анализов</p>
        ) : (
          <div className="space-y-3">
            {labResults.map((result) => {
              const vals = valuesByResult.get(result.id) ?? [];
              const dateStr = new Date(result.taken_at + 'T00:00:00').toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
              });
              return (
                <div key={result.id}>
                  <p className="mb-1 text-[11px] text-muted-foreground">
                    {dateStr}
                    {result.lab_name ? ` · ${result.lab_name}` : ''}
                    {result.cycle_day ? ` · день цикла ${result.cycle_day}` : ''}
                  </p>
                  <div className="divide-y divide-border text-xs">
                    {vals.map((v) => {
                      const tag = getTag(v.value, v.reference_low, v.reference_high);
                      return (
                        <div key={v.marker_code} className="flex items-center justify-between py-1.5">
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
        )}
      </section>

      {/* Комментарии врача */}
      <section className="mb-4 rounded-lg border border-border p-3">
        <h2 className="mb-2 text-sm font-medium">Ваши комментарии</h2>

        <CommentForm patientId={patientId} />

        {(!comments || comments.length === 0) ? (
          <p className="mt-2 text-xs text-muted-foreground">Нет комментариев</p>
        ) : (
          <div className="mt-3 space-y-2">
            {comments.map((c) => {
              const dateStr = new Date(c.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });
              return (
                <div key={c.id} className="rounded bg-muted p-2 text-xs">
                  <p>{c.text}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{dateStr}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <p className="text-center text-[10px] text-muted-foreground">
        Данные предоставлены пациенткой. Доступ зафиксирован в журнале аудита.
      </p>
    </div>
  );
}
