'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { unlinkPatient } from '@/app/(doctor)/patients/actions';

export function UnlinkPatientButton({ patientId }: { patientId: string }) {
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  function handleClick() {
    if (!confirm) {
      setConfirm(true);
      return;
    }
    startTransition(async () => {
      await unlinkPatient(patientId);
    });
  }

  if (confirm) {
    return (
      <div className="flex gap-1">
        <Button onClick={handleClick} disabled={pending} size="sm" variant="destructive">
          {pending ? '...' : 'Да'}
        </Button>
        <Button onClick={() => setConfirm(false)} disabled={pending} size="sm" variant="ghost">
          Нет
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleClick} size="sm" variant="ghost" className="text-xs text-destructive">
      Отвязать
    </Button>
  );
}
