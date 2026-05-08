'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, FlaskConical, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/dashboard', label: 'Главная', icon: Home },
  { href: '/journal', label: 'Журнал', icon: BookOpen },
  { href: '/labs', label: 'Анализы', icon: FlaskConical },
  { href: '/profile', label: 'Профиль', icon: User },
] as const;

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 border-t border-border bg-background">
      <div className="grid grid-cols-4">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'flex flex-col items-center gap-1 py-2 text-[10px]',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
