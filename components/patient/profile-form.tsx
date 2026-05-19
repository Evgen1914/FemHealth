'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile } from '@/app/(patient)/profile/actions';

interface ProfileFormProps {
  initial: {
    birth_date: string | null;
    height_cm: number | null;
    weight_kg: number | null;
    avg_cycle_length: number;
    primary_diagnoses: string[];
  };
}

export function ProfileForm({ initial }: ProfileFormProps) {
  const [birthDate, setBirthDate] = useState(initial.birth_date ?? '');
  const [height, setHeight] = useState(initial.height_cm?.toString() ?? '');
  const [weight, setWeight] = useState(initial.weight_kg?.toString() ?? '');
  const [cycleLength, setCycleLength] = useState(initial.avg_cycle_length.toString());
  const [diagnoses, setDiagnoses] = useState(initial.primary_diagnoses.join(', '));
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateProfile({
        birth_date: birthDate || null,
        height_cm: height ? parseInt(height) : null,
        weight_kg: weight ? parseFloat(weight.replace(',', '.')) : null,
        avg_cycle_length: parseInt(cycleLength) || 28,
        primary_diagnoses: diagnoses
          .split(',')
          .map((d) => d.trim())
          .filter(Boolean),
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <p className="text-xs font-medium">Личные данные</p>

      <div className="grid grid-cols-2 gap-x-3 gap-y-4">
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="birth_date" className="text-[11px]">Дата рождения</Label>
          <Input
            id="birth_date"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="max-w-full"
          />
        </div>
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="cycle_length" className="text-[11px]">Длина цикла (дн.)</Label>
          <Input
            id="cycle_length"
            type="number"
            value={cycleLength}
            onChange={(e) => setCycleLength(e.target.value)}
          />
        </div>
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="height" className="text-[11px]">Рост (см)</Label>
          <Input
            id="height"
            type="number"
            placeholder="165"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
        </div>
        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="weight" className="text-[11px]">Вес (кг)</Label>
          <Input
            id="weight"
            type="text"
            inputMode="decimal"
            placeholder="58.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="diagnoses" className="text-[11px]">Диагнозы (через запятую)</Label>
        <Input
          id="diagnoses"
          placeholder="СПКЯ, гипотиреоз..."
          value={diagnoses}
          onChange={(e) => setDiagnoses(e.target.value)}
        />
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button onClick={handleSave} disabled={pending} size="sm" className="w-full">
        {pending ? 'Сохранение...' : saved ? 'Сохранено' : 'Сохранить'}
      </Button>
    </div>
  );
}
