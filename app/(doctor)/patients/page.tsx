import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCycleDay, getCyclePhase, PHASE_LABELS } from '@/lib/medical/cycle';
import { ConfirmLinkButton } from '@/components/doctor/confirm-link-button';

export default async function PatientsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: doctorProfile } = await supabase
    .from('doctor_profiles')
    .select('invite_code')
    .eq('user_id', user.id)
    .single();

  const { data: links } = await supabase
    .from('patient_links')
    .select('patient_id, status, created_at')
    .eq('doctor_id', user.id)
    .order('created_at', { ascending: false });

  const activeLinks = (links ?? []).filter((l) => l.status === 'active');
  const pendingLinks = (links ?? []).filter((l) => l.status === 'pending');
  const allPatientIds = (links ?? []).map((l) => l.patient_id);

  const { data: patientProfiles } =
    allPatientIds.length > 0
      ? await supabase
          .from('patient_profiles')
          .select('user_id, birth_date, avg_cycle_length')
          .in('user_id', allPatientIds)
      : { data: [] };

  const { data: profiles } =
    allPatientIds.length > 0
      ? await supabase.from('profiles').select('id, email').in('id', allPatientIds)
      : { data: [] };

  const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);
  const patientMap = new Map(patientProfiles?.map((p) => [p.user_id, p]) ?? []);

  const { data: lastEntries } =
    allPatientIds.length > 0
      ? await supabase
          .from('cycle_entries')
          .select('patient_id, date, period_flow')
          .in('patient_id', allPatientIds)
          .gt('period_flow', 0)
          .order('date', { ascending: false })
      : { data: [] };

  const lastPeriodMap = new Map<string, string>();
  for (const e of lastEntries ?? []) {
    if (!lastPeriodMap.has(e.patient_id)) {
      lastPeriodMap.set(e.patient_id, e.date);
    }
  }

  const today = new Date();

  function getAge(birthDate: string | null): number | null {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  return (
    <div className="p-4 lg:p-6">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-medium">Пациентки</h1>
        <div className="text-right text-xs text-muted-foreground">
          <span>Код-приглашение:</span>
          <span className="ml-1 rounded bg-accent px-2 py-0.5 font-mono text-sm font-medium text-foreground">
            {doctorProfile?.invite_code ?? '—'}
          </span>
        </div>
      </header>

      {pendingLinks.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-medium text-warning">Ожидают подтверждения</p>
          {pendingLinks.map((link) => {
            const prof = profileMap.get(link.patient_id);
            const pendingEmail = prof?.email ?? '';
            const pendingName = pendingEmail.split('@')[0] ?? 'Пациентка';
            return (
              <div
                key={link.patient_id}
                className="flex items-center justify-between rounded-lg border border-warning bg-warning-bg p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-warning text-xs font-medium text-white">
                    {pendingName[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="text-xs font-medium">{pendingName}</span>
                </div>
                <ConfirmLinkButton patientId={link.patient_id} />
              </div>
            );
          })}
        </div>
      )}

      {activeLinks.length === 0 && pendingLinks.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">Пока нет привязанных пациенток</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Сообщите пациентке код <strong>{doctorProfile?.invite_code}</strong> для привязки
          </p>
        </div>
      )}

      <div className="space-y-2">
        {activeLinks.map((link) => {
          const prof = profileMap.get(link.patient_id);
          const pp = patientMap.get(link.patient_id);
          const email = prof?.email ?? '';
          const name = email.split('@')[0] ?? 'Пациентка';
          const age = getAge(pp?.birth_date ?? null);
          const avgCycle = pp?.avg_cycle_length ?? 28;

          const lastPeriod = lastPeriodMap.get(link.patient_id);
          let phaseLabel = '—';
          if (lastPeriod) {
            const day = getCycleDay(new Date(lastPeriod), today);
            const phase = getCyclePhase(day, avgCycle);
            phaseLabel = `день ${day} · ${PHASE_LABELS[phase]}`;
          }

          return (
            <Link
              key={link.patient_id}
              href={`/patients/${link.patient_id}`}
              className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-medium text-accent-foreground">
                  {name[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {age !== null ? `${age} лет · ` : ''}
                    {phaseLabel}
                  </p>
                </div>
              </div>
              <span className="text-muted-foreground">→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
