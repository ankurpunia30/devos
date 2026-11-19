import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import type { GitHubRepository, GitHubPullRequest, GitHubCommit } from '../types.ts';
import { ActivityBus } from './activity-bus.ts';

export class GitHubService {
  private db: DatabaseSync;
  private activityBus: ActivityBus;

  constructor(db: DatabaseSync, activityBus: ActivityBus) {
    this.db = db;
    this.activityBus = activityBus;
  }

  public connectRepository(params: {
    userId: string;
    projectId?: string | null;
    githubRepoId: number;
    name: string;
    fullName: string;
    htmlUrl: string;
    description?: string;
    isPrivate?: boolean;
    defaultBranch?: string;
    stargazersCount?: number;
    openIssuesCount?: number;
  }): GitHubRepository {
    const id = `repo_${randomUUID()}`;
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO github_repositories (
        id, user_id, project_id, github_repo_id, name, full_name, html_url,
        description, is_private, default_branch, open_issues_count, stargazers_count,
        last_synced_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.userId,
      params.projectId || null,
      params.githubRepoId,
      params.name,
      params.fullName,
      params.htmlUrl,
      params.description || null,
      params.isPrivate ? 1 : 0,
      params.defaultBranch || 'main',
      params.openIssuesCount || 0,
      params.stargazersCount || 0,
      now,
      now
    );

    const repo: GitHubRepository = {
      id,
      userId: params.userId,
      projectId: params.projectId || null,
      githubRepoId: params.githubRepoId,
      name: params.name,
      fullName: params.fullName,
      htmlUrl: params.htmlUrl,
      description: params.description,
      isPrivate: Boolean(params.isPrivate),
      defaultBranch: params.defaultBranch || 'main',
      openIssuesCount: params.openIssuesCount || 0,
      stargazersCount: params.stargazersCount || 0,
      lastSyncedAt: now,
      createdAt: now,
    };

    this.activityBus.emit({
      userId: params.userId,
      eventType: 'github.repo_connected',
      sourceDomain: 'github',
      repositoryId: repo.id,
      projectId: repo.projectId,
      title: `Connected GitHub repository: ${repo.fullName}`,
      description: repo.description,
      metadata: { stargazers: repo.stargazersCount, isPrivate: repo.isPrivate },
    });

    return repo;
  }

  public getRepositories(userId: string): GitHubRepository[] {
    const rows = this.db.prepare('SELECT * FROM github_repositories WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
    return rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      projectId: r.project_id,
      githubRepoId: r.github_repo_id,
      name: r.name,
      fullName: r.full_name,
      htmlUrl: r.html_url,
      description: r.description,
      isPrivate: Boolean(r.is_private),
      defaultBranch: r.default_branch,
      openIssuesCount: r.open_issues_count,
      stargazersCount: r.stargazers_count,
      lastSyncedAt: r.last_synced_at,
      createdAt: r.created_at,
    }));
  }

  public createPullRequest(params: {
    repositoryId: string;
    taskId?: string | null;
    githubPrId: number;
    number: number;
    title: string;
    state?: 'open' | 'closed' | 'merged';
    authorLogin: string;
    htmlUrl: string;
    reviewStatus?: 'pending' | 'approved' | 'changes_requested';
  }): GitHubPullRequest {
    const id = `pr_${randomUUID()}`;
    const now = new Date().toISOString();
    const state = params.state || 'open';
    const reviewStatus = params.reviewStatus || 'pending';

    this.db.prepare(`
      INSERT INTO github_pull_requests (
        id, repository_id, task_id, github_pr_id, number, title, state,
        author_login, html_url, review_status, merged_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.repositoryId,
      params.taskId || null,
      params.githubPrId,
      params.number,
      params.title,
      state,
      params.authorLogin,
      params.htmlUrl,
      reviewStatus,
      state === 'merged' ? now : null,
      now
    );

    const repo = this.db.prepare('SELECT user_id, project_id, full_name FROM github_repositories WHERE id = ?').get(params.repositoryId) as any;
    if (repo) {
      this.activityBus.emit({
        userId: repo.user_id,
        eventType: state === 'merged' ? 'github.pr_merged' : 'github.pr_opened',
        sourceDomain: 'github',
        repositoryId: params.repositoryId,
        projectId: repo.project_id,
        taskId: params.taskId || null,
        title: `PR #${params.number} ${state === 'merged' ? 'merged' : 'opened'}: ${params.title}`,
        metadata: { prNumber: params.number, author: params.authorLogin, htmlUrl: params.htmlUrl },
      });
    }

    return {
      id,
      repositoryId: params.repositoryId,
      taskId: params.taskId || null,
      githubPrId: params.githubPrId,
      number: params.number,
      title: params.title,
      state,
      authorLogin: params.authorLogin,
      htmlUrl: params.htmlUrl,
      reviewStatus,
      mergedAt: state === 'merged' ? now : null,
      createdAt: now,
    };
  }

  public getPullRequests(userId: string, state?: 'open' | 'closed' | 'merged'): GitHubPullRequest[] {
    let sql = `
      SELECT pr.* FROM github_pull_requests pr
      JOIN github_repositories r ON pr.repository_id = r.id
      WHERE r.user_id = ?
    `;
    const params: any[] = [userId];

    if (state) {
      sql += ' AND pr.state = ?';
      params.push(state);
    }
    sql += ' ORDER BY pr.created_at DESC';

    const rows = this.db.prepare(sql).all(...params) as any[];
    return rows.map(r => ({
      id: r.id,
      repositoryId: r.repository_id,
      taskId: r.task_id,
      githubPrId: r.github_pr_id,
      number: r.number,
      title: r.title,
      state: r.state as any,
      authorLogin: r.author_login,
      htmlUrl: r.html_url,
      reviewStatus: r.review_status as any,
      mergedAt: r.merged_at,
      createdAt: r.created_at,
    }));
  }

  public recordCommit(params: {
    repositoryId: string;
    sha: string;
    message: string;
    authorName: string;
    authorEmail: string;
    htmlUrl: string;
    committedAt?: string;
  }): GitHubCommit {
    const id = `cmt_${randomUUID()}`;
    const now = new Date().toISOString();
    const committedAt = params.committedAt || now;

    this.db.prepare(`
      INSERT INTO github_commits (
        id, repository_id, sha, message, author_name, author_email, html_url, committed_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.repositoryId,
      params.sha,
      params.message,
      params.authorName,
      params.authorEmail,
      params.htmlUrl,
      committedAt,
      now
    );

    const repo = this.db.prepare('SELECT user_id, project_id, full_name FROM github_repositories WHERE id = ?').get(params.repositoryId) as any;
    if (repo) {
      this.activityBus.emit({
        userId: repo.user_id,
        eventType: 'github.commit_synced',
        sourceDomain: 'github',
        repositoryId: params.repositoryId,
        projectId: repo.project_id,
        title: `Pushed commit ${params.sha.slice(0, 7)}: ${params.message}`,
        metadata: { sha: params.sha, author: params.authorName },
        occurredAt: committedAt,
      });
    }

    return {
      id,
      repositoryId: params.repositoryId,
      sha: params.sha,
      message: params.message,
      authorName: params.authorName,
      authorEmail: params.authorEmail,
      htmlUrl: params.htmlUrl,
      committedAt,
      createdAt: now,
    };
  }

  public getRecentCommits(userId: string, limit: number = 10): GitHubCommit[] {
    const rows = this.db.prepare(`
      SELECT c.* FROM github_commits c
      JOIN github_repositories r ON c.repository_id = r.id
      WHERE r.user_id = ?
      ORDER BY c.committed_at DESC
      LIMIT ?
    `).all(userId, limit) as any[];

    return rows.map(r => ({
      id: r.id,
      repositoryId: r.repository_id,
      sha: r.sha,
      message: r.message,
      authorName: r.author_name,
      authorEmail: r.author_email,
      htmlUrl: r.html_url,
      committedAt: r.committed_at,
      createdAt: r.created_at,
    }));
  }
}
