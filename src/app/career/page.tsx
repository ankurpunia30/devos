'use client';

import { useState, useEffect } from 'react';
import { DomainCopilot } from '@/components/DomainCopilot';
import type { CareerApplication, CareerQuestion, CareerStage } from '@/types';
import {
  Briefcase,
  DollarSign,
  MapPin,
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
  BookOpen,
  X,
} from 'lucide-react';

export default function CareerPage() {
  const [apps, setApps] = useState<CareerApplication[]>([]);
  const [questions, setQuestions] = useState<CareerQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'star'>('pipeline');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAppModal, setShowAppModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);

  // App form
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [stage, setStage] = useState<CareerStage>('applied');
  const [salaryRange, setSalaryRange] = useState('');
  const [location, setLocation] = useState('');
  const [nextInterviewDate, setNextInterviewDate] = useState('');
  const [notes, setNotes] = useState('');

  // Question form
  const [qQuestion, setQQuestion] = useState('');
  const [qCompany, setQCompany] = useState('');
  const [qCategory, setQCategory] = useState<'technical' | 'behavioral' | 'system_design'>('behavioral');
  const [qSituation, setQSituation] = useState('');
  const [qTask, setQTask] = useState('');
  const [qAction, setQAction] = useState('');
  const [qResult, setQResult] = useState('');

  const loadData = async () => {
    try {
      const [appRes, qRes] = await Promise.all([
        fetch('/api/career/applications'),
        fetch('/api/career/questions'),
      ]);
      setApps((await appRes.json()).data || []);
      setQuestions((await qRes.json()).data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    await fetch('/api/career/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company,
        role,
        stage,
        salaryRange,
        location,
        nextInterviewDate: nextInterviewDate || null,
        notes,
      }),
    });

    setCompany('');
    setRole('');
    setSalaryRange('');
    setLocation('');
    setNotes('');
    setShowAppModal(false);
    loadData();
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qQuestion.trim()) return;

    await fetch('/api/career/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: qQuestion,
        company: qCompany,
        category: qCategory,
        starSituation: qSituation,
        starTask: qTask,
        starAction: qAction,
        starResult: qResult,
      }),
    });

    setQQuestion('');
    setQCompany('');
    setQSituation('');
    setQTask('');
    setQAction('');
    setQResult('');
    setShowQuestionModal(false);
    loadData();
  };

  const updateStage = async (id: string, newStage: CareerStage) => {
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, stage: newStage } : a)));
    await fetch(`/api/career/applications/${id}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: newStage }),
    });
    loadData();
  };

  const stages: { id: CareerStage; label: string; badge: string }[] = [
    { id: 'wishlist', label: 'Target / Wishlist', badge: 'bg-surface-800 text-surface-400' },
    { id: 'applied', label: 'Applied', badge: 'bg-blue-500/10 text-blue-300 border-blue-500/20' },
    { id: 'screening', label: 'Screening', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20' },
    { id: 'technical', label: 'Technical / Rounds', badge: 'bg-purple-500/10 text-purple-300 border-purple-500/20' },
    { id: 'offer', label: 'Offer Received', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Career & Interview Management</span>
          </h2>
          <p className="text-xs text-surface-400">
            End-to-end engineering pipeline, interview schedules & STAR behavioral story vault
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DomainCopilot agentId="career_agent" triggerLabel="Ask Career Agent" />
          {activeTab === 'pipeline' ? (
            <button
              onClick={() => setShowAppModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Target Company</span>
            </button>
          ) : (
            <button
              onClick={() => setShowQuestionModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add STAR Story</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-1">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'pipeline'
              ? 'bg-brand-600 text-white font-semibold shadow-glow-sm'
              : 'bg-surface-900/60 text-surface-400 hover:text-white'
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
          <span>Application Pipeline ({apps.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('star')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'star'
              ? 'bg-brand-600 text-white font-semibold shadow-glow-sm'
              : 'bg-surface-900/60 text-surface-400 hover:text-white'
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          <span>STAR Method Question Bank ({questions.length})</span>
        </button>
      </div>

      {/* Tab 1: Application Pipeline */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
          {stages.map((st) => {
            const stageApps = apps.filter((a) => a.stage === st.id);
            return (
              <div
                key={st.id}
                className="bg-surface-925/80 border border-white/[0.06] rounded-2xl p-3 flex flex-col space-y-3 min-h-[450px]"
              >
                <div className="flex items-center justify-between px-1 pb-2 border-b border-white/[0.05]">
                  <span className="text-xs font-bold text-white tracking-tight">{st.label}</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-800 text-[10px] font-mono text-surface-400 font-bold">
                    {stageApps.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {stageApps.length === 0 ? (
                    <div className="py-8 text-center text-[10px] font-mono text-surface-600">
                      Empty stage
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <div
                        key={app.id}
                        className="card-linear p-3 space-y-2 group relative"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white">{app.company}</h4>
                            <span className="text-[9px] font-mono text-surface-500">
                              {app.appliedDate?.slice(5)}
                            </span>
                          </div>
                          <p className="text-[11px] text-brand-300 font-medium">{app.role}</p>
                        </div>

                        {app.salaryRange && (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                            <DollarSign className="h-3 w-3" />
                            <span>{app.salaryRange}</span>
                          </div>
                        )}

                        {app.location && (
                          <div className="flex items-center gap-1 text-[10px] font-mono text-surface-400">
                            <MapPin className="h-3 w-3 text-surface-500" />
                            <span>{app.location}</span>
                          </div>
                        )}

                        {app.nextInterviewDate && (
                          <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-[10px] font-mono text-brand-300 font-semibold">
                            <Calendar className="h-3 w-3 text-brand-400" />
                            <span>Next: {app.nextInterviewDate}</span>
                          </div>
                        )}

                        {app.notes && (
                          <p className="text-[11px] text-surface-400 line-clamp-2 leading-relaxed pt-1 border-t border-white/[0.04]">
                            {app.notes}
                          </p>
                        )}

                        {/* Stage Selector */}
                        <div className="pt-2 border-t border-white/[0.04]">
                          <select
                            value={app.stage}
                            onChange={(e) => updateStage(app.id, e.target.value as CareerStage)}
                            className="w-full bg-surface-950 border border-white/[0.08] rounded-lg px-2 py-1 text-[10px] text-surface-300 focus:outline-none focus:border-brand-500 font-mono"
                          >
                            <option value="wishlist">Wishlist</option>
                            <option value="applied">Applied</option>
                            <option value="screening">Screening</option>
                            <option value="technical">Technical</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: STAR Stories */}
      {activeTab === 'star' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {questions.map((q) => (
            <div key={q.id} className="card-linear p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  {q.company && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-brand-400 font-semibold">
                      {q.company}
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {q.question}
                  </h3>
                </div>
                <span className="pill-badge bg-surface-800 text-surface-300 border-white/[0.05] capitalize shrink-0">
                  {q.category.replace('_', ' ')}
                </span>
              </div>

              {/* STAR Breakdown */}
              <div className="space-y-2 text-xs">
                {q.starSituation && (
                  <div className="p-2.5 rounded-xl bg-surface-950/70 border border-white/[0.04] space-y-0.5">
                    <span className="font-mono text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                      [S] Situation
                    </span>
                    <p className="text-surface-300 leading-relaxed">{q.starSituation}</p>
                  </div>
                )}
                {q.starTask && (
                  <div className="p-2.5 rounded-xl bg-surface-950/70 border border-white/[0.04] space-y-0.5">
                    <span className="font-mono text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      [T] Task
                    </span>
                    <p className="text-surface-300 leading-relaxed">{q.starTask}</p>
                  </div>
                )}
                {q.starAction && (
                  <div className="p-2.5 rounded-xl bg-surface-950/70 border border-white/[0.04] space-y-0.5">
                    <span className="font-mono text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                      [A] Action
                    </span>
                    <p className="text-surface-300 leading-relaxed">{q.starAction}</p>
                  </div>
                )}
                {q.starResult && (
                  <div className="p-2.5 rounded-xl bg-surface-950/70 border border-white/[0.04] space-y-0.5">
                    <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      [R] Result
                    </span>
                    <p className="text-surface-300 leading-relaxed font-medium">{q.starResult}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add App Modal */}
      {showAppModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-surface-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Add Career Opportunity</h3>
              <button onClick={() => setShowAppModal(false)} className="text-surface-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateApp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Company</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google, Stripe"
                    required
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Staff Backend Engineer"
                    required
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Pipeline Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as CareerStage)}
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="applied">Applied</option>
                    <option value="screening">Screening</option>
                    <option value="technical">Technical</option>
                    <option value="offer">Offer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Salary Range</label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="e.g. $350k - $420k"
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Remote, San Francisco"
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Next Round Date</label>
                  <input
                    type="date"
                    value={nextInterviewDate}
                    onChange={(e) => setNextInterviewDate(e.target.value)}
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-surface-400">Notes & Preparation Plan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Focus topics, interviewer names, compensation targets..."
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl p-3 font-sans text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAppModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-surface-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm"
                >
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add STAR Question Modal */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-surface-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Save STAR Story</h3>
              <button onClick={() => setShowQuestionModal(false)} className="text-surface-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuestion} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-surface-400">Interview Question</label>
                <input
                  type="text"
                  value={qQuestion}
                  onChange={(e) => setQQuestion(e.target.value)}
                  placeholder="e.g. Tell me about a time you resolved a major production outage."
                  required
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Company</label>
                  <input
                    type="text"
                    value={qCompany}
                    onChange={(e) => setQCompany(e.target.value)}
                    placeholder="e.g. Google, Amazon"
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Category</label>
                  <select
                    value={qCategory}
                    onChange={(e) => setQCategory(e.target.value as 'technical' | 'behavioral' | 'system_design')}
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="behavioral">Behavioral (Leadership & STAR)</option>
                    <option value="system_design">System Design</option>
                    <option value="technical">Technical Architecture</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-blue-400 font-bold">[S] Situation</label>
                <textarea
                  value={qSituation}
                  onChange={(e) => setQSituation(e.target.value)}
                  rows={2}
                  placeholder="Context, scale, and problem setting..."
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-amber-400 font-bold">[T] Task</label>
                <textarea
                  value={qTask}
                  onChange={(e) => setQTask(e.target.value)}
                  rows={2}
                  placeholder="What was your specific responsibility..."
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-purple-400 font-bold">[A] Action</label>
                <textarea
                  value={qAction}
                  onChange={(e) => setQAction(e.target.value)}
                  rows={2}
                  placeholder="What concrete engineering decisions and steps did you take..."
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-emerald-400 font-bold">[R] Result</label>
                <textarea
                  value={qResult}
                  onChange={(e) => setQResult(e.target.value)}
                  rows={2}
                  placeholder="Quantifiable outcome, latency improvement, revenue impact..."
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-surface-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm"
                >
                  Save STAR Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
