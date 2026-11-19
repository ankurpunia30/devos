'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Search, Plus, Terminal, Sparkles, CheckCircle2, LogOut } from 'lucide-react';
import Link from 'next/link';

const routeNames: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Home', subtitle: 'DevOS Landing' },
  '/dashboard': { title: 'Executive Dashboard', subtitle: 'Single source of truth for developer telemetry' },
  '/tasks': { title: 'Task Kanban & Sprints', subtitle: 'Linear-grade sprint backlog & execution' },
  '/projects': { title: 'Project Workspaces', subtitle: 'Multi-repository architecture & milestones' },
  '/github': { title: 'GitHub & PR Review Queue', subtitle: 'Live repositories, commits & pending reviews' },
  '/dsa': { title: 'LeetCode Practice Hub', subtitle: 'Live telemetry, problem catalog & spaced repetition schedule' },
  '/daily': { title: 'Daily Focus & Standup', subtitle: 'Pomodoro timer & 1-click grounded standup' },
  '/analytics': { title: 'Heatmap & Contribution Streaks', subtitle: 'Cross-module engineering telemetry' },
  '/activities': { title: 'Universal Activity Journal', subtitle: 'Auditable append-only event stream' },
  '/notes': { title: 'Developer Knowledge Base', subtitle: 'Architecture notes, debugging & engineering memory' },
  '/snippets': { title: 'Code Snippet Vault', subtitle: 'Reusable algorithms, commands & SQL scripts' },
  '/toolbox': { title: 'Developer Offline Toolbox', subtitle: 'Zero-latency JSON, JWT, UUID & Base64 utilities' },
  '/career': { title: 'Career & Interview Management', subtitle: 'Target pipeline, offer negotiation & STAR behavioral questions' },
  '/architecture': { title: 'Architecture Decision Records (ADRs)', subtitle: 'Immutable architectural trade-offs, schemas & Mermaid diagrams' },
  '/deployments': { title: 'Environments & Deployment Telemetry', subtitle: 'Multi-stage release log & automated rollback targets' },
  '/assistant': { title: 'Contextual AI & Grounded Intelligence', subtitle: 'Deterministic natural-language task extraction & zero-hallucination Q&A' },
  '/integrations': { title: '3rd-Party Integrations & Webhooks', subtitle: 'Live GitHub synchronization, LeetCode profile GraphQL & inbound webhooks' },
};

export function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const current = routeNames[pathname] || { title: 'DevOS Workspace', subtitle: 'Developer Operating System' };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    router.push('/');
    router.refresh();
  };

  return (
    <header className="h-14 border-b border-white/[0.07] bg-surface-950/80 backdrop-blur-xl px-6 flex items-center justify-between shrink-0 sticky top-0 z-30">
      {/* Title & Subtitle */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            {current.title}
          </h2>
          <p className="text-[11px] text-surface-400 hidden md:block">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Global Actions Bar */}
      <div className="flex items-center gap-3">
        {/* Command Palette Trigger */}
        <button
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-900 border border-white/[0.08] text-surface-400 hover:text-surface-200 hover:border-white/[0.15] transition-all text-xs shadow-inner"
        >
          <Search className="h-3.5 w-3.5 text-brand-400" />
          <span className="hidden sm:inline">Search or jump to...</span>
          <kbd className="px-1.5 py-0.5 rounded bg-surface-800 border border-white/10 text-[9px] font-mono text-surface-400">
            ⌘K
          </kbd>
        </button>

        {/* Telemetry Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Telemetry Online</span>
        </div>

        {/* New Task Shortcut */}
        <Link
          href="/tasks"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium shadow-glow-sm transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Task</span>
        </Link>

        {/* Sign Out Action */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-900 hover:bg-rose-500/10 hover:text-rose-400 text-surface-400 border border-white/[0.08] text-xs transition cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
