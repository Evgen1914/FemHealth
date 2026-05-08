'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function logPeriodStart(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизован.' };

  const dateStr = formData.get('date') as string;
  const date = dateStr || new Date().toISOString().split('T')[0];

  const { error } = await supabase.from('cycle_entries').upsert(
    {
      patient_id: user.id,
      date,
      period_flow: 2,
    },
    { onConflict: 'patient_id,date' },
  );

  if (error) return { error: `Ошибка записи: ${error.message}` };

  revalidatePath('/dashboard');
  return { success: true };
}

export async function logPeriodEnd() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизован.' };

  const today = new Date().toISOString().split('T')[0];

  const { error } = await supabase.from('cycle_entries').upsert(
    {
      patient_id: user.id,
      date: today,
      period_flow: 0,
      period_end: true,
    },
    { onConflict: 'patient_id,date' },
  );

  if (error) return { error: `Ошибка записи: ${error.message}` };

  revalidatePath('/dashboard');
  return { success: true };
}

export async function updatePeriodFlow(date: string, flow: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизован.' };

  const { error } = await supabase.from('cycle_entries').upsert(
    {
      patient_id: user.id,
      date,
      period_flow: flow,
    },
    { onConflict: 'patient_id,date' },
  );

  if (error) return { error: `Ошибка записи: ${error.message}` };

  revalidatePath('/dashboard');
  return { success: true };
}
