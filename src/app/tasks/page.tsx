'use client';

import { useState, useEffect } from 'react';
import type { Task, TaskStatus, Priority } from '@/types';
import {
  Plus,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Tag,
  FolderGit2,
  Calendar,
  X,
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('medium');
  const [newEstimatedMinutes, setNewEstimatedMinutes] = useState(45);

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const updateStatus = async (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    loadTasks();
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        status: 'todo',
        estimatedMinutes: Number(newEstimatedMinutes) || 45,
      }),
    });

    setNewTitle('');
    setNewDesc('');
    setShowModal(false);
    loadTasks();
  };

  const statusWorkflow: TaskStatus[] = ['backlog', 'todo', 'in_progress', 'blocked', 'completed'];

  const columns: { id: TaskStatus; label: string; badge: string; color: string }[] = [
    { id: 'backlog', label: 'Backlog', badge: 'bg-surface-800 text-surface-400', color: 'text-surface-400' },
    { id: 'todo', label: 'Todo', badge: 'bg-brand-500/10 text-brand-300 border-brand-500/20', color: 'text-brand-400' },
    { id: 'in_progress', label: 'In Progress', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20', color: 'text-amber-400' },
    { id: 'blocked', label: 'Blocked', badge: 'bg-rose-500/10 text-rose-300 border-rose-500/20', color: 'text-rose-400' },
    { id: 'completed', label: 'Completed', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20', color: 'text-emerald-400' },
  ];

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case 'critical':
        return <span className="pill-badge bg-rose-500/15 text-rose-300 border-rose-500/30">🔴 Critical</span>;
      case 'high':
        return <span className="pill-badge bg-amber-500/15 text-amber-300 border-amber-500/30">🟠 High</span>;
      case 'medium':
        return <span className="pill-badge bg-brand-500/15 text-brand-300 border-brand-500/30">🟡 Medium</span>;
      case 'low':
        return <span className="pill-badge bg-surface-800 text-surface-400 border-white/5">🔵 Low</span>;
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search & Filter */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="h-3.5 w-3.5 text-surface-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter sprint tasks..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-900 border border-white/[0.08] text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-all font-sans"
            />
          </div>

          <div className="flex items-center gap-1 bg-surface-900 p-1 rounded-xl border border-white/[0.08]">
            {['all', 'critical', 'high', 'medium'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono capitalize transition-all ${
                  priorityFilter === p
                    ? 'bg-brand-600 text-white font-bold shadow-sm'
                    : 'text-surface-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* 5-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);
          const currentIdx = statusWorkflow.indexOf(col.id);

          return (
            <div
              key={col.id}
              className="bg-surface-925/80 border border-white/[0.06] rounded-2xl p-3 flex flex-col space-y-3 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1 pb-2 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold tracking-tight ${col.color}`}>
                    {col.label}
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-800 text-[10px] font-mono text-surface-400 font-bold border border-white/[0.05]">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-2.5 flex-1">
                {colTasks.length === 0 ? (
                  <div className="py-8 text-center text-[11px] font-mono text-surface-600">
                    No tickets
                  </div>
                ) : (
                  colTasks.map((t) => (
                    <div
                      key={t.id}
                      className="card-linear p-3 space-y-2.5 group relative"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-white leading-snug line-clamp-2">
                          {t.title}
                        </h4>
                        {getPriorityBadge(t.priority)}
                      </div>

                      {t.description && (
                        <p className="text-[11px] text-surface-400 line-clamp-2 leading-relaxed">
                          {t.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 border-t border-white/[0.04] text-[10px] font-mono text-surface-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 text-surface-500" />
                          <span>{t.estimatedMinutes || 30}m</span>
                        </div>

                        {/* Workflow Shift Arrows */}
                        <div className="flex items-center gap-1 opacity-75 group-hover:opacity-100 transition-opacity">
                          {currentIdx > 0 && (
                            <button
                              onClick={() => updateStatus(t.id, statusWorkflow[currentIdx - 1])}
                              className="p-1 rounded bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white"
                              title={`Move to ${statusWorkflow[currentIdx - 1]}`}
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                          )}
                          {currentIdx < statusWorkflow.length - 1 && (
                            <button
                              onClick={() => updateStatus(t.id, statusWorkflow[currentIdx + 1])}
                              className="p-1 rounded bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white"
                              title={`Move to ${statusWorkflow[currentIdx + 1]}`}
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-surface-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Create New Sprint Ticket</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-surface-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={createTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-surface-400">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Implement Redis distributed rate limiter"
                  required
                  autoFocus
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-surface-400">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Requirements, architectural constraints, and acceptance criteria..."
                  rows={3}
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Estimated Minutes</label>
                  <input
                    type="number"
                    value={newEstimatedMinutes}
                    onChange={(e) => setNewEstimatedMinutes(Number(e.target.value))}
                    min={5}
                    max={480}
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
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
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
