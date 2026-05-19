'use client';

import { useTransition } from 'react';
import { Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, springTap, springTransition } from '@/components/ui/motion';
import { logPeriodStart, logPeriodEnd } from '@/app/(patient)/dashboard/actions';

interface PeriodButtonProps {
  isOnPeriod: boolean;
}

export function PeriodButton({ isOnPeriod }: PeriodButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      if (isOnPeriod) {
        await logPeriodEnd();
      } else {
        const formData = new FormData();
        formData.set('date', new Date().toISOString().split('T')[0]);
        await logPeriodStart(formData);
      }
    });
  }

  return (
    <motion.div whileTap={springTap} transition={springTransition}>
      <Button
        variant="default"
        className="w-full gap-2 rounded-full py-2.5 shadow-sm"
        onClick={handleClick}
        disabled={pending}
      >
        <Droplets className="h-4 w-4" />
        {pending
          ? '...'
          : isOnPeriod
            ? 'Закончилась'
            : 'Менструация'}
      </Button>
    </motion.div>
  );
}
