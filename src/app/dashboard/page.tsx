import {
  taskService,
  projectService,
  githubService,
  dsaService,
  heatmapService,
  activityBus,
  dailyService,
  integrationService,
  authService,
} from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';
import { cookies } from 'next/headers';
import Link from 'next/link';
import {
  Flame,
  CheckCircle2,
  GitPullRequest,
  ListTodo,
  ArrowRight,
  Activity,
  Target,
  Sparkles,
  GitCommit,
  Code2,
  Calendar,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10);

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('devos_session')?.value;
  const currentUser = sessionToken ? authService.validateSession(sessionToken) : null;
  const userId = currentUser?.id || DEFAULT_USER_ID;

  const [
    tasks,
    projects,
    prs,
    dsaStats,
    heatmap,
    priorities,
    recentActivities,
    integrations,
  ] = await Promise.all([
    taskService.getTasks(userId),
    projectService.getProjects(userId),
    githubService.getPullRequests(userId),
    dsaService.getStats(userId),
    heatmapService.getHeatmap(userId, 35),
    dailyService.getDailyPriorities(userId, today),
    activityBus.getRecentActivities(userId, 6),
    integrationService.getIntegrations(userId),
  ]);

  const ghIntegration = integrations.find((i) => i.provider === 'github' && i.status === 'connected');

  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const completedToday = tasks.filter((t) => t.status === 'completed').length;
  const openPRs = prs.filter((p) => p.state === 'open').length;

  const getHeatmapColor = (cnt: number) => {
    if (cnt === 0) return 'bg-surface-850 border border-white/[0.04]';
    if (cnt <= 2) return 'bg-brand-950 border border-brand-800/60 text-brand-400';
    if (cnt <= 4) return 'bg-brand-800/80 border border-brand-600/70 text-brand-200';
    if (cnt <= 7) return 'bg-brand-600 border border-brand-400 text-white';
    return 'bg-emerald-500 border border-emerald-400 text-white shadow-glow-sm';
  };

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'github':
        return <GitCommit className="h-3.5 w-3.5 text-purple-400" />;
      case 'dsa':
        return <Code2 className="h-3.5 w-3.5 text-emerald-400" />;
      case 'tasks':
        return <ListTodo className="h-3.5 w-3.5 text-blue-400" />;
      case 'daily':
        return <Calendar className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <Activity className="h-3.5 w-3.5 text-brand-400" />;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-surface-900 via-surface-900 to-surface-850 border border-white/[0.07] shadow-specular">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-medium text-emerald-400 uppercase tracking-wider">
              System Health 100% • All Systems Operational
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Welcome back, Lead Engineer
          </h1>
          <p className="text-xs text-surface-400 max-w-xl">
            You have <span className="text-brand-300 font-medium">{inProgressTasks} active tickets</span> in flight,{' '}
            <span className="text-purple-300 font-medium">{openPRs} pending PRs</span> awaiting review, and a{' '}
            <span className="text-amber-300 font-medium">{heatmap.currentStreak}-day continuous streak</span>.
            {dsaStats.leetcode?.connected && (
              <span className="block mt-1 text-[11px] text-emerald-400 font-mono">
                ⚡ LeetCode verified: @{dsaStats.leetcode.username} with {dsaStats.leetcode.totalSolved} AC solutions ({dsaStats.leetcode.easySolved}E • {dsaStats.leetcode.mediumSolved}M • {dsaStats.leetcode.hardSolved}H)
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/daily"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 border border-white/[0.08] text-xs font-medium transition-all shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            <span>Generate Standup</span>
          </Link>
          <Link
            href="/tasks"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
          >
            <span>Open Kanban</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Row (Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Card */}
        <div className="card-linear p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-400">Activity Streak</span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Flame className="h-4 w-4 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono tracking-tight">
              🔥 {heatmap.currentStreak} Days
            </div>
            <p className="text-[11px] text-amber-400/90 font-medium mt-0.5">
              Longest: {heatmap.longestStreak} days
            </p>
          </div>
          <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: `${Math.min(100, (heatmap.currentStreak / 30) * 100)}%` }} />
          </div>
        </div>

        {/* LeetCode Practice Card */}
        <Link href="/dsa" className="card-linear p-4 space-y-3 block hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-400 group-hover:text-emerald-400 transition-colors">
              {dsaStats.leetcode?.connected ? 'LeetCode Profile' : 'LeetCode Practice'}
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div>
            {dsaStats.leetcode?.connected ? (
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white font-mono tracking-tight">
                    {dsaStats.leetcode.totalSolved}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold truncate">
                    @{dsaStats.leetcode.username}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono mt-1">
                  <span className="text-emerald-400 font-semibold">{dsaStats.leetcode.easySolved}E</span>
                  <span className="text-surface-600">•</span>
                  <span className="text-amber-400 font-semibold">{dsaStats.leetcode.mediumSolved}M</span>
                  <span className="text-surface-600">•</span>
                  <span className="text-rose-400 font-semibold">{dsaStats.leetcode.hardSolved}H</span>
                  <span className="text-surface-400 ml-auto font-mono text-[9px]">
                    {dsaStats.solved}/{dsaStats.total} tracked
                  </span>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-2xl font-bold text-white font-mono tracking-tight">
                  {dsaStats.solved} <span className="text-sm font-normal text-surface-500">/ {dsaStats.total}</span>
                </div>
                <p className="text-[11px] text-emerald-400/90 font-medium mt-0.5">
                  {dsaStats.masteryPercentage}% Problems Solved
                </p>
              </div>
            )}
          </div>
          <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${dsaStats.masteryPercentage}%` }} />
          </div>
        </Link>

        {/* Pull Requests Card */}
        <Link href="/github" className="card-linear p-4 space-y-3 block hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-400 group-hover:text-purple-400 transition-colors">
              {ghIntegration ? 'GitHub Synced' : 'Open Pull Requests'}
            </span>
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <GitPullRequest className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono tracking-tight">
              {openPRs} <span className="text-sm font-normal text-surface-500">In Review</span>
            </div>
            <p className="text-[11px] text-purple-400/90 font-medium mt-0.5">
              {ghIntegration ? `@${ghIntegration.accountIdentifier} • ` : ''}{prs.length} monitored PRs
            </p>
          </div>
          <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: `${openPRs > 0 ? 60 : 10}%` }} />
          </div>
        </Link>

        {/* Tasks Card */}
        <div className="card-linear p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-400">Active Sprint Tasks</span>
            <div className="h-7 w-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <ListTodo className="h-4 w-4 text-brand-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono tracking-tight">
              {inProgressTasks} <span className="text-sm font-normal text-surface-500">In Progress</span>
            </div>
            <p className="text-[11px] text-brand-400/90 font-medium mt-0.5">
              {completedToday} completed tickets
            </p>
          </div>
          <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-blue-500 rounded-full" style={{ width: `${Math.min(100, (completedToday / Math.max(1, tasks.length)) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* 35-Day Heatmap Strip */}
      <div className="card-linear p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-brand-400" />
            <h3 className="text-xs font-semibold text-white tracking-tight">
              35-Day Cross-Domain Activity Heatstrip
            </h3>
          </div>
          <Link
            href="/analytics"
            className="text-[11px] font-mono text-brand-400 hover:text-brand-300 flex items-center gap-1"
          >
            <span>Full 60-Day Matrix</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 pt-1">
          {heatmap.contributions.slice(-35).map((day) => (
            <div key={day.date} className="flex flex-col items-center gap-1 group relative">
              <div
                className={`h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-mono font-bold transition-all group-hover:scale-110 cursor-pointer ${getHeatmapColor(
                  day.count
                )}`}
              >
                {day.count > 0 ? day.count : ''}
              </div>
              <span className="text-[9px] text-surface-500 font-mono hidden md:block">
                {day.date.slice(8)}
              </span>

              {/* Tooltip */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col z-20 px-2.5 py-1.5 rounded-lg bg-surface-950 border border-white/10 text-[10px] font-mono whitespace-nowrap shadow-xl">
                <span className="font-bold text-white">{day.date}</span>
                <span className="text-brand-300">{day.count} activities</span>
                <span className="text-surface-400">
                  {day.breakdown.tasks} tasks • {day.breakdown.github} git • {day.breakdown.dsa} dsa
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Today's Priorities + Projects Hub + Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Today's Rocks + Active Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Priorities (Daily Rocks) */}
          <div className="card-linear p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Today&apos;s Focus & Daily Rocks</h3>
              </div>
              <Link
                href="/daily"
                className="text-xs text-surface-400 hover:text-surface-200 flex items-center gap-1 font-mono"
              >
                <span>Manage Rocks</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {priorities.length === 0 ? (
                <div className="py-6 text-center text-xs text-surface-500 font-mono">
                  No daily rocks scheduled for today. Head to My Day to set your Top 3.
                </div>
              ) : (
                priorities.map((rock) => (
                  <div
                    key={rock.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      rock.isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300 line-through opacity-75'
                        : 'bg-surface-850/60 border-white/[0.05] text-surface-200 hover:border-white/[0.1]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-5 w-5 rounded-md bg-surface-800 border border-white/10 flex items-center justify-center font-mono text-[10px] text-surface-400 font-bold">
                        #{rock.rank}
                      </span>
                      <span className="text-xs font-medium">{rock.customTitle || 'Priority Task'}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-800 text-surface-400 border border-white/[0.05]">
                      {rock.isCompleted ? 'Done' : 'Pending'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Projects Hub */}
          <div className="card-linear p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span>Active Workspaces & Projects</span>
              </h3>
              <Link
                href="/projects"
                className="text-xs text-surface-400 hover:text-surface-200 flex items-center gap-1 font-mono"
              >
                <span>View All ({projects.length})</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.slice(0, 4).map((proj) => (
                <div
                  key={proj.id}
                  className="p-3.5 rounded-xl bg-surface-850/50 border border-white/[0.06] hover:border-brand-500/30 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{proj.name}</h4>
                      <p className="text-[11px] text-surface-400 line-clamp-1">{proj.description}</p>
                    </div>
                    <span className="pill-badge bg-brand-500/10 text-brand-300 border-brand-500/20">
                      {proj.category}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-surface-400">
                      <span>Progress</span>
                      <span className="font-bold text-surface-200">{proj.progressPercentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${proj.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.techStack.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-800 text-surface-400 border border-white/[0.04]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Universal Activity Stream */}
        <div className="space-y-6">
          <div className="card-linear p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-brand-400" />
                <h3 className="text-sm font-semibold text-white">Live Activity Stream</h3>
              </div>
              <Link
                href="/activities"
                className="text-xs text-surface-400 hover:text-surface-200 font-mono flex items-center gap-1"
              >
                <span>Journal</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl bg-surface-850/40 border border-white/[0.04] hover:bg-surface-850 transition-colors"
                >
                  <div className="h-7 w-7 rounded-lg bg-surface-800 border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                    {getDomainIcon(act.sourceDomain)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-surface-200 truncate">{act.title}</p>
                    {act.description && (
                      <p className="text-[11px] text-surface-400 truncate">{act.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.2 rounded bg-surface-800 text-surface-400 border border-white/[0.04]">
                        {act.sourceDomain}
                      </span>
                      <span className="text-[10px] font-mono text-surface-500">
                        {new Date(act.occurredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
