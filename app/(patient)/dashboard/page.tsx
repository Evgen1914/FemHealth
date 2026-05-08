import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email ?? '';
  const name = email.split('@')[0] ?? 'Пользователь';

  return (
    <div className="px-4 pb-4">
      <header className="flex items-center justify-between py-3">
        <h1 className="text-lg font-medium">Привет, {name}</h1>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
          {name[0]?.toUpperCase() ?? '?'}
        </div>
      </header>

      <div className="flex flex-col items-center py-6">
        <svg viewBox="0 0 260 220" className="w-full max-w-[260px]">
          <circle cx="130" cy="110" r="92" fill="none" stroke="#F1EFE8" strokeWidth="14" />
          <path
            d="M 130 18 A 92 92 0 0 1 222 110"
            fill="none"
            stroke="#F09595"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 222 110 A 92 92 0 0 1 195 178"
            fill="none"
            stroke="#FAC775"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 195 178 A 92 92 0 0 1 65 178"
            fill="none"
            stroke="#9FE1CB"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 65 178 A 92 92 0 0 1 130 18"
            fill="none"
            stroke="#D3D1C7"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <text x="130" y="100" textAnchor="middle" fontSize="13" fill="var(--muted-foreground)">
            День цикла
          </text>
          <text
            x="130"
            y="130"
            textAnchor="middle"
            fontSize="34"
            fontWeight="500"
            fill="var(--foreground)"
          >
            —
          </text>
          <text x="130" y="150" textAnchor="middle" fontSize="11" fill="var(--primary)">
            Нет данных
          </text>
        </svg>
        <p className="mt-1 text-xs text-muted-foreground">
          Отметьте первый день менструации, чтобы начать трекинг
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button variant="default" size="sm" className="rounded-full">
          + Менструация
        </Button>
        <Button variant="secondary" size="sm" className="rounded-full">
          + Симптом
        </Button>
      </div>
    </div>
  );
}
