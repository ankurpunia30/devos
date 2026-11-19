import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import type { Task, TaskStatus, Priority } from '../types.ts';
import { ActivityBus } from './activity-bus.ts';

export class TaskService {
  private db: DatabaseSync;
  private activityBus: ActivityBus;

  constructor(db: DatabaseSync, activityBus: ActivityBus) {
    this.db = db;
    this.activityBus = activityBus;
  }

  public createTask(params: {
    userId: string;
    title: string;
    description?: string;
    projectId?: string | null;
    parentTaskId?: string | null;
    priority?: Priority;
    status?: TaskStatus;
    dueDate?: string | null;
    estimatedMinutes?: number | null;
    tags?: string[];
  }): Task {
    const id = `task_${randomUUID()}`;
    const now = new Date().toISOString();
    const priority = params.priority || 'medium';
    const status = params.status || 'todo';
    const tags = params.tags || [];

    this.db.prepare(`
      INSERT INTO tasks (
        id, user_id, project_id, parent_task_id, title, description,
        priority, status, due_date, estimated_minutes, actual_minutes,
        tags, completed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.userId,
      params.projectId || null,
      params.parentTaskId || null,
      params.title,
      params.description || null,
      priority,
      status,
      params.dueDate || null,
      params.estimatedMinutes || null,
      0,
      JSON.stringify(tags),
      status === 'completed' ? now : null,
      now,
      now
    );

    const task: Task = {
      id,
      userId: params.userId,
      projectId: params.projectId || null,
      parentTaskId: params.parentTaskId || null,
      title: params.title,
      description: params.description,
      priority,
      status,
      dueDate: params.dueDate || null,
      estimatedMinutes: params.estimatedMinutes || null,
      actualMinutes: 0,
      tags,
      completedAt: status === 'completed' ? now : null,
      createdAt: now,
      updatedAt: now,
    };

    this.activityBus.emit({
      userId: params.userId,
      eventType: 'task.created',
      sourceDomain: 'tasks',
      taskId: task.id,
      projectId: task.projectId,
      title: `Created task: ${task.title}`,
      description: task.description,
      metadata: { priority: task.priority, status: task.status },
    });

    return task;
  }

  public updateTask(
    taskId: string,
    userId: string,
    updates: Partial<{
      title: string;
      description: string;
      status: TaskStatus;
      priority: Priority;
      dueDate: string | null;
      estimatedMinutes: number | null;
      actualMinutes: number;
      tags: string[];
      projectId: string | null;
    }>
  ): Task | null {
    const current = this.getTaskById(taskId, userId);
    if (!current) return null;

    const now = new Date().toISOString();
    const isNowCompleted = updates.status === 'completed' && current.status !== 'completed';
    const completedAt = isNowCompleted
      ? now
      : updates.status && updates.status !== 'completed'
      ? null
      : current.completedAt;

    const updatedTask: Task = {
      ...current,
      ...updates,
      completedAt,
      updatedAt: now,
    };

    this.db.prepare(`
      UPDATE tasks SET
        title = ?, description = ?, status = ?, priority = ?,
        due_date = ?, estimated_minutes = ?, actual_minutes = ?,
        tags = ?, project_id = ?, completed_at = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      updatedTask.title,
      updatedTask.description || null,
      updatedTask.status,
      updatedTask.priority,
      updatedTask.dueDate || null,
      updatedTask.estimatedMinutes || null,
      updatedTask.actualMinutes,
      JSON.stringify(updatedTask.tags),
      updatedTask.projectId || null,
      updatedTask.completedAt || null,
      updatedTask.updatedAt,
      taskId,
      userId
    );

    const eventType = isNowCompleted ? 'task.completed' : 'task.updated';
    this.activityBus.emit({
      userId,
      eventType,
      sourceDomain: 'tasks',
      taskId: updatedTask.id,
      projectId: updatedTask.projectId,
      title: isNowCompleted ? `Completed task: ${updatedTask.title}` : `Updated task: ${updatedTask.title}`,
      metadata: { previousStatus: current.status, newStatus: updatedTask.status },
    });

    return updatedTask;
  }

  public getTasks(userId: string, filters?: {
    projectId?: string;
    status?: TaskStatus;
    priority?: Priority;
  }): Task[] {
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params: any[] = [userId];

    if (filters?.projectId) {
      query += ' AND project_id = ?';
      params.push(filters.projectId);
    }
    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters?.priority) {
      query += ' AND priority = ?';
      params.push(filters.priority);
    }

    query += ' ORDER BY created_at DESC';
    const rows = this.db.prepare(query).all(...params) as any[];

    return rows.map(this.mapRowToTask);
  }

  public getTaskById(taskId: string, userId: string): Task | null {
    const row = this.db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(taskId, userId) as any;
    if (!row) return null;
    return this.mapRowToTask(row);
  }

  public deleteTask(taskId: string, userId: string): boolean {
    const task = this.getTaskById(taskId, userId);
    if (!task) return false;

    this.db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(taskId, userId);
    return true;
  }

  private mapRowToTask(r: any): Task {
    return {
      id: r.id,
      userId: r.user_id,
      projectId: r.project_id,
      parentTaskId: r.parent_task_id,
      title: r.title,
      description: r.description,
      priority: r.priority as Priority,
      status: r.status as TaskStatus,
      dueDate: r.due_date,
      estimatedMinutes: r.estimated_minutes,
      actualMinutes: r.actual_minutes,
      tags: JSON.parse(r.tags || '[]'),
      externalReference: r.external_reference ? JSON.parse(r.external_reference) : null,
      completedAt: r.completed_at,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
  }
}
