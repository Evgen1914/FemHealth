'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { unlinkDoctor } from '@/app/(patient)/profile/actions';

export function UnlinkDoctorButton({
  doctorId,
  status,
}: {
  doctorId: string;
  status: 'active' | 'pending';
}) {
  const [pending, startTransition] = useTransition();
  const [confirm, setConfirm] = useState(false);

  const label = status === 'pending' ? 'Отменить' : 'Отвязать';

  function handleClick() {
    if (!confirm && status === 'active') {
      setConfirm(true);
      return;
    }
    startTransition(async () => {
      await unlinkDoctor(doctorId);
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
    <Button
      onClick={handleClick}
      disabled={pending}
      size="sm"
      variant="ghost"
      className="text-xs text-destructive"
    >
      {pending ? '...' : label}
    </Button>
  );
}
