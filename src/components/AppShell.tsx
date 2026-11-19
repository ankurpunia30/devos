'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { TopNav } from '@/components/TopNav';
import { CommandPalette } from '@/components/CommandPalette';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicPage = pathname === '/' || pathname === '/login';

  if (isPublicPage) {
    return (
      <div className="h-screen w-full overflow-y-auto bg-surface-950 text-surface-200">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-surface-950 text-surface-200">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
