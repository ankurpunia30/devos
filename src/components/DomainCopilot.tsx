'use client';

import { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Zap,
  CheckCircle2,
  ChevronUp,
  MessageSquare,
} from 'lucide-react';
import { DEVOS_SUBAGENTS, type DevOSSubagent } from '@/domain/subagents-catalog';
import { MarkdownView } from './MarkdownView';

interface DomainCopilotProps {
  agentId: string;
  triggerLabel?: string;
  className?: string;
}

export function DomainCopilot({
  agentId,
  triggerLabel,
  className = '',
}: DomainCopilotProps) {
  const agent: DevOSSubagent | undefined = DEVOS_SUBAGENTS.find((a) => a.id === agentId) || DEVOS_SUBAGENTS[0];
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; citations?: any[] }>>([
    {
      sender: 'agent',
      text: `Hello! I am your **${agent.name}** (${agent.role}). I can analyze your local SQLite telemetry with zero hallucinations. Ask me anything or choose a skill prompt below!`,
    },
  ]);

  const handleSend = async (textToSend: string) => {
    const q = textToSend.trim();
    if (!q || loading) return;

    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    setQuery('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/subagents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agent.id, query: q }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'agent',
            text: data.data.answerMarkdown,
            citations: data.data.citations,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'agent', text: 'Sorry, I encountered an error querying the local database.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'agent', text: 'Network/Server connection error.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button - Clean, Distraction-Free High Craft */}
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-900 hover:bg-surface-800 text-surface-200 hover:text-white border border-white/[0.1] hover:border-white/[0.2] text-xs font-medium transition-all shadow-sm cursor-pointer active:scale-[0.98] ${className}`}
      >
        <Sparkles className="h-3.5 w-3.5 text-brand-400 shrink-0" />
        <span>{triggerLabel || `Ask ${agent.name.split(' ')[0]} Agent`}</span>
      </button>

      {/* Modal / Slide-Over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-surface-900 border border-white/[0.1] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85vh] h-[650px] overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-surface-950/80">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white shadow-sm`}>
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-tight">{agent.name}</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/30">
                      Grounded Subagent
                    </span>
                  </div>
                  <p className="text-[11px] text-surface-400">{agent.role}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/[0.08] text-surface-400 hover:text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Predefined Skills Strip */}
            <div className="px-5 py-2.5 bg-surface-950/40 border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-surface-500 font-mono text-[10px] uppercase font-semibold shrink-0">
                Skills:
              </span>
              {agent.skills.map((s) => (
                <span
                  key={s.id}
                  title={s.description}
                  className="px-2 py-0.5 rounded-lg bg-surface-800 text-surface-300 border border-white/[0.06] shrink-0 font-mono text-[10px]"
                >
                  ✓ {s.name}
                </span>
              ))}
            </div>

            {/* Conversation Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-sans">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.sender === 'agent' && (
                    <div className={`h-6 w-6 rounded-lg bg-gradient-to-br ${agent.gradient} flex items-center justify-center text-white shrink-0 mt-0.5`}>
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                      m.sender === 'user'
                        ? 'bg-brand-600 text-white font-medium whitespace-pre-wrap'
                        : 'bg-surface-950 border border-white/[0.08] text-surface-200'
                    }`}
                  >
                    {m.sender === 'user' ? m.text : <MarkdownView content={m.text} />}

                    {m.citations && m.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-white/[0.08] flex flex-wrap gap-1.5">
                        <span className="text-[10px] text-surface-500 font-mono block w-full">Verified Citations:</span>
                        {m.citations.map((c, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20 text-[10px] font-mono"
                          >
                            #{c.entity}: {c.title}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {m.sender === 'user' && (
                    <div className="h-6 w-6 rounded-lg bg-surface-700 flex items-center justify-center text-white shrink-0 mt-0.5">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-xs text-brand-400 font-mono animate-pulse">
                  <Sparkles className="h-4 w-4" />
                  <span>{agent.name} querying local SQLite event bus...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="px-5 py-2.5 bg-surface-950/60 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] text-surface-500 font-mono shrink-0">Prompts:</span>
              {agent.samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p)}
                  className="px-2.5 py-1 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white border border-white/[0.06] text-[11px] whitespace-nowrap transition cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Query Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(query);
              }}
              className="p-3 border-t border-white/[0.08] bg-surface-950 flex items-center gap-2"
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Ask ${agent.name}...`}
                className="flex-1 px-3.5 py-2 rounded-xl bg-surface-900 border border-white/[0.08] text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 font-sans"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="p-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white transition cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
