'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
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
    <Button
      variant="default"
      size="sm"
      className="rounded-full"
      onClick={handleClick}
      disabled={pending}
    >
      {pending ? '...' : isOnPeriod ? 'Менструация закончилась' : '+ Менструация'}
    </Button>
  );
}
