'use client';

import { useState } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Tag,
  Calendar,
  Clock,
  ArrowRight,
  Database,
  Bot,
  User,
  Zap,
  Shield,
  Layers,
  Code2,
  CheckSquare,
  GitBranch,
  Briefcase,
  Wrench,
  LayoutDashboard,
} from 'lucide-react';
import { DEVOS_SUBAGENTS, type DevOSSubagent } from '@/domain/subagents-catalog';
import type { ParsedTask } from '@/domain/ai-assistant-service';
import { MarkdownView } from '@/components/MarkdownView';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  agentId: string;
  text: string;
  citations?: Array<{ entity: string; id: string; title: string }>;
  timestamp: string;
}

const iconMap: Record<string, any> = {
  LayoutDashboard,
  CheckSquare,
  Code2,
  GitBranch,
  Clock,
  Layers,
  Briefcase,
  Wrench,
};

export default function AssistantPage() {
  const [selectedAgent, setSelectedAgent] = useState<DevOSSubagent>(DEVOS_SUBAGENTS[0]);

  // Natural Language Task Scaffolder State
  const [nlInput, setNlInput] = useState('Build SQLite WAL checkpoint background daemon priority:critical #backend #sqlite');
  const [parsedResult, setParsedResult] = useState<ParsedTask | null>(null);
  const [createdFeedback, setCreatedFeedback] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Chat Assistant State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      agentId: 'dashboard_agent',
      text: `### DevOS Multi-Agent Autonomous Network Active ⚡\n\nI am connected to your local SQLite event bus. You can consult any of our **8 domain subagents** for deterministic answers grounded in your actual data:\n\n- **Dashboard Agent**: Telemetry, consistency & 35-day streaks\n- **Task Kanban Agent**: WIP balancing, backlog breakdown & estimates\n- **LeetCode Tutor Agent**: Complexity proofs (Big-O) & spaced repetition\n- **Code Review Agent**: PR audit & conventional commit formatting\n- **Daily Standup Agent**: Grounded 3-part Markdown reports\n- **Architecture Agent**: System ADRs & Mermaid diagrams\n- **Career Coach Agent**: STAR behavioral story bank & interview rounds\n- **Offline Toolbox Agent**: Cryptographic guarantees & JWT claim inspection`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [queryInput, setQueryInput] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);

  // NL Task Parser Handler
  const handleParseTask = async (autoCreate: boolean = false) => {
    if (!nlInput.trim()) return;
    setIsParsing(true);
    setCreatedFeedback(null);

    try {
      const res = await fetch('/api/ai/parse-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: nlInput, autoCreate }),
      });
      const data = await res.json();
      setParsedResult(data.data.parsed);

      if (autoCreate && data.data.createdTask) {
        setCreatedFeedback(`✓ Created task "${data.data.createdTask.title}" and pushed to Kanban!`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsParsing(false);
    }
  };

  // Chat Query Handler
  const handleSendQuery = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || isQuerying) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      agentId: selectedAgent.id,
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQueryInput('');
    setIsQuerying(true);

    try {
      const res = await fetch('/api/ai/subagents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgent.id, query: q }),
      });
      const data = await res.json();

      if (data.success && data.data) {
        const assistantMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          agentId: selectedAgent.id,
          text: data.data.answerMarkdown,
          citations: data.data.citations,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          agentId: selectedAgent.id,
          text: `⚠️ Query failed: ${data.error || 'Unable to query SQLite telemetry'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          agentId: selectedAgent.id,
          text: `⚠️ Network error: ${err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsQuerying(false);
    }
  };

  const SelectedIcon = iconMap[selectedAgent.iconName] || Bot;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-surface-900 border border-white/[0.08] shadow-specular">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-glow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Domain Subagent Orchestration Hub</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                8 Subagents Active
              </span>
            </h1>
            <p className="text-xs text-surface-400 mt-0.5">
              Zero-hallucination domain agents grounded directly in your local SQLite event bus.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-surface-400">
          <Database className="h-4 w-4 text-emerald-400" />
          <span>SQLite WAL Memory Grounded</span>
        </div>
      </div>

      {/* Subagent Switcher Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
            Select Active Subagent:
          </span>
          <span className="text-[11px] text-surface-400">
            Current: <strong className="text-white">{selectedAgent.name}</strong> ({selectedAgent.role})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {DEVOS_SUBAGENTS.map((agent) => {
            const Icon = iconMap[agent.iconName] || Bot;
            const isSelected = selectedAgent.id === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-surface-850 border-brand-500 shadow-glow-sm ring-1 ring-brand-500/50'
                    : 'bg-surface-900 border-white/[0.06] hover:bg-surface-850 hover:border-white/[0.12]'
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white mb-1.5 shadow-sm`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-white truncate w-full">
                  {agent.name.replace(' Agent', '').replace(' Specialist', '')}
                </span>
                <span className="text-[10px] text-surface-400 font-mono capitalize">
                  {agent.domain}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Subagent Skills Card */}
      <div className="p-4 rounded-2xl bg-surface-900 border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${selectedAgent.gradient} flex items-center justify-center text-white shrink-0`}>
            <SelectedIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">{selectedAgent.name}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-surface-300">
                {selectedAgent.role}
              </span>
            </div>
            <p className="text-xs text-surface-400 mt-0.5">{selectedAgent.description}</p>
          </div>
        </div>

        {/* Predefined Skills Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {selectedAgent.skills.map((skill) => (
            <span
              key={skill.id}
              title={skill.description}
              className="px-2.5 py-1 rounded-xl bg-surface-950 border border-white/[0.08] text-[11px] font-mono text-surface-300"
            >
              ✓ {skill.name}
            </span>
          ))}
        </div>
      </div>

      {/* Main Grounded Chat Window */}
      <div className="rounded-3xl bg-surface-900 border border-white/[0.08] shadow-specular flex flex-col h-[520px] overflow-hidden">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            const agentForMsg = DEVOS_SUBAGENTS.find((a) => a.id === m.agentId) || selectedAgent;
            const MsgIcon = iconMap[agentForMsg.iconName] || Bot;

            return (
              <div key={m.id} className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className={`h-7 w-7 rounded-xl bg-gradient-to-br ${agentForMsg.gradient} flex items-center justify-center text-white shrink-0 mt-0.5`}>
                    <MsgIcon className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] p-4 rounded-2xl leading-relaxed whitespace-pre-wrap text-xs font-sans ${
                    isUser
                      ? 'bg-brand-600 text-white font-medium'
                      : 'bg-surface-950 border border-white/[0.08] text-surface-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-surface-400 mb-1 font-mono">
                    <span>{isUser ? 'You' : agentForMsg.name}</span>
                    <span>{m.timestamp}</span>
                  </div>

                  <div className="mt-1">
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{m.text}</div>
                    ) : (
                      <MarkdownView content={m.text} />
                    )}
                  </div>

                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/[0.08] flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-surface-500 font-mono w-full">Verified Citations:</span>
                      {m.citations.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-brand-500/10 text-brand-300 border border-brand-500/20 text-[10px] font-mono"
                        >
                          #{c.entity}: {c.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {isUser && (
                  <div className="h-7 w-7 rounded-xl bg-surface-700 flex items-center justify-center text-white shrink-0 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}
          {isQuerying && (
            <div className="flex items-center gap-2 text-xs text-brand-400 font-mono animate-pulse">
              <Sparkles className="h-4 w-4" />
              <span>{selectedAgent.name} querying local SQLite event bus...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-5 py-2.5 bg-surface-950/70 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-mono text-surface-500 shrink-0 font-semibold">
            {selectedAgent.name.split(' ')[0]} Prompts:
          </span>
          {selectedAgent.samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSendQuery(p)}
              className="px-3 py-1 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white border border-white/[0.06] text-xs whitespace-nowrap transition cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery(queryInput);
          }}
          className="p-3 border-t border-white/[0.08] bg-surface-950 flex items-center gap-2"
        >
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder={`Ask ${selectedAgent.name} about your ${selectedAgent.domain} telemetry...`}
            className="flex-1 px-4 py-2.5 rounded-2xl bg-surface-900 border border-white/[0.08] text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 font-sans"
          />
          <button
            type="submit"
            disabled={isQuerying || !queryInput.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold shadow-glow-sm transition cursor-pointer"
          >
            <span>Send</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* Deterministic NL Task Scaffolder Section */}
      <div className="p-6 rounded-3xl bg-surface-900 border border-white/[0.08] shadow-specular space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Deterministic Natural-Language Task Scaffolder
            </h3>
            <p className="text-xs text-surface-400">
              Type naturally with priority tags (e.g. <code className="text-amber-300 font-mono">!critical</code>), hashtags (<code className="text-brand-300 font-mono">#backend</code>), and dates.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={nlInput}
            onChange={(e) => setNlInput(e.target.value)}
            placeholder="Type e.g.: Finish Redis rate limiter by Friday priority:high #backend"
            className="flex-1 px-4 py-2.5 rounded-2xl bg-surface-950 border border-white/[0.08] text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 font-sans"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleParseTask(false)}
              disabled={isParsing}
              className="px-4 py-2.5 rounded-2xl bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-semibold border border-white/[0.08] transition cursor-pointer"
            >
              Parse Only
            </button>
            <button
              onClick={() => handleParseTask(true)}
              disabled={isParsing}
              className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm transition cursor-pointer"
            >
              Parse & Push to Kanban
            </button>
          </div>
        </div>

        {createdFeedback && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{createdFeedback}</span>
          </div>
        )}

        {parsedResult && (
          <div className="p-4 rounded-2xl bg-surface-950 border border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-surface-500 font-mono text-[10px] block">Title</span>
              <span className="text-white font-semibold">{parsedResult.title}</span>
            </div>
            <div>
              <span className="text-surface-500 font-mono text-[10px] block">Priority</span>
              <span className="font-mono text-amber-400 uppercase font-bold">{parsedResult.priority}</span>
            </div>
            <div>
              <span className="text-surface-500 font-mono text-[10px] block">Due Date</span>
              <span className="font-mono text-surface-300">{parsedResult.dueDate || 'Unset'}</span>
            </div>
            <div>
              <span className="text-surface-500 font-mono text-[10px] block">Tags & Estimate</span>
              <span className="font-mono text-brand-300">{parsedResult.tags.join(', ') || 'None'} (~{parsedResult.estimatedMinutes}m)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
