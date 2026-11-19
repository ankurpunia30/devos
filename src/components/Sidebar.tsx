'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DevOSLogo } from './DevOSLogo';
import {
  LayoutDashboard,
  CheckSquare,
  FolderGit2,
  GitBranch,
  Code2,
  Clock,
  Flame,
  Activity,
  BookOpen,
  Terminal,
  Wrench,
  Zap,
  Sparkles,
  Briefcase,
  Layers,
  Rocket,
  Bot,
  Webhook,
} from 'lucide-react';
import { useState } from 'react';

const coreNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Task Kanban', href: '/tasks', icon: CheckSquare },
  { name: 'Project Hub', href: '/projects', icon: FolderGit2 },
  { name: 'GitHub & PRs', href: '/github', icon: GitBranch },
  { name: 'LeetCode Practice', href: '/dsa', icon: Code2 },
  { name: 'Daily & Standup', href: '/daily', icon: Clock },
  { name: 'Heatmap & Streaks', href: '/analytics', icon: Flame },
  { name: 'Activity Stream', href: '/activities', icon: Activity },
];

const lifecycleNavigation = [
  { name: 'Career & Prep', href: '/career', icon: Briefcase },
  { name: 'Architecture ADRs', href: '/architecture', icon: Layers },
  { name: 'Deployments', href: '/deployments', icon: Rocket },
  { name: 'Grounded AI', href: '/assistant', icon: Bot },
];

const workspaceNavigation = [
  { name: 'Knowledge Base', href: '/notes', icon: BookOpen },
  { name: 'Snippet Vault', href: '/snippets', icon: Terminal },
  { name: 'Developer Toolbox', href: '/toolbox', icon: Wrench },
  { name: 'Integrations & Webhooks', href: '/integrations', icon: Webhook },
];

export function Sidebar() {
  const pathname = usePathname();
  const [quickCapture, setQuickCapture] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQuickCapture = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && quickCapture.trim()) {
      setIsSubmitting(true);
      try {
        await fetch('/api/quick-capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: quickCapture }),
        });
        setQuickCapture('');
        window.location.reload();
      } catch (err) {
        console.error('Quick capture failed:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <aside className="w-64 border-r border-white/[0.07] bg-surface-950/95 backdrop-blur-2xl flex flex-col justify-between p-3.5 flex-shrink-0 h-screen select-none overflow-y-auto">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1 pb-1">
          <Link href="/dashboard" className="flex items-center space-x-2.5 hover:opacity-90 transition">
            <DevOSLogo size={28} />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-semibold text-sm tracking-tight text-white font-sans">DevOS</h1>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-surface-400 font-mono">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-surface-400 font-mono">Personal Developer OS</p>
            </div>
          </Link>
        </div>

        {/* Core Navigation */}
        <div className="space-y-1">
          <p className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-surface-500 font-medium mb-1">
            Productivity & Execution
          </p>
          <nav className="space-y-0.5">
            {coreNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-white/[0.08] text-white font-medium'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-surface-500 group-hover:text-surface-300'}`} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Engineering Lifecycle Navigation */}
        <div className="space-y-1 pt-1">
          <p className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-surface-500 font-medium mb-1">
            Lifecycle & Intelligence
          </p>
          <nav className="space-y-0.5">
            {lifecycleNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-white/[0.08] text-white font-medium'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-surface-500 group-hover:text-surface-300'}`} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Developer Utilities Navigation */}
        <div className="space-y-1 pt-1">
          <p className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-surface-500 font-medium mb-1">
            Engineering Vault
          </p>
          <nav className="space-y-0.5">
            {workspaceNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-white/[0.08] text-white font-medium'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-surface-500 group-hover:text-surface-300'}`} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Quick Capture & User Profile */}
      <div className="space-y-3 pt-3 border-t border-white/[0.06]">
        {/* Quick Capture Card */}
        <div className="p-2 rounded-xl bg-surface-900/50 border border-white/[0.05]">
          <div className="flex items-center justify-between text-[10px] text-surface-400 mb-1 font-mono">
            <span>Quick Capture</span>
            <kbd className="px-1 py-0.2 rounded bg-white/[0.06] border border-white/5 text-[9px] text-surface-400">↵</kbd>
          </div>
          <input
            type="text"
            value={quickCapture}
            onChange={(e) => setQuickCapture(e.target.value)}
            onKeyDown={handleQuickCapture}
            disabled={isSubmitting}
            placeholder="Type task e.g. #p:high..."
            className="w-full bg-surface-950 border border-white/[0.06] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-white/20 transition-all font-sans"
          />
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-surface-900/30 border border-white/[0.04]">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded-md bg-white/[0.1] border border-white/[0.08] flex items-center justify-center font-bold text-[10px] text-white">
              LE
            </div>
            <div className="text-xs overflow-hidden leading-tight">
              <p className="font-medium text-surface-200 truncate text-[11px]">Lead Engineer</p>
              <p className="text-surface-500 truncate font-mono text-[9px]">Local SQLite WAL</p>
            </div>
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" title="Online" />
        </div>
      </div>
    </aside>
  );
}
