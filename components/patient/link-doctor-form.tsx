'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { linkDoctor } from '@/app/(patient)/profile/actions';

export function LinkDoctorForm() {
  const [code, setCode] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleSubmit() {
    if (!code.trim()) return;
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await linkDoctor(code);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(`Заявка отправлена врачу ${result.doctorName ?? ''}`);
        setCode('');
      }
    });
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <p className="mb-2 text-xs font-medium">Привязка к врачу</p>
      <p className="mb-2 text-[11px] text-muted-foreground">
        Введите код-приглашение, который дал вам врач
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="abc123"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="font-mono text-sm"
        />
        <Button onClick={handleSubmit} disabled={pending || !code.trim()} size="sm">
          {pending ? '...' : 'Привязать'}
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      {success && <p className="mt-1 text-xs text-success">{success}</p>}
    </div>
  );
}
