import type { DatabaseSync } from 'node:sqlite';
import type { ArchitectureDecision, ADRStatus } from '../types.ts';
import type { ActivityBus } from './activity-bus.ts';

export class ArchitectureService {
  private db: DatabaseSync;
  private bus?: ActivityBus;

  constructor(db: DatabaseSync, bus?: ActivityBus) {
    this.db = db;
    this.bus = bus;
  }

  public getADRs(userId: string, projectId?: string): ArchitectureDecision[] {
    let query = `
      SELECT 
        id, user_id as userId, project_id as projectId, adr_number as adrNumber,
        title, status, context, decision, consequences, mermaid_diagram as mermaidDiagram,
        created_at as createdAt, updated_at as updatedAt
      FROM architecture_decisions
      WHERE user_id = ?
    `;
    const params: unknown[] = [userId];

    if (projectId) {
      query += ` AND project_id = ?`;
      params.push(projectId);
    }
    query += ` ORDER BY adr_number ASC`;

    return this.db.prepare(query).all(...(params as [string, ...string[]])) as unknown as ArchitectureDecision[];
  }

  public createADR(params: {
    userId: string;
    projectId?: string;
    title: string;
    status?: ADRStatus;
    context: string;
    decision: string;
    consequences: string;
    mermaidDiagram?: string;
  }): ArchitectureDecision {
    const id = `adr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const status = params.status || 'accepted';

    // Get next ADR number
    const maxRow = this.db.prepare(`
      SELECT MAX(adr_number) as maxNum FROM architecture_decisions WHERE user_id = ?
    `).get(params.userId) as { maxNum: number | null };
    const adrNumber = (maxRow?.maxNum || 0) + 1;

    this.db.prepare(`
      INSERT INTO architecture_decisions (
        id, user_id, project_id, adr_number, title, status, context, decision,
        consequences, mermaid_diagram, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.userId,
      params.projectId ?? null,
      adrNumber,
      params.title,
      status,
      params.context,
      params.decision,
      params.consequences,
      params.mermaidDiagram ?? null,
      now,
      now
    );

    if (this.bus) {
      this.bus.emit({
        userId: params.userId,
        eventType: 'quick_capture.saved',
        sourceDomain: 'projects',
        projectId: params.projectId,
        title: `Architecture: ADR-${String(adrNumber).padStart(3, '0')} ${params.title}`,
        description: `Status: ${status}`,
      });
    }

    return {
      id,
      userId: params.userId,
      projectId: params.projectId,
      adrNumber,
      title: params.title,
      status,
      context: params.context,
      decision: params.decision,
      consequences: params.consequences,
      mermaidDiagram: params.mermaidDiagram,
      createdAt: now,
      updatedAt: now,
    };
  }

  public updateADRStatus(id: string, status: ADRStatus): boolean {
    const now = new Date().toISOString();
    const res = this.db.prepare(`
      UPDATE architecture_decisions
      SET status = ?, updated_at = ?
      WHERE id = ?
    `).run(status, now, id);

    return (res.changes ?? 0) > 0;
  }
}
