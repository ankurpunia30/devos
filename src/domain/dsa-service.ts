import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import type { DSATopic, DSAProblem, DSASubmission, DSAStatus, DSADifficulty, DSAStats } from '../types.ts';
import { ActivityBus } from './activity-bus.ts';

export class DSAService {
  private db: DatabaseSync;
  private activityBus: ActivityBus;

  constructor(db: DatabaseSync, activityBus: ActivityBus) {
    this.db = db;
    this.activityBus = activityBus;
  }

  public getTopics(): DSATopic[] {
    const rows = this.db.prepare('SELECT * FROM dsa_topics ORDER BY display_order ASC').all() as any[];
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      displayOrder: r.display_order,
    }));
  }

  public getProblems(userId: string, filters?: {
    topicId?: string;
    status?: DSAStatus;
    difficulty?: DSADifficulty;
  }): DSAProblem[] {
    let sql = 'SELECT * FROM dsa_problems WHERE user_id = ?';
    const params: any[] = [userId];

    if (filters?.topicId) {
      sql += ' AND topic_id = ?';
      params.push(filters.topicId);
    }
    if (filters?.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters?.difficulty) {
      sql += ' AND difficulty = ?';
      params.push(filters.difficulty);
    }

    sql += ' ORDER BY neetcode_roadmap_flag DESC, created_at ASC';
    const rows = this.db.prepare(sql).all(...params) as any[];

    return rows.map(this.mapRowToProblem);
  }

  public getProblemById(id: string, userId: string): DSAProblem | null {
    const row = this.db.prepare('SELECT * FROM dsa_problems WHERE id = ? AND user_id = ?').get(id, userId) as any;
    if (!row) return null;
    return this.mapRowToProblem(row);
  }

  public updateProblem(
    id: string,
    userId: string,
    updates: Partial<{
      status: DSAStatus;
      notes: string;
      approachSummary: string;
      timeComplexity: string;
      spaceComplexity: string;
      nextRevisionDate: string | null;
    }>
  ): DSAProblem | null {
    const current = this.getProblemById(id, userId);
    if (!current) return null;

    const now = new Date().toISOString();
    const isNowSolved = updates.status === 'solved' && current.status !== 'solved';
    const lastSolvedAt = isNowSolved ? now : current.lastSolvedAt;

    // Spaced repetition: if solved, schedule revision in 3 days
    let nextRevisionDate = updates.nextRevisionDate !== undefined ? updates.nextRevisionDate : current.nextRevisionDate;
    if (isNowSolved && !updates.nextRevisionDate) {
      const revision = new Date();
      revision.setDate(revision.getDate() + 3);
      nextRevisionDate = revision.toISOString().slice(0, 10);
    }

    const updated: DSAProblem = {
      ...current,
      ...updates,
      nextRevisionDate,
      lastSolvedAt,
    };

    this.db.prepare(`
      UPDATE dsa_problems SET
        status = ?, notes = ?, approach_summary = ?,
        time_complexity = ?, space_complexity = ?,
        next_revision_date = ?, last_solved_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      updated.status,
      updated.notes || null,
      updated.approachSummary || null,
      updated.timeComplexity || null,
      updated.spaceComplexity || null,
      updated.nextRevisionDate || null,
      updated.lastSolvedAt || null,
      id,
      userId
    );

    if (isNowSolved) {
      this.activityBus.emit({
        userId,
        eventType: 'dsa.problem_solved',
        sourceDomain: 'dsa',
        title: `Solved DSA Problem: ${updated.title} (${updated.difficulty.toUpperCase()})`,
        description: updated.approachSummary || updated.notes,
        metadata: {
          difficulty: updated.difficulty,
          topicId: updated.topicId,
          timeComplexity: updated.timeComplexity,
          nextRevision: updated.nextRevisionDate,
        },
      });
    }

    return updated;
  }

  public recordSubmission(params: {
    problemId: string;
    status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded';
    code?: string;
    runtimeMs?: number;
    memoryMb?: number;
  }): DSASubmission {
    const id = `sub_${randomUUID()}`;
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO dsa_submissions (id, problem_id, status, code, runtime_ms, memory_mb, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.problemId,
      params.status,
      params.code || null,
      params.runtimeMs || null,
      params.memoryMb || null,
      now
    );

    return {
      id,
      problemId: params.problemId,
      status: params.status,
      code: params.code,
      runtimeMs: params.runtimeMs,
      memoryMb: params.memoryMb,
      submittedAt: now,
    };
  }

  public getStats(userId: string): DSAStats {
    const totalRow = this.db.prepare('SELECT COUNT(*) as total FROM dsa_problems WHERE user_id = ?').get(userId) as any;
    const solvedRow = this.db.prepare("SELECT COUNT(*) as solved FROM dsa_problems WHERE user_id = ? AND status IN ('solved', 'revision_needed')").get(userId) as any;
    const attemptedRow = this.db.prepare("SELECT COUNT(*) as attempted FROM dsa_problems WHERE user_id = ? AND status = 'attempted'").get(userId) as any;
    const revisionRow = this.db.prepare("SELECT COUNT(*) as revision FROM dsa_problems WHERE user_id = ? AND status = 'revision_needed'").get(userId) as any;

    const total = totalRow?.total || 0;
    const solved = solvedRow?.solved || 0;
    const attempted = attemptedRow?.attempted || 0;
    const revisionNeeded = revisionRow?.revision || 0;
    const masteryPercentage = total > 0 ? Math.round((solved / total) * 100) : 0;

    // Topic breakdown
    const topicStats = this.db.prepare(`
      SELECT 
        t.id, t.name,
        COUNT(p.id) as total,
        SUM(CASE WHEN p.status IN ('solved', 'revision_needed') THEN 1 ELSE 0 END) as solved
      FROM dsa_topics t
      LEFT JOIN dsa_problems p ON t.id = p.topic_id AND p.user_id = ?
      GROUP BY t.id, t.name, t.display_order
      ORDER BY t.display_order ASC
    `).all(userId) as any[];

    // Live LeetCode Integration Profile
    let leetcodeProfile: DSAStats['leetcode'] = null;
    try {
      const leetcodeRow = this.db.prepare(`
        SELECT account_identifier, status, metadata, last_synced_at
        FROM user_integrations
        WHERE user_id = ? AND provider = 'leetcode'
      `).get(userId) as any;

      if (leetcodeRow && leetcodeRow.status === 'connected') {
        const meta = JSON.parse(leetcodeRow.metadata || '{}');
        leetcodeProfile = {
          connected: true,
          username: leetcodeRow.account_identifier,
          totalSolved: meta.totalSolved || 0,
          easySolved: meta.easy || 0,
          mediumSolved: meta.medium || 0,
          hardSolved: meta.hard || 0,
          lastSyncedAt: leetcodeRow.last_synced_at || null,
        };
      }
    } catch {}

    return {
      total,
      solved,
      attempted,
      revisionNeeded,
      masteryPercentage,
      topics: topicStats.map(ts => ({
        id: ts.id,
        name: ts.name,
        total: ts.total || 0,
        solved: ts.solved || 0,
        percentage: ts.total > 0 ? Math.round(((ts.solved || 0) / ts.total) * 100) : 0,
      })),
      leetcode: leetcodeProfile,
    };
  }

  private mapRowToProblem(r: any): DSAProblem {
    return {
      id: r.id,
      userId: r.user_id,
      topicId: r.topic_id,
      title: r.title,
      slug: r.slug,
      difficulty: r.difficulty as DSADifficulty,
      leetcodeUrl: r.leetcode_url,
      neetcodeRoadmapFlag: Boolean(r.neetcode_roadmap_flag),
      status: r.status as DSAStatus,
      notes: r.notes,
      approachSummary: r.approach_summary,
      timeComplexity: r.time_complexity,
      spaceComplexity: r.space_complexity,
      nextRevisionDate: r.next_revision_date,
      lastSolvedAt: r.last_solved_at,
      createdAt: r.created_at,
    };
  }
}
