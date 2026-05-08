import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/patient/sign-out-button';
import { LinkDoctorForm } from '@/components/patient/link-doctor-form';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: links } = await supabase
    .from('patient_links')
    .select('doctor_id, status')
    .eq('patient_id', user.id);

  const doctorIds = (links ?? []).map((l) => l.doctor_id);
  const { data: doctors } =
    doctorIds.length > 0
      ? await supabase
          .from('doctor_profiles')
          .select('user_id, full_name, specialty')
          .in('user_id', doctorIds)
      : { data: [] };

  const doctorMap = new Map(doctors?.map((d) => [d.user_id, d]) ?? []);

  return (
    <div className="px-4 pb-20">
      <header className="py-3">
        <h1 className="text-lg font-medium">Профиль</h1>
      </header>

      <div className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="text-sm font-medium">{user.email ?? '—'}</p>
        </div>

        {/* Привязанные врачи */}
        {links && links.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium">Ваши врачи</p>
            {links.map((l) => {
              const doc = doctorMap.get(l.doctor_id);
              return (
                <div
                  key={l.doctor_id}
                  className="flex items-center justify-between rounded-lg bg-muted p-3 text-xs"
                >
                  <div>
                    <p className="font-medium">{doc?.full_name ?? 'Врач'}</p>
                    <p className="text-muted-foreground">{doc?.specialty ?? ''}</p>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] ${
                      l.status === 'active'
                        ? 'bg-success-bg text-success'
                        : 'bg-warning-bg text-warning'
                    }`}
                  >
                    {l.status === 'active' ? 'Активно' : 'Ожидание'}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <LinkDoctorForm />

        <SignOutButton />
      </div>
    </div>
  );
}
