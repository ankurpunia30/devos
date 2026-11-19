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
  Briefcase,
  Layers,
  Bot,
  Wrench,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

// Consolidated FAANG Information Architecture: 3 High-Signal Core Loops
const focusNavigation = [
  { name: 'Today & Rituals', href: '/daily', icon: Clock, badge: 'Focus' },
  { name: 'Sprint Backlog', href: '/tasks', icon: CheckSquare },
  { name: 'Telemetry Overview', href: '/dashboard', icon: LayoutDashboard },
];

const engineeringNavigation = [
  { name: 'Workspaces & Code', href: '/projects', icon: FolderGit2, badge: 'GitHub' },
  { name: 'Code Review & PRs', href: '/github', icon: GitBranch },
  { name: 'Architecture ADRs', href: '/architecture', icon: Layers },
];

const masteryNavigation = [
  { name: 'Algorithms & DSA', href: '/dsa', icon: Code2, badge: 'Spaced' },
  { name: 'Career Pipeline', href: '/career', icon: Briefcase },
];

const utilityNavigation = [
  { name: 'Grounded Assistant', href: '/assistant', icon: Bot },
  { name: 'Offline Toolbox', href: '/toolbox', icon: Wrench },
  { name: 'Integrations', href: '/integrations', icon: Sliders },
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
    <aside className="w-64 border-r border-white/[0.06] bg-[#0c0d10] flex flex-col justify-between p-3 flex-shrink-0 h-screen select-none overflow-y-auto">
      <div className="space-y-4">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1 pb-1">
          <Link href="/dashboard" className="flex items-center space-x-2.5 hover:opacity-90 transition">
            <DevOSLogo size={26} />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-semibold text-sm tracking-tight text-white font-sans">DevOS</h1>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.06] text-surface-400 font-mono">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-surface-500 font-mono">Focus Operating System</p>
            </div>
          </Link>
        </div>

        {/* 1. Daily Focus & Execution */}
        <div className="space-y-0.5">
          <div className="flex items-center justify-between px-2.5 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-surface-500 font-medium">
              Daily Focus
            </span>
          </div>
          <nav className="space-y-0.5">
            {focusNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/[0.09] text-white font-medium shadow-sm'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-surface-500 group-hover:text-surface-300'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/[0.05] text-surface-500 group-hover:text-surface-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 2. Engineering & Codebase */}
        <div className="space-y-0.5 pt-1">
          <div className="flex items-center justify-between px-2.5 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-surface-500 font-medium">
              Engineering
            </span>
          </div>
          <nav className="space-y-0.5">
            {engineeringNavigation.map((item) => {
              const isActive = pathname === item.href || (item.href === '/projects' && pathname.startsWith('/projects/'));
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/[0.09] text-white font-medium shadow-sm'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-surface-500 group-hover:text-surface-300'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/[0.05] text-surface-500 group-hover:text-surface-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 3. Mastery & Career */}
        <div className="space-y-0.5 pt-1">
          <div className="flex items-center justify-between px-2.5 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-surface-500 font-medium">
              Mastery & Craft
            </span>
          </div>
          <nav className="space-y-0.5">
            {masteryNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/[0.09] text-white font-medium shadow-sm'
                      : 'text-surface-400 hover:text-surface-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-white' : 'text-surface-500 group-hover:text-surface-300'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/[0.05] text-surface-500 group-hover:text-surface-400">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 4. Utilities & Settings */}
        <div className="space-y-0.5 pt-1">
          <div className="flex items-center justify-between px-2.5 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-surface-500 font-medium">
              System & Tools
            </span>
          </div>
          <nav className="space-y-0.5">
            {utilityNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/[0.09] text-white font-medium shadow-sm'
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

      {/* Quick Capture & User Footprint */}
      <div className="space-y-2.5 pt-2.5 border-t border-white/[0.05]">
        {/* Minimalist Natural Language Quick Capture */}
        <div className="p-2 rounded-lg bg-surface-900/40 border border-white/[0.04] focus-within:border-white/20 transition-all">
          <div className="flex items-center justify-between text-[10px] text-surface-400 mb-1 font-mono">
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-brand-400" />
              Quick Capture
            </span>
            <kbd className="px-1 py-0.2 rounded bg-white/[0.06] text-[9px] text-surface-400">↵</kbd>
          </div>
          <input
            type="text"
            value={quickCapture}
            onChange={(e) => setQuickCapture(e.target.value)}
            onKeyDown={handleQuickCapture}
            disabled={isSubmitting}
            placeholder="e.g. Audit SQLite WAL #p:high..."
            className="w-full bg-surface-950/70 border border-white/[0.05] rounded-md px-2 py-1 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-white/20 transition-all font-sans"
          />
        </div>

        {/* Database & Session Status */}
        <div className="flex items-center justify-between px-2 py-1 rounded-md bg-surface-900/20 border border-white/[0.03]">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 rounded bg-white/[0.08] flex items-center justify-center font-bold text-[9px] text-white font-mono">
              DB
            </div>
            <div className="text-[10px] overflow-hidden leading-tight font-mono">
              <p className="text-surface-300 truncate">SQLite WAL Active</p>
              <p className="text-surface-500 truncate text-[9px]">Grounded & Protected</p>
            </div>
          </div>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/90" title="Local Storage Online" />
        </div>
      </div>
    </aside>
  );
}
