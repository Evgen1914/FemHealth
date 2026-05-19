'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { rejectLink } from '@/app/(doctor)/patients/actions';

export function RejectLinkButton({ patientId }: { patientId: string }) {
  const [pending, startTransition] = useTransition();

  function handleReject() {
    startTransition(async () => {
      await rejectLink(patientId);
    });
  }

  return (
    <Button onClick={handleReject} disabled={pending} size="sm" variant="ghost" className="text-destructive">
      {pending ? '...' : 'Отклонить'}
    </Button>
  );
}
