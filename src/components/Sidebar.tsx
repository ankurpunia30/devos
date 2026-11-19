'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CheckSquare,
  FolderGit2,
  Github,
  Code2,
  Clock,
  Flame,
  Activity,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Task Kanban', href: '/tasks', icon: CheckSquare },
  { name: 'Project Hub', href: '/projects', icon: FolderGit2 },
  { name: 'GitHub & PRs', href: '/github', icon: Github },
  { name: 'LeetCode / NeetCode', href: '/dsa', icon: Code2 },
  { name: 'My Day & Standup', href: '/daily', icon: Clock },
  { name: 'Heatmap & Streaks', href: '/analytics', icon: Flame },
  { name: 'Activity Stream', href: '/activities', icon: Activity },
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
    <aside className="w-64 border-r border-slate-800 bg-surface-900 flex flex-col justify-between p-4 flex-shrink-0 h-screen">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center space-x-3 px-2">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              DevOS <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono border border-indigo-500/20">Next.js 15</span>
            </h1>
            <p className="text-xs text-slate-400">Developer Operating System</p>
          </div>
        </div>

        {/* Links */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick Capture & User */}
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Quick Capture</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono">Enter</kbd>
          </div>
          <input
            type="text"
            value={quickCapture}
            onChange={(e) => setQuickCapture(e.target.value)}
            onKeyDown={handleQuickCapture}
            disabled={isSubmitting}
            placeholder="Type idea or 'todo: ...'"
            className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 px-2 pt-2 border-t border-slate-800">
          <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs text-white">
            LE
          </div>
          <div className="text-xs overflow-hidden">
            <p className="font-medium text-slate-200 truncate">Lead Engineer</p>
            <p className="text-slate-500 truncate font-mono text-[10px]">usr_devos_root</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
