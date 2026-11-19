'use client';

import { useState, useEffect } from 'react';
import { DomainCopilot } from '@/components/DomainCopilot';
import type { ArchitectureDecision, ADRStatus } from '@/types';
import {
  Layers,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCode,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';

export default function ArchitecturePage() {
  const [adrs, setAdrs] = useState<ArchitectureDecision[]>([]);
  const [selectedAdr, setSelectedAdr] = useState<ArchitectureDecision | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<ADRStatus>('accepted');
  const [context, setContext] = useState('');
  const [decision, setDecision] = useState('');
  const [consequences, setConsequences] = useState('');
  const [mermaidDiagram, setMermaidDiagram] = useState('');

  const loadAdrs = async () => {
    try {
      const res = await fetch('/api/architecture/adrs');
      const data = await res.json();
      const list = data.data || [];
      setAdrs(list);
      if (list.length > 0 && !selectedAdr) {
        setSelectedAdr(list[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAdrs();
  }, []);

  const handleCreateAdr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !context.trim() || !decision.trim() || !consequences.trim()) return;

    await fetch('/api/architecture/adrs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        status,
        context,
        decision,
        consequences,
        mermaidDiagram: mermaidDiagram.trim() || null,
      }),
    });

    setTitle('');
    setContext('');
    setDecision('');
    setConsequences('');
    setMermaidDiagram('');
    setShowModal(false);
    loadAdrs();
  };

  const filteredAdrs = adrs.filter((a) => {
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.decision.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.context.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusPill = (st: ADRStatus) => {
    switch (st) {
      case 'accepted':
        return <span className="pill-badge bg-emerald-500/15 text-emerald-300 border-emerald-500/30">Accepted</span>;
      case 'proposed':
        return <span className="pill-badge bg-amber-500/15 text-amber-300 border-amber-500/30">Proposed</span>;
      case 'deprecated':
        return <span className="pill-badge bg-rose-500/15 text-rose-300 border-rose-500/30">Deprecated</span>;
      case 'superseded':
        return <span className="pill-badge bg-surface-800 text-surface-400 border-white/[0.05]">Superseded</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Architecture Decision Records (ADRs)</span>
          </h2>
          <p className="text-xs text-surface-400">
            Immutable architectural log capturing context, trade-offs, schemas and system invariants
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DomainCopilot agentId="architecture_agent" triggerLabel="Ask Architecture Agent" />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New ADR</span>
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Col (5 spans): ADR Index & Search */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-surface-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search decisions, context, consequences..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-900 border border-white/[0.08] text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 font-sans"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {['all', 'accepted', 'proposed', 'deprecated'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-[10px] font-mono capitalize transition-all ${
                  filterStatus === st
                    ? 'bg-brand-600 text-white font-bold'
                    : 'bg-surface-900 text-surface-400 hover:text-white border border-white/[0.05]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredAdrs.map((adr) => {
              const isSelected = selectedAdr?.id === adr.id;
              return (
                <div
                  key={adr.id}
                  onClick={() => setSelectedAdr(adr)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-brand-500/10 border-brand-500/30 shadow-sm'
                      : 'bg-surface-900/60 border-white/[0.05] hover:bg-surface-850 hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-brand-400">
                      ADR-{String(adr.adrNumber).padStart(3, '0')}
                    </span>
                    {getStatusPill(adr.status)}
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-1">
                    {adr.title}
                  </h4>

                  <p className="text-[11px] text-surface-400 line-clamp-2 leading-relaxed">
                    {adr.decision}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-surface-500 pt-1">
                    <span>{new Date(adr.createdAt).toLocaleDateString()}</span>
                    {adr.mermaidDiagram && (
                      <span className="text-purple-400 flex items-center gap-1">
                        <FileCode className="h-3 w-3" /> Diagram
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col (7 spans): Selected ADR Full Reader */}
        <div className="lg:col-span-7 card-linear p-6 space-y-5 min-h-[500px]">
          {selectedAdr ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-white/[0.06]">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-brand-400">
                      ADR-{String(selectedAdr.adrNumber).padStart(3, '0')}
                    </span>
                    {getStatusPill(selectedAdr.status)}
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {selectedAdr.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono text-surface-500">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Recorded on {new Date(selectedAdr.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Context */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-surface-400 font-bold">
                  1. Context & Problem Statement
                </h4>
                <div className="p-3.5 rounded-xl bg-surface-950/70 border border-white/[0.04] text-xs text-surface-300 leading-relaxed whitespace-pre-wrap">
                  {selectedAdr.context}
                </div>
              </div>

              {/* Decision */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-brand-400 font-bold">
                  2. Architectural Decision
                </h4>
                <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs text-brand-200 leading-relaxed whitespace-pre-wrap font-medium">
                  {selectedAdr.decision}
                </div>
              </div>

              {/* Consequences */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono uppercase tracking-wider text-surface-400 font-bold">
                  3. Consequences & Trade-Offs
                </h4>
                <div className="p-3.5 rounded-xl bg-surface-950/70 border border-white/[0.04] text-xs text-surface-300 leading-relaxed whitespace-pre-wrap">
                  {selectedAdr.consequences}
                </div>
              </div>

              {/* Mermaid Architecture Code */}
              {selectedAdr.mermaidDiagram && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1.5">
                    <FileCode className="h-3.5 w-3.5" />
                    <span>Architecture Diagram Definition</span>
                  </h4>
                  <pre className="p-3.5 rounded-xl bg-surface-950 border border-white/[0.06] font-mono text-xs text-purple-200 overflow-x-auto">
                    <code>{selectedAdr.mermaidDiagram}</code>
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-surface-500 font-mono">
              Select an ADR from the list or create a new one.
            </div>
          )}
        </div>
      </div>

      {/* New ADR Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-surface-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Create Architecture Decision Record</h3>
              <button onClick={() => setShowModal(false)} className="text-surface-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAdr} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Adopt Event-Driven Activity Bus"
                    required
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ADRStatus)}
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="accepted">Accepted</option>
                    <option value="proposed">Proposed</option>
                    <option value="deprecated">Deprecated</option>
                    <option value="superseded">Superseded</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-surface-400">Context & Motivation</label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={2}
                  required
                  placeholder="What forces, business requirements or architectural challenges prompted this decision?"
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-brand-400 font-bold">Decision</label>
                <textarea
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  rows={2}
                  required
                  placeholder="What is the explicit design choice, invariant, or technology selection?"
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-surface-400">Consequences & Trade-offs</label>
                <textarea
                  value={consequences}
                  onChange={(e) => setConsequences(e.target.value)}
                  rows={2}
                  required
                  placeholder="What are the positive outcomes and negative trade-offs of this decision?"
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-purple-400">Mermaid Diagram Definition (Optional)</label>
                <textarea
                  value={mermaidDiagram}
                  onChange={(e) => setMermaidDiagram(e.target.value)}
                  rows={2}
                  placeholder="graph LR&#10;  A[Client] --> B[Service]"
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl p-2.5 font-mono text-xs text-white focus:outline-none focus:border-brand-500"
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
                  Save ADR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
