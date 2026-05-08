'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function addComment(patientId: string, text: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизован' };

  const { data: link } = await supabase
    .from('patient_links')
    .select('id')
    .eq('doctor_id', user.id)
    .eq('patient_id', patientId)
    .eq('status', 'active')
    .maybeSingle();

  if (!link) return { error: 'Нет доступа к пациентке' };

  const { error } = await supabase.from('doctor_comments').insert({
    doctor_id: user.id,
    patient_id: patientId,
    target_type: 'general',
    text,
  });

  if (error) return { error: error.message };

  await supabase.from('audit_log').insert({
    actor_id: user.id,
    patient_id: patientId,
    action: 'add_comment',
    target_type: 'doctor_comment',
  });

  revalidatePath(`/patients/${patientId}`);
  return { error: null };
}

export async function confirmLink(patientId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизован' };

  const { error } = await supabase
    .from('patient_links')
    .update({ status: 'active' as const })
    .eq('doctor_id', user.id)
    .eq('patient_id', patientId)
    .eq('status', 'pending');

  if (error) return { error: error.message };

  revalidatePath('/patients');
  return { error: null };
}
