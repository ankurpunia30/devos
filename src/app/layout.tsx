import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'DevOS — Personal Developer Operating System',
  description: 'Consolidated developer productivity, GitHub, LeetCode, and engineering telemetry.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-surface-950 text-surface-200 h-screen overflow-hidden antialiased selection:bg-brand-500/30 selection:text-brand-100 font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
