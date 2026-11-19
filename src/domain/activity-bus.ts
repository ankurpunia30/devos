import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import type { ActivityEvent, ActivityEventType } from '../types.ts';

export type ActivityListener = (event: ActivityEvent) => void | Promise<void>;

export class ActivityBus {
  private db: DatabaseSync;
  private listeners: Map<string, ActivityListener[]> = new Map();

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  public subscribe(eventType: ActivityEventType | '*', listener: ActivityListener): () => void {
    const list = this.listeners.get(eventType) || [];
    list.push(listener);
    this.listeners.set(eventType, list);

    return () => {
      const updated = (this.listeners.get(eventType) || []).filter(l => l !== listener);
      this.listeners.set(eventType, updated);
    };
  }

  public emit(params: {
    userId: string;
    eventType: ActivityEventType;
    sourceDomain: ActivityEvent['sourceDomain'];
    title: string;
    description?: string;
    projectId?: string | null;
    repositoryId?: string | null;
    taskId?: string | null;
    metadata?: Record<string, unknown>;
    externalId?: string | null;
    occurredAt?: string;
  }): ActivityEvent {
    const id = `act_${randomUUID()}`;
    const now = new Date().toISOString();
    const occurredAt = params.occurredAt || now;

    const event: ActivityEvent = {
      id,
      userId: params.userId,
      eventType: params.eventType,
      sourceDomain: params.sourceDomain,
      title: params.title,
      description: params.description,
      projectId: params.projectId || null,
      repositoryId: params.repositoryId || null,
      taskId: params.taskId || null,
      metadata: params.metadata || {},
      externalId: params.externalId || null,
      occurredAt,
      createdAt: now,
    };

    // 1. Persist to SQLite
    this.db.prepare(`
      INSERT INTO activities (
        id, user_id, event_type, source_domain, project_id, repository_id, 
        task_id, title, description, metadata, external_id, occurred_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      event.id,
      event.userId,
      event.eventType,
      event.sourceDomain,
      event.projectId,
      event.repositoryId,
      event.taskId,
      event.title,
      event.description || null,
      JSON.stringify(event.metadata),
      event.externalId,
      event.occurredAt,
      event.createdAt
    );

    // 2. Fan-out to listeners
    const specificListeners = this.listeners.get(event.eventType) || [];
    const wildcardListeners = this.listeners.get('*') || [];

    for (const listener of [...specificListeners, ...wildcardListeners]) {
      try {
        listener(event);
      } catch (err) {
        console.error(`Error in activity listener for ${event.eventType}:`, err);
      }
    }

    return event;
  }

  public getRecentActivities(userId: string, limit: number = 20): ActivityEvent[] {
    const rows = this.db.prepare(`
      SELECT * FROM activities 
      WHERE user_id = ? 
      ORDER BY occurred_at DESC 
      LIMIT ?
    `).all(userId, limit) as any[];

    return rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      eventType: r.event_type as ActivityEventType,
      sourceDomain: r.source_domain,
      projectId: r.project_id,
      repositoryId: r.repository_id,
      taskId: r.task_id,
      title: r.title,
      description: r.description,
      metadata: JSON.parse(r.metadata || '{}'),
      externalId: r.external_id,
      occurredAt: r.occurred_at,
      createdAt: r.created_at,
    }));
  }
}
