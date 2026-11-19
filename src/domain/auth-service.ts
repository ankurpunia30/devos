import type { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
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
