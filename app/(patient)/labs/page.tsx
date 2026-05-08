import { Button } from '@/components/ui/button';

export default function LabsPage() {
  return (
    <div className="px-4 pb-4">
      <header className="flex items-center justify-between py-3">
        <h1 className="text-lg font-medium">Анализы</h1>
        <Button size="sm" className="rounded-full">
          + Добавить
        </Button>
      </header>

      {/* Фильтры — заглушка */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {['Все', 'Гормоны', 'Щитовидка', 'Углеводы'].map((label, i) => (
          <span
            key={label}
            className={`rounded-full px-2.5 py-1 text-xs ${
              i === 0
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Список анализов — заглушка */}
      <p className="text-xs text-muted-foreground">12 апреля · Инвитро · день цикла 5</p>
      <div className="mt-2 divide-y divide-border text-xs">
        {[
          { name: 'ФСГ', value: '6.2 мМЕ/мл', tag: 'norm' },
          { name: 'ЛГ', value: '14.8 мМЕ/мл', tag: 'warn' },
          { name: 'Эстрадиол', value: '52 пг/мл', tag: 'norm' },
          { name: 'Пролактин', value: '32 нг/мл', tag: 'out' },
          { name: 'ТТГ', value: '2.1 мМЕ/л', tag: 'norm' },
          { name: 'HOMA-IR', value: '3.4', tag: 'out' },
        ].map((row) => (
          <div key={row.name} className="flex items-center justify-between py-2.5">
            <span>{row.name}</span>
            <span className="flex items-center gap-1.5">
              <span className="font-medium">{row.value}</span>
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] ${
                  row.tag === 'norm'
                    ? 'bg-success-bg text-success'
                    : row.tag === 'warn'
                      ? 'bg-warning-bg text-warning'
                      : 'bg-danger-bg text-destructive'
                }`}
              >
                {row.tag === 'norm' ? 'норма' : row.tag === 'warn' ? 'погр.' : '↑'}
              </span>
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[10px] text-muted-foreground">
        Не является диагностикой, обсудите с врачом.
      </p>
    </div>
  );
}
