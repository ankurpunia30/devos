'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DomainCopilot } from '@/components/DomainCopilot';
import type { Project, ProjectCategory } from '@/types';
import {
  FolderGit2,
  Plus,
  Calendar,
  Layers,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Star,
  GitBranch,
  ChevronRight,
} from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Project Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('personal');
  const [techStackInput, setTechStackInput] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const json = await res.json();
      if (json.success && json.data) {
        setProjects(json.data);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const stack = techStackInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category,
          techStack: stack,
          targetCompletionDate: targetDate || undefined,
        }),
      });

      const json = await res.json();
      if (json.success && json.data && githubRepo.trim()) {
        // Link GitHub repository
        const cleanRepo = githubRepo.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
        await fetch(`/api/projects/${json.data.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ linkRepoFullName: cleanRepo }),
        });
      }

      setName('');
      setDescription('');
      setTechStackInput('');
      setGithubRepo('');
      setTargetDate('');
      setShowModal(false);
      loadProjects();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Project Workspaces</span>
          </h2>
          <p className="text-xs text-surface-400">
            Openable workspaces connected to GitHub repositories, sprint tasks & architecture specs
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <DomainCopilot agentId="architecture_agent" triggerLabel="Ask Project Architect" />
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-sm transition active:scale-[0.98] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Workspace</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-surface-400 flex items-center justify-center gap-2">
          <RotateCcw className="h-4 w-4 animate-spin text-brand-400" />
          <span>Loading project workspaces...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 rounded-2xl bg-surface-900 border border-white/[0.08] text-center space-y-3">
          <FolderGit2 className="h-10 w-10 text-surface-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Project Workspaces Yet</h3>
          <p className="text-xs text-surface-400 max-w-md mx-auto">
            Create your first workspace to synchronize GitHub commits, pull requests, sprint tasks, and architecture specs into one cockpit.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition"
          >
            Create Workspace
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="card-linear p-5 space-y-4 group block hover:border-white/[0.18] transition-all cursor-pointer relative"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-brand-400 font-semibold">
                    {p.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5 group-hover:text-brand-300 transition-colors flex items-center gap-1.5">
                    <span>{p.name}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-surface-500 group-hover:text-brand-300 group-hover:translate-x-0.5 transition-all" />
                  </h3>
                </div>
                <span className="pill-badge bg-surface-800 text-surface-300 border-white/[0.06] capitalize text-[10px]">
                  {p.status.replace('_', ' ')}
                </span>
              </div>

              <p className="text-xs text-surface-400 line-clamp-2 leading-relaxed">
                {p.description || 'Click to open workspace, manage tasks, and inspect GitHub activity.'}
              </p>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-surface-500">Milestone Progress</span>
                  <span className="text-white font-bold">{p.progressPercentage}%</span>
                </div>
                <div className="w-full bg-surface-950 h-2 rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
                  <div
                    className="bg-gradient-to-r from-brand-600 to-indigo-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${p.progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Tech Stack Chips & Action */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.05]">
                <div className="flex flex-wrap gap-1">
                  {p.techStack.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 rounded-md bg-surface-800 border border-white/[0.04] text-[10px] font-mono text-surface-300"
                    >
                      {tech}
                    </span>
                  ))}
                  {p.techStack.length > 3 && (
                    <span className="text-[10px] font-mono text-surface-500 self-center">
                      +{p.techStack.length - 3}
                    </span>
                  )}
                </div>

                <span className="text-xs font-mono text-brand-400 group-hover:text-brand-300 font-semibold flex items-center gap-1">
                  <span>Open</span>
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* New Workspace Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-surface-900 border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between bg-surface-950">
              <h3 className="text-sm font-bold text-white">Create New Project Workspace</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-surface-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-surface-400 font-medium">Workspace Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cloudflare Edge Gateway"
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-surface-500 focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-surface-400 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Goals, boundaries, and technical objective..."
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-surface-500 focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-surface-400 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="personal">Personal</option>
                    <option value="work">Work / Production</option>
                    <option value="open_source">Open Source</option>
                    <option value="learning">Learning</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-surface-400 font-medium">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-surface-400 font-medium">GitHub Repository (optional)</label>
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="e.g. ankurpunia30/devos or full URL"
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-surface-500 focus:outline-none focus:border-white/20 font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-surface-400 font-medium">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={techStackInput}
                  onChange={(e) => setTechStackInput(e.target.value)}
                  placeholder="e.g. TypeScript, React 19, SQLite, Docker"
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white placeholder-surface-500 focus:outline-none focus:border-white/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white text-xs font-semibold transition shadow-sm"
                >
                  {isSubmitting ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
