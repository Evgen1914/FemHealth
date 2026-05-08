'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { addComment } from '@/app/(doctor)/patients/actions';

export function CommentForm({ patientId }: { patientId: string }) {
  const [text, setText] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    if (!text.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await addComment(patientId, text.trim());
      if (result?.error) {
        setError(result.error);
      } else {
        setText('');
      }
    });
  }

  return (
    <div>
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Написать комментарий..."
          rows={2}
          className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <Button onClick={handleSubmit} disabled={pending || !text.trim()} size="sm">
          {pending ? '...' : '→'}
        </Button>
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
