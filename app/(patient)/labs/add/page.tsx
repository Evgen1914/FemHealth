import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { LabForm } from '@/components/patient/lab-form';

export default async function AddLabPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: markers } = await supabase
    .from('markers')
    .select('code, name_ru, default_unit, category')
    .order('sort_order');

  return (
    <div className="px-4 pb-4">
      <header className="flex items-center gap-3 py-3">
        <Link href="/labs" className="text-muted-foreground">
          ←
        </Link>
        <h1 className="text-lg font-medium">Новый анализ</h1>
      </header>

      <LabForm markers={markers ?? []} />
    </div>
  );
}
