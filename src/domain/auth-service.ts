import type { DatabaseSync } from 'node:sqlite';
import { randomUUID, scryptSync, randomBytes } from 'node:crypto';
import type { User, UserSession } from '../types.ts';
import type { ActivityBus } from './activity-bus.ts';
import { DEFAULT_USER_ID } from '../db/client.ts';

export class AuthService {
  private db: DatabaseSync;
  private activityBus: ActivityBus;

  constructor(db: DatabaseSync, activityBus: ActivityBus) {
    this.db = db;
    this.activityBus = activityBus;
  }

  public signUpWithPassword(params: {
    email: string;
    password: string;
    name?: string;
  }): { user: User; sessionToken: string } {
    const now = new Date().toISOString();
    const normalizedEmail = params.email.toLowerCase().trim();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }
    if (!params.password || params.password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const existing = this.db.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).get(normalizedEmail) as any;

    if (existing) {
      throw new Error('An account with this email already exists. Please sign in.');
    }

    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(params.password, salt, 64).toString('hex');
    const userId = `usr_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
    const displayName = params.name?.trim() || normalizedEmail.split('@')[0];

    this.db.prepare(`
      INSERT INTO users (id, email, password_hash, password_salt, name, avatar_url, timezone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      normalizedEmail,
      hash,
      salt,
      displayName,
      `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop`,
      'UTC',
      now
    );

    const user: User = {
      id: userId,
      email: normalizedEmail,
      name: displayName,
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop`,
      timezone: 'UTC',
      createdAt: now,
    };

    // Seed dynamic starter workspace for this specific user
    try {
      this.seedUserWorkspace(user.id, user.name);
    } catch (e) {
      console.error('Failed to seed user workspace:', e);
    }

    // Create session (valid for 30 days)
    const sessionToken = `devos_ses_${randomUUID().replace(/-/g, '')}`;
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + 30);
    const expiresAt = expiresDate.toISOString();

    const sessionId = `ses_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
    this.db.prepare(`
      INSERT INTO user_sessions (id, user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionId, user.id, sessionToken, expiresAt, now);

    this.activityBus.emit({
      userId: user.id,
      eventType: 'auth.signup',
      sourceDomain: 'system',
      title: `User signed up: ${user.name}`,
      description: `New dynamic workspace initialized for ${user.email}`,
    });

    return { user, sessionToken };
  }

  public signInWithPassword(params: {
    email: string;
    password: string;
  }): { user: User; sessionToken: string } {
    const now = new Date().toISOString();
    const normalizedEmail = params.email.toLowerCase().trim();

    const row = this.db.prepare(
      'SELECT id, email, password_hash, password_salt, name, avatar_url, timezone, created_at FROM users WHERE email = ?'
    ).get(normalizedEmail) as any;

    if (!row) {
      throw new Error('Invalid email or password.');
    }

    if (!row.password_hash || !row.password_salt) {
      throw new Error('Account does not have a password set. Please sign up or contact support.');
    }

    const computedHash = scryptSync(params.password, row.password_salt, 64).toString('hex');
    if (computedHash !== row.password_hash) {
      throw new Error('Invalid email or password.');
    }

    const user: User = {
      id: row.id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatar_url,
      timezone: row.timezone || 'UTC',
      createdAt: row.created_at,
    };

    // Create session (valid for 30 days)
    const sessionToken = `devos_ses_${randomUUID().replace(/-/g, '')}`;
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + 30);
    const expiresAt = expiresDate.toISOString();

    const sessionId = `ses_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
    this.db.prepare(`
      INSERT INTO user_sessions (id, user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionId, user.id, sessionToken, expiresAt, now);

    this.activityBus.emit({
      userId: user.id,
      eventType: 'auth.login',
      sourceDomain: 'system',
      title: `User logged in: ${user.name}`,
      description: `Session active for ${user.email}`,
    });

    return { user, sessionToken };
  }

  private seedUserWorkspace(userId: string, userName: string) {
    const now = new Date().toISOString();
    const projId = `proj_${randomUUID().replace(/-/g, '').slice(0, 12)}`;

    // 1. Initial Project Workspace
    this.db.prepare(`
      INSERT INTO projects (id, user_id, name, slug, description, status, category, tech_stack, architecture_overview, target_completion_date, progress_percentage, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      projId,
      userId,
      `${userName}'s Production App`,
      'production-app',
      'Primary personal project workspace with integrated GitHub repository, tasks & architecture.',
      'in_progress',
      'personal',
      JSON.stringify(['TypeScript', 'React', 'Node.js', 'SQLite']),
      'High-performance event-driven architecture with local-first database.',
      '2026-12-31',
      25,
      now,
      now
    );

    // 2. Initial Milestone
    this.db.prepare(`
      INSERT INTO project_milestones (id, project_id, title, description, due_date, is_completed, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `).run(`ms_${randomUUID().replace(/-/g, '').slice(0, 12)}`, projId, 'MVP Release & Deployment', 'Ship initial sprint milestone', '2026-12-15', now);

    // 3. Initial Sprint Tasks
    this.db.prepare(`
      INSERT INTO tasks (id, user_id, project_id, title, description, priority, status, due_date, estimated_minutes, actual_minutes, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
    `).run(`task_${randomUUID().replace(/-/g, '').slice(0, 12)}`, userId, projId, 'Configure local database schema and models', 'Review SQLite WAL engine', 'high', 'in_progress', now.slice(0, 10), 60, JSON.stringify(['backend', 'database']), now, now);

    this.db.prepare(`
      INSERT INTO tasks (id, user_id, project_id, title, description, priority, status, due_date, estimated_minutes, actual_minutes, tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
    `).run(`task_${randomUUID().replace(/-/g, '').slice(0, 12)}`, userId, projId, 'Connect GitHub repository & verify CI workflow', 'Sync remote commits and PRs', 'medium', 'todo', now.slice(0, 10), 45, JSON.stringify(['git', 'ci']), now, now);

    // 4. Initial Daily Priorities
    this.db.prepare(`
      INSERT INTO daily_priorities (id, user_id, date, rank, task_id, custom_title, is_completed)
      VALUES (?, ?, ?, 1, null, 'Review sprint tasks & backlog', 0)
    `).run(`dp_${randomUUID().replace(/-/g, '').slice(0, 12)}`, userId, now.slice(0, 10));

    // 5. Initial LeetCode Problems for this user
    const sampleProblems = [
      { title: 'Two Sum', slug: 'two-sum', diff: 'easy', url: 'https://leetcode.com/problems/two-sum/' },
      { title: 'Trapping Rain Water', slug: 'trapping-rain-water', diff: 'hard', url: 'https://leetcode.com/problems/trapping-rain-water/' },
      { title: '3Sum', slug: '3sum', diff: 'medium', url: 'https://leetcode.com/problems/3sum/' }
    ];
    for (const p of sampleProblems) {
      try {
        this.db.prepare(`
          INSERT INTO dsa_problems (id, user_id, topic_id, title, slug, difficulty, leetcode_url, status, created_at)
          VALUES (?, ?, 'topic_arrays', ?, ?, ?, ?, 'solved', ?)
        `).run(`prob_${randomUUID().replace(/-/g, '').slice(0, 12)}`, userId, p.title, p.slug, p.diff, p.url, now);
      } catch {}
    }
  }

  public createGoogleUserOrLogin(profile: {
    googleId: string;
    email: string;
    name: string;
    avatarUrl?: string;
  }): { user: User; sessionToken: string; isNewUser: boolean } {
    const now = new Date().toISOString();
    const normalizedEmail = profile.email.toLowerCase().trim();

    // Check if user already exists by email
    const existingRow = this.db.prepare(
      'SELECT id, email, name, avatar_url, timezone, created_at FROM users WHERE email = ?'
    ).get(normalizedEmail) as any;

    let user: User;
    let isNewUser = false;

    if (existingRow) {
      user = {
        id: existingRow.id,
        email: existingRow.email,
        name: profile.name || existingRow.name,
        avatarUrl: profile.avatarUrl || existingRow.avatar_url,
        timezone: existingRow.timezone || 'UTC',
        createdAt: existingRow.created_at,
      };

      // Update avatar or name if newer from Google
      this.db.prepare(
        'UPDATE users SET name = ?, avatar_url = ? WHERE id = ?'
      ).run(user.name, user.avatarUrl || null, user.id);
    } else {
      isNewUser = true;
      const newUserId = `usr_google_${profile.googleId || randomUUID().replace(/-/g, '').slice(0, 12)}`;
      user = {
        id: newUserId,
        email: normalizedEmail,
        name: profile.name || 'Developer',
        avatarUrl: profile.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop`,
        timezone: 'UTC',
        createdAt: now,
      };

      this.db.prepare(`
        INSERT INTO users (id, email, name, avatar_url, timezone, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(user.id, user.email, user.name, user.avatarUrl || null, user.timezone, user.createdAt);

      this.activityBus.emit({
        userId: user.id,
        eventType: 'auth.signup',
        sourceDomain: 'system',
        title: `Signed up via Google OAuth: ${user.name}`,
        description: `New developer account provisioned with email ${user.email}`,
      });
    }

    // Create session (valid for 30 days)
    const sessionToken = `devos_ses_${randomUUID().replace(/-/g, '')}`;
    const expiresDate = new Date();
    expiresDate.setDate(expiresDate.getDate() + 30);
    const expiresAt = expiresDate.toISOString();

    const sessionId = `ses_${randomUUID().replace(/-/g, '').slice(0, 16)}`;
    this.db.prepare(`
      INSERT INTO user_sessions (id, user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(sessionId, user.id, sessionToken, expiresAt, now);

    this.activityBus.emit({
      userId: user.id,
      eventType: 'auth.login',
      sourceDomain: 'system',
      title: `Logged in via Google OAuth`,
      description: `Active session established for ${user.email}`,
    });

    return { user, sessionToken, isNewUser };
  }

  public validateSession(token: string): User | null {
    if (!token) return null;

    const now = new Date().toISOString();
    const row = this.db.prepare(`
      SELECT 
        u.id, u.email, u.name, u.avatar_url, u.timezone, u.created_at,
        s.expires_at, s.id as session_id
      FROM user_sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = ?
    `).get(token) as any;

    if (!row) return null;

    if (row.expires_at < now) {
      // Session has expired -> clean it up
      this.db.prepare('DELETE FROM user_sessions WHERE id = ?').run(row.session_id);
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatar_url,
      timezone: row.timezone,
      createdAt: row.created_at,
    };
  }

  public logout(token: string): boolean {
    if (!token) return false;
    const info = this.db.prepare('DELETE FROM user_sessions WHERE token = ?').run(token);
    return info.changes > 0;
  }

  public getUserById(userId: string): User | null {
    const row = this.db.prepare(
      'SELECT id, email, name, avatar_url, timezone, created_at FROM users WHERE id = ?'
    ).get(userId) as any;

    if (!row) return null;
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      avatarUrl: row.avatar_url,
      timezone: row.timezone,
      createdAt: row.created_at,
    };
  }

  public getOrCreateDefaultDevUser(): { user: User; sessionToken: string } {
    return this.createGoogleUserOrLogin({
      googleId: 'developer_root',
      email: 'developer@devos.local',
      name: 'Lead Engineer',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
    });
  }
}
