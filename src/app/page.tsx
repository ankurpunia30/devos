import {
  taskService,
  projectService,
  githubService,
  dsaService,
  heatmapService,
  activityBus,
  dailyService,
} from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';
import Link from 'next/link';
import { Flame, CheckCircle2, GitPullRequest, ListTodo, ArrowRight, Activity, Target } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [
    tasks,
    projects,
    prs,
    dsaStats,
    heatmap,
    priorities,
    recentActivities,
  ] = await Promise.all([
    taskService.getTasks(DEFAULT_USER_ID),
    projectService.getProjects(DEFAULT_USER_ID),
    githubService.getPullRequests(DEFAULT_USER_ID),
    dsaService.getStats(DEFAULT_USER_ID),
    heatmapService.getHeatmap(DEFAULT_USER_ID, 30),
    dailyService.getDailyPriorities(DEFAULT_USER_ID, today),
    activityBus.getRecentActivities(DEFAULT_USER_ID, 8),
  ]);

  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completedToday = tasks.filter((t) => t.status === 'completed').length;
  const openPRs = prs.filter((p) => p.state === 'open').length;

  const getColor = (cnt: number) => {
    if (cnt === 0) return 'bg-slate-900 border border-slate-800/80';
    if (cnt <= 2) return 'bg-indigo-950 border border-indigo-900';
    if (cnt <= 4) return 'bg-indigo-700 border border-indigo-600';
    if (cnt <= 7) return 'bg-indigo-500 border border-indigo-400';
    return 'bg-emerald-400 border border-emerald-300';
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Executive Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400">Consolidated overview of developer life and active telemetry</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ● Next.js 15 SSR Active
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Daily Streak</span>
            <Flame className="h-4 w-4 text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mt-1 font-mono">
            🔥 {heatmap.currentStreak} Days
          </h3>
          <p className="text-[11px] text-amber-400 mt-1">Cross-module consistency</p>
        </div>

        <div className="p-4 rounded-xl bg-surface-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">NeetCode Mastery</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mt-1 font-mono">
            {dsaStats.solved}/{dsaStats.total}
          </h3>
          <p className="text-[11px] text-emerald-400 mt-1">{dsaStats.masteryPercentage}% Curriculum Mastered</p>
        </div>

        <div className="p-4 rounded-xl bg-surface-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Open Pull Requests</span>
            <GitPullRequest className="h-4 w-4 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mt-1 font-mono">
            {openPRs}
          </h3>
          <p className="text-[11px] text-indigo-400 mt-1">Awaiting review</p>
        </div>

        <div className="p-4 rounded-xl bg-surface-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Sprint Tasks</span>
            <ListTodo className="h-4 w-4 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mt-1 font-mono">
            {inProgressTasks} In Flight
          </h3>
          <p className="text-[11px] text-purple-400 mt-1">{completedToday} completed today</p>
        </div>
      </div>

      {/* Heatmap Strip */}
      <div className="p-5 rounded-xl bg-surface-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Flame className="h-4 w-4 text-amber-400" />
            <span>30-Day Contribution Heatmap</span>
          </h3>
          <Link href="/analytics" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            <span>Deep Analytics</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex gap-1.5 overflow-x-auto py-1">
          {heatmap.contributions.map((c) => (
            <div
              key={c.date}
              className={`h-5 w-5 rounded-sm ${getColor(c.count)} flex-shrink-0 transition-transform hover:scale-110`}
              title={`${c.date}: ${c.count} contributions`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Top 3 Priorities */}
          <div className="p-5 rounded-xl bg-surface-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-400" />
                <span>Today's Top 3 Priorities</span>
              </h3>
              <Link href="/daily" className="text-xs text-indigo-400 hover:text-indigo-300">
                Manage ➔
              </Link>
            </div>
            <div className="space-y-2.5">
              {[1, 2, 3].map((rank) => {
                const item = priorities.find((p) => p.rank === rank);
                const title = item ? item.customTitle : `Set daily priority #${rank}`;
                const isDone = item && item.isCompleted;
                return (
                  <div
                    key={rank}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="h-5 w-5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-xs flex items-center justify-center font-bold">
                        {rank}
                      </span>
                      <span className={`text-xs ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                        {title}
                      </span>
                    </div>
                    {item && (
                      <span
                        className={`px-2 py-0.5 text-[10px] rounded font-mono ${
                          isDone
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isDone ? 'COMPLETED' : 'IN PROGRESS'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Projects */}
          <div className="p-5 rounded-xl bg-surface-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>🚀</span>
                <span>Active Projects</span>
              </h3>
              <Link href="/projects" className="text-xs text-indigo-400 hover:text-indigo-300">
                All Projects ➔
              </Link>
            </div>
            <div className="space-y-4">
              {projects.slice(0, 3).map((p) => (
                <div key={p.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-200">{p.name}</span>
                    <span className="font-mono text-indigo-400">{p.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${p.progressPercentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="p-5 rounded-xl bg-surface-900 border border-slate-800 space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>Live Activity Feed</span>
            </h3>
            <span className="text-[10px] font-mono text-slate-500">REALTIME</span>
          </div>
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
            {recentActivities.map((a) => (
              <div key={a.id} className="flex items-start space-x-3 text-xs p-2 rounded hover:bg-slate-800/40 transition">
                <div
                  className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${
                    a.eventType.includes('completed') || a.eventType.includes('solved')
                      ? 'bg-emerald-400'
                      : a.eventType.includes('created') || a.eventType.includes('opened')
                      ? 'bg-indigo-400'
                      : 'bg-slate-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-slate-200 font-medium truncate">{a.title}</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {new Date(a.occurredAt).toLocaleTimeString()} • {a.sourceDomain}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
