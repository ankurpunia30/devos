import { githubService, integrationService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';
import { DomainCopilot } from '@/components/DomainCopilot';
import {
  GitBranch,
  GitPullRequest,
  Star,
  AlertCircle,
  ExternalLink,
  GitCommit,
  CheckCircle2,
  Clock,
  Plus,
  RotateCcw,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function GitHubPage() {
  const [repos, prs, commits, ghIntegration] = await Promise.all([
    githubService.getRepositories(DEFAULT_USER_ID),
    githubService.getPullRequests(DEFAULT_USER_ID),
    githubService.getRecentCommits(DEFAULT_USER_ID, 12),
    integrationService.getIntegration(DEFAULT_USER_ID, 'github'),
  ]);

  const getReviewStatusPill = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="pill-badge bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Approved
          </span>
        );
      case 'changes_requested':
        return (
          <span className="pill-badge bg-rose-500/15 text-rose-300 border-rose-500/30">
            <AlertCircle className="h-3 w-3 text-rose-400" /> Changes Requested
          </span>
        );
      default:
        return (
          <span className="pill-badge bg-amber-500/15 text-amber-300 border-amber-500/30">
            <Clock className="h-3 w-3 text-amber-400" /> Review Pending
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>GitHub Repositories & PR Review Hub</span>
          </h2>
          <p className="text-xs text-surface-400">
            Live synchronization with GitHub API v3, open review queues & webhook automation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DomainCopilot agentId="github_agent" triggerLabel="Ask Code Review Agent" />
          <Link
            href="/integrations"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Configure / Sync GitHub</span>
          </Link>
        </div>
      </div>

      {ghIntegration && ghIntegration.status === 'connected' ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-surface-900 via-surface-900 to-purple-950/20 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Connected GitHub Profile:</span>
                <span className="text-xs font-mono font-semibold text-purple-300">@{ghIntegration.accountIdentifier}</span>
                <span className="pill-badge bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px]">
                  Active Telemetry
                </span>
              </div>
              <p className="text-[11px] text-surface-400">
                Last synced: {ghIntegration.lastSyncedAt ? new Date(ghIntegration.lastSyncedAt).toLocaleString() : 'Just now'} • Webhooks & API v3 polling active
              </p>
            </div>
          </div>
          <Link
            href="/integrations"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-xs font-semibold transition-all self-start sm:self-auto"
          >
            <span>Manage Token / Webhooks</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-linear p-4 space-y-1">
          <span className="text-xs font-medium text-surface-400">Connected Repositories</span>
          <div className="text-2xl font-bold text-white font-mono">{repos.length}</div>
          <p className="text-[11px] text-surface-500 font-mono">Synced with local SQLite</p>
        </div>

        <div className="card-linear p-4 space-y-1">
          <span className="text-xs font-medium text-surface-400">Open PRs In Flight</span>
          <div className="text-2xl font-bold text-purple-400 font-mono">
            {prs.filter((p) => p.state === 'open').length}
          </div>
          <p className="text-[11px] text-purple-400/80 font-mono">Awaiting code review</p>
        </div>

        <div className="card-linear p-4 space-y-1">
          <span className="text-xs font-medium text-surface-400">Recent Commits</span>
          <div className="text-2xl font-bold text-brand-400 font-mono">{commits.length}</div>
          <p className="text-[11px] text-brand-400/80 font-mono">Recorded in telemetry bus</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Repos & PR Review Queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Repositories */}
          <div className="card-linear p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-purple-400" />
                <span>Connected Repositories</span>
              </h3>
            </div>

            <div className="space-y-3">
              {repos.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-xl bg-surface-850/60 border border-white/[0.06] hover:border-white/[0.12] transition-all flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={r.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-white hover:text-brand-300 font-mono flex items-center gap-1.5 transition-colors"
                      >
                        <span>{r.fullName}</span>
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                      <span className="text-[9px] px-2 py-0.2 rounded-full bg-surface-800 border border-white/[0.05] text-surface-400 font-mono">
                        {r.defaultBranch}
                      </span>
                    </div>
                    <p className="text-xs text-surface-400 line-clamp-1">{r.description || 'No description'}</p>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-surface-400 shrink-0">
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400" />
                      <span>{r.stargazersCount}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 text-surface-500" />
                      <span>{r.openIssuesCount} issues</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pull Request Queue */}
          <div className="card-linear p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitPullRequest className="h-4 w-4 text-brand-400" />
              <span>Pull Request Review Queue</span>
            </h3>

            <div className="space-y-3">
              {prs.length === 0 ? (
                <div className="py-8 text-center text-xs text-surface-500 font-mono">
                  No pull requests currently open.
                </div>
              ) : (
                prs.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-surface-850/60 border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-surface-500 font-bold">
                          #{p.number}
                        </span>
                        <a
                          href={p.htmlUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-white hover:text-brand-300 transition-colors"
                        >
                          {p.title}
                        </a>
                      </div>
                      <p className="text-[11px] text-surface-400 font-mono">
                        by @{p.authorLogin}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {getReviewStatusPill(p.reviewStatus)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Recent Commits Stream */}
        <div className="space-y-6">
          <div className="card-linear p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitCommit className="h-4 w-4 text-purple-400" />
              <span>Commit Telemetry</span>
            </h3>

            <div className="space-y-3">
              {commits.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-surface-850/40 border border-white/[0.04] space-y-1.5"
                >
                  <p className="text-xs font-medium text-surface-200 line-clamp-2 leading-snug">
                    {c.message}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-surface-500 pt-1">
                    <span className="px-1.5 py-0.2 rounded bg-surface-800 text-brand-300 border border-white/[0.05]">
                      {c.sha.slice(0, 7)}
                    </span>
                    <span>{new Date(c.committedAt).toLocaleDateString()}</span>
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
