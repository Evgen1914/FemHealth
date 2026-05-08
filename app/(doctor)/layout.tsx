export default function DoctorLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-full">
      <aside className="hidden w-52 flex-col border-r border-border bg-muted p-4 lg:flex">
        <div className="mb-6 text-sm font-medium text-primary">FemHealth · Doctor</div>
        <nav className="space-y-1 text-sm text-muted-foreground">
          <div className="rounded-md bg-accent px-3 py-2 font-medium text-accent-foreground">
            Пациентки
          </div>
          <div className="px-3 py-2">Настройки</div>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
