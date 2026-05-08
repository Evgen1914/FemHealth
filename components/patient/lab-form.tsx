'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createLabResult } from '@/app/(patient)/labs/actions';
import { Plus, X } from 'lucide-react';

interface MarkerOption {
  code: string;
  name_ru: string;
  default_unit: string;
  category: string;
}

interface LabFormProps {
  markers: MarkerOption[];
}

const CATEGORY_LABELS: Record<string, string> = {
  hormones: 'Гормоны',
  thyroid: 'Щитовидная железа',
  metabolism: 'Углеводный обмен',
  vitamins: 'Витамины',
  general: 'Общая клиника',
};

interface ValueRow {
  marker_code: string;
  value: string;
  unit: string;
}

export function LabForm({ markers }: LabFormProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [labName, setLabName] = useState('');
  const [cycleDay, setCycleDay] = useState('');
  const [values, setValues] = useState<ValueRow[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const addedCodes = new Set(values.map((v) => v.marker_code));
  const categories = [...new Set(markers.map((m) => m.category))];
  const filteredMarkers = markers.filter(
    (m) => !addedCodes.has(m.code) && (filterCategory === 'all' || m.category === filterCategory),
  );

  function addMarker(m: MarkerOption) {
    setValues((prev) => [...prev, { marker_code: m.code, value: '', unit: m.default_unit }]);
    setShowPicker(false);
  }

  function removeRow(index: number) {
    setValues((prev) => prev.filter((_, i) => i !== index));
  }

  function updateValue(index: number, val: string) {
    setValues((prev) => prev.map((row, i) => (i === index ? { ...row, value: val } : row)));
  }

  function handleSubmit() {
    const parsed = values
      .filter((v) => v.value.trim() !== '')
      .map((v) => ({
        marker_code: v.marker_code,
        value: parseFloat(v.value.replace(',', '.')),
        unit: v.unit,
      }));

    if (parsed.some((v) => isNaN(v.value))) {
      setError('Проверьте числовые значения.');
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await createLabResult(
        date,
        labName,
        cycleDay ? parseInt(cycleDay) : null,
        parsed,
      );
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="date">Дата сдачи</Label>
          <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cycle_day">День цикла</Label>
          <Input
            id="cycle_day"
            type="number"
            placeholder="—"
            value={cycleDay}
            onChange={(e) => setCycleDay(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="lab_name">Лаборатория</Label>
        <Input
          id="lab_name"
          placeholder="Инвитро, Хеликс, Гемотест..."
          value={labName}
          onChange={(e) => setLabName(e.target.value)}
        />
      </div>

      {/* Добавленные показатели */}
      {values.length > 0 && (
        <div className="space-y-2">
          {values.map((row, i) => {
            const marker = markers.find((m) => m.code === row.marker_code);
            return (
              <div key={row.marker_code} className="flex items-center gap-2 rounded-lg bg-muted p-2">
                <span className="flex-1 text-xs font-medium">{marker?.name_ru}</span>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={row.value}
                  onChange={(e) => updateValue(i, e.target.value)}
                  className="w-20 text-right text-xs"
                />
                <span className="w-16 text-[11px] text-muted-foreground">{row.unit}</span>
                <button type="button" onClick={() => removeRow(i)} className="text-muted-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Выбор показателя */}
      {showPicker ? (
        <div className="rounded-lg border border-border p-3">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setFilterCategory('all')}
              className={`rounded-full px-2 py-0.5 text-[11px] ${
                filterCategory === 'all' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              Все
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  filterCategory === cat ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                {CATEGORY_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>
          <div className="max-h-48 space-y-0.5 overflow-y-auto">
            {filteredMarkers.map((m) => (
              <button
                key={m.code}
                type="button"
                onClick={() => addMarker(m)}
                className="flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs hover:bg-muted"
              >
                <span>{m.name_ru}</span>
                <span className="text-muted-foreground">{m.default_unit}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowPicker(true)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Добавить показатель
        </Button>
      )}

      {error && (
        <div className="rounded-lg bg-danger-bg px-3 py-2 text-xs text-destructive">{error}</div>
      )}

      {values.length > 0 && (
        <Button onClick={handleSubmit} disabled={pending} className="w-full">
          {pending ? 'Сохранение...' : 'Сохранить анализ'}
        </Button>
      )}
    </div>
  );
}
