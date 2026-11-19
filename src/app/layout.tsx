import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { CommandPalette } from '@/components/CommandPalette';

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
      <body className="bg-surface-950 text-surface-200 flex h-screen overflow-hidden antialiased selection:bg-brand-500/30 selection:text-brand-100">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
        <CommandPalette />
      </body>
    </html>
  );
}
