'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface LabValueInput {
  marker_code: string;
  value: number;
  unit: string;
}

export async function createLabResult(
  date: string,
  labName: string,
  cycleDay: number | null,
  values: LabValueInput[],
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизован.' };
  if (values.length === 0) return { error: 'Добавьте хотя бы один показатель.' };

  const { data: result, error: resultError } = await supabase
    .from('lab_results')
    .insert({
      patient_id: user.id,
      taken_at: date,
      lab_name: labName || null,
      cycle_day: cycleDay,
    })
    .select('id')
    .single();

  if (resultError || !result) {
    return { error: `Ошибка создания записи: ${resultError?.message}` };
  }

  const refs = await supabase
    .from('marker_references')
    .select('marker_id, condition, reference_low, reference_high, markers!inner(code)')
    .in(
      'markers.code',
      values.map((v) => v.marker_code),
    );

  const refMap = new Map<string, { low: number | null; high: number | null }>();
  if (refs.data) {
    for (const r of refs.data) {
      const code = (r.markers as unknown as { code: string }).code;
      refMap.set(code, { low: r.reference_low, high: r.reference_high });
    }
  }

  const rows = values.map((v) => {
    const ref = refMap.get(v.marker_code);
    return {
      lab_result_id: result.id,
      marker_code: v.marker_code,
      value: v.value,
      unit: v.unit,
      reference_low: ref?.low ?? null,
      reference_high: ref?.high ?? null,
    };
  });

  const { error } = await supabase.from('lab_values').insert(rows);

  if (error) return { error: `Ошибка записи показателей: ${error.message}` };

  revalidatePath('/labs');
  redirect('/labs');
}

export async function deleteLabResult(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизован.' };

  const { error } = await supabase
    .from('lab_results')
    .delete()
    .eq('id', id)
    .eq('patient_id', user.id);

  if (error) return { error: `Ошибка удаления: ${error.message}` };

  revalidatePath('/labs');
  return { success: true };
}
