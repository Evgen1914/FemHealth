import { TabBar } from '@/components/patient/tab-bar';

export default function PatientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-full flex-col">
      <main className="flex-1">{children}</main>
      <TabBar />
    </div>
  );
}
