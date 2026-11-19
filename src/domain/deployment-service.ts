import type { DatabaseSync } from 'node:sqlite';
import type { Deployment, DeploymentEnvironment, DeploymentStatus } from '../types.ts';
import type { ActivityBus } from './activity-bus.ts';

export class DeploymentService {
  private db: DatabaseSync;
  private bus?: ActivityBus;

  constructor(db: DatabaseSync, bus?: ActivityBus) {
    this.db = db;
    this.bus = bus;
  }

  public getDeployments(userId: string, projectId?: string): Deployment[] {
    let query = `
      SELECT 
        id, user_id as userId, project_id as projectId, environment,
        version_tag as versionTag, commit_sha as commitSha, status,
        rollback_plan as rollbackPlan, deployed_at as deployedAt,
        created_at as createdAt
      FROM deployments
      WHERE user_id = ?
    `;
    const params: unknown[] = [userId];

    if (projectId) {
      query += ` AND project_id = ?`;
      params.push(projectId);
    }
    query += ` ORDER BY 
      CASE environment
        WHEN 'prod' THEN 1
        WHEN 'staging' THEN 2
        WHEN 'dev' THEN 3
        WHEN 'local' THEN 4
      END,
      deployed_at DESC
    `;

    return this.db.prepare(query).all(...(params as [string, ...string[]])) as unknown as Deployment[];
  }

  public recordDeployment(params: {
    userId: string;
    projectId?: string;
    environment: DeploymentEnvironment;
    versionTag: string;
    commitSha?: string;
    status?: DeploymentStatus;
    rollbackPlan?: string;
  }): Deployment {
    const id = `dep_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const status = params.status || 'healthy';

    this.db.prepare(`
      INSERT INTO deployments (
        id, user_id, project_id, environment, version_tag, commit_sha,
        status, rollback_plan, deployed_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.userId,
      params.projectId ?? null,
      params.environment,
      params.versionTag,
      params.commitSha ?? null,
      status,
      params.rollbackPlan ?? null,
      now,
      now
    );

    if (this.bus) {
      this.bus.emit({
        userId: params.userId,
        eventType: 'quick_capture.saved',
        sourceDomain: 'projects',
        projectId: params.projectId,
        title: `Deployment: [${params.environment.toUpperCase()}] ${params.versionTag}`,
        description: `Status: ${status} • Commit: ${params.commitSha || 'HEAD'}`,
      });
    }

    return {
      id,
      userId: params.userId,
      projectId: params.projectId,
      environment: params.environment,
      versionTag: params.versionTag,
      commitSha: params.commitSha,
      status,
      rollbackPlan: params.rollbackPlan,
      deployedAt: now,
      createdAt: now,
    };
  }

  public updateDeploymentStatus(id: string, status: DeploymentStatus): boolean {
    const res = this.db.prepare(`
      UPDATE deployments
      SET status = ?
      WHERE id = ?
    `).run(status, id);

    return (res.changes ?? 0) > 0;
  }
}
