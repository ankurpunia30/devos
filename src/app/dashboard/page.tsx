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
import { DomainCopilot } from '@/components/DomainCopilot';
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
  FolderGit2,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  Terminal,
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
  const criticalTasks = tasks.filter((t) => (t.priority === 'critical' || t.status === 'blocked') && t.status !== 'completed').length;
  const openPRs = prs.filter((p) => p.state === 'open').length;

  const getHeatmapColor = (cnt: number) => {
    if (cnt === 0) return 'bg-white/[0.03] border border-white/[0.04] text-surface-600';
    if (cnt <= 2) return 'bg-brand-950/80 border border-brand-800/40 text-brand-400';
    if (cnt <= 4) return 'bg-brand-800/70 border border-brand-600/50 text-brand-200';
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
      {/* 1. Executive Mission Control Banner */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-[#121318] via-[#15161d] to-[#121318] border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-mono font-medium text-emerald-400 uppercase tracking-widest">
                SQLite WAL • Zero Cloud Leakage • 100% Grounded
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{currentUser?.name || 'Lead Engineer'}’s Engineering Cockpit</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-white/[0.06] text-surface-400 border border-white/[0.06]">
                Tier-1 Focus
              </span>
            </h1>

            <p className="text-xs text-surface-400 max-w-2xl leading-relaxed">
              Sprint backlog is tracking <span className="text-white font-medium">{inProgressTasks} active tickets</span>,{' '}
              <span className="text-purple-300 font-medium">{openPRs} pending pull requests</span> awaiting review, and{' '}
              <span className="text-amber-300 font-medium">{heatmap.currentStreak}-day continuous engineering streak</span>.
              {criticalTasks > 0 ? (
                <span className="text-rose-400 font-semibold ml-1.5 inline-flex items-center gap-1">
                  ⚠️ {criticalTasks} blocker/critical priority ticket(s) active
                </span>
              ) : (
                <span className="text-emerald-400 ml-1.5">✓ Backlog clear of critical blockers</span>
              )}
            </p>
          </div>

          {/* Quick Action Dock */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <DomainCopilot agentId="dashboard_agent" triggerLabel="Audit Dashboard" />
            
            <Link
              href="/daily"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-850 hover:bg-surface-800 text-surface-200 border border-white/[0.08] text-xs font-medium transition active:scale-[0.98]"
            >
              <Sparkles className="h-3.5 w-3.5 text-brand-400" />
              <span>Grounded Standup</span>
            </Link>

            <Link
              href="/tasks"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-surface-100 text-surface-950 text-xs font-semibold shadow-sm transition active:scale-[0.98]"
            >
              <ListTodo className="h-3.5 w-3.5" />
              <span>Sprint Kanban</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Linear-Grade 4-Metric Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Sprint Velocity */}
        <Link href="/tasks" className="card-linear p-4 space-y-3 block hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-400 group-hover:text-surface-200 transition-colors">
              Sprint Backlog & Velocity
            </span>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <ListTodo className="h-4 w-4 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono tracking-tight flex items-baseline gap-2">
              <span>{inProgressTasks}</span>
              <span className="text-xs font-normal text-surface-500 font-sans">in flight</span>
            </div>
            <p className="text-[11px] text-surface-400 font-mono mt-0.5">
              {completedToday} done today • {tasks.length} total sprint tickets
            </p>
          </div>
          <div className="h-1.5 w-full bg-surface-850 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (completedToday / Math.max(1, tasks.length)) * 100)}%` }}
            />
          </div>
        </Link>

        {/* Metric 2: GitHub & Code Review */}
        <Link href="/github" className="card-linear p-4 space-y-3 block hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-400 group-hover:text-purple-300 transition-colors">
              {ghIntegration ? 'GitHub Live Sync' : 'Code Review Queue'}
            </span>
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <GitPullRequest className="h-4 w-4 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono tracking-tight flex items-baseline gap-2">
              <span>{openPRs}</span>
              <span className="text-xs font-normal text-purple-400 font-sans">PRs in review</span>
            </div>
            <p className="text-[11px] text-purple-300/80 font-mono mt-0.5 truncate">
              {ghIntegration ? `@${ghIntegration.accountIdentifier}` : 'Live review stream'} • {prs.length} total PRs
            </p>
          </div>
          <div className="h-1.5 w-full bg-surface-850 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${openPRs > 0 ? 70 : 15}%` }}
            />
          </div>
        </Link>

        {/* Metric 3: Algorithmic Retention (DSA) */}
        <Link href="/dsa" className="card-linear p-4 space-y-3 block hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-400 group-hover:text-emerald-300 transition-colors">
              Algorithms & Spaced Repetition
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Code2 className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono tracking-tight flex items-baseline gap-2">
              <span>{dsaStats.leetcode?.connected ? dsaStats.leetcode.totalSolved : dsaStats.solved}</span>
              <span className="text-xs font-normal text-surface-500 font-sans">
                {dsaStats.leetcode?.connected ? 'LeetCode AC' : `/ ${dsaStats.total} solved`}
              </span>
            </div>
            <p className="text-[11px] text-emerald-400/90 font-mono mt-0.5">
              {dsaStats.leetcode?.connected
                ? `${dsaStats.leetcode.easySolved}E • ${dsaStats.leetcode.mediumSolved}M • ${dsaStats.leetcode.hardSolved}H`
                : `${dsaStats.masteryPercentage}% catalog mastery`}
            </p>
          </div>
          <div className="h-1.5 w-full bg-surface-850 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${dsaStats.masteryPercentage}%` }}
            />
          </div>
        </Link>

        {/* Metric 4: Continuous Engineering Streak */}
        <Link href="/analytics" className="card-linear p-4 space-y-3 block hover:border-amber-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-400 group-hover:text-amber-300 transition-colors">
              Engineering Streak
            </span>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Flame className="h-4 w-4 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white font-mono tracking-tight flex items-baseline gap-2">
              <span>🔥 {heatmap.currentStreak}</span>
              <span className="text-xs font-normal text-surface-500 font-sans">Days active</span>
            </div>
            <p className="text-[11px] text-amber-400/90 font-mono mt-0.5">
              Longest streak: {heatmap.longestStreak} days
            </p>
          </div>
          <div className="h-1.5 w-full bg-surface-850 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (heatmap.currentStreak / 30) * 100)}%` }}
            />
          </div>
        </Link>
      </div>

      {/* 3. 35-Day Universal Heatstrip (Clean, Monochromatic to High-Signal) */}
      <div className="card-linear p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-brand-400" />
            <h3 className="text-xs font-semibold text-white tracking-tight">
              35-Day Multi-Domain Engineering Heatstrip
            </h3>
          </div>
          <Link
            href="/analytics"
            className="text-[11px] font-mono text-surface-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>Full 60-Day Matrix</span>
            <ChevronRight className="h-3 w-3" />
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

              {/* Instant Telemetry Tooltip */}
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col z-20 px-2.5 py-1.5 rounded-lg bg-surface-950 border border-white/10 text-[10px] font-mono whitespace-nowrap shadow-xl">
                <span className="font-bold text-white">{day.date}</span>
                <span className="text-brand-300">{day.count} activities logged</span>
                <span className="text-surface-400">
                  {day.breakdown.tasks} tasks • {day.breakdown.github} git • {day.breakdown.dsa} dsa
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Strategic 2-Column Core Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Today's Rocks + Openable Workspaces */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Daily 3 Rocks */}
          <div className="card-linear p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Daily Focus & Strategic Rocks</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Rule of 3
                </span>
              </div>
              <Link
                href="/daily"
                className="text-xs text-surface-400 hover:text-surface-200 flex items-center gap-1 font-mono transition-colors"
              >
                <span>Edit Rocks</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2">
              {priorities.length === 0 ? (
                <div className="py-6 text-center text-xs text-surface-500 font-mono border border-dashed border-white/[0.06] rounded-xl">
                  No rocks scheduled for today. Set your Top 3 in <Link href="/daily" className="text-brand-400 underline">Today & Rituals</Link>.
                </div>
              ) : (
                priorities.map((rock) => (
                  <div
                    key={rock.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      rock.isCompleted
                        ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300 line-through opacity-75'
                        : 'bg-surface-850/50 border-white/[0.05] text-surface-200 hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-5 w-5 rounded-md bg-surface-800 border border-white/10 flex items-center justify-center font-mono text-[10px] text-surface-400 font-bold">
                        #{rock.rank}
                      </span>
                      <span className="text-xs font-medium">{rock.customTitle || 'Priority Objective'}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-800 text-surface-400 border border-white/[0.05]">
                      {rock.isCompleted ? '✓ Done' : 'In Progress'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Connected Workspaces & Codebases (Interactive Openable Workspaces) */}
          <div className="card-linear p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-4 w-4 text-brand-400" />
                <h3 className="text-sm font-semibold text-white">Project Workspaces & Repositories</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.06] text-surface-400">
                  {projects.length} Total
                </span>
              </div>
              <Link
                href="/projects"
                className="text-xs text-surface-400 hover:text-white flex items-center gap-1 font-mono transition-colors"
              >
                <span>All Workspaces</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {projects.slice(0, 4).map((proj) => (
                <Link
                  key={proj.id}
                  href={`/projects/${proj.id}`}
                  className="p-4 rounded-xl bg-surface-850/40 border border-white/[0.06] hover:border-white/20 hover:bg-surface-850 transition-all space-y-3 block group cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors flex items-center gap-1.5">
                        <span>{proj.name}</span>
                        <ChevronRight className="h-3 w-3 text-surface-500 group-hover:text-white transition-colors" />
                      </h4>
                      <p className="text-[11px] text-surface-400 line-clamp-1 mt-0.5">
                        {proj.description || 'Active engineering workspace'}
                      </p>
                    </div>
                    <span className="pill-badge bg-white/[0.06] text-surface-300 border-white/[0.08] font-mono text-[9px]">
                      {proj.category}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-surface-400">
                      <span>Milestone Progress</span>
                      <span className="font-bold text-surface-200">{proj.progressPercentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full transition-all"
                        style={{ width: `${proj.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-surface-400 border-t border-white/[0.04]">
                    <div className="flex items-center gap-1">
                      <GitCommit className="h-3 w-3 text-surface-500" />
                      <span>{proj.techStack?.[0] || 'TypeScript'}</span>
                    </div>
                    <span className="text-brand-400 group-hover:underline">
                      Open Cockpit →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Live Activity Journal + Instant Grounded Actions */}
        <div className="space-y-6">
          {/* Executive Grounded Copilot Dock */}
          <div className="card-linear p-5 space-y-3.5 bg-gradient-to-b from-[#14151b] to-[#101115]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <h3 className="text-xs font-semibold text-white">Grounded DB Copilot</h3>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                0% Hallucination
              </span>
            </div>

            <p className="text-[11px] text-surface-400 leading-relaxed">
              Every query is dynamically executed across your SQLite WAL database without cloud leakage.
            </p>

            <div className="space-y-1.5 pt-1">
              <Link
                href="/assistant?q=What are my blockers and critical priorities?"
                className="flex items-center justify-between p-2 rounded-lg bg-surface-900/60 border border-white/[0.05] hover:border-white/15 text-xs text-surface-300 hover:text-white transition"
              >
                <span>🔴 Current Blockers & Criticals</span>
                <ChevronRight className="h-3 w-3 text-surface-500" />
              </Link>
              <Link
                href="/assistant?q=What did I accomplish yesterday?"
                className="flex items-center justify-between p-2 rounded-lg bg-surface-900/60 border border-white/[0.05] hover:border-white/15 text-xs text-surface-300 hover:text-white transition"
              >
                <span>⚡ Yesterday's Verified Work</span>
                <ChevronRight className="h-3 w-3 text-surface-500" />
              </Link>
              <Link
                href="/assistant?q=What architecture decisions have we made?"
                className="flex items-center justify-between p-2 rounded-lg bg-surface-900/60 border border-white/[0.05] hover:border-white/15 text-xs text-surface-300 hover:text-white transition"
              >
                <span>🏛️ Active ADR Architecture</span>
                <ChevronRight className="h-3 w-3 text-surface-500" />
              </Link>
            </div>
          </div>

          {/* Live Activity Stream */}
          <div className="card-linear p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-brand-400" />
                <h3 className="text-xs font-semibold text-white">Live Activity Journal</h3>
              </div>
              <Link
                href="/activities"
                className="text-[10px] text-surface-400 hover:text-surface-200 font-mono flex items-center gap-1 transition-colors"
              >
                <span>Full Stream</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl bg-surface-850/30 border border-white/[0.04] hover:bg-surface-850 transition-colors"
                >
                  <div className="h-6 w-6 rounded-md bg-surface-800 border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                    {getDomainIcon(act.sourceDomain)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-surface-200 truncate">{act.title}</p>
                    {act.description && (
                      <p className="text-[11px] text-surface-400 truncate">{act.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-mono uppercase tracking-wider px-1 py-0.2 rounded bg-surface-800 text-surface-400 border border-white/[0.04]">
                        {act.sourceDomain}
                      </span>
                      <span className="text-[9px] font-mono text-surface-500">
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
