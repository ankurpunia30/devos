import { heatmapService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';
import { Flame, Award, Zap, BarChart3, GitCommit, CheckSquare, Code2, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const heatmap = heatmapService.getHeatmap(DEFAULT_USER_ID, 60);

  const getColor = (cnt: number) => {
    if (cnt === 0) return 'bg-surface-850 border border-white/[0.04] text-surface-600';
    if (cnt <= 2) return 'bg-brand-950 border border-brand-800/60 text-brand-400';
    if (cnt <= 4) return 'bg-brand-800/80 border border-brand-600/70 text-brand-200';
    if (cnt <= 7) return 'bg-brand-600 border border-brand-400 text-white';
    return 'bg-emerald-500 border border-emerald-400 text-white shadow-glow-sm';
  };

  const domainTotals = heatmap.contributions.reduce(
    (acc, day) => {
      acc.tasks += day.breakdown.tasks;
      acc.github += day.breakdown.github;
      acc.dsa += day.breakdown.dsa;
      acc.daily += day.breakdown.daily;
      return acc;
    },
    { tasks: 0, github: 0, dsa: 0, daily: 0 }
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card-linear p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-surface-400 font-medium">
            <span>Current Continuous Streak</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <h3 className="text-3xl font-bold text-amber-400 font-mono tracking-tight">
            🔥 {heatmap.currentStreak} Days
          </h3>
          <p className="text-[11px] text-surface-500 font-mono">Verified daily activity consistency</p>
        </div>

        <div className="card-linear p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-surface-400 font-medium">
            <span>Longest Streak Record</span>
            <Award className="h-4 w-4 text-emerald-400" />
          </div>
          <h3 className="text-3xl font-bold text-emerald-400 font-mono tracking-tight">
            🏆 {heatmap.longestStreak} Days
          </h3>
          <p className="text-[11px] text-surface-500 font-mono">All-time personal benchmark</p>
        </div>

        <div className="card-linear p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-surface-400 font-medium">
            <span>Total Logged Activities</span>
            <Zap className="h-4 w-4 text-brand-400" />
          </div>
          <h3 className="text-3xl font-bold text-brand-400 font-mono tracking-tight">
            ⚡ {heatmap.totalContributions}
          </h3>
          <p className="text-[11px] text-surface-500 font-mono">Last 60 days across all domains</p>
        </div>
      </div>

      {/* 60-Day Heatmap Grid */}
      <div className="card-linear p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-400" />
            <span>60-Day Multi-Domain Contribution Heatmap</span>
          </h3>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-surface-400">
            <span>Less</span>
            <span className="h-3 w-3 rounded-sm bg-surface-850 border border-white/[0.04]" />
            <span className="h-3 w-3 rounded-sm bg-brand-950 border border-brand-800" />
            <span className="h-3 w-3 rounded-sm bg-brand-800 border border-brand-600" />
            <span className="h-3 w-3 rounded-sm bg-brand-600 border border-brand-400" />
            <span className="h-3 w-3 rounded-sm bg-emerald-500 border border-emerald-400" />
            <span>More</span>
          </div>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 gap-2 pt-2">
          {heatmap.contributions.map((day) => (
            <div
              key={day.date}
              className={`h-11 rounded-xl p-1.5 flex flex-col justify-between transition-all hover:scale-105 cursor-pointer ${getColor(
                day.count
              )}`}
              title={`${day.date}: ${day.count} activities (${day.breakdown.tasks} tasks, ${day.breakdown.github} git, ${day.breakdown.dsa} dsa, ${day.breakdown.daily} daily)`}
            >
              <div className="text-[9px] font-mono leading-none opacity-75">
                {day.date.slice(5)}
              </div>
              <div className="text-right text-[11px] font-bold font-mono">
                {day.count > 0 ? day.count : '·'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Domain Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-linear p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <CheckSquare className="h-4 w-4 text-blue-400" />
            <span>Task Kanban</span>
          </div>
          <div className="text-xl font-bold font-mono text-blue-400">{domainTotals.tasks} events</div>
          <p className="text-[10px] font-mono text-surface-500">Completed & updated sprint tickets</p>
        </div>

        <div className="card-linear p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <GitCommit className="h-4 w-4 text-purple-400" />
            <span>GitHub Sync</span>
          </div>
          <div className="text-xl font-bold font-mono text-purple-400">{domainTotals.github} events</div>
          <p className="text-[10px] font-mono text-surface-500">Commits, PR reviews & repo events</p>
        </div>

        <div className="card-linear p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Code2 className="h-4 w-4 text-emerald-400" />
            <span>DSA Mastery</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">{domainTotals.dsa} events</div>
          <p className="text-[10px] font-mono text-surface-500">NeetCode solves & scheduled revisions</p>
        </div>

        <div className="card-linear p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <Calendar className="h-4 w-4 text-amber-400" />
            <span>Daily Focus</span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-400">{domainTotals.daily} events</div>
          <p className="text-[10px] font-mono text-surface-500">Pomodoros & standup runs</p>
        </div>
      </div>
    </div>
  );
}
