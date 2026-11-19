'use client';

import { useState, useEffect } from 'react';
import type { Deployment, DeploymentEnvironment, DeploymentStatus } from '@/types';
import {
  Rocket,
  Plus,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  GitCommit,
  Clock,
  Server,
  Layers,
  X,
  Sparkles,
} from 'lucide-react';

export default function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [environment, setEnvironment] = useState<DeploymentEnvironment>('prod');
  const [versionTag, setVersionTag] = useState('');
  const [commitSha, setCommitSha] = useState('');
  const [status, setStatus] = useState<DeploymentStatus>('healthy');
  const [rollbackPlan, setRollbackPlan] = useState('');

  const loadDeployments = async () => {
    try {
      const res = await fetch('/api/deployments');
      const data = await res.json();
      setDeployments(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeployments();
  }, []);

  const handleCreateDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionTag.trim()) return;

    await fetch('/api/deployments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        environment,
        versionTag,
        commitSha: commitSha.trim() || undefined,
        status,
        rollbackPlan: rollbackPlan.trim() || undefined,
      }),
    });

    setVersionTag('');
    setCommitSha('');
    setRollbackPlan('');
    setShowModal(false);
    loadDeployments();
  };

  const getStatusBadge = (st: DeploymentStatus) => {
    switch (st) {
      case 'healthy':
        return (
          <span className="pill-badge bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Healthy</span>
          </span>
        );
      case 'degraded':
        return (
          <span className="pill-badge bg-amber-500/15 text-amber-300 border-amber-500/30">
            <AlertTriangle className="h-3 w-3 text-amber-400" />
            <span>Degraded</span>
          </span>
        );
      case 'deploying':
        return (
          <span className="pill-badge bg-blue-500/15 text-blue-300 border-blue-500/30 animate-pulse">
            <Clock className="h-3 w-3 text-blue-400" />
            <span>Deploying</span>
          </span>
        );
      case 'down':
        return (
          <span className="pill-badge bg-rose-500/15 text-rose-300 border-rose-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            <span>Down</span>
          </span>
        );
    }
  };

  const environments: DeploymentEnvironment[] = ['prod', 'staging', 'dev', 'local'];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Environments & Deployment Telemetry</span>
          </h2>
          <p className="text-xs text-surface-400">
            Multi-stage release tracking, active version tags, and instant rollback playbooks
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
        >
          <Rocket className="h-4 w-4" />
          <span>Log Deployment</span>
        </button>
      </div>

      {/* Environment Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {environments.map((env) => {
          const envDeploy = deployments.find((d) => d.environment === env);

          return (
            <div
              key={env}
              className={`card-linear p-5 space-y-3 relative overflow-hidden ${
                env === 'prod' ? 'border-brand-500/30 shadow-glow-sm' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-surface-400">
                  {env === 'prod' ? '🚀 Production' : env === 'staging' ? '🧪 Staging' : env === 'dev' ? '🛠 Development' : '💻 Local Sandbox'}
                </span>
                {envDeploy ? (
                  getStatusBadge(envDeploy.status)
                ) : (
                  <span className="pill-badge bg-surface-800 text-surface-500 border-white/[0.04]">
                    Idle
                  </span>
                )}
              </div>

              {envDeploy ? (
                <div className="space-y-2">
                  <div>
                    <div className="text-xl font-bold text-white font-mono tracking-tight">
                      {envDeploy.versionTag}
                    </div>
                    {envDeploy.commitSha && (
                      <p className="text-[11px] font-mono text-purple-400 flex items-center gap-1 mt-0.5">
                        <GitCommit className="h-3 w-3" />
                        <span>SHA: {envDeploy.commitSha.slice(0, 7)}</span>
                      </p>
                    )}
                  </div>

                  <div className="text-[10px] font-mono text-surface-500">
                    Deployed: {new Date(envDeploy.deployedAt).toLocaleString()}
                  </div>

                  {envDeploy.rollbackPlan && (
                    <div className="p-2.5 rounded-xl bg-surface-950/80 border border-white/[0.04] space-y-1 text-[11px] font-mono">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <RotateCcw className="h-3 w-3" /> Rollback Target
                      </span>
                      <p className="text-surface-300 text-[10px] leading-relaxed line-clamp-2">
                        {envDeploy.rollbackPlan}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-surface-500 font-mono">
                  No active release logged
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Deployment History Timeline */}
      <div className="card-linear p-6 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-brand-400" />
          <span>Release Deployment Log</span>
        </h3>

        <div className="space-y-3">
          {deployments.length === 0 ? (
            <div className="py-8 text-center text-xs text-surface-500 font-mono">
              No deployments recorded.
            </div>
          ) : (
            deployments.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-xl bg-surface-850/40 border border-white/[0.04] hover:bg-surface-850 hover:border-white/[0.08] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-surface-800 text-brand-300 border border-white/[0.05]">
                      {d.environment}
                    </span>
                    <span className="text-xs font-bold text-white font-mono">{d.versionTag}</span>
                    {d.commitSha && (
                      <span className="text-[10px] font-mono text-purple-400">
                        ({d.commitSha.slice(0, 7)})
                      </span>
                    )}
                  </div>
                  {d.rollbackPlan && (
                    <p className="text-[11px] text-surface-400 font-mono">
                      Rollback: {d.rollbackPlan}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-surface-500 text-[11px]">
                    {new Date(d.deployedAt).toLocaleString()}
                  </span>
                  {getStatusBadge(d.status)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Log Deployment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-surface-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Log Release Deployment</h3>
              <button onClick={() => setShowModal(false)} className="text-surface-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeployment} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Environment</label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as DeploymentEnvironment)}
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                  >
                    <option value="prod">Production</option>
                    <option value="staging">Staging</option>
                    <option value="dev">Development</option>
                    <option value="local">Local</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Release Version Tag</label>
                  <input
                    type="text"
                    value={versionTag}
                    onChange={(e) => setVersionTag(e.target.value)}
                    placeholder="e.g. v2.1.0"
                    required
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Commit SHA</label>
                  <input
                    type="text"
                    value={commitSha}
                    onChange={(e) => setCommitSha(e.target.value)}
                    placeholder="e.g. 7f8a91b"
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Health Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DeploymentStatus)}
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500 font-mono"
                  >
                    <option value="healthy">Healthy</option>
                    <option value="deploying">Deploying</option>
                    <option value="degraded">Degraded</option>
                    <option value="down">Down</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-amber-400">Rollback Target & Playbook</label>
                <textarea
                  value={rollbackPlan}
                  onChange={(e) => setRollbackPlan(e.target.value)}
                  rows={2}
                  placeholder="Rollback target version or command: git checkout v2.0.0 && npm run build"
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl p-2.5 font-mono text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-surface-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm"
                >
                  Log Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
