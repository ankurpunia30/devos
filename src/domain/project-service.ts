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

  public toggleMilestone(milestoneId: string, isCompleted: boolean): boolean {
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE project_milestones
      SET is_completed = ?, completed_at = ?
      WHERE id = ?
    `).run(isCompleted ? 1 : 0, isCompleted ? now : null, milestoneId);
    return true;
  }

  public linkRepository(projectId: string, repoFullName: string, userId: string) {
    const now = new Date().toISOString();
    const existing = this.db.prepare('SELECT id FROM github_repositories WHERE (project_id = ? OR full_name = ?) AND user_id = ?').get(projectId, repoFullName, userId) as any;
    if (existing) {
      this.db.prepare('UPDATE github_repositories SET project_id = ? WHERE id = ?').run(projectId, existing.id);
      return existing.id;
    }

    const id = `repo_${randomUUID()}`;
    const name = repoFullName.split('/')[1] || repoFullName;
    this.db.prepare(`
      INSERT INTO github_repositories (
        id, user_id, project_id, github_repo_id, name, full_name, html_url,
        description, is_private, default_branch, open_issues_count, stargazers_count,
        last_synced_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      userId,
      projectId,
      Math.floor(Math.random() * 90000000) + 10000000,
      name,
      repoFullName,
      `https://github.com/${repoFullName}`,
      `Repository connected to ${name}`,
      0,
      'main',
      1,
      8,
      now,
      now
    );

    // Also add a sample PR and sample commit
    this.db.prepare(`
      INSERT INTO github_pull_requests (id, repository_id, github_pr_id, number, title, state, author_login, html_url, review_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `pr_${randomUUID()}`,
      id,
      Math.floor(Math.random() * 9000000) + 1000000,
      1,
      `feat(workspace): initial repository setup for ${name}`,
      'open',
      'ankur',
      `https://github.com/${repoFullName}/pull/1`,
      'approved',
      now
    );

    this.db.prepare(`
      INSERT INTO github_commits (id, repository_id, sha, message, author_name, author_email, html_url, committed_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `cmt_${randomUUID()}`,
      id,
      'a1b2c3d',
      `chore: repository initialized in DevOS workspace`,
      'Lead Engineer',
      'developer@devos.local',
      `https://github.com/${repoFullName}/commit/a1b2c3d`,
      now,
      now
    );

    return id;
  }

  public getProjectWorkspace(idOrSlug: string, userId: string) {
    const project = this.db.prepare(
      'SELECT * FROM projects WHERE (id = ? OR slug = ?) AND user_id = ?'
    ).get(idOrSlug, idOrSlug, userId) as any;
    if (!project) return null;

    const mappedProject = this.mapRowToProject(project);

    // Linked GitHub repository
    const repoRow = this.db.prepare(
      'SELECT * FROM github_repositories WHERE (project_id = ? OR name = ? OR name = ?) AND user_id = ? LIMIT 1'
    ).get(project.id, project.slug, project.name.toLowerCase(), userId) as any;

    let repo = null;
    let commits: any[] = [];
    let pullRequests: any[] = [];

    if (repoRow) {
      repo = {
        id: repoRow.id,
        fullName: repoRow.full_name,
        name: repoRow.name,
        htmlUrl: repoRow.html_url,
        description: repoRow.description,
        defaultBranch: repoRow.default_branch || 'main',
        stargazersCount: repoRow.stargazers_count || 0,
        openIssuesCount: repoRow.open_issues_count || 0,
        lastSyncedAt: repoRow.last_synced_at,
      };

      commits = (this.db.prepare(
        'SELECT * FROM github_commits WHERE repository_id = ? ORDER BY committed_at DESC LIMIT 10'
      ).all(repoRow.id) as any[]).map(c => ({
        id: c.id,
        sha: c.sha,
        message: c.message,
        authorName: c.author_name,
        htmlUrl: c.html_url,
        committedAt: c.committed_at,
      }));

      pullRequests = (this.db.prepare(
        'SELECT * FROM github_pull_requests WHERE repository_id = ? ORDER BY created_at DESC'
      ).all(repoRow.id) as any[]).map(p => ({
        id: p.id,
        number: p.number,
        title: p.title,
        state: p.state,
        authorLogin: p.author_login,
        htmlUrl: p.html_url,
        reviewStatus: p.review_status,
        createdAt: p.created_at,
      }));
    }

    // Tasks for this project
    const tasks = (this.db.prepare(
      'SELECT * FROM tasks WHERE project_id = ? AND user_id = ? ORDER BY created_at DESC'
    ).all(project.id, userId) as any[]).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      priority: t.priority,
      status: t.status,
      dueDate: t.due_date,
      estimatedMinutes: t.estimated_minutes,
      actualMinutes: t.actual_minutes,
      tags: JSON.parse(t.tags || '[]'),
      completedAt: t.completed_at,
      createdAt: t.created_at,
    }));

    // Milestones
    const milestones = this.getMilestones(project.id);

    // ADRs
    const adrs = (this.db.prepare(
      'SELECT * FROM architecture_decisions WHERE (project_id = ? OR project_id IS NULL) AND user_id = ? ORDER BY adr_number ASC LIMIT 5'
    ).all(project.id, userId) as any[]).map((a) => ({
      id: a.id,
      adrNumber: a.adr_number,
      title: a.title,
      status: a.status,
      context: a.context,
      decision: a.decision,
      mermaidDiagram: a.mermaid_diagram,
      createdAt: a.created_at,
    }));

    return {
      project: mappedProject,
      repository: repo,
      commits,
      pullRequests,
      tasks,
      milestones,
      adrs,
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
