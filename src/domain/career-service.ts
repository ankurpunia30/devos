import type { DatabaseSync } from 'node:sqlite';
import type { CareerApplication, CareerQuestion, CareerStage, ActivityEvent } from '../types.ts';
import type { ActivityBus } from './activity-bus.ts';

export class CareerService {
  private db: DatabaseSync;
  private bus?: ActivityBus;

  constructor(db: DatabaseSync, bus?: ActivityBus) {
    this.db = db;
    this.bus = bus;
  }

  public getApplications(userId: string): CareerApplication[] {
    const rows = this.db.prepare(`
      SELECT 
        id, user_id as userId, company, role, stage, salary_range as salaryRange,
        location, applied_date as appliedDate, next_interview_date as nextInterviewDate,
        notes, created_at as createdAt, updated_at as updatedAt
      FROM career_applications
      WHERE user_id = ?
      ORDER BY 
        CASE stage
          WHEN 'offer' THEN 1
          WHEN 'technical' THEN 2
          WHEN 'screening' THEN 3
          WHEN 'applied' THEN 4
          WHEN 'wishlist' THEN 5
          WHEN 'rejected' THEN 6
        END,
        updated_at DESC
    `).all(userId) as unknown as CareerApplication[];

    return rows;
  }

  public createApplication(params: {
    userId: string;
    company: string;
    role: string;
    stage?: CareerStage;
    salaryRange?: string;
    location?: string;
    appliedDate?: string;
    nextInterviewDate?: string;
    notes?: string;
  }): CareerApplication {
    const id = `app_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const stage = params.stage || 'applied';

    this.db.prepare(`
      INSERT INTO career_applications (
        id, user_id, company, role, stage, salary_range, location, applied_date,
        next_interview_date, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.userId,
      params.company,
      params.role,
      stage,
      params.salaryRange ?? null,
      params.location ?? null,
      params.appliedDate || now.slice(0, 10),
      params.nextInterviewDate ?? null,
      params.notes ?? null,
      now,
      now
    );

    if (this.bus) {
      this.bus.emit({
        userId: params.userId,
        eventType: 'quick_capture.saved',
        sourceDomain: 'daily',
        title: `Career: Applied to ${params.company} for ${params.role}`,
        description: `Pipeline stage: ${stage}`,
      });
    }

    return {
      id,
      userId: params.userId,
      company: params.company,
      role: params.role,
      stage,
      salaryRange: params.salaryRange,
      location: params.location,
      appliedDate: params.appliedDate || now.slice(0, 10),
      nextInterviewDate: params.nextInterviewDate,
      notes: params.notes,
      createdAt: now,
      updatedAt: now,
    };
  }

  public updateApplicationStage(id: string, stage: CareerStage): boolean {
    const now = new Date().toISOString();
    const res = this.db.prepare(`
      UPDATE career_applications
      SET stage = ?, updated_at = ?
      WHERE id = ?
    `).run(stage, now, id);

    return (res.changes ?? 0) > 0;
  }

  public getQuestions(userId: string, category?: string): CareerQuestion[] {
    let query = `
      SELECT 
        id, user_id as userId, company, question, category,
        star_situation as starSituation, star_task as starTask,
        star_action as starAction, star_result as starResult,
        notes, created_at as createdAt
      FROM career_questions
      WHERE user_id = ?
    `;
    const params: unknown[] = [userId];

    if (category && category !== 'all') {
      query += ` AND category = ?`;
      params.push(category);
    }
    query += ` ORDER BY created_at DESC`;

    return this.db.prepare(query).all(...(params as [string, ...string[]])) as unknown as CareerQuestion[];
  }

  public createQuestion(params: {
    userId: string;
    question: string;
    company?: string;
    category?: 'technical' | 'behavioral' | 'system_design';
    starSituation?: string;
    starTask?: string;
    starAction?: string;
    starResult?: string;
    notes?: string;
  }): CareerQuestion {
    const id = `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const category = params.category || 'technical';

    this.db.prepare(`
      INSERT INTO career_questions (
        id, user_id, company, question, category, star_situation, star_task,
        star_action, star_result, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      params.userId,
      params.company ?? null,
      params.question,
      category,
      params.starSituation ?? null,
      params.starTask ?? null,
      params.starAction ?? null,
      params.starResult ?? null,
      params.notes ?? null,
      now
    );

    return {
      id,
      userId: params.userId,
      company: params.company,
      question: params.question,
      category,
      starSituation: params.starSituation,
      starTask: params.starTask,
      starAction: params.starAction,
      starResult: params.starResult,
      notes: params.notes,
      createdAt: now,
    };
  }
}
