'use client';

import { useState, useEffect } from 'react';
import type { DSAProblem, DSATopic, DSAStatus } from '@/types';
import {
  Code2,
  ExternalLink,
  CheckCircle2,
  Clock,
  RotateCcw,
  Search,
  Filter,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';

export default function DSAPage() {
  const [topics, setTopics] = useState<DSATopic[]>([]);
  const [problems, setProblems] = useState<DSAProblem[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<{
    total: number;
    solved: number;
    attempted: number;
    revisionNeeded: number;
    masteryPercentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [tRes, pRes, sRes] = await Promise.all([
        fetch('/api/dsa/topics'),
        fetch('/api/dsa/problems'),
        fetch('/api/dsa/stats'),
      ]);
      setTopics((await tRes.json()).data || []);
      setProblems((await pRes.json()).data || []);
      setStats((await sRes.json()).data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (problemId: string, status: DSAStatus) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === problemId ? { ...p, status } : p))
    );
    await fetch(`/api/dsa/problems/${problemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadData();
  };

  const filtered = problems.filter((p) => {
    const matchesTopic = !selectedTopic || p.topicId === selectedTopic;
    const matchesDifficulty = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTopic && matchesDifficulty && matchesSearch;
  });

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'easy':
        return <span className="pill-badge bg-emerald-500/15 text-emerald-300 border-emerald-500/30">Easy</span>;
      case 'medium':
        return <span className="pill-badge bg-amber-500/15 text-amber-300 border-amber-500/30">Medium</span>;
      case 'hard':
        return <span className="pill-badge bg-rose-500/15 text-rose-300 border-rose-500/30">Hard</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: DSAStatus) => {
    switch (status) {
      case 'solved':
        return (
          <span className="pill-badge bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Solved
          </span>
        );
      case 'attempted':
        return (
          <span className="pill-badge bg-amber-500/15 text-amber-300 border-amber-500/30">
            <Clock className="h-3 w-3 text-amber-400" /> Attempted
          </span>
        );
      case 'revision_needed':
        return (
          <span className="pill-badge bg-rose-500/15 text-rose-300 border-rose-500/30 animate-pulse">
            <RotateCcw className="h-3 w-3 text-rose-400" /> Revision Due
          </span>
        );
      default:
        return (
          <span className="pill-badge bg-surface-800 text-surface-400 border-white/[0.04]">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Mastery Progress */}
      {stats && (
        <div className="p-5 rounded-2xl bg-surface-900 border border-white/[0.08] shadow-specular space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Award className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  NeetCode 150 Mastery Matrix
                </h3>
                <p className="text-xs text-surface-400">
                  Curriculum progress and spaced repetition schedule
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-right">
                <span className="text-emerald-400 font-bold text-base">{stats.solved}</span>
                <span className="text-surface-500"> / {stats.total} Solved</span>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                {stats.masteryPercentage}%
              </span>
            </div>
          </div>

          <div className="h-2 w-full bg-surface-950 rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
            <div
              className="bg-gradient-to-r from-brand-500 via-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.masteryPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Filters & Topic Navigation */}
      <div className="space-y-3">
        {/* Search & Difficulty Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="h-3.5 w-3.5 text-surface-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems by name or slug..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-900 border border-white/[0.08] text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-all font-sans"
            />
          </div>

          <div className="flex items-center gap-1 bg-surface-900 p-1 rounded-xl border border-white/[0.08]">
            {['all', 'easy', 'medium', 'hard'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition-all ${
                  difficultyFilter === d
                    ? 'bg-brand-600 text-white font-bold shadow-sm'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1">
          <button
            onClick={() => setSelectedTopic('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedTopic === ''
                ? 'bg-brand-600 text-white font-semibold shadow-glow-sm'
                : 'bg-surface-900/60 text-surface-400 hover:text-white hover:bg-surface-850 border border-white/[0.05]'
            }`}
          >
            All Topics ({problems.length})
          </button>
          {topics.map((t) => {
            const count = problems.filter((p) => p.topicId === t.id).length;
            const solvedCount = problems.filter((p) => p.topicId === t.id && p.status === 'solved').length;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedTopic(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedTopic === t.id
                    ? 'bg-brand-600 text-white font-semibold shadow-glow-sm'
                    : 'bg-surface-900/60 text-surface-400 hover:text-white hover:bg-surface-850 border border-white/[0.05]'
                }`}
              >
                <span>{t.name}</span>
                <span className="text-[10px] font-mono opacity-70">
                  {solvedCount}/{count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Problems Matrix Table */}
      <div className="card-linear overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-925 text-[10px] font-mono text-surface-400 uppercase tracking-wider border-b border-white/[0.06]">
              <tr>
                <th className="py-3 px-4">Problem</th>
                <th className="py-3 px-3">Difficulty</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Spaced Repetition</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-surface-500 font-mono">
                    No problems match your current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((problem) => (
                  <tr
                    key={problem.id}
                    className="hover:bg-surface-850/50 transition-colors group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                          {problem.title}
                        </span>
                        {problem.neetcodeRoadmapFlag && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                            NC150
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-surface-500">
                        {problem.slug}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {getDifficultyBadge(problem.difficulty)}
                    </td>
                    <td className="py-3.5 px-3">
                      <select
                        value={problem.status}
                        onChange={(e) => updateStatus(problem.id, e.target.value as DSAStatus)}
                        className="bg-surface-950 border border-white/[0.08] rounded-lg px-2 py-1 text-xs text-surface-200 focus:outline-none focus:border-brand-500 font-mono"
                      >
                        <option value="pending">Pending</option>
                        <option value="attempted">Attempted</option>
                        <option value="solved">Solved</option>
                        <option value="revision_needed">Revision Due</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-surface-400">
                      {problem.nextRevisionDate ? (
                        <span className="text-amber-400">Due: {problem.nextRevisionDate}</span>
                      ) : (
                        <span className="text-surface-600">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={problem.leetcodeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-800 hover:bg-brand-600 text-surface-300 hover:text-white transition-all text-xs font-medium"
                      >
                        <span>Solve</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
