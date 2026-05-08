import { createClient } from '@/lib/supabase/server';
import { SignOutButton } from '@/components/patient/sign-out-button';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="px-4 pb-4">
      <header className="py-3">
        <h1 className="text-lg font-medium">Профиль</h1>
      </header>

      <div className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="text-sm font-medium">{user?.email ?? '—'}</p>
        </div>

        <p className="text-xs text-muted-foreground">
          Здесь будут настройки, подписка, связка с врачом и экспорт данных.
        </p>

        <SignOutButton />
      </div>
    </div>
  );
}
