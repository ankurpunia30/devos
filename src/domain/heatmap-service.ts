import { DatabaseSync } from 'node:sqlite';
import type { DailyContribution, HeatmapStats } from '../types.ts';

export class HeatmapService {
  private db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  public getHeatmap(userId: string, days: number = 60): HeatmapStats {
    // Generate dates map for the last `days` days
    const dateMap = new Map<string, DailyContribution>();
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      dateMap.set(dateStr, {
        date: dateStr,
        count: 0,
        breakdown: {
          tasks: 0,
          github: 0,
          dsa: 0,
          daily: 0,
        },
      });
    }

    // Query activities within window
    const startDate = Array.from(dateMap.keys())[0];
    const rows = this.db.prepare(`
      SELECT 
        substr(occurred_at, 1, 10) as day,
        source_domain,
        COUNT(*) as cnt
      FROM activities
      WHERE user_id = ? AND occurred_at >= ?
      GROUP BY day, source_domain
      ORDER BY day ASC
    `).all(userId, startDate) as any[];

    let totalContributions = 0;
    for (const r of rows) {
      const entry = dateMap.get(r.day);
      if (entry) {
        entry.count += r.cnt;
        totalContributions += r.cnt;
        if (r.source_domain === 'tasks') entry.breakdown.tasks += r.cnt;
        else if (r.source_domain === 'github') entry.breakdown.github += r.cnt;
        else if (r.source_domain === 'dsa') entry.breakdown.dsa += r.cnt;
        else if (r.source_domain === 'daily') entry.breakdown.daily += r.cnt;
      }
    }

    const contributions = Array.from(dateMap.values());

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Evaluate backwards from yesterday or today
    const reversed = [...contributions].reverse();
    let isCurrent = true;

    for (const day of reversed) {
      if (day.count > 0) {
        tempStreak++;
        if (isCurrent) currentStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        if (isCurrent && day.date === now.toISOString().slice(0, 10)) {
          // If today has 0 so far, don't break current streak yet
          continue;
        }
        isCurrent = false;
        tempStreak = 0;
      }
    }

    return {
      contributions,
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      totalContributions,
    };
  }
}
