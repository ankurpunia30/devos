import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import type { Project, ProjectMilestone, ProjectStatus, ProjectCategory } from '../types.ts';
import { ActivityBus } from './activity-bus.ts';

export class ProjectService {
  private db: DatabaseSync;
  private activityBus: ActivityBus;

  constructor(db: DatabaseSync, activityBus: ActivityBus) {
    this.db = db;
    this.activityBus = activityBus;

    // Automatically recalculate project progress when tasks change
    this.activityBus.subscribe('*', (event) => {
      if (event.projectId && event.sourceDomain === 'tasks') {
        this.recalculateProjectProgress(event.projectId, event.userId);
      }
    });
  }

  public createProject(params: {
    userId: string;
    name: string;
    description?: string;
    category?: ProjectCategory;
    techStack?: string[];
    architectureOverview?: string;
    targetCompletionDate?: string;
  }): Project {
    const id = `proj_${randomUUID()}`;
    const slug = params.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString();
    const category = params.category || 'personal';
    const techStack = params.techStack || [];

    this.db.prepare(`
      INSERT INTO projects (
        id, user_id, name, slug, description, status, category,
        tech_stack, architecture_overview, target_completion_date,
        progress_percentage, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.userId,
      params.name,
      slug,
      params.description || null,
      'planning',
      category,
      JSON.stringify(techStack),
      params.architectureOverview || null,
      params.targetCompletionDate || null,
      0,
      now,
      now
    );

    const project: Project = {
      id,
      userId: params.userId,
      name: params.name,
      slug,
      description: params.description || '',
      status: 'planning',
      category,
      techStack,
      architectureOverview: params.architectureOverview,
      targetCompletionDate: params.targetCompletionDate,
      progressPercentage: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.activityBus.emit({
      userId: params.userId,
      eventType: 'project.created',
      sourceDomain: 'projects',
      projectId: project.id,
      title: `Created project: ${project.name}`,
      description: project.description,
      metadata: { category: project.category, techStack: project.techStack },
    });

    return project;
  }

  public getProjects(userId: string): Project[] {
    const rows = this.db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC').all(userId) as any[];
    return rows.map(this.mapRowToProject);
  }

  public getProjectById(projectId: string, userId: string): Project | null {
    const row = this.db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?').get(projectId, userId) as any;
    if (!row) return null;
    return this.mapRowToProject(row);
  }

  public updateProjectStatus(projectId: string, userId: string, status: ProjectStatus): Project | null {
    const project = this.getProjectById(projectId, userId);
    if (!project) return null;

    const now = new Date().toISOString();
    this.db.prepare('UPDATE projects SET status = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(
      status, now, projectId, userId
    );

    project.status = status;
    project.updatedAt = now;

    this.activityBus.emit({
      userId,
      eventType: status === 'completed' ? 'project.completed' : 'project.updated',
      sourceDomain: 'projects',
      projectId,
      title: `Project ${project.name} is now ${status}`,
    });

    return project;
  }

  public recalculateProjectProgress(projectId: string, userId: string): number {
    const totalRow = this.db.prepare('SELECT COUNT(*) as cnt FROM tasks WHERE project_id = ? AND user_id = ?').get(projectId, userId) as any;
    const completedRow = this.db.prepare("SELECT COUNT(*) as cnt FROM tasks WHERE project_id = ? AND user_id = ? AND status = 'completed'").get(projectId, userId) as any;

    const total = totalRow?.cnt || 0;
    const completed = completedRow?.cnt || 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const now = new Date().toISOString();
    this.db.prepare('UPDATE projects SET progress_percentage = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(
      progress, now, projectId, userId
    );

    return progress;
  }

  public addMilestone(params: {
    projectId: string;
    title: string;
    description?: string;
    dueDate?: string;
  }): ProjectMilestone {
    const id = `ms_${randomUUID()}`;
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO project_milestones (id, project_id, title, description, due_date, is_completed, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(id, params.projectId, params.title, params.description || null, params.dueDate || null, now);

    return {
      id,
      projectId: params.projectId,
      title: params.title,
      description: params.description,
      dueDate: params.dueDate,
      isCompleted: false,
      createdAt: now,
    };
  }

  public getMilestones(projectId: string): ProjectMilestone[] {
    const rows = this.db.prepare('SELECT * FROM project_milestones WHERE project_id = ? ORDER BY due_date ASC').all(projectId) as any[];
    return rows.map(r => ({
      id: r.id,
      projectId: r.project_id,
      title: r.title,
      description: r.description,
      dueDate: r.due_date,
      isCompleted: Boolean(r.is_completed),
      completedAt: r.completed_at,
      createdAt: r.created_at,
    }));
  }

  private mapRowToProject(r: any): Project {
    return {
      id: r.id,
      userId: r.user_id,
      name: r.name,
      slug: r.slug,
      description: r.description || '',
      status: r.status as ProjectStatus,
      category: r.category as ProjectCategory,
      techStack: JSON.parse(r.tech_stack || '[]'),
      architectureOverview: r.architecture_overview,
      targetCompletionDate: r.target_completion_date,
      progressPercentage: r.progress_percentage || 0,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }
}
