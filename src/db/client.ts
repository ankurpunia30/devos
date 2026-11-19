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
    1,
    now
  );

  db.prepare(`
    INSERT INTO project_milestones (id, project_id, title, description, due_date, is_completed, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'ms_devos_phase2',
    proj1Id,
    'Phase 2: Developer Integrations (GitHub & LeetCode)',
    'Deliver GitHub repo/PR sync, NeetCode 150 practice hub, and Activity Heatmap.',
    '2026-12-15',
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
    'completed',
    now,
    120,
    60,
    JSON.stringify(['frontend', 'ui', 'tasks']),
    now,
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
    'completed',
    now,
    45,
    30,
    JSON.stringify(['standup', 'ai', 'productivity']),
    now,
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
  `).run('dp_1', DEFAULT_USER_ID, today, 1, null, 'Ship Phase 2 GitHub & LeetCode Integrations', 1);

  db.prepare(`
    INSERT INTO daily_priorities (id, user_id, date, rank, task_id, custom_title, is_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('dp_2', DEFAULT_USER_ID, today, 2, null, 'Solve NeetCode Trapping Rain Water & 3Sum', 0);

  db.prepare(`
    INSERT INTO daily_priorities (id, user_id, date, rank, task_id, custom_title, is_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('dp_3', DEFAULT_USER_ID, today, 3, null, 'Review Rust Tokio async scheduling docs', 0);

  // ==========================================
  // Phase 2 Seeds: GitHub Repositories & PRs
  // ==========================================
  const repo1Id = 'gh_repo_devos';
  db.prepare(`
    INSERT INTO github_repositories (id, user_id, project_id, github_repo_id, name, full_name, html_url, description, is_private, default_branch, open_issues_count, stargazers_count, last_synced_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    repo1Id,
    DEFAULT_USER_ID,
    proj1Id,
    87654321,
    'devos',
    'ankur/devos',
    'https://github.com/ankur/devos',
    'Personal Developer Operating System built for deep productivity and zero context-switching.',
    1,
    'main',
    2,
    14,
    now,
    now
  );

  db.prepare(`
    INSERT INTO github_pull_requests (id, repository_id, task_id, github_pr_id, number, title, state, author_login, html_url, review_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'pr_101',
    repo1Id,
    null,
    9876501,
    12,
    'feat(integrations): GitHub sync adapter & LeetCode roadmap tracker',
    'open',
    'ankur',
    'https://github.com/ankur/devos/pull/12',
    'approved',
    now
  );

  db.prepare(`
    INSERT INTO github_commits (id, repository_id, sha, message, author_name, author_email, html_url, committed_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'cmt_1',
    repo1Id,
    '7fde09d',
    'feat(phase-1): core productivity foundation release',
    'Lead Engineer',
    'developer@devos.local',
    'https://github.com/ankur/devos/commit/7fde09d',
    now,
    now
  );

  // ==========================================
  // Phase 2 Seeds: NeetCode 150 Topics & Problems
  // ==========================================
  const topics = [
    { id: 'arrays-hashing', name: 'Arrays & Hashing', order: 1 },
    { id: 'two-pointers', name: 'Two Pointers', order: 2 },
    { id: 'sliding-window', name: 'Sliding Window', order: 3 },
    { id: 'stack', name: 'Stack', order: 4 },
    { id: 'binary-search', name: 'Binary Search', order: 5 },
    { id: 'linked-list', name: 'Linked List', order: 6 },
    { id: 'trees', name: 'Trees', order: 7 },
    { id: 'graphs', name: 'Graphs', order: 8 },
    { id: 'dp', name: 'Dynamic Programming', order: 9 },
  ];

  const insertTopic = db.prepare('INSERT INTO dsa_topics (id, name, display_order) VALUES (?, ?, ?)');
  for (const t of topics) {
    insertTopic.run(t.id, t.name, t.order);
  }

  const problems = [
    // Arrays & Hashing
    { topic: 'arrays-hashing', title: 'Contains Duplicate', slug: 'contains-duplicate', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/contains-duplicate/' },
    { topic: 'arrays-hashing', title: 'Valid Anagram', slug: 'valid-anagram', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/valid-anagram/' },
    { topic: 'arrays-hashing', title: 'Two Sum', slug: 'two-sum', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/two-sum/' },
    { topic: 'arrays-hashing', title: 'Group Anagrams', slug: 'group-anagrams', diff: 'medium', status: 'attempted', url: 'https://leetcode.com/problems/group-anagrams/' },
    { topic: 'arrays-hashing', title: 'Top K Frequent Elements', slug: 'top-k-frequent-elements', diff: 'medium', status: 'pending', url: 'https://leetcode.com/problems/top-k-frequent-elements/' },
    
    // Two Pointers
    { topic: 'two-pointers', title: 'Valid Palindrome', slug: 'valid-palindrome', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/valid-palindrome/' },
    { topic: 'two-pointers', title: '3Sum', slug: '3sum', diff: 'medium', status: 'revision_needed', url: 'https://leetcode.com/problems/3sum/' },
    { topic: 'two-pointers', title: 'Container With Most Water', slug: 'container-with-most-water', diff: 'medium', status: 'pending', url: 'https://leetcode.com/problems/container-with-most-water/' },
    { topic: 'two-pointers', title: 'Trapping Rain Water', slug: 'trapping-rain-water', diff: 'hard', status: 'pending', url: 'https://leetcode.com/problems/trapping-rain-water/' },

    // Sliding Window
    { topic: 'sliding-window', title: 'Best Time to Buy And Sell Stock', slug: 'best-time-to-buy-and-sell-stock', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
    { topic: 'sliding-window', title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
    
    // Trees
    { topic: 'trees', title: 'Invert Binary Tree', slug: 'invert-binary-tree', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/invert-binary-tree/' },
    { topic: 'trees', title: 'Maximum Depth of Binary Tree', slug: 'maximum-depth-of-binary-tree', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
    { topic: 'trees', title: 'Lowest Common Ancestor of a BST', slug: 'lowest-common-ancestor-of-a-binary-search-tree', diff: 'medium', status: 'pending', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' },

    // Graphs
    { topic: 'graphs', title: 'Number of Islands', slug: 'number-of-islands', diff: 'medium', status: 'attempted', url: 'https://leetcode.com/problems/number-of-islands/' },
    { topic: 'graphs', title: 'Clone Graph', slug: 'clone-graph', diff: 'medium', status: 'pending', url: 'https://leetcode.com/problems/clone-graph/' },

    // Dynamic Programming
    { topic: 'dp', title: 'Climbing Stairs', slug: 'climbing-stairs', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/climbing-stairs/' },
    { topic: 'dp', title: 'Coin Change', slug: 'coin-change', diff: 'medium', status: 'pending', url: 'https://leetcode.com/problems/coin-change/' },
    { topic: 'dp', title: 'Longest Increasing Subsequence', slug: 'longest-increasing-subsequence', diff: 'medium', status: 'pending', url: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
  ];

  const insertProb = db.prepare(`
    INSERT INTO dsa_problems (id, user_id, topic_id, title, slug, difficulty, leetcode_url, neetcode_roadmap_flag, status, created_at, last_solved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
  `);

  for (let i = 0; i < problems.length; i++) {
    const p = problems[i];
    const isSolved = p.status === 'solved' || p.status === 'revision_needed';
    insertProb.run(
      `dsa_${i + 1}`,
      DEFAULT_USER_ID,
      p.topic,
      p.title,
      p.slug,
      p.diff,
      p.url,
      p.status,
      now,
      isSolved ? now : null
    );
  }
}
