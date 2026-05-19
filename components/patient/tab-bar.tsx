'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, FlaskConical, User } from 'lucide-react';
import { motion } from '@/components/ui/motion';
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="mx-auto grid max-w-md grid-cols-4 px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'relative flex flex-col items-center gap-0.5 pt-2 pb-1.5 text-[10px] font-medium',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground active:text-foreground',
              )}
            >
              <div className="relative flex h-8 w-8 items-center justify-center rounded-xl">
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute inset-0 rounded-xl bg-accent"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon
                  className="relative z-10 h-[18px] w-[18px]"
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
