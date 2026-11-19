'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DevOSLogo } from '@/components/DevOSLogo';
import {
  Terminal,
  Shield,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  GitPullRequest,
  Code2,
  Flame,
  Wrench,
  Clock,
  Layers,
  ChevronRight,
  Activity,
  Award,
  Zap,
  Lock,
  ExternalLink,
  Laptop,
  Check,
  Cpu,
  FileText,
  Workflow,
} from 'lucide-react';

export default function HomePage() {
  const [activeStoryStage, setActiveStoryStage] = useState<'standup' | 'sprint' | 'reviews' | 'architecture' | 'dsa'>('standup');

  const storyStages = [
    {
      id: 'standup',
      time: '09:15 AM',
      title: 'Morning Standup & Focus',
      discipline: 'Daily Execution',
      summary: 'Yesterday’s git commits, closed sprint tasks, and solved LeetCode problems auto-synthesized into a crisp 3-part Markdown update.',
    },
    {
      id: 'sprint',
      time: '11:00 AM',
      title: 'Deep Work Sprint',
      discipline: 'Kanban Velocity',
      summary: 'Natural language task parsing (#p:high #backend 45m). Clean keyboard-driven WIP flow without bloated Jira dropdowns.',
    },
    {
      id: 'reviews',
      time: '02:30 PM',
      title: 'Code Review & PR Queue',
      discipline: 'Engineering Quality',
      summary: 'Live GitHub pull request stream with automated semantic commit verification and static security audit checklist.',
    },
    {
      id: 'architecture',
      time: '04:45 PM',
      title: 'Architecture Decision Records',
      discipline: 'Systems Design',
      summary: 'Drafting ADRs with Michael Nygard formatting and real-time Mermaid diagrams. Eliminating ephemeral Slack consensus.',
    },
    {
      id: 'dsa',
      time: '06:45 PM',
      title: 'Continuous Algorithmic Sharpness',
      discipline: 'Interview Mastery',
      summary: 'Dynamic LeetCode matrix syncing 930+ solves. Spaced repetition engine decays problems at 3d, 7d, and 21d intervals.',
    },
  ] as const;

  return (
    <div className="min-h-screen bg-surface-950 text-surface-200 selection:bg-brand-500/20 selection:text-brand-100 flex flex-col font-sans">
      {/* Background Subtle Ambient Lighting - Calm & Monochromatic */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-brand-600/10 via-indigo-600/5 to-transparent blur-[160px] rounded-full" />
        <div className="absolute top-[1200px] right-1/4 w-[600px] h-[600px] bg-emerald-500/[0.03] blur-[180px] rounded-full" />
      </div>

      {/* Modern High-Craft Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-surface-950/85 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <DevOSLogo size={30} withText />
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs text-surface-400 font-medium">
            <a href="#story" className="hover:text-white transition">
              The Product Story
            </a>
            <a href="#narrative" className="hover:text-white transition">
              A Day in DevOS
            </a>
            <a href="#disciplines" className="hover:text-white transition">
              4 Disciplines
            </a>
            <a href="#principles" className="hover:text-white transition">
              Engineering Tenets
            </a>
            <a
              href="https://github.com/ankurpunia30/devos"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition flex items-center gap-1 font-mono text-[11px]"
            >
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-surface-300 hover:text-white hover:bg-white/[0.06] transition"
            >
              <span>Live Workspace</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-surface-100 text-surface-950 text-xs font-semibold transition active:scale-[0.98] shadow-sm"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section: The Executive Problem Statement */}
      <section className="relative z-10 pt-20 pb-16 px-6 max-w-4xl mx-auto text-center space-y-7">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-surface-400 text-[11px] font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
          <span>DevOS 2.0 • Personal Engineering Operating System</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
            Software engineering didn’t get harder because of code.{' '}
            <span className="text-surface-400 block sm:inline font-normal">
              It got harder because of cognitive fragmentation.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-surface-400 max-w-2xl mx-auto leading-relaxed">
            The modern senior engineer operates across 8+ fragmented tabs every day—Jira tickets, GitHub PRs, LeetCode algorithms, Notion ADRs, Slack standups, and sketchy web debuggers. DevOS replaces context switching with one calm, local-first cockpit.
          </p>
        </div>

        {/* Primary Call to Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-white hover:bg-surface-100 text-surface-950 font-semibold text-xs transition-all active:scale-[0.98] cursor-pointer shadow-sm"
          >
            <Lock className="h-4 w-4" />
            <span>Sign In to Your Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-surface-900 hover:bg-surface-850 text-surface-200 hover:text-white font-medium text-xs border border-white/[0.08] transition active:scale-[0.98]"
          >
            <Laptop className="h-4 w-4 text-surface-400" />
            <span>Open Workspace</span>
            <ChevronRight className="h-4 w-4 text-surface-500" />
          </Link>
        </div>

        {/* Trust & Sovereignty Guarantee */}
        <p className="text-[11px] text-surface-500 font-mono">
          Authentication strictly enforced via Email & Password. Isolated SQLite WAL persistence.
        </p>

        {/* Tenet Specs Strip */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5 text-xs text-surface-400">
          <span className="px-3 py-1 rounded-lg bg-surface-900/60 border border-white/[0.05] font-mono text-[11px]">
            ⚡ 2ms SQLite WAL Engine
          </span>
          <span className="px-3 py-1 rounded-lg bg-surface-900/60 border border-white/[0.05] font-mono text-[11px]">
            🛡️ Zero Cloud Telemetry Leakage
          </span>
          <span className="px-3 py-1 rounded-lg bg-surface-900/60 border border-white/[0.05] font-mono text-[11px]">
            🧠 8 Grounded Domain Copilots
          </span>
          <span className="px-3 py-1 rounded-lg bg-surface-900/60 border border-white/[0.05] font-mono text-[11px]">
            📈 100% Dynamic LeetCode Matrix
          </span>
        </div>
      </section>

      {/* The Product Contrast: The 8-Tab Tax vs The Unified OS */}
      <section id="story" className="relative z-10 px-6 max-w-5xl mx-auto w-full py-12">
        <div className="text-center space-y-2 mb-8">
          <p className="text-xs font-mono uppercase tracking-widest text-surface-500">The Problem & Insight</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            The Context Switching Tax of Modern Engineering
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: The Old Way (Fragmented Chaos) */}
          <div className="p-6 rounded-2xl bg-surface-900/40 border border-white/[0.06] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="text-xs font-mono text-rose-400/90 font-medium">Without DevOS: The 8-Tab Dispersal</span>
              <span className="text-[10px] font-mono text-surface-500">~23 min context reload</span>
            </div>
            <ul className="space-y-3 text-xs text-surface-400">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400/80 mt-0.5 font-bold">✕</span>
                <span><strong>Stale Standups:</strong> Manually trying to remember yesterday's work across Slack, git logs, and Jira tickets.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400/80 mt-0.5 font-bold">✕</span>
                <span><strong>Jira Bureaucracy:</strong> 15-field ticket forms that derail flow state during active sprints.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400/80 mt-0.5 font-bold">✕</span>
                <span><strong>Interview Skill Decay:</strong> Algorithmic practice neglected until 2 weeks before a big interview round.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400/80 mt-0.5 font-bold">✕</span>
                <span><strong>Ephemeral Architecture:</strong> Key systems design tradeoffs lost forever in transient Slack channel discussions.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-400/80 mt-0.5 font-bold">✕</span>
                <span><strong>Privacy Leakage:</strong> Pasting proprietary company JWTs and JSON into random online formatters.</span>
              </li>
            </ul>
          </div>

          {/* Right: The DevOS Way (Calm Cockpit) */}
          <div className="p-6 rounded-2xl bg-surface-900/90 border border-brand-500/20 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <span className="text-xs font-mono text-emerald-400 font-medium">With DevOS: Unified Engineering Cockpit</span>
              <span className="text-[10px] font-mono text-emerald-400/80">Zero Cognitive Friction</span>
            </div>
            <ul className="space-y-3 text-xs text-surface-300">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                <span><strong>Grounded Standup Generator:</strong> One click queries your local database to produce verified 3-part Markdown updates.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                <span><strong>Natural Language Task Parsing:</strong> Type <code className="text-white font-mono bg-white/[0.08] px-1 py-0.5 rounded text-[11px]">#p:high 45m</code> and immediately get structured, prioritized tickets.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                <span><strong>Year-Round Algorithmic Retention:</strong> Spaced repetition schedules (3d, 7d, 21d) linked to live LeetCode GraphQL stats.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                <span><strong>Durable Architecture ADRs:</strong> Michael Nygard-standard records with native Mermaid sequence diagrams.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                <span><strong>100% Offline Cryptographic Sandbox:</strong> JWT claim inspector, Base64 converter, and UUID generator with zero network transit.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Narrative Section: A Day in DevOS */}
      <section id="narrative" className="relative z-10 px-6 max-w-5xl mx-auto w-full py-16">
        <div className="text-center space-y-2 mb-10">
          <p className="text-xs font-mono uppercase tracking-widest text-surface-500">The Senior Engineer's Journey</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            A Day in the Life with DevOS
          </h2>
          <p className="text-xs text-surface-400 max-w-lg mx-auto">
            Experience how DevOS orchestrates your entire daily engineering cycle from morning standup to evening mastery.
          </p>
        </div>

        {/* Interactive Timeline Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {storyStages.map((stage) => {
            const isActive = activeStoryStage === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setActiveStoryStage(stage.id)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  isActive
                    ? 'bg-surface-900 border-white/[0.2] text-white shadow-sm'
                    : 'bg-surface-950/60 border-white/[0.05] text-surface-400 hover:text-surface-200 hover:bg-surface-900/40'
                }`}
              >
                <span className="text-[10px] font-mono text-brand-400 block">{stage.time}</span>
                <span className="text-xs font-semibold block mt-0.5 truncate">{stage.title}</span>
                <span className="text-[10px] text-surface-500 font-mono block mt-1">{stage.discipline}</span>
              </button>
            );
          })}
        </div>

        {/* Narrative Stage Deep-Dive Card */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-900/90 border border-white/[0.08] space-y-5">
          {activeStoryStage === 'standup' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-brand-400">09:15 AM • DAILY FOCUS & STANDUP</span>
                  <h3 className="text-base font-bold text-white">Synthesize Truth, Not Recollection</h3>
                </div>
                <span className="text-xs font-mono text-surface-500">daily_agent active</span>
              </div>
              <p className="text-xs text-surface-300 leading-relaxed">
                Standup shouldn’t require 15 minutes of digging through git logs and closed tickets. DevOS checks your local SQLite event bus and automatically formats your 3-part Markdown standup:
              </p>
              <div className="p-4 rounded-xl bg-surface-950 border border-white/[0.06] font-mono text-xs text-surface-300 space-y-2">
                <p className="text-emerald-400 font-semibold">### Yesterday Completed:</p>
                <p className="text-surface-400 pl-3">• Merged PR #42 (feat/auth): Google OAuth 2.0 flow with HTTP-only cookies</p>
                <p className="text-surface-400 pl-3">• Solved LeetCode #42: Trapping Rain Water (Two Pointers, O(1) space)</p>
                <p className="text-brand-300 font-semibold pt-1">### Today’s Top 3 Rocks:</p>
                <p className="text-surface-400 pl-3">• Refactor database schema to bundled TypeScript constants</p>
                <p className="text-surface-400 pl-3">• Benchmark SQLite WAL multi-threaded checkpoints</p>
              </div>
            </div>
          )}

          {activeStoryStage === 'sprint' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-blue-400">11:00 AM • SPRINT VELOCITY & FLOW</span>
                  <h3 className="text-base font-bold text-white">Linear-Grade Tasks without Jira Friction</h3>
                </div>
                <span className="text-xs font-mono text-surface-500">kanban_agent active</span>
              </div>
              <p className="text-xs text-surface-300 leading-relaxed">
                When you're deep in the code, context switches kill velocity. Quick-capture tasks using deterministic natural language syntax directly into your 5-column Kanban board:
              </p>
              <div className="p-4 rounded-xl bg-surface-950 border border-white/[0.06] font-mono text-xs text-surface-300 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-white font-semibold">Input: </span>
                  <span className="text-brand-300">"Implement Redis rate limiter middleware by Friday !high #backend 45m"</span>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[11px]">
                  Parsed & Pushed
                </span>
              </div>
            </div>
          )}

          {activeStoryStage === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-emerald-400">02:30 PM • CODE REVIEWS & PR AUDITS</span>
                  <h3 className="text-base font-bold text-white">Unblock Teammates & Enforce Standards</h3>
                </div>
                <span className="text-xs font-mono text-surface-500">github_agent active</span>
              </div>
              <p className="text-xs text-surface-300 leading-relaxed">
                Monitor your inbound and outbound pull requests with color-coded approvals, changes requested, and automated conventional commit verification:
              </p>
              <div className="p-3.5 rounded-xl bg-surface-950 border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <GitPullRequest className="h-4 w-4 text-emerald-400" />
                  <div>
                    <span className="text-xs font-semibold text-white block">PR #104: feat(subagents): add domain-bound copilot drawer</span>
                    <span className="text-[11px] font-mono text-surface-400">2 reviewers approved • 0 blocking changes</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                  Ready to Merge
                </span>
              </div>
            </div>
          )}

          {activeStoryStage === 'architecture' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-purple-400">04:45 PM • SYSTEMS DESIGN & ARCHITECTURE</span>
                  <h3 className="text-base font-bold text-white">Durable Decision Records that Outlast Sprints</h3>
                </div>
                <span className="text-xs font-mono text-surface-500">architecture_agent active</span>
              </div>
              <p className="text-xs text-surface-300 leading-relaxed">
                Prevent the repeat debates that plague growing engineering organizations. Structure Michael Nygard-standard ADRs with context, tradeoffs, and rendered Mermaid diagrams:
              </p>
              <div className="p-4 rounded-xl bg-surface-950 border border-white/[0.06] font-mono text-xs text-surface-300 space-y-1">
                <p className="text-white font-semibold">ADR-004: SQLite WAL Mode vs Containerized Postgres for Single-Node Workstations</p>
                <p className="text-surface-400 text-[11px]">Status: <span className="text-emerald-400">Accepted</span> • Decision Driver: Sub-2ms local latency with zero network hops</p>
              </div>
            </div>
          )}

          {activeStoryStage === 'dsa' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-amber-400">06:45 PM • CONTINUOUS ALGORITHMIC MASTERY</span>
                  <h3 className="text-base font-bold text-white">Retain Interview Edge Year-Round</h3>
                </div>
                <span className="text-xs font-mono text-surface-500">dsa_agent active</span>
              </div>
              <p className="text-xs text-surface-300 leading-relaxed">
                Rather than cramming for 2 months when switching jobs, solve 1 problem every evening. DevOS synchronizes with your live LeetCode GraphQL profile and reminds you when problems decay:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-surface-950 border border-white/[0.06]">
                  <span className="text-[11px] text-surface-400 block font-mono">Solved on LeetCode</span>
                  <span className="text-xl font-bold font-mono text-white">934 Problems</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-950 border border-white/[0.06]">
                  <span className="text-[11px] text-surface-400 block font-mono">Spaced Decay Interval</span>
                  <span className="text-xl font-bold font-mono text-amber-300">3d / 7d / 21d</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-950 border border-white/[0.06]">
                  <span className="text-[11px] text-surface-400 block font-mono">Algorithm Tutor</span>
                  <span className="text-xl font-bold font-mono text-emerald-300">Big-O Audited</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* The 4 Operational Disciplines Grid */}
      <section id="disciplines" className="relative z-10 px-6 max-w-5xl mx-auto w-full py-16 space-y-10">
        <div className="text-center space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-surface-500">Product Architecture</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            The 4 Disciplines of an Elite Engineer
          </h2>
          <p className="text-xs text-surface-400 max-w-lg mx-auto">
            Engineered from first principles to address every dimension of staff-level engineering ownership.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Discipline 1 */}
          <div className="p-6 rounded-2xl bg-surface-900/60 border border-white/[0.06] space-y-3">
            <div className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white">
              <Terminal className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">1. Deep Work & Sprint Velocity</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              5-column Kanban board with keyboard shortcuts, deterministic task parsing, integrated Pomodoro timer blocks, and automated 3-part Markdown standups generated from actual database commits.
            </p>
          </div>

          {/* Discipline 2 */}
          <div className="p-6 rounded-2xl bg-surface-900/60 border border-white/[0.06] space-y-3">
            <div className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-amber-400">
              <Code2 className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">2. Algorithmic Rigor & Continuous Retention</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              100% dynamic LeetCode problem ingestion via GraphQL telemetry. Automated spaced repetition scheduler that flags problems for revision based on memory decay curves.
            </p>
          </div>

          {/* Discipline 3 */}
          <div className="p-6 rounded-2xl bg-surface-900/60 border border-white/[0.06] space-y-3">
            <div className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-indigo-400">
              <Layers className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">3. Architecture & Systems Design ADRs</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Turn architecture debates into permanent institutional knowledge. Michael Nygard-standard ADRs with status tracking, consequence matrices, and built-in Mermaid sequence diagram generation.
            </p>
          </div>

          {/* Discipline 4 */}
          <div className="p-6 rounded-2xl bg-surface-900/60 border border-white/[0.06] space-y-3">
            <div className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-emerald-400">
              <Shield className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-white">4. Zero-Trust Local Security & Domain Copilots</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              8 domain-bound subagents grounded directly in your local SQLite event bus. 100% client-side cryptographic utilities (JWT decoder, UUID v4, Base64) with zero network leakage.
            </p>
          </div>
        </div>
      </section>

      {/* Engineering Tenets Section (FAANG PM Philosophy) */}
      <section id="principles" className="relative z-10 px-6 max-w-5xl mx-auto w-full py-12">
        <div className="p-8 sm:p-10 rounded-2xl bg-surface-900/80 border border-white/[0.08] space-y-6">
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-widest text-surface-500">The Non-Negotiables</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              FAANG Engineering Principles Baked into DevOS
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2">
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <span className="text-emerald-400">01.</span> Zero Hallucinations
              </h4>
              <p className="text-xs text-surface-400 leading-relaxed">
                DevOS domain agents do not give generic boilerplate. Every citation and summary is grounded in your verified SQLite event stream.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <span className="text-brand-400">02.</span> Local Privacy Sovereignty
              </h4>
              <p className="text-xs text-surface-400 leading-relaxed">
                Your company’s code reviews, tickets, and internal architecture remain strictly on your local disk. No third-party data mining.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <span className="text-indigo-400">03.</span> Sub-Millisecond Speed
              </h4>
              <p className="text-xs text-surface-400 leading-relaxed">
                Built on Node.js native SQLite DatabaseSync with WAL journaling. Sub-2ms execution so your workstation never buffers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="relative z-10 px-6 max-w-3xl mx-auto w-full py-16 text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Reclaim your engineering flow state.
        </h2>
        <p className="text-xs sm:text-sm text-surface-400 max-w-xl mx-auto leading-relaxed">
          Stop context switching between 8 open browser tabs. Unify your sprint flow, code reviews, algorithms, and architecture into one cohesive operating system.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-surface-100 text-surface-950 font-semibold text-xs transition active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <span>Sign In or Create Account</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-surface-900 hover:bg-surface-850 text-surface-300 hover:text-white font-medium text-xs border border-white/[0.08] transition"
          >
            <span>Preview Dashboard</span>
          </Link>
        </div>
      </section>

      {/* Clean High-Craft Footer */}
      <footer className="mt-auto border-t border-white/[0.06] bg-surface-950 px-6 py-10 text-xs text-surface-500 z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <DevOSLogo size={22} />
            <span className="font-semibold text-white font-sans text-xs">DevOS v2.0</span>
            <span className="text-surface-600">•</span>
            <span>Personal Developer Operating System</span>
          </div>

          <div className="flex items-center gap-6 font-medium text-[11px]">
            <Link href="/login" className="hover:text-surface-300 transition">
              Sign In
            </Link>
            <Link href="/dashboard" className="hover:text-surface-300 transition">
              Executive Dashboard
            </Link>
            <a
              href="https://github.com/ankurpunia30/devos"
              target="_blank"
              rel="noreferrer"
              className="hover:text-surface-300 transition"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
