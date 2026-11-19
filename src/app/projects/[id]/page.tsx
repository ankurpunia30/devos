'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DomainCopilot } from '@/components/DomainCopilot';
import { MarkdownView } from '@/components/MarkdownView';
import type { Project, ProjectMilestone, Task, GitHubRepository, GitHubPullRequest, GitHubCommit } from '@/types';
import {
  FolderGit2,
  GitBranch,
  GitPullRequest,
  GitCommit,
  CheckCircle2,
  Clock,
  Calendar,
  Layers,
  ExternalLink,
  Plus,
  ArrowLeft,
  Star,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Tag,
  Check,
  ChevronRight,
} from 'lucide-react';

interface ProjectWorkspaceData {
  project: Project;
  repository: (GitHubRepository & { htmlUrl?: string; defaultBranch?: string }) | null;
  commits: GitHubCommit[];
  pullRequests: GitHubPullRequest[];
  tasks: Task[];
  milestones: ProjectMilestone[];
  adrs: Array<{
    id: string;
    adrNumber: number;
    title: string;
    status: string;
    context: string;
    decision: string;
    mermaidDiagram?: string;
  }>;
}

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [data, setData] = useState<ProjectWorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'github' | 'milestones' | 'adrs'>('overview');

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // New milestone form state
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');
  const [isSubmittingMilestone, setIsSubmittingMilestone] = useState(false);

  // Link GitHub repo state
  const [repoInput, setRepoInput] = useState('');
  const [isLinkingRepo, setIsLinkingRepo] = useState(false);

  const loadWorkspace = async () => {
    if (!projectId) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Failed to load project workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, [projectId]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isSubmittingTask) return;
    setIsSubmittingTask(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'task',
          title: newTaskTitle.trim(),
          priority: newTaskPriority,
        }),
      });
      setNewTaskTitle('');
      loadWorkspace();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toggleMilestoneId: milestoneId,
          isCompleted: !currentStatus,
        }),
      });
      loadWorkspace();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim() || isSubmittingMilestone) return;
    setIsSubmittingMilestone(true);
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'milestone',
          title: milestoneTitle.trim(),
          dueDate: milestoneDueDate || undefined,
        }),
      });
      setMilestoneTitle('');
      setMilestoneDueDate('');
      setShowMilestoneForm(false);
      loadWorkspace();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingMilestone(false);
    }
  };

  const handleLinkRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoInput.trim() || isLinkingRepo) return;
    setIsLinkingRepo(true);
    try {
      const cleanRepo = repoInput.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkRepoFullName: cleanRepo }),
      });
      setRepoInput('');
      loadWorkspace();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLinkingRepo(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      loadWorkspace();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="flex items-center gap-3 text-surface-400 font-mono text-xs">
          <RotateCcw className="h-4 w-4 animate-spin text-brand-400" />
          <span>Opening Project Workspace...</span>
        </div>
      </div>
    );
  }

  if (!data || !data.project) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-4">
        <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs text-surface-400 hover:text-white transition">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects</span>
        </Link>
        <div className="p-8 rounded-2xl bg-surface-900 border border-white/[0.08] text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
          <h2 className="text-base font-bold text-white">Project Workspace Not Found</h2>
          <p className="text-xs text-surface-400">The requested project workspace id does not exist in local SQLite.</p>
        </div>
      </div>
    );
  }

  const { project, repository, commits, pullRequests, tasks, milestones, adrs } = data;
  const completedTasksCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-surface-400">
          <Link href="/projects" className="hover:text-white transition flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Projects</span>
          </Link>
          <span className="text-surface-600">/</span>
          <span className="text-white font-semibold truncate max-w-[200px]">{project.name}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <DomainCopilot agentId="architecture_agent" triggerLabel="Ask Project Architect" />
          <Link
            href="/tasks"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-900 hover:bg-surface-850 text-surface-300 hover:text-white border border-white/[0.08] text-xs font-medium transition"
          >
            <span>Sprint Kanban</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Main Workspace Header Banner */}
      <div className="p-6 rounded-2xl bg-surface-900/90 border border-white/[0.08] space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/15 text-brand-300 border border-brand-500/25 font-semibold">
                {project.category}
              </span>
              <h1 className="text-2xl font-bold text-white tracking-tight">{project.name}</h1>
              <span className="pill-badge bg-surface-800 text-surface-300 border-white/[0.08] capitalize text-[11px]">
                ● {project.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-surface-400 max-w-2xl leading-relaxed">
              {project.description || 'No description provided for this workspace.'}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-4 bg-surface-950/80 p-3 rounded-xl border border-white/[0.06] shrink-0 font-mono text-xs">
            <div>
              <span className="text-[10px] text-surface-500 block">Milestones</span>
              <span className="text-sm font-bold text-white">
                {milestones.filter((m) => m.isCompleted).length} / {milestones.length}
              </span>
            </div>
            <div className="h-6 w-px bg-white/[0.08]" />
            <div>
              <span className="text-[10px] text-surface-500 block">Sprint Tasks</span>
              <span className="text-sm font-bold text-emerald-400">
                {completedTasksCount} / {tasks.length}
              </span>
            </div>
            <div className="h-6 w-px bg-white/[0.08]" />
            <div>
              <span className="text-[10px] text-surface-500 block">Velocity</span>
              <span className="text-sm font-bold text-brand-300">{project.progressPercentage}%</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] font-mono text-surface-400">
            <span>Overall Milestone Completion</span>
            <span className="text-white font-semibold">{project.progressPercentage}%</span>
          </div>
          <div className="w-full bg-surface-950 h-2 rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
            <div
              className="bg-gradient-to-r from-brand-600 via-indigo-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${project.progressPercentage}%` }}
            />
          </div>
        </div>

        {/* GitHub Linked Repository Card */}
        <div className="pt-2 border-t border-white/[0.06]">
          {repository ? (
            <div className="p-3.5 rounded-xl bg-surface-950 border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white shrink-0">
                  <FolderGit2 className="h-4 w-4 text-brand-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-mono">{repository.fullName}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-800 text-surface-400 border border-white/[0.06]">
                      {repository.defaultBranch || 'main'}
                    </span>
                    <span className="text-[10px] text-surface-500 font-mono flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-400" />
                      {repository.stargazersCount || 0}
                    </span>
                  </div>
                  <p className="text-[11px] text-surface-400 line-clamp-1 mt-0.5">
                    {repository.description || 'GitHub repository synchronized with DevOS.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={repository.htmlUrl || `https://github.com/${repository.fullName}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 hover:text-white border border-white/[0.08] text-xs font-semibold transition"
                >
                  <span>Open on GitHub</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleLinkRepo}
              className="p-3 rounded-xl bg-surface-950/80 border border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2 text-surface-400 w-full sm:w-auto">
                <FolderGit2 className="h-4 w-4 text-surface-500 shrink-0" />
                <span>Connect GitHub Repository:</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={repoInput}
                  onChange={(e) => setRepoInput(e.target.value)}
                  placeholder="e.g. ankurpunia30/devos"
                  className="bg-surface-900 border border-white/[0.08] rounded-lg px-2.5 py-1 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-white/20 font-mono w-full sm:w-56"
                />
                <button
                  type="submit"
                  disabled={isLinkingRepo || !repoInput.trim()}
                  className="px-3 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-xs transition cursor-pointer shrink-0"
                >
                  {isLinkingRepo ? 'Linking...' : 'Connect'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-1 overflow-x-auto text-xs">
        {[
          { id: 'overview', label: 'Overview & Architecture', count: null },
          { id: 'tasks', label: 'Sprint Tasks', count: tasks.length },
          { id: 'github', label: 'GitHub PRs & Commits', count: pullRequests.length + commits.length },
          { id: 'milestones', label: 'Milestones', count: milestones.length },
          { id: 'adrs', label: 'Architecture Decisions (ADRs)', count: adrs.length },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-xl font-medium transition cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? 'bg-surface-900 text-white font-bold border border-white/[0.08]'
                  : 'text-surface-400 hover:text-surface-200 hover:bg-surface-900/40'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="px-1.5 py-0.2 rounded bg-surface-800 text-[10px] font-mono text-surface-400">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview & Architecture */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2 space-y-5">
            {/* Architecture Overview */}
            <div className="p-5 rounded-2xl bg-surface-900 border border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-brand-400" />
                <h3 className="text-sm font-bold text-white">Architecture Overview & Technical Specs</h3>
              </div>
              <div className="text-xs text-surface-300 leading-relaxed">
                <MarkdownView
                  content={
                    project.architectureOverview ||
                    'No formal architecture overview documented yet. You can document technical boundaries, data flows, and subsystem responsibilities here.'
                  }
                />
              </div>
            </div>

            {/* Sprint Tasks Snapshot */}
            <div className="p-5 rounded-2xl bg-surface-900 border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Active Sprint Tasks</span>
                  <span className="text-xs font-mono text-surface-500">({tasks.length})</span>
                </h3>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="text-xs text-brand-400 hover:text-brand-300 font-medium transition flex items-center gap-1"
                >
                  <span>Manage All</span>
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>

              {tasks.length === 0 ? (
                <p className="text-xs text-surface-500 py-2">No tasks assigned to this project yet.</p>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {tasks.slice(0, 4).map((t) => (
                    <div key={t.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => handleUpdateTaskStatus(t.id, t.status === 'completed' ? 'todo' : 'completed')}
                          className={`h-4 w-4 rounded flex items-center justify-center border transition ${
                            t.status === 'completed'
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          {t.status === 'completed' && <Check className="h-3 w-3" />}
                        </button>
                        <span className={`font-medium ${t.status === 'completed' ? 'line-through text-surface-500' : 'text-surface-200'}`}>
                          {t.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-950 text-surface-400 border border-white/[0.05] capitalize">
                        {t.priority}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Tech Stack & Milestones Checklist */}
          <div className="space-y-5">
            {/* Tech Stack */}
            <div className="p-5 rounded-2xl bg-surface-900 border border-white/[0.08] space-y-3">
              <h3 className="text-xs font-bold text-surface-400 font-mono uppercase tracking-wider">
                Technology Stack
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2.5 py-1 rounded-lg bg-surface-950 border border-white/[0.06] text-xs font-mono text-surface-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Timeline */}
            <div className="p-5 rounded-2xl bg-surface-900 border border-white/[0.08] space-y-3 font-mono text-xs">
              <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider">
                Timeline & Schedule
              </h3>
              <div className="flex items-center gap-2 text-surface-300">
                <Calendar className="h-4 w-4 text-surface-500" />
                <span>Target: {project.targetCompletionDate || 'Open-ended'}</span>
              </div>
              <div className="flex items-center gap-2 text-surface-300">
                <Clock className="h-4 w-4 text-surface-500" />
                <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sprint Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Quick Task Creator Form */}
          <form
            onSubmit={handleCreateTask}
            className="p-3.5 rounded-2xl bg-surface-900 border border-white/[0.08] flex flex-col sm:flex-row items-center gap-3"
          >
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Add a new task to this workspace..."
              className="flex-1 bg-surface-950 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-white/20 w-full"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="bg-surface-950 border border-white/[0.08] text-xs text-surface-300 rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="critical">Critical</option>
              </select>
              <button
                type="submit"
                disabled={isSubmittingTask || !newTaskTitle.trim()}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Task</span>
              </button>
            </div>
          </form>

          {/* Task List Table */}
          <div className="rounded-2xl bg-surface-900 border border-white/[0.08] overflow-hidden">
            <div className="p-3.5 border-b border-white/[0.08] flex items-center justify-between text-xs font-mono text-surface-400">
              <span>Task & Description</span>
              <span>Status & Priority</span>
            </div>
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-surface-500">
                No tasks created for this project yet. Use the field above to add your first sprint task.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {tasks.map((t) => (
                  <div key={t.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleUpdateTaskStatus(t.id, t.status === 'completed' ? 'todo' : 'completed')}
                        className={`h-4 w-4 rounded flex items-center justify-center border mt-0.5 transition cursor-pointer ${
                          t.status === 'completed'
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        {t.status === 'completed' && <Check className="h-3 w-3" />}
                      </button>
                      <div>
                        <span className={`font-medium block ${t.status === 'completed' ? 'line-through text-surface-500' : 'text-white'}`}>
                          {t.title}
                        </span>
                        {t.description && (
                          <span className="text-[11px] text-surface-400 block mt-0.5 line-clamp-1">
                            {t.description}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto font-mono text-[11px]">
                      <select
                        value={t.status}
                        onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value)}
                        className="bg-surface-950 border border-white/[0.08] rounded-lg px-2 py-1 text-surface-300 focus:outline-none capitalize"
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="completed">Completed</option>
                      </select>
                      <span className="px-2 py-0.5 rounded bg-surface-950 text-surface-400 border border-white/[0.06] capitalize">
                        {t.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: GitHub PRs & Commits */}
      {activeTab === 'github' && (
        <div className="space-y-5">
          {/* Pull Requests */}
          <div className="p-5 rounded-2xl bg-surface-900 border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <GitPullRequest className="h-4 w-4 text-emerald-400" />
                <span>Pull Requests</span>
                <span className="text-xs font-mono text-surface-500">({pullRequests.length})</span>
              </h3>
            </div>

            {pullRequests.length === 0 ? (
              <p className="text-xs text-surface-500 py-3">No pull requests synced for this repository.</p>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {pullRequests.map((pr) => (
                  <div key={pr.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">#{pr.number} {pr.title}</span>
                        <span className="pill-badge bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px] font-mono">
                          {pr.reviewStatus}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-surface-500 block mt-0.5">
                        by @{pr.authorLogin} • state: {pr.state}
                      </span>
                    </div>
                    {pr.htmlUrl && (
                      <a
                        href={pr.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-400 hover:text-brand-300 font-mono text-[11px] flex items-center gap-1 self-end sm:self-auto"
                      >
                        <span>View PR</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Commits */}
          <div className="p-5 rounded-2xl bg-surface-900 border border-white/[0.08] space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <GitCommit className="h-4 w-4 text-brand-400" />
              <span>Recent Commits</span>
              <span className="text-xs font-mono text-surface-500">({commits.length})</span>
            </h3>

            {commits.length === 0 ? (
              <p className="text-xs text-surface-500 py-3">No commits recorded yet.</p>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {commits.map((c) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      <span className="px-1.5 py-0.5 rounded bg-surface-950 text-brand-300 border border-white/[0.06] text-[10px]">
                        {c.sha.slice(0, 7)}
                      </span>
                      <span className="text-surface-200 truncate max-w-md">{c.message}</span>
                    </div>
                    <span className="text-[10px] text-surface-500">{c.authorName}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Milestones Checklist */}
      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Project Milestones & Key Results</h3>
            <button
              onClick={() => setShowMilestoneForm(!showMilestoneForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-800 hover:bg-surface-700 text-surface-200 border border-white/[0.08] text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{showMilestoneForm ? 'Cancel' : 'Add Milestone'}</span>
            </button>
          </div>

          {showMilestoneForm && (
            <form
              onSubmit={handleCreateMilestone}
              className="p-4 rounded-2xl bg-surface-900 border border-white/[0.08] space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="Milestone title e.g. Phase 2 Release"
                  className="bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 focus:outline-none"
                />
                <input
                  type="date"
                  value={milestoneDueDate}
                  onChange={(e) => setMilestoneDueDate(e.target.value)}
                  className="bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingMilestone || !milestoneTitle.trim()}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition cursor-pointer"
              >
                {isSubmittingMilestone ? 'Saving...' : 'Save Milestone'}
              </button>
            </form>
          )}

          <div className="rounded-2xl bg-surface-900 border border-white/[0.08] overflow-hidden divide-y divide-white/[0.04]">
            {milestones.length === 0 ? (
              <div className="p-8 text-center text-xs text-surface-500">
                No milestones added yet. Click &quot;Add Milestone&quot; to establish phase targets.
              </div>
            ) : (
              milestones.map((m) => (
                <div key={m.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleMilestone(m.id, m.isCompleted)}
                      className={`h-5 w-5 rounded-lg flex items-center justify-center border transition cursor-pointer ${
                        m.isCompleted
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'border-white/20 hover:border-white/40'
                      }`}
                    >
                      {m.isCompleted && <Check className="h-3.5 w-3.5" />}
                    </button>
                    <div>
                      <span className={`font-medium block ${m.isCompleted ? 'line-through text-surface-500' : 'text-white'}`}>
                        {m.title}
                      </span>
                      {m.description && (
                        <span className="text-[11px] text-surface-400 block mt-0.5">{m.description}</span>
                      )}
                    </div>
                  </div>

                  {m.dueDate && (
                    <span className="text-[11px] font-mono text-surface-500 shrink-0">
                      Due: {m.dueDate}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 5: Architecture Decisions (ADRs) */}
      {activeTab === 'adrs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Architecture Decisions Linked to Workspace</h3>
            <Link
              href="/architecture"
              className="text-xs text-brand-400 hover:text-brand-300 font-medium transition flex items-center gap-1"
            >
              <span>ADR Hub</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {adrs.length === 0 ? (
            <div className="p-8 rounded-2xl bg-surface-900 border border-white/[0.08] text-center text-xs text-surface-500">
              No ADRs linked to this project yet. Visit the Architecture Hub to document technical decisions.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {adrs.map((a) => (
                <div key={a.id} className="p-5 rounded-2xl bg-surface-900 border border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">
                      ADR-{String(a.adrNumber).padStart(3, '0')}: {a.title}
                    </span>
                    <span className="pill-badge bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px] font-mono capitalize">
                      {a.status}
                    </span>
                  </div>
                  <p className="text-xs text-surface-400 leading-relaxed">
                    <strong>Decision:</strong> {a.decision}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
