import { projectService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';
import { FolderGit2, Plus, Calendar, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const projects = projectService.getProjects(DEFAULT_USER_ID);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Project Workspaces</span>
          </h2>
          <p className="text-xs text-surface-400">
            Consolidated multi-repository workspaces, architecture specs & milestones
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((p) => (
          <div
            key={p.id}
            className="card-linear p-5 space-y-4 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-brand-400 font-semibold">
                  {p.category}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5 group-hover:text-brand-300 transition-colors">
                  {p.name}
                </h3>
              </div>
              <span
                className={`pill-badge ${
                  p.status === 'in_progress'
                    ? 'bg-brand-500/15 text-brand-300 border-brand-500/30'
                    : 'bg-surface-800 text-surface-400 border-white/[0.05]'
                }`}
              >
                {p.status.replace('_', ' ')}
              </span>
            </div>

            <p className="text-xs text-surface-400 line-clamp-2 leading-relaxed">
              {p.description || 'No description provided.'}
            </p>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-surface-500">Milestone Progress</span>
                <span className="text-brand-400 font-bold">{p.progressPercentage}%</span>
              </div>
              <div className="w-full bg-surface-950 h-2 rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
                <div
                  className="bg-gradient-to-r from-brand-600 to-indigo-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${p.progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Tech Stack Chips */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/[0.05]">
              {p.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 rounded-md bg-surface-800 border border-white/[0.04] text-[10px] font-mono text-surface-300"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Target Date */}
            {p.targetCompletionDate && (
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-surface-500">
                <Calendar className="h-3 w-3" />
                <span>Target: {p.targetCompletionDate}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
