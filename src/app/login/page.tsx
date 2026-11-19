'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { DevOSLogo } from '@/components/DevOSLogo';
import { Shield, ArrowLeft, Lock, Mail, User, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';
    const payload = mode === 'signup' ? { email, password, name } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        router.push(redirectPath);
        router.refresh();
      } else {
        setErrorMsg(json.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setMode('signin');
    setEmail('developer@devos.local');
    setPassword('devos123');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen w-full bg-surface-950 flex flex-col justify-between p-6 relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-600/10 blur-[140px] pointer-events-none rounded-full" />

      {/* Top Bar */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-mono text-surface-400 hover:text-white transition group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Homepage</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-surface-500 font-mono">
          <Shield className="h-3.5 w-3.5 text-emerald-400" />
          <span>Strict Email & Password Auth</span>
        </div>
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-8">
        <div className="p-8 rounded-3xl bg-surface-900/90 border border-white/[0.08] shadow-2xl backdrop-blur-2xl space-y-6 relative">
          {/* Brand Mark */}
          <div className="flex flex-col items-center text-center space-y-3">
            <DevOSLogo size={48} />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                {mode === 'signin' ? 'Sign in to DevOS' : 'Create your DevOS Account'}
              </h1>
              <p className="text-xs text-surface-400 mt-1">
                {mode === 'signin'
                  ? 'Access your personal engineering workspace & telemetry'
                  : 'Get your isolated, dynamic workstation backed by SQLite'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-surface-950 rounded-xl border border-white/[0.06] text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg font-semibold transition cursor-pointer ${
                mode === 'signin'
                  ? 'bg-surface-800 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-lg font-semibold transition cursor-pointer ${
                mode === 'signup'
                  ? 'bg-surface-800 text-white shadow-sm'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-surface-300 font-medium flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-surface-500" />
                  <span>Full Name</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Linus Torvalds"
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white placeholder-surface-500 focus:outline-none focus:border-white/20"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-surface-300 font-medium flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-surface-500" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@domain.com"
                className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white placeholder-surface-500 focus:outline-none focus:border-white/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-surface-300 font-medium flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-surface-500" />
                <span>Password (min. 6 characters)</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white placeholder-surface-500 focus:outline-none focus:border-white/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white hover:bg-surface-100 disabled:opacity-50 text-surface-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span>{loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>

          {/* Quick Demo Fill Shortcut */}
          <div className="pt-2 border-t border-white/[0.06] text-center space-y-2">
            <span className="text-[11px] text-surface-500 block font-mono">
              Quick test? Use the pre-configured developer demo account:
            </span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-950 hover:bg-surface-850 text-brand-300 hover:text-brand-200 border border-white/[0.06] text-[11px] font-mono transition cursor-pointer"
            >
              <span>Fill Demo: developer@devos.local</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto text-center text-xs text-surface-600 font-mono z-10">
        Strict Password Authentication • Isolated SQLite Database Persistence
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface-950 flex items-center justify-center text-xs font-mono text-surface-500">
          Loading authentication gateway...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
