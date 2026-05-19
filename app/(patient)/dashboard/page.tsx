import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  getCycleDay,
  getCyclePhase,
  getDaysUntilOvulation,
  getDaysUntilPeriod,
} from '@/lib/medical/cycle';
import { DashboardContent } from '@/components/patient/dashboard-content';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'doctor') redirect('/patients');

  const email = profile?.email ?? user.email ?? '';
  const name = email.split('@')[0] ?? 'Пользователь';

  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('avg_cycle_length')
    .eq('user_id', user.id)
    .single();

  const avgCycleLength = patientProfile?.avg_cycle_length ?? 28;

  const { data: lastPeriodEntry } = await supabase
    .from('cycle_entries')
    .select('date')
    .eq('patient_id', user.id)
    .gt('period_flow', 0)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  const lastPeriodDate = lastPeriodEntry?.date ? new Date(lastPeriodEntry.date) : null;

  const today = new Date();
  const cycleDay = lastPeriodDate ? getCycleDay(lastPeriodDate, today) : null;
  const phase = cycleDay ? getCyclePhase(cycleDay, avgCycleLength) : 'unknown';

  const daysUntilOvulation =
    cycleDay !== null ? getDaysUntilOvulation(cycleDay, avgCycleLength) : null;
  const daysUntilPeriod =
    cycleDay !== null ? getDaysUntilPeriod(cycleDay, avgCycleLength) : null;

  const isOnPeriod = phase === 'menstrual';

  const { data: comments } = await supabase
    .from('doctor_comments')
    .select('id, text, target_type, created_at, doctor_id')
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const doctorIds = [...new Set((comments ?? []).map((c) => c.doctor_id))];
  const { data: doctorProfiles } =
    doctorIds.length > 0
      ? await supabase
          .from('doctor_profiles')
          .select('user_id, full_name')
          .in('user_id', doctorIds)
      : { data: [] };

  const doctorNames = new Map(
    doctorProfiles?.map((d) => [d.user_id, d.full_name]) ?? [],
  );

  let hint = 'Отметьте первый день менструации, чтобы начать трекинг';
  if (cycleDay !== null) {
    if (daysUntilOvulation !== null && daysUntilOvulation > 0) {
      hint = `Овуляция через ~${daysUntilOvulation} дн.`;
    } else if (daysUntilPeriod !== null && daysUntilPeriod > 0) {
      hint = `Менструация через ~${daysUntilPeriod} дн.`;
    } else {
      hint = `Цикл: день ${cycleDay}`;
    }
  }

  const todayLabel = today.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const commentsData = (comments ?? []).map((c) => ({
    id: c.id,
    text: c.text,
    target_type: c.target_type,
    created_at: c.created_at,
    doctor_name: doctorNames.get(c.doctor_id) ?? 'Врач',
  }));

  return (
    <div className="px-4">
      <DashboardContent
        name={name}
        todayLabel={todayLabel}
        cycleRing={{ cycleDay, phase, avgCycleLength }}
        hint={hint}
        isOnPeriod={isOnPeriod}
        comments={commentsData}
      />
    </div>
  );
}
