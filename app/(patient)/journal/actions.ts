'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { SymptomValue } from '@/lib/medical/symptoms';

export async function logSymptoms(date: string, symptoms: { type: SymptomValue; severity: number }[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизован.' };
  if (symptoms.length === 0) return { error: 'Выберите хотя бы один симптом.' };

  const { data: entry, error: entryError } = await supabase
    .from('cycle_entries')
    .upsert(
      { patient_id: user.id, date },
      { onConflict: 'patient_id,date' },
    )
    .select('id')
    .single();

  if (entryError || !entry) {
    return { error: `Ошибка создания записи дня: ${entryError?.message}` };
  }

  await supabase
    .from('symptoms')
    .delete()
    .eq('cycle_entry_id', entry.id)
    .eq('patient_id', user.id);

  const rows = symptoms.map((s) => ({
    cycle_entry_id: entry.id,
    patient_id: user.id,
    type: s.type,
    severity: s.severity,
  }));

  const { error } = await supabase.from('symptoms').insert(rows);

  if (error) return { error: `Ошибка записи симптомов: ${error.message}` };

  revalidatePath('/journal');
  revalidatePath('/dashboard');
  return { success: true };
}
