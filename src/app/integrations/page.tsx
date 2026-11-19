'use client';

import { useState, useEffect } from 'react';
import type { UserIntegration } from '@/types';
import {
  GitBranch,
  Code2,
  Calendar,
  Webhook,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Key,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<UserIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // GitHub state
  const [githubIdentifier, setGithubIdentifier] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubSyncing, setGithubSyncing] = useState(false);
  const [githubResult, setGithubResult] = useState<string | null>(null);

  // LeetCode state
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [leetcodeSyncing, setLeetcodeSyncing] = useState(false);
  const [leetcodeResult, setLeetcodeResult] = useState<string | null>(null);

  const loadIntegrations = async () => {
    try {
      const res = await fetch('/api/integrations');
      const data = await res.json();
      const list: UserIntegration[] = data.data || [];
      setIntegrations(list);

      const gh = list.find((i) => i.provider === 'github');
      if (gh) {
        setGithubIdentifier(gh.accountIdentifier);
      }

      const lc = list.find((i) => i.provider === 'leetcode');
      if (lc) {
        setLeetcodeUsername(lc.accountIdentifier);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntegrations();
  }, []);

  const handleSaveAndSyncGitHub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubIdentifier.trim()) return;
    setGithubSyncing(true);
    setGithubResult(null);

    try {
      // 1. Save Integration
      await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'github',
          accountIdentifier: githubIdentifier.trim(),
          accessToken: githubToken.trim() || undefined,
        }),
      });

      // 2. Trigger Sync
      const syncRes = await fetch('/api/integrations/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: githubIdentifier.trim(),
          token: githubToken.trim() || undefined,
        }),
      });
      const syncData = await syncRes.json();

      if (syncData.success) {
        setGithubResult(
          `✓ Successfully synced ${syncData.data.reposSynced} repos, ${syncData.data.commitsSynced} commits, and ${syncData.data.prsSynced} PRs directly into DevOS SQLite!`
        );
      } else {
        setGithubResult(`⚠️ Sync completed with message: ${syncData.error}`);
      }
      loadIntegrations();
    } catch (err: unknown) {
      setGithubResult(`Sync status: ${(err as Error).message}`);
    } finally {
      setGithubSyncing(false);
    }
  };

  const handleSaveAndSyncLeetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leetcodeUsername.trim()) return;
    setLeetcodeSyncing(true);
    setLeetcodeResult(null);

    try {
      // 1. Save Integration
      await fetch('/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'leetcode',
          accountIdentifier: leetcodeUsername.trim(),
        }),
      });

      // 2. Trigger Sync
      const syncRes = await fetch('/api/integrations/leetcode/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: leetcodeUsername.trim() }),
      });
      const syncData = await syncRes.json();

      if (syncData.success) {
        setLeetcodeResult(
          `✓ Verified profile @${syncData.data.username}: ${syncData.data.totalSolved} solved (${syncData.data.easySolved}E / ${syncData.data.mediumSolved}M / ${syncData.data.hardSolved}H). Updated ${syncData.data.problemsUpdated} roadmap problems!`
        );
      } else {
        setLeetcodeResult(`Status: ${syncData.error}`);
      }
      loadIntegrations();
    } catch (err: unknown) {
      setLeetcodeResult(`Sync status: ${(err as Error).message}`);
    } finally {
      setLeetcodeSyncing(false);
    }
  };

  const copyWebhookUrl = () => {
    const url = `${window.location.origin}/api/integrations/github/webhook`;
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const ghIntegration = integrations.find((i) => i.provider === 'github');
  const lcIntegration = integrations.find((i) => i.provider === 'leetcode');

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>3rd-Party Integrations & Webhook Hub</span>
          </h2>
          <p className="text-xs text-surface-400">
            Connect live GitHub repositories, pull requests, LeetCode profiles, and incoming event webhooks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="pill-badge bg-emerald-500/10 text-emerald-300 border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Tokens Stored Locally & Masked</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Card 1: GitHub Integration */}
        <div className="card-linear p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">GitHub Integration</h3>
                <p className="text-xs text-surface-400">Repos, commits, pull request queue & webhooks</p>
              </div>
            </div>
            {ghIntegration ? (
              <span className="pill-badge bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Connected
              </span>
            ) : (
              <span className="pill-badge bg-surface-800 text-surface-400 border-white/[0.05]">
                Not Configured
              </span>
            )}
          </div>

          <form onSubmit={handleSaveAndSyncGitHub} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-surface-400 flex items-center justify-between">
                <span>GitHub Username or Organization</span>
                <span className="text-surface-500 text-[10px]">Public or Authenticated</span>
              </label>
              <input
                type="text"
                value={githubIdentifier}
                onChange={(e) => setGithubIdentifier(e.target.value)}
                placeholder="e.g. torvalds or your-username"
                required
                className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-surface-400 flex items-center justify-between">
                <span>Personal Access Token (PAT)</span>
                <span className="text-surface-500 text-[10px]">Optional (for private repos & rate limits)</span>
              </label>
              <div className="relative">
                <Key className="h-3.5 w-3.5 text-surface-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_... or github_pat_..."
                  className="w-full pl-9 pr-3 py-2 bg-surface-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 font-mono"
                />
              </div>
              <p className="text-[10px] text-surface-500 font-mono pt-0.5">
                Requires <code className="text-purple-300">repo</code> and <code className="text-purple-300">read:user</code> scopes.
              </p>
            </div>

            <button
              type="submit"
              disabled={githubSyncing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${githubSyncing ? 'animate-spin' : ''}`} />
              <span>{githubSyncing ? 'Connecting & Syncing...' : 'Save & Sync Live Repos'}</span>
            </button>
          </form>

          {githubResult && (
            <div className="p-3.5 rounded-xl bg-surface-950 border border-white/[0.08] text-xs font-mono text-purple-200 leading-relaxed">
              {githubResult}
            </div>
          )}

          {/* Webhook Endpoint Box */}
          <div className="pt-3 border-t border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-surface-400 font-semibold flex items-center gap-1.5">
                <Webhook className="h-3.5 w-3.5 text-purple-400" />
                <span>Inbound GitHub Webhook URL</span>
              </span>
              <button
                onClick={copyWebhookUrl}
                className="flex items-center gap-1 text-[11px] font-mono text-purple-400 hover:text-purple-300"
              >
                {copiedWebhook ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedWebhook ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-950 border border-white/[0.06] text-[11px] font-mono text-surface-400 select-all truncate">
              /api/integrations/github/webhook
            </div>
            <p className="text-[10px] text-surface-500 font-mono">
              Add to your GitHub repo settings (Payload URL, application/json, push & pull_request events).
            </p>
          </div>
        </div>

        {/* Card 2: LeetCode Integration */}
        <div className="card-linear p-6 space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Code2 className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">LeetCode GraphQL Integration</h3>
                <p className="text-xs text-surface-400">Live solved counts & NeetCode 150 status sync</p>
              </div>
            </div>
            {lcIntegration ? (
              <span className="pill-badge bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Connected
              </span>
            ) : (
              <span className="pill-badge bg-surface-800 text-surface-400 border-white/[0.05]">
                Not Configured
              </span>
            )}
          </div>

          <form onSubmit={handleSaveAndSyncLeetCode} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-surface-400 flex items-center justify-between">
                <span>LeetCode Public Username</span>
                <span className="text-surface-500 text-[10px]">No password required</span>
              </label>
              <input
                type="text"
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                placeholder="e.g. neal_wu or your-handle"
                required
                className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 font-mono"
              />
              <p className="text-[10px] text-surface-500 font-mono pt-0.5">
                Uses LeetCode&apos;s official public GraphQL profile endpoint (<code className="text-amber-300">leetcode.com/graphql</code>).
              </p>
            </div>

            <button
              type="submit"
              disabled={leetcodeSyncing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-lg shadow-amber-600/25 transition-all disabled:opacity-50"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${leetcodeSyncing ? 'animate-spin' : ''}`} />
              <span>{leetcodeSyncing ? 'Querying LeetCode GraphQL...' : 'Save & Sync LeetCode Profile'}</span>
            </button>
          </form>

          {leetcodeResult && (
            <div className="p-3.5 rounded-xl bg-surface-950 border border-white/[0.08] text-xs font-mono text-amber-200 leading-relaxed">
              {leetcodeResult}
            </div>
          )}

          {/* Sync Rules Breakdown */}
          <div className="pt-3 border-t border-white/[0.06] space-y-2">
            <h4 className="text-xs font-mono text-surface-400 font-semibold">
              Automatic Sync Rules:
            </h4>
            <ul className="text-[11px] font-mono text-surface-400 space-y-1.5 list-disc list-inside">
              <li>Pulls total solved problems and breakdowns (Easy, Medium, Hard).</li>
              <li>Matches recent Accepted submissions against your NeetCode 150 matrix.</li>
              <li>Automatically marks matched problems solved and sets spaced-repetition schedules.</li>
              <li>Logs events directly to your 60-day contribution heatmap.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
