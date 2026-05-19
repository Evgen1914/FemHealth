'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { motion, springTap, springTransition } from '@/components/ui/motion';
import { AnimatePresence } from 'motion/react';
import { SYMPTOM_OPTIONS, type SymptomValue } from '@/lib/medical/symptoms';
import { logSymptoms } from '@/app/(patient)/journal/actions';

interface SymptomInputProps {
  date: string;
  existingSymptoms?: { type: SymptomValue; severity: number }[];
}

export function SymptomInput({ date, existingSymptoms = [] }: SymptomInputProps) {
  const [selected, setSelected] = useState<Map<SymptomValue, number>>(() => {
    const map = new Map<SymptomValue, number>();
    existingSymptoms.forEach((s) => map.set(s.type, s.severity));
    return map;
  });
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function toggleSymptom(type: SymptomValue) {
    setSaved(false);
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.set(type, 5);
      }
      return next;
    });
  }

  function setSeverity(type: SymptomValue, severity: number) {
    setSaved(false);
    setSelected((prev) => {
      const next = new Map(prev);
      next.set(type, severity);
      return next;
    });
  }

  function handleSave() {
    const symptoms = Array.from(selected.entries()).map(([type, severity]) => ({
      type,
      severity,
    }));
    startTransition(async () => {
      await logSymptoms(date, symptoms);
      setSaved(true);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {SYMPTOM_OPTIONS.map((opt) => {
          const isActive = selected.has(opt.value);
          return (
            <motion.button
              key={opt.value}
              type="button"
              onClick={() => toggleSymptom(opt.value)}
              whileTap={springTap}
              transition={springTransition}
              className={`rounded-full px-3 py-1.5 text-xs transition-colors ${
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {opt.emoji} {opt.label}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={springTransition}
            className="space-y-3 overflow-hidden rounded-lg bg-muted p-3"
          >
            {Array.from(selected.entries()).map(([type, severity]) => {
              const opt = SYMPTOM_OPTIONS.find((o) => o.value === type);
              if (!opt) return null;
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={springTransition}
                >
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span>
                      {opt.emoji} {opt.label}
                    </span>
                    <span className="font-medium">{severity}/10</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    value={severity}
                    onChange={(e) => setSeverity(type, Number(e.target.value))}
                    className="h-1.5 w-full cursor-pointer accent-primary"
                  />
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={springTransition}
          >
            <motion.div whileTap={springTap} transition={springTransition}>
              <Button onClick={handleSave} disabled={pending} className="w-full" size="sm">
                {pending ? 'Сохранение...' : saved ? 'Сохранено' : 'Сохранить симптомы'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
