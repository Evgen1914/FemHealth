'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { motion, springTransition } from '@/components/ui/motion';
import { AnimatePresence } from 'motion/react';
import { Download, Trash2 } from 'lucide-react';

export function AccountActions() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setExporting(true);
    setError(null);
    try {
      const res = await fetch('/api/account/export');
      if (!res.ok) throw new Error('Ошибка экспорта');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `femhealth-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Не удалось скачать данные. Попробуйте позже.');
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (!confirmStep) {
      setConfirmStep(true);
      return;
    }

    setDeleting(true);
    setError(null);
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Ошибка удаления');
      }
      router.push('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить аккаунт.');
      setDeleting(false);
      setConfirmStep(false);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium">Мои данные (152-ФЗ)</p>

      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
        onClick={handleExport}
        disabled={exporting}
      >
        <Download className="h-4 w-4" />
        {exporting ? 'Экспорт...' : 'Скачать мои данные'}
      </Button>

      <AnimatePresence mode="wait">
        {!confirmStep ? (
          <motion.div
            key="delete-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springTransition}
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
              Удалить аккаунт
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="delete-confirm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={springTransition}
            className="overflow-hidden"
          >
            <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <p className="text-xs text-destructive">
                Все ваши данные будут удалены безвозвратно. Это действие нельзя отменить.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Удаление...' : 'Да, удалить'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setConfirmStep(false)}
                  disabled={deleting}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
