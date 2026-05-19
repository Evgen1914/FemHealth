'use client';

import { Stethoscope } from 'lucide-react';
import { motion, fadeUp, staggerContainer, springTransition } from '@/components/ui/motion';

export interface DoctorComment {
  id: string;
  text: string;
  target_type: string;
  created_at: string;
  doctor_name: string;
}

interface DoctorCommentsProps {
  comments: DoctorComment[];
}

const targetLabels: Record<string, string> = {
  general: 'Общее',
  cycle: 'Цикл',
  labs: 'Анализы',
  symptoms: 'Симптомы',
};

export function DoctorComments({ comments }: DoctorCommentsProps) {
  if (comments.length === 0) return null;

  return (
    <motion.div
      className="mt-5 space-y-2.5"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="flex items-center gap-1.5">
        <Stethoscope className="h-3.5 w-3.5 text-primary" />
        <p className="text-xs font-semibold">Рекомендации врача</p>
      </div>
      {comments.map((c) => (
        <motion.div
          key={c.id}
          variants={fadeUp}
          transition={springTransition}
          className="rounded-xl border border-border/40 bg-muted/60 p-3 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-foreground">
              {c.doctor_name}
            </p>
            <span className="text-[10px] text-muted-foreground">
              {new Date(c.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          </div>
          {c.target_type && c.target_type !== 'general' && (
            <span className="mt-1 inline-block rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground">
              {targetLabels[c.target_type] ?? c.target_type}
            </span>
          )}
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {c.text}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
