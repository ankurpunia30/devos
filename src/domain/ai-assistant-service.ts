import type { DatabaseSync } from 'node:sqlite';
import type { Task, Priority } from '../types.ts';

export interface ParsedTask {
  title: string;
  dueDate?: string;
  priority: Priority;
  tags: string[];
  estimatedMinutes: number;
}

export interface GroundedAnswer {
  query: string;
  answerMarkdown: string;
  citations: Array<{ entity: string; id: string; title: string }>;
  timestamp: string;
}

export class AiAssistantService {
  private db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  /**
   * Deterministic Natural-Language Task Parser
   */
  public parseNaturalLanguageTask(input: string): ParsedTask {
    let cleanText = input.trim();
    let priority: Priority = 'medium';
    const tags: string[] = [];
    let dueDate: string | undefined = undefined;
    let estimatedMinutes = 45;

    // 1. Extract Priority tags (e.g. priority:critical or !critical or [p:high])
    const priorityMatch = cleanText.match(/\b(?:priority:|p:|!)(critical|high|medium|low)\b/i);
    if (priorityMatch) {
      priority = priorityMatch[1].toLowerCase() as Priority;
      cleanText = cleanText.replace(priorityMatch[0], '').trim();
    } else if (/\bcritical\b/i.test(cleanText) && !/\bcritical thinking\b/i.test(cleanText)) {
      priority = 'critical';
    } else if (/\burgent\b/i.test(cleanText)) {
      priority = 'high';
    }

    // 2. Extract Hashtags (#backend, #redis)
    const tagMatches = cleanText.match(/#[a-zA-Z0-9_-]+/g);
    if (tagMatches) {
      for (const t of tagMatches) {
        tags.push(t.slice(1).toLowerCase());
        cleanText = cleanText.replace(t, '').trim();
      }
    }

    // 3. Extract Due Date expressions
    const now = new Date();
    const todayIso = now.toISOString().slice(0, 10);

    if (/\btoday\b/i.test(cleanText)) {
      dueDate = todayIso;
      cleanText = cleanText.replace(/\btoday\b/i, '').trim();
    } else if (/\btomorrow\b/i.test(cleanText)) {
      const tmrw = new Date(now.getTime() + 86400000);
      dueDate = tmrw.toISOString().slice(0, 10);
      cleanText = cleanText.replace(/\btomorrow\b/i, '').trim();
    } else {
      const dayMap: Record<string, number> = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };

      const dayMatch = cleanText.match(/\b(?:by|on|next)?\s*(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
      if (dayMatch) {
        const targetDay = dayMap[dayMatch[1].toLowerCase()];
        const currentDay = now.getDay();
        let daysUntil = (targetDay - currentDay + 7) % 7;
        if (daysUntil === 0) daysUntil = 7; // Next occurrence

        const targetDate = new Date(now.getTime() + daysUntil * 86400000);
        dueDate = targetDate.toISOString().slice(0, 10);
        cleanText = cleanText.replace(dayMatch[0], '').trim();
      }
    }

    // 4. Strip noise prefixes ("Remind me to", "Todo:", "Need to", "Please")
    cleanText = cleanText.replace(/^(?:remind me to|todo:|need to|please)\s+/i, '').trim();
    // Strip trailing prepositions ("by", "on", "due")
    cleanText = cleanText.replace(/\s+(?:by|on|due)$/i, '').trim();

    return {
      title: cleanText || input,
      dueDate,
      priority,
      tags,
      estimatedMinutes,
    };
  }

  /**
   * Grounded Developer Q&A (Zero-Hallucination Query Engine)
   */
  public answerGroundedQuery(userId: string, query: string): GroundedAnswer {
    const qLower = query.toLowerCase();
    const citations: Array<{ entity: string; id: string; title: string }> = [];
    const now = new Date().toISOString();

    // Query 1: Accomplishments / Yesterday / Standup
    if (qLower.includes('accomplish') || qLower.includes('yesterday') || qLower.includes('standup')) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const rows = this.db.prepare(`
        SELECT id, event_type, source_domain, title, description, occurred_at
        FROM activities
        WHERE user_id = ? AND occurred_at LIKE ?
        ORDER BY occurred_at DESC
      `).all(userId, `${yesterday}%`) as Array<{
        id: string;
        event_type: string;
        source_domain: string;
        title: string;
        description: string;
        occurred_at: string;
      }>;

      if (rows.length === 0) {
        return {
          query,
          answerMarkdown: `**Verified Telemetry Report for ${yesterday}:**\n\nNo recorded activities (commits, solved DSA, or completed tasks) were found in the database for yesterday.`,
          citations: [],
          timestamp: now,
        };
      }

      let markdown = `### Grounded Accomplishments Summary (${yesterday})\n\n`;
      markdown += `Found **${rows.length} verified events** across your activity journal:\n\n`;

      for (const r of rows) {
        markdown += `- **[${r.source_domain.toUpperCase()}]** ${r.title}`;
        if (r.description) markdown += ` — *${r.description}*`;
        markdown += ` \`[ID: ${r.id}]\`\n`;
        citations.push({ entity: 'activity', id: r.id, title: r.title });
      }

      return {
        query,
        answerMarkdown: markdown,
        citations,
        timestamp: now,
      };
    }

    // Query 2: Blockers / Critical Priorities
    if (qLower.includes('block') || qLower.includes('critical') || qLower.includes('urgent')) {
      const blockedTasks = this.db.prepare(`
        SELECT id, title, priority, status, due_date
        FROM tasks
        WHERE user_id = ? AND (priority = 'critical' OR status = 'blocked')
        ORDER BY priority DESC, created_at DESC
      `).all(userId) as Array<{
        id: string;
        title: string;
        priority: string;
        status: string;
        due_date: string | null;
      }>;

      if (blockedTasks.length === 0) {
        return {
          query,
          answerMarkdown: `**Operational Health Status:**\n\nZero blocked or critical tasks currently found. Your sprint backlog has no recorded roadblocks.`,
          citations: [],
          timestamp: now,
        };
      }

      let markdown = `### Active Blockers & Critical Priority Tickets\n\n`;
      for (const t of blockedTasks) {
        markdown += `- 🔴 **${t.title}** (Status: \`${t.status}\`, Priority: \`${t.priority}\`)`;
        if (t.due_date) markdown += ` • *Due: ${t.due_date}*`;
        markdown += ` \`[Task: ${t.id}]\`\n`;
        citations.push({ entity: 'task', id: t.id, title: t.title });
      }

      return {
        query,
        answerMarkdown: markdown,
        citations,
        timestamp: now,
      };
    }

    // Query 3: Architecture & ADRs
    if (qLower.includes('adr') || qLower.includes('architecture') || qLower.includes('decision')) {
      const adrs = this.db.prepare(`
        SELECT id, adr_number, title, status, decision
        FROM architecture_decisions
        WHERE user_id = ?
        ORDER BY adr_number ASC
      `).all(userId) as Array<{
        id: string;
        adr_number: number;
        title: string;
        status: string;
        decision: string;
      }>;

      let markdown = `### Architecture Decision Records (ADRs)\n\n`;
      for (const a of adrs) {
        markdown += `#### ADR-${String(a.adr_number).padStart(3, '0')}: ${a.title} (\`${a.status.toUpperCase()}\`)\n`;
        markdown += `> **Decision:** ${a.decision}\n\n`;
        citations.push({ entity: 'adr', id: a.id, title: a.title });
      }

      return {
        query,
        answerMarkdown: markdown,
        citations,
        timestamp: now,
      };
    }

    // Query 4: Career & Interview Prep
    if (qLower.includes('interview') || qLower.includes('career') || qLower.includes('job') || qLower.includes('offer')) {
      const apps = this.db.prepare(`
        SELECT id, company, role, stage, next_interview_date, salary_range
        FROM career_applications
        WHERE user_id = ?
        ORDER BY updated_at DESC
      `).all(userId) as Array<{
        id: string;
        company: string;
        role: string;
        stage: string;
        next_interview_date: string | null;
        salary_range: string | null;
      }>;

      let markdown = `### Career & Interview Pipeline Status\n\n`;
      for (const a of apps) {
        markdown += `- **${a.company}** — ${a.role} (Stage: \`${a.stage.toUpperCase()}\`)`;
        if (a.next_interview_date) markdown += ` • Next Round: **${a.next_interview_date}**`;
        if (a.salary_range) markdown += ` • Compensation: ${a.salary_range}`;
        markdown += ` \`[App: ${a.id}]\`\n`;
        citations.push({ entity: 'career_application', id: a.id, title: `${a.company} - ${a.role}` });
      }

      return {
        query,
        answerMarkdown: markdown,
        citations,
        timestamp: now,
      };
    }

    // Default Fallback
    return {
      query,
      answerMarkdown: `I can answer queries grounded directly in your DevOS SQLite records:\n- *"What did I accomplish yesterday?"*\n- *"What are my current blockers and critical priorities?"*\n- *"What architecture decisions have we made?"*\n- *"What is my interview and career pipeline status?"*`,
      citations: [],
      timestamp: now,
    };
  }
}
