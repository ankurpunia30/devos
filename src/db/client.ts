import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const DEFAULT_USER_ID = 'usr_devos_root';

export function createDatabase(dbPath: string = ':memory:'): DatabaseSync {
  const db = new DatabaseSync(dbPath);
  
  // Enable foreign keys
  db.exec('PRAGMA foreign_keys = ON;');

  // Read and apply schema
  const schemaPath = join(__dirname, 'schema.sql');
  const schemaSql = readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);

  // Check if seed user exists
  const existingUser = db.prepare('SELECT id FROM users WHERE id = ?').get(DEFAULT_USER_ID);
  if (!existingUser) {
    seedInitialData(db);
  }

  return db;
}

function seedInitialData(db: DatabaseSync) {
  const now = new Date().toISOString();

  // 1. Root User
  db.prepare(`
    INSERT INTO users (id, email, name, avatar_url, timezone, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    DEFAULT_USER_ID,
    'developer@devos.local',
    'Lead Engineer',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop',
    'UTC',
    now
  );

  // 2. Starter Projects
  const proj1Id = 'proj_devos_core';
  const proj2Id = 'proj_algo_mastery';

  db.prepare(`
    INSERT INTO projects (id, user_id, name, slug, description, status, category, tech_stack, architecture_overview, target_completion_date, progress_percentage, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    proj1Id,
    DEFAULT_USER_ID,
    'DevOS Platform',
    'devos-platform',
    'Personal Developer Operating System consolidating productivity, Git, and knowledge management.',
    'in_progress',
    'personal',
    JSON.stringify(['TypeScript', 'Node.js', 'SQLite', 'TailwindCSS']),
    'Event-driven modular monolith with normalized SQLite/Postgres persistence.',
    '2026-12-31',
    40,
    now,
    now
  );

  db.prepare(`
    INSERT INTO projects (id, user_id, name, slug, description, status, category, tech_stack, architecture_overview, target_completion_date, progress_percentage, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    proj2Id,
    DEFAULT_USER_ID,
    'Distributed Systems Engine',
    'distributed-systems-engine',
    'Raft consensus and Paxos replication implementation in Rust.',
    'planning',
    'learning',
    JSON.stringify(['Rust', 'Tokio', 'gRPC']),
    'Multi-node distributed log with leader election and snapshot compaction.',
    '2027-02-15',
    15,
    now,
    now
  );

  // 3. Milestones
  db.prepare(`
    INSERT INTO project_milestones (id, project_id, title, description, due_date, is_completed, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'ms_devos_phase1',
    proj1Id,
    'Phase 1: Core Productivity Foundation',
    'Deliver Task Kanban, Project Hub, Daily Workspace, and Activity Bus.',
    '2026-11-30',
    0,
    now
  );

  // 4. Initial Tasks
  const task1Id = 'task_setup_schema';
  const task2Id = 'task_build_kanban';
  const task3Id = 'task_wire_standup';

  db.prepare(`
    INSERT INTO tasks (id, user_id, project_id, title, description, priority, status, due_date, estimated_minutes, actual_minutes, tags, completed_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    task1Id,
    DEFAULT_USER_ID,
    proj1Id,
    'Design and verify DevOS Phase 1 unified database schema',
    'Normalized tables for projects, tasks, activities, and daily operations.',
    'critical',
    'completed',
    now,
    60,
    45,
    JSON.stringify(['database', 'schema', 'architecture']),
    now,
    now,
    now
  );

  db.prepare(`
    INSERT INTO tasks (id, user_id, project_id, title, description, priority, status, due_date, estimated_minutes, actual_minutes, tags, completed_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    task2Id,
    DEFAULT_USER_ID,
    proj1Id,
    'Build high-density Task Kanban and List management interface',
    'Support drag-and-drop status transitions, priority filtering, and subtasks.',
    'high',
    'in_progress',
    now,
    120,
    60,
    JSON.stringify(['frontend', 'ui', 'tasks']),
    null,
    now,
    now
  );

  db.prepare(`
    INSERT INTO tasks (id, user_id, project_id, title, description, priority, status, due_date, estimated_minutes, actual_minutes, tags, completed_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    task3Id,
    DEFAULT_USER_ID,
    proj1Id,
    'Implement automated daily standup generator',
    'Synthesize yesterday accomplishments and today priorities into markdown.',
    'medium',
    'todo',
    now,
    45,
    0,
    JSON.stringify(['standup', 'ai', 'productivity']),
    null,
    now,
    now
  );

  // 5. Initial Activities
  db.prepare(`
    INSERT INTO activities (id, user_id, event_type, source_domain, project_id, task_id, title, description, metadata, occurred_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'act_init_1',
    DEFAULT_USER_ID,
    'task.completed',
    'tasks',
    proj1Id,
    task1Id,
    'Completed task: Design and verify DevOS Phase 1 unified database schema',
    'Unified relational schema verified with Node 24 native SQLite engine.',
    JSON.stringify({ duration_minutes: 45 }),
    now,
    now
  );

  // 6. Daily Priorities (Top 3 Rocks)
  const today = now.slice(0, 10);
  db.prepare(`
    INSERT INTO daily_priorities (id, user_id, date, rank, task_id, custom_title, is_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('dp_1', DEFAULT_USER_ID, today, 1, task2Id, null, 0);

  db.prepare(`
    INSERT INTO daily_priorities (id, user_id, date, rank, task_id, custom_title, is_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('dp_2', DEFAULT_USER_ID, today, 2, task3Id, null, 0);

  db.prepare(`
    INSERT INTO daily_priorities (id, user_id, date, rank, task_id, custom_title, is_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('dp_3', DEFAULT_USER_ID, today, 3, null, 'Review Rust Tokio async scheduling docs', 0);
}
