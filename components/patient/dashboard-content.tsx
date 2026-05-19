'use client';

import Link from 'next/link';
import { PenLine } from 'lucide-react';
import { PageTransition, FadeUpItem, motion, springTap, springTransition } from '@/components/ui/motion';
import { CycleRing, type CycleRingProps } from '@/components/patient/cycle-ring';
import { PeriodButton } from '@/components/patient/period-button';
import { DoctorComments, type DoctorComment } from '@/components/patient/doctor-comments';

interface DashboardContentProps {
  name: string;
  todayLabel: string;
  cycleRing: CycleRingProps;
  hint: string;
  isOnPeriod: boolean;
  comments: DoctorComment[];
}

export function DashboardContent({
  name,
  todayLabel,
  cycleRing,
  hint,
  isOnPeriod,
  comments,
}: DashboardContentProps) {
  return (
    <PageTransition>
      <FadeUpItem>
        <header className="flex items-center justify-between pb-1 pt-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Привет, {name}</h1>
            <p className="mt-0.5 text-xs capitalize text-muted-foreground">{todayLabel}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-sm font-semibold text-primary-foreground shadow-sm">
            {name[0]?.toUpperCase() ?? '?'}
          </div>
        </header>
      </FadeUpItem>

      <FadeUpItem>
        <div className="mt-4 rounded-2xl bg-gradient-to-b from-accent/60 to-background p-4 shadow-sm ring-1 ring-border/40">
          <div className="flex flex-col items-center">
            <CycleRing {...cycleRing} />
            <p className="mt-2 text-sm font-medium text-muted-foreground">{hint}</p>
          </div>
        </div>
      </FadeUpItem>

      <FadeUpItem>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <PeriodButton isOnPeriod={isOnPeriod} />
          <motion.div whileTap={springTap} transition={springTransition}>
            <Link
              href="/journal"
              className="inline-flex h-full w-full items-center justify-center gap-2 rounded-full bg-muted px-4 py-2.5 text-sm font-medium text-foreground shadow-sm ring-1 ring-border/30 transition-colors active:bg-muted/70"
            >
              <PenLine className="h-4 w-4 text-muted-foreground" />
              Симптом
            </Link>
          </motion.div>
        </div>
      </FadeUpItem>

      <FadeUpItem>
        <DoctorComments comments={comments} />
      </FadeUpItem>

      <FadeUpItem>
        <p className="mt-6 text-center text-[10px] text-muted-foreground">
          Не является диагностикой, обсудите с врачом.
        </p>
      </FadeUpItem>
    </PageTransition>
  );
}
