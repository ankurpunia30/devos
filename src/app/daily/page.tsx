'use client';

import { useState, useEffect } from 'react';
import type { DailyPriority } from '@/types';
import {
  Clock,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Target,
  Flame,
} from 'lucide-react';

export default function DailyWorkspacePage() {
  const [priorities, setPriorities] = useState<DailyPriority[]>([]);
  const [rocks, setRocks] = useState<Record<number, string>>({ 1: '', 2: '', 3: '' });
  const [standupMarkdown, setStandupMarkdown] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [completedNotification, setCompletedNotification] = useState(false);

  // Pomodoro
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);

  const loadPriorities = async () => {
    try {
      const res = await fetch('/api/daily/priorities');
      const data = await res.json();
      const list: DailyPriority[] = data.data || [];
      setPriorities(list);

      const map: Record<number, string> = { 1: '', 2: '', 3: '' };
      list.forEach((p) => {
        map[p.rank] = p.customTitle || '';
      });
      setRocks(map);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPriorities();
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      fetch('/api/daily/pomodoro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMinutes: 25 }),
      });
      setCompletedNotification(true);
      setTimeout(() => setCompletedNotification(false), 5000);
      setSeconds(25 * 60);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setSeconds(25 * 60);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleSaveRock = async (rank: 1 | 2 | 3) => {
    const title = rocks[rank];
    if (!title?.trim()) return;

    await fetch('/api/daily/priorities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rank, customTitle: title }),
    });
    loadPriorities();
  };

  const handleTogglePriority = async (id: string) => {
    await fetch(`/api/daily/priorities/${id}/toggle`, { method: 'PATCH' });
    loadPriorities();
  };

  const handleGenerateStandup = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/daily/standup', { method: 'POST' });
      const data = await res.json();
      setStandupMarkdown(data.data.rawMarkdown);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyStandup = () => {
    if (!standupMarkdown) return;
    navigator.clipboard.writeText(standupMarkdown);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const progressPercent = ((25 * 60 - seconds) / (25 * 60)) * 100;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {completedNotification && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Focus block completed! 25 minutes recorded to the Universal Activity Bus.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Top 3 Rocks & Standup Generator */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top 3 Priorities */}
          <div className="card-linear p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" />
                <span>Today&apos;s Focus & Top 3 Daily Rocks</span>
              </h3>
              <span className="text-[10px] font-mono text-surface-500">Essential Intentions</span>
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((rank) => {
                const priorityItem = priorities.find((p) => p.rank === rank);
                const isCompleted = priorityItem?.isCompleted || false;

                return (
                  <div
                    key={rank}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/20 opacity-80'
                        : 'bg-surface-850/60 border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <button
                      onClick={() => priorityItem && handleTogglePriority(priorityItem.id)}
                      disabled={!priorityItem}
                      className={`h-6 w-6 rounded-lg border flex items-center justify-center font-mono text-xs font-bold transition-all shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-400 text-black shadow-glow-sm'
                          : 'bg-surface-800 border-white/10 text-surface-400 hover:text-white'
                      }`}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : rank}
                    </button>

                    <input
                      type="text"
                      value={rocks[rank] || ''}
                      onChange={(e) => setRocks({ ...rocks, [rank]: e.target.value })}
                      onBlur={() => handleSaveRock(rank as 1 | 2 | 3)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveRock(rank as 1 | 2 | 3)}
                      placeholder={`Set Priority #${rank}...`}
                      className={`flex-1 bg-transparent border-0 text-xs text-white placeholder-surface-500 focus:outline-none ${
                        isCompleted ? 'line-through text-emerald-300' : ''
                      }`}
                    />

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-800 text-surface-500">
                      {isCompleted ? 'Completed' : 'Active'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Standup Generator */}
          <div className="card-linear p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-brand-400" />
                  <span>Automated Grounded Standup Generator</span>
                </h3>
                <p className="text-xs text-surface-400">
                  Aggregates real commits, completed tasks, and solved DSA from SQLite
                </p>
              </div>

              <div className="flex items-center gap-2">
                {standupMarkdown && (
                  <button
                    onClick={handleCopyStandup}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 border border-white/[0.08] text-xs font-medium transition-all"
                  >
                    {copySuccess ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
                  </button>
                )}
                <button
                  onClick={handleGenerateStandup}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{isGenerating ? 'Compiling...' : 'Generate Standup'}</span>
                </button>
              </div>
            </div>

            {standupMarkdown ? (
              <div className="p-4 rounded-xl bg-surface-950 border border-white/[0.08] font-mono text-xs text-surface-200 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {standupMarkdown}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-surface-500 font-mono border border-dashed border-white/[0.06] rounded-xl">
                Click &ldquo;Generate Standup&rdquo; to pull real telemetry data from yesterday and today.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pomodoro Focus Engine */}
        <div className="space-y-6">
          <div className="card-linear p-6 flex flex-col items-center justify-center text-center space-y-5">
            <div className="flex items-center gap-2 text-xs font-mono font-medium text-surface-400 uppercase tracking-wider">
              <Clock className="h-4 w-4 text-brand-400" />
              <span>Pomodoro Deep Work</span>
            </div>

            {/* Circular Timer Display */}
            <div className="relative h-44 w-44 rounded-full bg-surface-950 border-4 border-surface-800 flex items-center justify-center shadow-inner">
              <div
                className="absolute inset-0 rounded-full border-4 border-brand-500 transition-all duration-1000"
                style={{
                  clipPath: `polygon(50% 50%, 50% 0%, ${progressPercent}% 0%, ${progressPercent}% 100%, 0% 100%, 0% 0%)`,
                }}
              />
              <div className="text-4xl font-mono font-bold text-white tracking-tighter">
                {formatTime(seconds)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTimer}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-lg transition-all ${
                  isActive
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30'
                }`}
              >
                {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isActive ? 'Pause' : 'Start Focus'}</span>
              </button>

              <button
                onClick={resetTimer}
                className="p-2.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-400 hover:text-white border border-white/[0.08] transition-all"
                title="Reset Timer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[11px] text-surface-500 font-mono">
              25m sprint • Completed blocks automatically persist to activity timeline
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
