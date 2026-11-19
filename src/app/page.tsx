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
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'dsa' | 'github' | 'toolbox'>('dashboard');

  return (
    <div className="min-h-screen bg-surface-950 text-surface-200 selection:bg-brand-500/30 selection:text-brand-100 flex flex-col">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-brand-600/15 via-indigo-600/5 to-transparent blur-[160px] rounded-full" />
        <div className="absolute top-[800px] left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[160px] rounded-full" />
        <div className="absolute top-[1600px] right-1/4 w-[600px] h-[600px] bg-indigo-500/5 blur-[180px] rounded-full" />
      </div>

      {/* Modern Marketing Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-surface-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-95 transition">
            <DevOSLogo size={36} withText withBadge />
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs text-surface-400 font-medium">
            <a href="#features" className="hover:text-white transition">
              Capabilities
            </a>
            <a href="#preview" className="hover:text-white transition">
              Live Preview
            </a>
            <a href="#dsa" className="hover:text-white transition">
              LeetCode Hub
            </a>
            <a href="#architecture" className="hover:text-white transition">
              Architecture
            </a>
            <a
              href="https://github.com/ankurpunia30/devos"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition flex items-center gap-1"
            >
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-surface-300 hover:text-white hover:bg-white/[0.06] transition"
            >
              <span>Dashboard</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-surface-100 text-surface-950 text-xs font-semibold transition shadow-glow-sm active:scale-[0.99]"
            >
              {/* Google G Logo */}
              <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign In with Google</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6 max-w-6xl mx-auto text-center space-y-8">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-mono shadow-glow-sm">
          <Sparkles className="h-3.5 w-3.5 text-brand-400" />
          <span>DevOS 2.0 • The Developer Operating System</span>
        </div>

        {/* Primary Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.12]">
            The Operating System Built for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-emerald-400">
              Modern Engineers
            </span>
          </h1>
          <p className="text-base sm:text-lg text-surface-400 max-w-2xl mx-auto leading-relaxed">
            Replace 10 fragmented tabs with one consolidated workstation. Linear-grade task kanban, real-time GitHub PR telemetry, dynamic LeetCode practice matrix, and offline developer utilities.
          </p>
        </div>

        {/* Dual Call-to-Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white hover:bg-surface-100 text-surface-950 font-bold text-xs transition-all shadow-glow-md active:scale-[0.99] cursor-pointer"
          >
            {/* Google Icon */}
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Sign In with Google</span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-surface-900 hover:bg-surface-850 text-white font-semibold text-xs border border-white/[0.08] hover:border-brand-500/40 transition shadow-specular active:scale-[0.99]"
          >
            <Laptop className="h-4 w-4 text-brand-400" />
            <span>Open Executive Dashboard</span>
            <ChevronRight className="h-4 w-4 text-surface-500" />
          </Link>
        </div>

        {/* Signup Guarantee Microcopy */}
        <p className="text-[11px] text-surface-500 font-mono">
          Signup is strictly enabled via Google OAuth. Zero passwords to remember.
        </p>

        {/* Feature Badges Strip */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-surface-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-900 border border-white/[0.06]">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>SQLite WAL Sub-Millisecond Speed</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-900 border border-white/[0.06]">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            <span>Local & Offline-First Privacy</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-900 border border-white/[0.06]">
            <Code2 className="h-3.5 w-3.5 text-brand-400" />
            <span>100% Dynamic LeetCode Hub</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-900 border border-white/[0.06]">
            <Lock className="h-3.5 w-3.5 text-indigo-400" />
            <span>Google OAuth Authenticated</span>
          </div>
        </div>
      </section>

      {/* Interactive OS Window Preview Section */}
      <section id="preview" className="relative z-10 px-6 max-w-6xl mx-auto w-full pb-20">
        <div className="rounded-3xl bg-surface-900/90 border border-white/[0.1] shadow-2xl overflow-hidden backdrop-blur-2xl">
          {/* macOS Titlebar */}
          <div className="px-5 py-3.5 border-b border-white/[0.08] bg-surface-950/90 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-xs font-mono text-surface-400 ml-2 font-medium">
                devos.local — Workstation Preview
              </span>
            </div>

            {/* Interactive Tab Switcher */}
            <div className="flex items-center gap-1 bg-surface-900 p-1 rounded-xl border border-white/[0.06]">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-brand-600 text-white font-bold shadow-sm'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                Executive Dashboard
              </button>
              <button
                onClick={() => setActiveTab('dsa')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === 'dsa'
                    ? 'bg-brand-600 text-white font-bold shadow-sm'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                LeetCode Matrix
              </button>
              <button
                onClick={() => setActiveTab('github')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === 'github'
                    ? 'bg-brand-600 text-white font-bold shadow-sm'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                GitHub PR Queue
              </button>
              <button
                onClick={() => setActiveTab('toolbox')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  activeTab === 'toolbox'
                    ? 'bg-brand-600 text-white font-bold shadow-sm'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                Developer Toolbox
              </button>
            </div>
          </div>

          {/* Interactive Window Body */}
          <div className="p-6 sm:p-8 bg-surface-950/70">
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-surface-900 border border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-surface-400">Activity Streak</span>
                      <Flame className="h-4 w-4 text-amber-400" />
                    </div>
                    <span className="text-2xl font-bold font-mono text-white mt-1 block">1 Day</span>
                    <span className="text-[11px] text-emerald-400 font-mono">Continuous ritual</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-900 border border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-surface-400">LeetCode Solved</span>
                      <Award className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-2xl font-bold font-mono text-white mt-1 block">934</span>
                    <span className="text-[11px] text-surface-400 font-mono">Live GraphQL synced</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-900 border border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-surface-400">Pending PRs</span>
                      <GitPullRequest className="h-4 w-4 text-brand-400" />
                    </div>
                    <span className="text-2xl font-bold font-mono text-white mt-1 block">1 Open</span>
                    <span className="text-[11px] text-amber-400 font-mono">Review requested</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-surface-900 border border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-surface-400">System Health</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-2xl font-bold font-mono text-emerald-300 mt-1 block">100%</span>
                    <span className="text-[11px] text-emerald-400 font-mono">All systems operational</span>
                  </div>
                </div>

                {/* 35-Day Heatstrip Preview */}
                <div className="p-5 rounded-2xl bg-surface-900 border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">35-Day Multi-Domain Activity Heatstrip</span>
                    <span className="text-surface-400 font-mono">Tasks • Git • LeetCode • Daily</span>
                  </div>
                  <div className="grid grid-cols-7 sm:grid-cols-35 gap-1.5 py-1">
                    {Array.from({ length: 35 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-6 rounded-md border ${
                          i > 25
                            ? 'bg-brand-600/60 border-brand-500/40'
                            : i % 3 === 0
                            ? 'bg-emerald-500/40 border-emerald-500/30'
                            : 'bg-surface-850 border-white/[0.04]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dsa' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-brand-500/10 to-transparent border border-amber-500/20 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <Code2 className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Verified Profile: @ankurpunia28</h4>
                      <p className="text-xs text-surface-400">934 Total Solved (282 Easy / 557 Medium / 95 Hard)</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                    Live Synced
                  </span>
                </div>

                <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-surface-900">
                  <div className="p-3 border-b border-white/[0.08] text-xs font-mono text-surface-400 flex justify-between">
                    <span>Problem & Difficulty</span>
                    <span>Status & Spaced Repetition</span>
                  </div>
                  <div className="divide-y divide-white/[0.04] text-xs">
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">Trapping Rain Water</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/15 text-rose-300 border border-rose-500/30 font-mono">
                          HARD
                        </span>
                      </div>
                      <span className="text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Solved • Revision in 3d
                      </span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">3Sum</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 font-mono">
                          MEDIUM
                        </span>
                      </div>
                      <span className="text-amber-400 font-mono flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" /> Revision Needed
                      </span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">Two Sum</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono">
                          EASY
                        </span>
                      </div>
                      <span className="text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Solved
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'github' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-surface-900 border border-white/[0.08] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitPullRequest className="h-4 w-4 text-brand-400" />
                      <span className="text-xs font-bold text-white">Pull Request Review Stream</span>
                    </div>
                    <span className="text-[11px] font-mono text-surface-400">Inbound Webhook Active</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-surface-950 border border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        #42 feat(auth): add Google OAuth 2.0 zero-password workflow
                      </span>
                      <span className="text-[11px] text-surface-400 font-mono">
                        ankurpunia30/devos • by lead-engineer
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono">
                      Approved
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'toolbox' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-surface-900 border border-white/[0.08] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Wrench className="h-4 w-4 text-brand-400" />
                    <span>Offline JWT Claim Decoder</span>
                  </div>
                  <p className="text-[11px] text-surface-400 leading-relaxed">
                    Client-side token parsing without sending private claims across the internet.
                  </p>
                  <div className="p-2.5 rounded-xl bg-surface-950 border border-white/[0.06] text-[10px] font-mono text-emerald-300">
                    &#123; &quot;sub&quot;: &quot;usr_devos_root&quot;, &quot;role&quot;: &quot;lead_engineer&quot; &#125;
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-surface-900 border border-white/[0.08] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Terminal className="h-4 w-4 text-emerald-400" />
                    <span>Cryptographic UUID v4</span>
                  </div>
                  <p className="text-[11px] text-surface-400 leading-relaxed">
                    RFC 4122 compliant UUID generation with 1-click clipboard copy.
                  </p>
                  <div className="p-2.5 rounded-xl bg-surface-950 border border-white/[0.06] text-[10px] font-mono text-brand-300">
                    d54c979e-4e44-48e0-a922-3112b07e8412
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Six Core Pillars Grid */}
      <section id="features" className="relative z-10 px-6 max-w-6xl mx-auto w-full py-16 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            Designed for Developers Who Value High Density
          </h2>
          <p className="text-xs sm:text-sm text-surface-400 max-w-xl mx-auto">
            Everything an engineer needs during a sprint, technical interview cycle, or production release.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1 */}
          <div className="p-6 rounded-3xl bg-surface-900/80 border border-white/[0.08] space-y-3 hover:border-brand-500/40 transition group">
            <div className="h-10 w-10 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:scale-105 transition-transform">
              <Terminal className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Linear-Grade Sprints & Kanban</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              5-column kanban board with instant keyboard navigation, priority badges, and an automated grounded standup generator that writes daily reports from actual completed code.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-3xl bg-surface-900/80 border border-white/[0.08] space-y-3 hover:border-brand-500/40 transition group">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Code2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Dynamic LeetCode Practice Matrix</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              100% dynamic problem ingestion with live GraphQL telemetry, spaced repetition engine that automatically schedules reviews 3 days out, and session token sync for 930+ solves.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-3xl bg-surface-900/80 border border-white/[0.08] space-y-3 hover:border-brand-500/40 transition group">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <GitPullRequest className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">GitHub PR & Review Queue</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Synchronize pull requests, commits, and repositories. Review status chips with color-coded approvals, changes requested, and live inbound webhook listeners.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-6 rounded-3xl bg-surface-900/80 border border-white/[0.08] space-y-3 hover:border-brand-500/40 transition group">
            <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <Wrench className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Developer Offline Toolbox</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Zero-latency client-side utilities including JSON formatter/beautifier, offline JWT inspector, Base64 encoder/decoder, UUID v4 generator, and epoch timestamp converter.
            </p>
          </div>

          {/* Pillar 5 */}
          <div className="p-6 rounded-3xl bg-surface-900/80 border border-white/[0.08] space-y-3 hover:border-brand-500/40 transition group">
            <div className="h-10 w-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Architecture Decisions & ADRs</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Track system architecture proposals, accepted tradeoffs, and consequences with numbered sequencing and built-in Mermaid diagram rendering.
            </p>
          </div>

          {/* Pillar 6 */}
          <div className="p-6 rounded-3xl bg-surface-900/80 border border-white/[0.08] space-y-3 hover:border-brand-500/40 transition group">
            <div className="h-10 w-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-white">Google OAuth Authentication</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              Signup and signin strictly powered by Google OAuth 2.0 with HTTP-only session tokens. No password breaches, zero friction, and isolated local SQLite persistence.
            </p>
          </div>
        </div>
      </section>

      {/* Architecture & Performance Callout */}
      <section id="architecture" className="relative z-10 px-6 max-w-6xl mx-auto w-full py-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-surface-900 via-surface-900/90 to-surface-950 border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              <Zap className="h-3 w-3" />
              <span>Next.js 16 • React 19 • SQLite WAL</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Local-First Speed with Zero Cloud Privacy Leaks
            </h3>
            <p className="text-xs sm:text-sm text-surface-400 leading-relaxed">
              DevOS runs on Node.js native <code className="text-white font-mono bg-white/[0.08] px-1 py-0.5 rounded">DatabaseSync</code> with WAL mode enabled. Read and write operations complete in under 2ms. No third-party analytics trackers, zero data harvesting.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full sm:w-auto shrink-0">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-surface-100 text-surface-950 text-xs font-bold transition shadow-glow-sm cursor-pointer"
            >
              <span>Get Started with Google</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-semibold border border-white/[0.08] transition"
            >
              <span>Explore Dashboard</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/[0.08] bg-surface-950/80 px-6 py-12 text-xs text-surface-500 z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DevOSLogo size={24} />
            <span className="font-bold text-white font-sans">DevOS</span>
            <span>— The Personal Developer Operating System</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
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
