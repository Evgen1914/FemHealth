import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CycleRing } from '@/components/patient/cycle-ring';
import { PeriodButton } from '@/components/patient/period-button';
import {
  getCycleDay,
  getCyclePhase,
  getDaysUntilOvulation,
  getDaysUntilPeriod,
} from '@/lib/medical/cycle';

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

  return (
    <div className="px-4 pb-4">
      <header className="flex items-center justify-between py-3">
        <h1 className="text-lg font-medium">Привет, {name}</h1>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
          {name[0]?.toUpperCase() ?? '?'}
        </div>
      </header>

      <div className="flex flex-col items-center py-6">
        <CycleRing cycleDay={cycleDay} phase={phase} avgCycleLength={avgCycleLength} />
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <PeriodButton isOnPeriod={isOnPeriod} />
        <Link
          href="/journal"
          className="inline-flex items-center justify-center rounded-full bg-muted px-3 py-1.5 text-sm text-foreground"
        >
          + Симптом
        </Link>
      </div>

      <p className="mt-4 text-center text-[10px] text-muted-foreground">
        Не является диагностикой, обсудите с врачом.
      </p>
    </div>
  );
}
