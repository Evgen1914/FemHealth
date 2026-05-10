import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PenLine } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { CycleRing } from '@/components/patient/cycle-ring';
import { PeriodButton } from '@/components/patient/period-button';
import {
  getCycleDay,
  getCyclePhase,
  getDaysUntilOvulation,
  getDaysUntilPeriod,
} from '@/lib/medical/cycle';
import { DoctorComments } from '@/components/patient/doctor-comments';

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

  return (
    <div className="px-4 pb-6">
      <header className="flex items-center justify-between pb-1 pt-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Привет, {name}</h1>
          <p className="mt-0.5 text-xs capitalize text-muted-foreground">{todayLabel}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-sm font-semibold text-primary-foreground shadow-sm">
          {name[0]?.toUpperCase() ?? '?'}
        </div>
      </header>

      <div className="mt-4 rounded-2xl bg-gradient-to-b from-accent/60 to-background p-4 shadow-sm ring-1 ring-border/40">
        <div className="flex flex-col items-center">
          <CycleRing cycleDay={cycleDay} phase={phase} avgCycleLength={avgCycleLength} />
          <p className="mt-2 text-sm font-medium text-muted-foreground">{hint}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <PeriodButton isOnPeriod={isOnPeriod} />
        <Link
          href="/journal"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-muted px-4 py-2.5 text-sm font-medium text-foreground shadow-sm ring-1 ring-border/30 transition-colors active:bg-muted/70"
        >
          <PenLine className="h-4 w-4 text-muted-foreground" />
          Симптом
        </Link>
      </div>

      <DoctorComments
        comments={(comments ?? []).map((c) => ({
          id: c.id,
          text: c.text,
          target_type: c.target_type,
          created_at: c.created_at,
          doctor_name: doctorNames.get(c.doctor_id) ?? 'Врач',
        }))}
      />

      <p className="mt-6 text-center text-[10px] text-muted-foreground">
        Не является диагностикой, обсудите с врачом.
      </p>
    </div>
  );
}
