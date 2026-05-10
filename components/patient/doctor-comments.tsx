'use client';

interface Comment {
  id: string;
  text: string;
  target_type: string;
  created_at: string;
  doctor_name: string;
}

interface DoctorCommentsProps {
  comments: Comment[];
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
    <div className="mt-4 space-y-2">
      <p className="text-xs font-medium">Рекомендации врача</p>
      {comments.map((c) => (
        <div key={c.id} className="rounded-lg bg-muted p-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-foreground">
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
            <span className="mt-0.5 inline-block rounded bg-accent px-1.5 py-0.5 text-[10px] text-accent-foreground">
              {targetLabels[c.target_type] ?? c.target_type}
            </span>
          )}
          <p className="mt-1 text-xs text-muted-foreground">{c.text}</p>
        </div>
      ))}
    </div>
  );
}
