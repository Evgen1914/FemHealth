import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { SWRegister } from '@/components/sw-register';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
});

export const metadata: Metadata = {
  title: 'FemHealth — кабинет пациентки',
  description:
    'Цифровой кабинет пациентки гинеколога-эндокринолога: трекинг цикла, анализы, связь с врачом.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FemHealth',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#993556',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <SWRegister />
      </body>
    </html>
  );
}
