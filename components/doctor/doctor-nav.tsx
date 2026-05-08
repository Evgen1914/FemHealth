'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Settings } from 'lucide-react';

const LINKS = [
  { href: '/patients', label: 'Пациентки', icon: Users },
  { href: '/settings', label: 'Настройки', icon: Settings },
];

export function DoctorNav({ mobile }: { mobile?: boolean }) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <nav className="flex justify-around py-2">
        {LINKS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 text-[10px] ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="space-y-1 text-sm">
      {LINKS.map(({ href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`block rounded-md px-3 py-2 ${
              active
                ? 'bg-accent font-medium text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
