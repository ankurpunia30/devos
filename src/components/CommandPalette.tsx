'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
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
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Utilities';
  icon: typeof Search;
  shortcut?: string;
  href?: string;
  action?: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  const commands: CommandItem[] = [
    { id: 'dash', title: 'Executive Dashboard', category: 'Navigation', icon: LayoutDashboard, href: '/' },
    { id: 'tasks', title: 'Task Kanban & Sprints', category: 'Navigation', icon: CheckSquare, href: '/tasks' },
    { id: 'projects', title: 'Project Workspaces', category: 'Navigation', icon: FolderGit2, href: '/projects' },
    { id: 'github', title: 'GitHub Hub & PR Reviews', category: 'Navigation', icon: GitBranch, href: '/github' },
    { id: 'dsa', title: 'NeetCode 150 Tracker', category: 'Navigation', icon: Code2, href: '/dsa' },
    { id: 'daily', title: 'Daily Focus & Standup', category: 'Navigation', icon: Clock, href: '/daily' },
    { id: 'analytics', title: 'Heatmap & Contribution Streaks', category: 'Navigation', icon: Flame, href: '/analytics' },
    { id: 'activities', title: 'Universal Activity Journal', category: 'Navigation', icon: Activity, href: '/activities' },
    { id: 'notes', title: 'Developer Knowledge Base', category: 'Navigation', icon: BookOpen, href: '/notes' },
    { id: 'snippets', title: 'Code Snippet Vault', category: 'Navigation', icon: Terminal, href: '/snippets' },
    { id: 'toolbox', title: 'Developer Offline Toolbox', category: 'Navigation', icon: Wrench, href: '/toolbox' },
    { id: 'new-task', title: 'Create New Task', category: 'Actions', icon: CheckSquare, shortcut: 'N', href: '/tasks?create=true' },
    { id: 'standup', title: 'Generate Standup Report', category: 'Actions', icon: Sparkles, href: '/daily' },
    { id: 'jwt', title: 'JWT Token Debugger', category: 'Utilities', icon: Wrench, href: '/toolbox?tool=jwt' },
    { id: 'json', title: 'JSON Validator & Formatter', category: 'Utilities', icon: Wrench, href: '/toolbox?tool=json' },
    { id: 'uuid', title: 'UUID v4 Generator', category: 'Utilities', icon: Wrench, href: '/toolbox?tool=uuid' },
  ];

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const filteredCommands = commands.filter((cmd) =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (cmd: CommandItem) => {
    setIsOpen(false);
    setQuery('');
    if (cmd.href) {
      router.push(cmd.href);
    } else if (cmd.action) {
      cmd.action();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-surface-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3 bg-surface-925">
          <Search className="h-4 w-4 text-brand-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search modules..."
            autoFocus
            className="w-full bg-transparent text-sm text-surface-100 placeholder-surface-500 focus:outline-none font-sans"
          />
          <kbd className="px-2 py-0.5 rounded bg-surface-800 border border-white/10 text-[10px] font-mono text-surface-400 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-surface-500">
              No matching commands or modules found.
            </div>
          ) : (
            filteredCommands.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => handleSelect(cmd)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs text-surface-300 hover:text-white hover:bg-surface-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-surface-800 flex items-center justify-center text-surface-400 group-hover:text-brand-400 group-hover:bg-brand-500/10 transition-colors">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="font-medium text-surface-200 group-hover:text-white">{cmd.title}</p>
                      <p className="text-[10px] text-surface-500 font-mono">{cmd.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-surface-500 group-hover:text-surface-300">
                    {cmd.shortcut && (
                      <kbd className="px-1.5 py-0.5 rounded bg-surface-800 border border-white/10 text-[9px] font-mono">
                        {cmd.shortcut}
                      </kbd>
                    )}
                    <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-white/[0.06] bg-surface-925/80 flex items-center justify-between text-[11px] text-surface-500 font-mono">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1 rounded bg-surface-800 border border-white/10 text-[9px]">↑↓</kbd>
            <span>Select:</span>
            <kbd className="px-1 rounded bg-surface-800 border border-white/10 text-[9px]">↵</kbd>
          </div>
          <span className="text-brand-400/80">DevOS Raycast Engine</span>
        </div>
      </div>
    </div>
  );
}
