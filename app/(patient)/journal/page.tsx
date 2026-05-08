import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SymptomInput } from '@/components/patient/symptom-input';
import { SYMPTOM_OPTIONS, type SymptomValue } from '@/lib/medical/symptoms';

export default async function JournalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const today = new Date().toISOString().split('T')[0];

  const { data: todayEntry } = await supabase
    .from('cycle_entries')
    .select('id')
    .eq('patient_id', user.id)
    .eq('date', today)
    .maybeSingle();

  let existingSymptoms: { type: SymptomValue; severity: number }[] = [];
  if (todayEntry) {
    const { data: symptoms } = await supabase
      .from('symptoms')
      .select('type, severity')
      .eq('cycle_entry_id', todayEntry.id);

    if (symptoms) {
      existingSymptoms = symptoms.map((s) => ({
        type: s.type as SymptomValue,
        severity: s.severity,
      }));
    }
  }

  const { data: recentEntries } = await supabase
    .from('cycle_entries')
    .select('date, period_flow')
    .eq('patient_id', user.id)
    .order('date', { ascending: false })
    .limit(7);

  const { data: recentSymptoms } = await supabase
    .from('symptoms')
    .select('cycle_entry_id, type, severity')
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  const symptomsByDate = new Map<string, { type: string; severity: number }[]>();
  if (recentEntries && recentSymptoms) {
    const entryIdToDate = new Map<string, string>();
    for (const entry of recentEntries) {
      const { data: entryRow } = await supabase
        .from('cycle_entries')
        .select('id')
        .eq('patient_id', user.id)
        .eq('date', entry.date)
        .maybeSingle();
      if (entryRow) {
        entryIdToDate.set(entryRow.id, entry.date);
      }
    }
    for (const s of recentSymptoms) {
      const date = entryIdToDate.get(s.cycle_entry_id);
      if (date && date !== today) {
        const list = symptomsByDate.get(date) ?? [];
        list.push({ type: s.type, severity: s.severity });
        symptomsByDate.set(date, list);
      }
    }
  }

  return (
    <div className="px-4 pb-4">
      <header className="py-3">
        <h1 className="text-lg font-medium">Журнал</h1>
        <p className="text-xs text-muted-foreground">Сегодня, {formatDateRu(today)}</p>
      </header>

      <SymptomInput date={today} existingSymptoms={existingSymptoms} />

      {symptomsByDate.size > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">Последние дни</h2>
          <div className="space-y-3">
            {Array.from(symptomsByDate.entries()).map(([date, symptoms]) => (
              <div key={date} className="rounded-lg bg-muted p-3">
                <p className="mb-2 text-xs font-medium">{formatDateRu(date)}</p>
                <div className="flex flex-wrap gap-1.5">
                  {symptoms.map((s, i) => {
                    const opt = SYMPTOM_OPTIONS.find((o) => o.value === s.type);
                    return (
                      <span key={i} className="rounded-full bg-background px-2 py-0.5 text-[11px]">
                        {opt?.emoji} {opt?.label} {s.severity}/10
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatDateRu(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}
