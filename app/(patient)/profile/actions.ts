'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function linkDoctor(inviteCode: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Не авторизована' };

  const { data: doctor } = await supabase
    .from('doctor_profiles')
    .select('user_id, full_name')
    .eq('invite_code', inviteCode.trim().toLowerCase())
    .maybeSingle();

  if (!doctor) return { error: 'Врач с таким кодом не найден' };

  const { data: existing } = await supabase
    .from('patient_links')
    .select('id, status')
    .eq('patient_id', user.id)
    .eq('doctor_id', doctor.user_id)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'active') return { error: 'Вы уже привязаны к этому врачу' };
    if (existing.status === 'pending') return { error: 'Заявка уже отправлена' };
  }

  const { error } = await supabase.from('patient_links').insert({
    patient_id: user.id,
    doctor_id: doctor.user_id,
    status: 'pending',
  });

  if (error) return { error: error.message };

  revalidatePath('/profile');
  return { error: null, doctorName: doctor.full_name };
}
