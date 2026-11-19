'use client';

import { useState, useEffect } from 'react';
import type { ActivityEvent } from '@/types';
import {
  Activity,
  GitCommit,
  ListTodo,
  Code2,
  Calendar,
  FolderGit2,
  Filter,
  Search,
  Sparkles,
  Clock,
} from 'lucide-react';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [filterDomain, setFilterDomain] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const loadActivities = async () => {
    try {
      const res = await fetch('/api/activities');
      const data = await res.json();
      setActivities(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'github':
        return <GitCommit className="h-4 w-4 text-purple-400" />;
      case 'dsa':
        return <Code2 className="h-4 w-4 text-emerald-400" />;
      case 'tasks':
        return <ListTodo className="h-4 w-4 text-blue-400" />;
      case 'daily':
        return <Calendar className="h-4 w-4 text-amber-400" />;
      case 'projects':
        return <FolderGit2 className="h-4 w-4 text-indigo-400" />;
      default:
        return <Activity className="h-4 w-4 text-brand-400" />;
    }
  };

  const filtered = activities.filter((act) => {
    const matchesDomain = filterDomain === 'all' || act.sourceDomain === filterDomain;
    const matchesSearch =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (act.description && act.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      act.eventType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Universal Activity Journal</span>
          </h2>
          <p className="text-xs text-surface-400">
            Immutable, audit-ready event bus capturing state transitions across all developer domains
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-full bg-surface-850 text-surface-300 border border-white/[0.06]">
            Total Events: {activities.length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="h-3.5 w-3.5 text-surface-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search activity titles, descriptions or event types..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-900 border border-white/[0.08] text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-all font-sans"
          />
        </div>

        <div className="flex items-center gap-1 bg-surface-900 p-1 rounded-xl border border-white/[0.08] overflow-x-auto max-w-full">
          {['all', 'tasks', 'github', 'dsa', 'daily', 'projects'].map((dom) => (
            <button
              key={dom}
              onClick={() => setFilterDomain(dom)}
              className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition-all whitespace-nowrap ${
                filterDomain === dom
                  ? 'bg-brand-600 text-white font-bold shadow-sm'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="card-linear p-5 space-y-3">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-surface-500 font-mono">
            No activity events recorded matching this filter.
          </div>
        ) : (
          filtered.map((act) => (
            <div
              key={act.id}
              className="p-3.5 rounded-xl bg-surface-850/40 border border-white/[0.04] hover:bg-surface-850 hover:border-white/[0.08] transition-all flex items-start gap-4"
            >
              <div className="h-9 w-9 rounded-xl bg-surface-800 border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                {getDomainIcon(act.sourceDomain)}
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-white truncate">{act.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-surface-500 shrink-0">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(act.occurredAt).toLocaleString()}</span>
                  </div>
                </div>

                {act.description && (
                  <p className="text-xs text-surface-400 leading-relaxed">{act.description}</p>
                )}

                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-surface-800 text-surface-400 border border-white/[0.04]">
                    {act.sourceDomain}
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                    {act.eventType}
                  </span>
                  {act.externalId && (
                    <span className="text-[9px] font-mono text-surface-500">
                      ext: {act.externalId}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
