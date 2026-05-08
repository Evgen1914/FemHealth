import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/patient/sign-out-button';

export default async function DoctorSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('doctor_profiles')
    .select('full_name, specialty, clinic, invite_code')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="p-4 lg:p-6">
      <header className="mb-4">
        <h1 className="text-xl font-medium">Настройки</h1>
      </header>

      <div className="space-y-4">
        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="text-muted-foreground">Имя</p>
          <p className="font-medium">{profile?.full_name ?? '—'}</p>
        </div>

        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="text-muted-foreground">Специальность</p>
          <p className="font-medium">{profile?.specialty ?? '—'}</p>
        </div>

        {profile?.clinic && (
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="text-muted-foreground">Клиника</p>
            <p className="font-medium">{profile.clinic}</p>
          </div>
        )}

        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="text-muted-foreground">Email</p>
          <p className="font-medium">{user.email ?? '—'}</p>
        </div>

        <div className="rounded-lg border border-primary/20 bg-accent p-4">
          <p className="text-xs text-muted-foreground">Код-приглашение для пациенток</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-primary">
            {profile?.invite_code ?? '—'}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Сообщите этот код пациентке, чтобы она могла привязаться к вам
          </p>
        </div>

        <SignOutButton />
      </div>
    </div>
  );
}
