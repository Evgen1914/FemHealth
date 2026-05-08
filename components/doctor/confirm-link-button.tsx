'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { confirmLink } from '@/app/(doctor)/patients/actions';

export function ConfirmLinkButton({ patientId }: { patientId: string }) {
  const [pending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      await confirmLink(patientId);
    });
  }

  return (
    <Button onClick={handleConfirm} disabled={pending} size="sm" variant="outline">
      {pending ? '...' : 'Принять'}
    </Button>
  );
}
