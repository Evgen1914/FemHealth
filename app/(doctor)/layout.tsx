import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DoctorNav } from '@/components/doctor/doctor-nav';

export default async function DoctorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'doctor') redirect('/dashboard');

  return (
    <div className="flex min-h-full">
      <aside className="hidden w-52 flex-col border-r border-border bg-muted p-4 lg:flex">
        <div className="mb-6 text-sm font-medium text-primary">FemHealth · Врач</div>
        <DoctorNav />
      </aside>
      <main className="flex-1">
        {children}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background lg:hidden">
          <DoctorNav mobile />
        </div>
      </main>
    </div>
  );
}
