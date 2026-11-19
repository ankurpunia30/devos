import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import type { DailyPriority, PomodoroSession, StandupReport } from '../types.ts';
import { ActivityBus } from './activity-bus.ts';

export class DailyService {
  private db: DatabaseSync;
  private activityBus: ActivityBus;

  constructor(db: DatabaseSync, activityBus: ActivityBus) {
    this.db = db;
    this.activityBus = activityBus;
  }

  public getDailyPriorities(userId: string, date: string): DailyPriority[] {
    const rows = this.db.prepare(`
      SELECT dp.*, t.title as task_title 
      FROM daily_priorities dp
      LEFT JOIN tasks t ON dp.task_id = t.id
      WHERE dp.user_id = ? AND dp.date = ?
      ORDER BY dp.rank ASC
    `).all(userId, date) as any[];

    return rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      date: r.date,
      rank: r.rank as 1 | 2 | 3,
      taskId: r.task_id,
      customTitle: r.custom_title || r.task_title || 'Untitled Priority',
      isCompleted: Boolean(r.is_completed),
      completedAt: r.completed_at,
    }));
  }

  public setDailyPriority(params: {
    userId: string;
    date: string;
    rank: 1 | 2 | 3;
    taskId?: string | null;
    customTitle?: string | null;
  }): DailyPriority {
    const id = `dp_${randomUUID()}`;

    // Upsert priority for given rank on that date
    this.db.prepare(`
      DELETE FROM daily_priorities 
      WHERE user_id = ? AND date = ? AND rank = ?
    `).run(params.userId, params.date, params.rank);

    this.db.prepare(`
      INSERT INTO daily_priorities (id, user_id, date, rank, task_id, custom_title, is_completed)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `).run(id, params.userId, params.date, params.rank, params.taskId || null, params.customTitle || null);

    return {
      id,
      userId: params.userId,
      date: params.date,
      rank: params.rank,
      taskId: params.taskId || null,
      customTitle: params.customTitle || null,
      isCompleted: false,
    };
  }

  public togglePriorityCompleted(priorityId: string, userId: string): boolean {
    const row = this.db.prepare('SELECT * FROM daily_priorities WHERE id = ? AND user_id = ?').get(priorityId, userId) as any;
    if (!row) return false;

    const newCompleted = row.is_completed ? 0 : 1;
    const now = new Date().toISOString();
    this.db.prepare(`
      UPDATE daily_priorities 
      SET is_completed = ?, completed_at = ?
      WHERE id = ? AND user_id = ?
    `).run(newCompleted, newCompleted ? now : null, priorityId, userId);

    return Boolean(newCompleted);
  }

  public recordPomodoro(userId: string, durationMinutes: number = 25, taskId?: string): PomodoroSession {
    const id = `pomo_${randomUUID()}`;
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO pomodoro_sessions (id, user_id, task_id, duration_minutes, completed_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, taskId || null, durationMinutes, now);

    this.activityBus.emit({
      userId,
      eventType: 'pomodoro.finished',
      sourceDomain: 'daily',
      taskId: taskId || null,
      title: `Completed ${durationMinutes}m Pomodoro Focus Session`,
      metadata: { duration_minutes: durationMinutes },
    });

    return {
      id,
      userId,
      taskId: taskId || null,
      durationMinutes,
      completedAt: now,
    };
  }

  public generateStandup(userId: string, date: string): StandupReport {
    // 1. Fetch completed tasks (Yesterday / Recent)
    const completedRows = this.db.prepare(`
      SELECT title, project_id FROM tasks 
      WHERE user_id = ? AND status = 'completed'
      ORDER BY completed_at DESC LIMIT 5
    `).all(userId) as any[];

    const yesterdayAccomplishments = completedRows.length > 0
      ? completedRows.map(r => r.title)
      : ['Implemented architectural foundations and database models.'];

    // 2. Fetch today's priorities and in-progress tasks
    const inProgressRows = this.db.prepare(`
      SELECT title FROM tasks 
      WHERE user_id = ? AND status IN ('in_progress', 'todo')
      ORDER BY priority = 'critical' DESC, priority = 'high' DESC LIMIT 5
    `).all(userId) as any[];

    const todayPlan = inProgressRows.length > 0
      ? inProgressRows.map(r => r.title)
      : ['Continue sprint backlog execution and architecture reviews.'];

    // 3. Fetch blocked tasks
    const blockedRows = this.db.prepare(`
      SELECT title FROM tasks 
      WHERE user_id = ? AND status = 'blocked'
    `).all(userId) as any[];

    const blockers = blockedRows.length > 0
      ? blockedRows.map(r => r.title)
      : ['No blockers identified. All systems operational.'];

    // 4. Synthesize Markdown
    const rawMarkdown = `### 📋 Daily Standup Report (${date})

**1. What did I accomplish recently?**
${yesterdayAccomplishments.map(a => `- ✅ ${a}`).join('\n')}

**2. What am I working on today?**
${todayPlan.map(p => `- 🚀 ${p}`).join('\n')}

**3. Blockers & Risks:**
${blockers.map(b => `- ⚠️ ${b}`).join('\n')}
`;

    const reportId = `std_${randomUUID()}`;
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO standup_reports (id, user_id, date, yesterday_accomplishments, today_plan, blockers, raw_markdown, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reportId,
      userId,
      date,
      JSON.stringify(yesterdayAccomplishments),
      JSON.stringify(todayPlan),
      JSON.stringify(blockers),
      rawMarkdown,
      now
    );

    this.activityBus.emit({
      userId,
      eventType: 'standup.generated',
      sourceDomain: 'daily',
      title: `Generated daily standup for ${date}`,
    });

    return {
      id: reportId,
      userId,
      date,
      yesterdayAccomplishments,
      todayPlan,
      blockers,
      rawMarkdown,
      createdAt: now,
    };
  }
}
