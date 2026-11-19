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
} from 'lucide-react';
import type { ParsedTask } from '@/domain/ai-assistant-service';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations?: Array<{ entity: string; id: string; title: string }>;
  timestamp: string;
}

export default function AssistantPage() {
  // Natural Language Task Scaffolder State
  const [nlInput, setNlInput] = useState('Remind me to complete Redis caching implementation by Friday priority:high #backend #caching');
  const [parsedResult, setParsedResult] = useState<ParsedTask | null>(null);
  const [createdFeedback, setCreatedFeedback] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  // Chat Assistant State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `### DevOS Grounded Intelligence Active ⚡\n\nI am connected directly to your local SQLite event bus with zero hallucinations. I can query:\n- **Recent telemetry & accomplishments** across tasks, Git, and DSA\n- **Active sprint blockers & critical priority tickets**\n- **Architecture Decision Records (ADRs)**\n- **Career & interview pipeline status**\n\nAsk a question below or click a quick prompt!`,
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
    if (!q) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQueryInput('');
    setIsQuerying(true);

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();

      const assistantMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.data.answerMarkdown,
        citations: data.data.citations,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsQuerying(false);
    }
  };

  const quickPrompts = [
    'What did I accomplish yesterday?',
    'What are my current blockers and critical priorities?',
    'What architecture decisions (ADRs) have we recorded?',
    'What is my career and interview pipeline status?',
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Contextual AI & Grounded Intelligence</span>
          </h2>
          <p className="text-xs text-surface-400">
            Deterministic natural-language task extraction and zero-hallucination SQLite telemetry Q&A
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="pill-badge bg-brand-500/10 text-brand-300 border-brand-500/20">
            ● Strict Entity Citation Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 spans): Natural Language Task Extraction Lab */}
        <div className="lg:col-span-5 card-linear p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-400" />
              <span>Natural-Language Task Scaffolder</span>
            </h3>
            <span className="text-[10px] font-mono text-surface-500">Regex & Entity Extractor</span>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-mono text-surface-400">
              Speak or type natural command:
            </label>
            <textarea
              value={nlInput}
              onChange={(e) => setNlInput(e.target.value)}
              rows={3}
              placeholder="e.g. Remind me to finish Redis caching by Friday priority:high #backend"
              className="w-full bg-surface-950 border border-white/[0.08] rounded-xl p-3 font-sans text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleParseTask(false)}
              disabled={isParsing}
              className="flex-1 px-3 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 border border-white/[0.08] text-xs font-medium transition-all"
            >
              Parse Entities
            </button>
            <button
              onClick={() => handleParseTask(true)}
              disabled={isParsing}
              className="flex-1 px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Parse & Create Task</span>
            </button>
          </div>

          {createdFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span>{createdFeedback}</span>
            </div>
          )}

          {/* Parsed Structure Preview */}
          {parsedResult && (
            <div className="p-4 rounded-xl bg-surface-950 border border-white/[0.08] space-y-2.5 font-mono text-xs">
              <span className="text-[10px] uppercase tracking-wider text-brand-400 font-bold">
                Structured Entity Representation
              </span>
              <div className="space-y-1.5 pt-1 text-surface-300">
                <div className="flex justify-between">
                  <span className="text-surface-500">Title:</span>
                  <span className="text-white font-medium text-right font-sans">{parsedResult.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Priority:</span>
                  <span className="capitalize text-amber-400 font-bold">{parsedResult.priority}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Due Date:</span>
                  <span className="text-emerald-400 font-bold">{parsedResult.dueDate || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Tags:</span>
                  <div className="flex gap-1">
                    {parsedResult.tags.map((t) => (
                      <span key={t} className="text-brand-300">#{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (7 spans): Grounded Developer Chat */}
        <div className="lg:col-span-7 card-linear p-5 space-y-4 flex flex-col h-[600px]">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-brand-400" />
              <h3 className="text-sm font-bold text-white">Grounded Engineering Memory Q&A</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">Zero Hallucination</span>
          </div>

          {/* Quick Prompts */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
            {quickPrompts.map((p) => (
              <button
                key={p}
                onClick={() => handleSendQuery(p)}
                className="px-2.5 py-1 rounded-lg bg-surface-850 hover:bg-surface-800 text-[10px] font-mono text-surface-300 hover:text-white border border-white/[0.05] whitespace-nowrap transition-all"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className="h-7 w-7 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-brand-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                    m.sender === 'user'
                      ? 'bg-brand-600 text-white rounded-br-sm'
                      : 'bg-surface-950/80 border border-white/[0.06] text-surface-200 rounded-bl-sm font-sans whitespace-pre-wrap'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Citations */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="pt-2 border-t border-white/[0.08] space-y-1">
                      <span className="text-[10px] font-mono text-surface-500 font-bold uppercase tracking-wider">
                        Cited Database Records:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {m.citations.map((c) => (
                          <span
                            key={c.id}
                            className="text-[9px] font-mono px-2 py-0.5 rounded bg-surface-850 border border-white/[0.06] text-brand-300"
                          >
                            [{c.entity}: {c.id}]
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="text-[9px] font-mono opacity-50 text-right">{m.timestamp}</div>
                </div>

                {m.sender === 'user' && (
                  <div className="h-7 w-7 rounded-lg bg-surface-800 border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-surface-300" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Query Input Bar */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06] shrink-0">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendQuery(queryInput)}
              placeholder="Ask anything about tasks, commits, ADRs, or interviews..."
              className="flex-1 bg-surface-950 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 font-sans"
            />
            <button
              onClick={() => handleSendQuery(queryInput)}
              disabled={isQuerying || !queryInput.trim()}
              className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-glow-sm disabled:opacity-50 transition-all shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
