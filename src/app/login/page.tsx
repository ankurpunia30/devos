'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { DevOSLogo } from '@/components/DevOSLogo';
import { Terminal, Shield, ArrowLeft, Sparkles, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

export const dynamic = 'force-dynamic';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [noticeMsg, setNoticeMsg] = useState<string | null>(null);

  useEffect(() => {
    const err = searchParams.get('error');
    const notice = searchParams.get('notice');

    if (err) {
      if (err === 'token_exchange_failed') {
        setErrorMsg('Google OAuth token exchange failed. Please verify your client secret.');
      } else if (err === 'invalid_oauth_state') {
        setErrorMsg('Session state verification failed. Please try again.');
      } else {
        setErrorMsg(`Authentication error: ${err}`);
      }
    }

    if (notice === 'google_config_required') {
      setNoticeMsg(
        'Google OAuth credentials (GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET) are not configured in environment variables. You can continue instantly using the Developer Sandbox login below.'
      );
    }
  }, [searchParams]);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'developer@devos.local', name: 'Lead Engineer' }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setErrorMsg(data.error || 'Demo login failed');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Demo login error');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="min-h-screen w-full bg-surface-950 flex flex-col justify-between p-6 relative overflow-hidden selection:bg-brand-500/30 selection:text-brand-100">
      {/* Background ambient radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-600/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 right-10 w-[350px] h-[350px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

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
          <Shield className="h-3.5 w-3.5 text-brand-400" />
          <span>Zero-Password • Google OAuth</span>
        </div>
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-md mx-auto my-auto z-10 py-8">
        <div className="p-8 rounded-3xl bg-surface-900/90 border border-white/[0.08] shadow-2xl backdrop-blur-2xl space-y-6 relative">
          {/* Brand Mark */}
          <div className="flex flex-col items-center text-center space-y-3">
            <DevOSLogo size={52} />
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Sign in to DevOS
              </h1>
              <p className="text-xs text-surface-400 mt-1">
                Your personal engineering telemetry & workstation
              </p>
            </div>
          </div>

          {/* Alert messages if any */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {noticeMsg && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-300">
              <Sparkles className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
              <span className="leading-relaxed">{noticeMsg}</span>
            </div>
          )}

          {/* Primary Action: Google OAuth */}
          <div className="space-y-3 pt-1">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-white hover:bg-surface-100 text-surface-950 font-semibold text-xs transition-all shadow-md hover:shadow-lg disabled:opacity-60 cursor-pointer active:scale-[0.99]"
            >
              {/* Official Google G Logo */}
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
              <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
            </button>

            {/* Developer Sandbox Login Option */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/[0.08]"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase tracking-wider font-mono text-surface-500">
                Sandbox Mode
              </span>
              <div className="flex-grow border-t border-white/[0.08]"></div>
            </div>

            <button
              onClick={handleDemoLogin}
              disabled={demoLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-surface-800/80 hover:bg-surface-800 border border-white/[0.08] hover:border-brand-500/40 text-surface-200 text-xs font-medium transition cursor-pointer"
            >
              <Terminal className="h-3.5 w-3.5 text-brand-400" />
              <span>{demoLoading ? 'Logging into Sandbox...' : 'Continue as Lead Engineer (Sandbox)'}</span>
            </button>
          </div>

          {/* Security & OAuth Rules Notice */}
          <div className="p-3 rounded-2xl bg-surface-950 border border-white/[0.05] space-y-1.5 text-[11px] text-surface-400">
            <div className="flex items-center gap-1.5 text-white font-medium">
              <Lock className="h-3 w-3 text-emerald-400" />
              <span>Google OAuth Security</span>
            </div>
            <p className="leading-relaxed">
              New accounts are provisioned exclusively through Google OAuth. Your developer credentials, access tokens, and LeetCode notes are encrypted locally in your isolated SQLite database.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-surface-500 gap-2 z-10">
        <span>DevOS 2.0 • Personal Developer Operating System</span>
        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-surface-300 transition">
            Overview
          </Link>
          <a
            href="https://github.com/ankurpunia30/devos"
            target="_blank"
            rel="noreferrer"
            className="hover:text-surface-300 transition"
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-surface-950 flex items-center justify-center text-xs font-mono text-surface-400">Loading DevOS Auth...</div>}>
      <LoginContent />
    </Suspense>
  );
}
