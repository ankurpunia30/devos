import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { SCHEMA_SQL } from './schema.ts';

export const DEFAULT_USER_ID = 'usr_devos_root';

export function createDatabase(dbPath: string = ':memory:'): DatabaseSync {
  if (dbPath !== ':memory:') {
    const dir = dirname(dbPath);
    if (dir && dir !== '.' && !existsSync(dir)) {
      try {
        mkdirSync(dir, { recursive: true });
      } catch {}
    }
  }

  const db = new DatabaseSync(dbPath);
  
  // Enable WAL mode and busy timeout for concurrent worker processes in Next.js
  if (dbPath !== ':memory:') {
    try {
      db.exec('PRAGMA journal_mode = WAL;');
      db.exec('PRAGMA busy_timeout = 10000;');
    } catch {}
  }
  db.exec('PRAGMA foreign_keys = ON;');

  // Ensure full schema is initialized directly from bundled TypeScript constant
  db.exec(SCHEMA_SQL);

  // Independently verify and seed every table group
  try {
    seedInitialData(db);
  } catch (err) {
    // If concurrent worker thread is seeding, ignore conflict
  }

  return db;
}

function seedInitialData(db: DatabaseSync) {
  const now = new Date().toISOString();

  // 1. Root User
  const userCheck = db.prepare('SELECT id FROM users WHERE id = ?').get(DEFAULT_USER_ID);
  if (!userCheck) {
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
  }

  // 2. Starter Projects
  const proj1Id = 'proj_devos_core';
  const proj2Id = 'proj_algo_mastery';
  const projCount = (db.prepare('SELECT count(*) as cnt FROM projects WHERE user_id = ?').get(DEFAULT_USER_ID) as any)?.cnt || 0;
  if (projCount === 0) {
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
  }

  // 3. Milestones
  const msCount = (db.prepare('SELECT count(*) as cnt FROM project_milestones').get() as any)?.cnt || 0;
  if (msCount === 0) {
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
      'Deliver GitHub repo/PR sync, LeetCode practice hub, and Activity Heatmap.',
      '2026-12-15',
      0,
      now
    );
  }

  // 4. Initial Tasks
  const task1Id = 'task_setup_schema';
  const task2Id = 'task_build_kanban';
  const task3Id = 'task_wire_standup';
  const taskCount = (db.prepare('SELECT count(*) as cnt FROM tasks WHERE user_id = ?').get(DEFAULT_USER_ID) as any)?.cnt || 0;
  if (taskCount === 0) {
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
  }

  // 5. Initial Activities
  const actCount = (db.prepare('SELECT count(*) as cnt FROM activities WHERE user_id = ?').get(DEFAULT_USER_ID) as any)?.cnt || 0;
  if (actCount === 0) {
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
  }

  // 6. Daily Priorities (Top 3 Rocks)
  const dpCount = (db.prepare('SELECT count(*) as cnt FROM daily_priorities WHERE user_id = ?').get(DEFAULT_USER_ID) as any)?.cnt || 0;
  if (dpCount === 0) {
    const today = now.slice(0, 10);
    db.prepare(`
      INSERT INTO daily_priorities (id, user_id, date, rank, task_id, custom_title, is_completed)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('dp_1', DEFAULT_USER_ID, today, 1, null, 'Ship Phase 2 GitHub & LeetCode Integrations', 1);

    db.prepare(`
      INSERT INTO daily_priorities (id, user_id, date, rank, task_id, custom_title, is_completed)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('dp_2', DEFAULT_USER_ID, today, 2, null, 'Solve LeetCode Trapping Rain Water & 3Sum', 0);

    db.prepare(`
      INSERT INTO daily_priorities (id, user_id, date, rank, task_id, custom_title, is_completed)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run('dp_3', DEFAULT_USER_ID, today, 3, null, 'Review Rust Tokio async scheduling docs', 0);
  }

  // ==========================================
  // Phase 2 Seeds: GitHub Repositories & PRs
  // ==========================================
  const ghCount = (db.prepare('SELECT count(*) as cnt FROM github_repositories WHERE user_id = ?').get(DEFAULT_USER_ID) as any)?.cnt || 0;
  if (ghCount === 0) {
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
  }

  // ==========================================
  // Phase 2 Seeds: LeetCode Topics & Problems
  // ==========================================
  const topicCount = (db.prepare('SELECT count(*) as cnt FROM dsa_topics').get() as any)?.cnt || 0;
  if (topicCount === 0) {
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
  }

  const dsaProbCount = (db.prepare('SELECT count(*) as cnt FROM dsa_problems WHERE user_id = ?').get(DEFAULT_USER_ID) as any)?.cnt || 0;
  if (dsaProbCount === 0) {
    // Check if user already has connected LeetCode integration with high solve count
    let userHasHighScore = false;
    try {
      const leetcodeInt = db.prepare(
        "SELECT metadata FROM user_integrations WHERE user_id = ? AND provider = 'leetcode' AND status = 'connected'"
      ).get(DEFAULT_USER_ID) as any;
      if (leetcodeInt?.metadata) {
        const meta = JSON.parse(leetcodeInt.metadata);
        if ((meta.totalSolved || 0) >= 100) {
          userHasHighScore = true;
        }
      }
    } catch {}

    const problems = [
      // Arrays & Hashing
      { topic: 'arrays-hashing', title: 'Contains Duplicate', slug: 'contains-duplicate', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/contains-duplicate/' },
      { topic: 'arrays-hashing', title: 'Valid Anagram', slug: 'valid-anagram', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/valid-anagram/' },
      { topic: 'arrays-hashing', title: 'Two Sum', slug: 'two-sum', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/two-sum/' },
      { topic: 'arrays-hashing', title: 'Group Anagrams', slug: 'group-anagrams', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/group-anagrams/' },
      { topic: 'arrays-hashing', title: 'Top K Frequent Elements', slug: 'top-k-frequent-elements', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/top-k-frequent-elements/' },
      { topic: 'arrays-hashing', title: 'Product of Array Except Self', slug: 'product-of-array-except-self', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/product-of-array-except-self/' },
      { topic: 'arrays-hashing', title: 'Longest Consecutive Sequence', slug: 'longest-consecutive-sequence', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
      
      // Two Pointers
      { topic: 'two-pointers', title: 'Valid Palindrome', slug: 'valid-palindrome', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/valid-palindrome/' },
      { topic: 'two-pointers', title: 'Two Sum II - Input Array Is Sorted', slug: 'two-sum-ii-input-array-is-sorted', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
      { topic: 'two-pointers', title: '3Sum', slug: '3sum', diff: 'medium', status: 'revision_needed', url: 'https://leetcode.com/problems/3sum/' },
      { topic: 'two-pointers', title: 'Container With Most Water', slug: 'container-with-most-water', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/container-with-most-water/' },
      { topic: 'two-pointers', title: 'Trapping Rain Water', slug: 'trapping-rain-water', diff: 'hard', status: userHasHighScore ? 'solved' : 'pending', url: 'https://leetcode.com/problems/trapping-rain-water/' },

      // Sliding Window
      { topic: 'sliding-window', title: 'Best Time to Buy And Sell Stock', slug: 'best-time-to-buy-and-sell-stock', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
      { topic: 'sliding-window', title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring-without-repeating-characters', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
      { topic: 'sliding-window', title: 'Longest Repeating Character Replacement', slug: 'longest-repeating-character-replacement', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
      { topic: 'sliding-window', title: 'Minimum Window Substring', slug: 'minimum-window-substring', diff: 'hard', status: userHasHighScore ? 'solved' : 'pending', url: 'https://leetcode.com/problems/minimum-window-substring/' },

      // Stack
      { topic: 'stack', title: 'Valid Parentheses', slug: 'valid-parentheses', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/valid-parentheses/' },
      { topic: 'stack', title: 'Min Stack', slug: 'min-stack', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/min-stack/' },
      { topic: 'stack', title: 'Evaluate Reverse Polish Notation', slug: 'evaluate-reverse-polish-notation', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/' },
      { topic: 'stack', title: 'Daily Temperatures', slug: 'daily-temperatures', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/daily-temperatures/' },
      
      // Binary Search
      { topic: 'binary-search', title: 'Binary Search', slug: 'binary-search', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/binary-search/' },
      { topic: 'binary-search', title: 'Search a 2D Matrix', slug: 'search-a-2d-matrix', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/search-a-2d-matrix/' },
      { topic: 'binary-search', title: 'Find Minimum in Rotated Sorted Array', slug: 'find-minimum-in-rotated-sorted-array', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
      
      // Linked List
      { topic: 'linked-list', title: 'Reverse Linked List', slug: 'reverse-linked-list', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/reverse-linked-list/' },
      { topic: 'linked-list', title: 'Merge Two Sorted Lists', slug: 'merge-two-sorted-lists', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
      { topic: 'linked-list', title: 'LRU Cache', slug: 'lru-cache', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/lru-cache/' },

      // Trees
      { topic: 'trees', title: 'Invert Binary Tree', slug: 'invert-binary-tree', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/invert-binary-tree/' },
      { topic: 'trees', title: 'Maximum Depth of Binary Tree', slug: 'maximum-depth-of-binary-tree', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
      { topic: 'trees', title: 'Lowest Common Ancestor of a BST', slug: 'lowest-common-ancestor-of-a-binary-search-tree', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' },
      { topic: 'trees', title: 'Binary Tree Level Order Traversal', slug: 'binary-tree-level-order-traversal', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },

      // Graphs
      { topic: 'graphs', title: 'Number of Islands', slug: 'number-of-islands', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/number-of-islands/' },
      { topic: 'graphs', title: 'Clone Graph', slug: 'clone-graph', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/clone-graph/' },
      { topic: 'graphs', title: 'Course Schedule', slug: 'course-schedule', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/course-schedule/' },

      // Dynamic Programming
      { topic: 'dp', title: 'Climbing Stairs', slug: 'climbing-stairs', diff: 'easy', status: 'solved', url: 'https://leetcode.com/problems/climbing-stairs/' },
      { topic: 'dp', title: 'Coin Change', slug: 'coin-change', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/coin-change/' },
      { topic: 'dp', title: 'Longest Increasing Subsequence', slug: 'longest-increasing-subsequence', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
      { topic: 'dp', title: 'Word Break', slug: 'word-break', diff: 'medium', status: 'solved', url: 'https://leetcode.com/problems/word-break/' },
    ];

    const insertProb = db.prepare(`
      INSERT INTO dsa_problems (id, user_id, topic_id, title, slug, difficulty, leetcode_url, neetcode_roadmap_flag, status, created_at, last_solved_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `);

    for (let i = 0; i < problems.length; i++) {
      const p = problems[i];
      const finalStatus = userHasHighScore ? 'solved' : p.status;
      const isSolved = finalStatus === 'solved' || finalStatus === 'revision_needed';
      insertProb.run(
        `dsa_${i + 1}`,
        DEFAULT_USER_ID,
        p.topic,
        p.title,
        p.slug,
        p.diff,
        p.url,
        finalStatus,
        now,
        isSolved ? now : null
      );
    }
  }

  // 7. Career Applications
  const careerCount = (db.prepare('SELECT count(*) as cnt FROM career_applications WHERE user_id = ?').get(DEFAULT_USER_ID) as any)?.cnt || 0;
  if (careerCount === 0) {
    const insertCareerApp = db.prepare(`
      INSERT INTO career_applications (id, user_id, company, role, stage, salary_range, location, applied_date, next_interview_date, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertCareerApp.run(
      'app_1',
      DEFAULT_USER_ID,
      'Stripe',
      'Principal Infrastructure Engineer',
      'offer',
      '$420,000 - $480,000',
      'San Francisco / Remote',
      '2026-10-15',
      null,
      'Offer received. Discussing signing equity grant and remote flexibility.',
      now,
      now
    );
    insertCareerApp.run(
      'app_2',
      DEFAULT_USER_ID,
      'Google',
      'Staff Software Engineer (Cloud Spanner)',
      'technical',
      '$380,000 - $440,000',
      'Mountain View / Hybrid',
      '2026-10-28',
      '2026-11-26',
      'System design & coding round 3 scheduled. Review distributed consensus and Raft.',
      now,
      now
    );
    insertCareerApp.run(
      'app_3',
      DEFAULT_USER_ID,
      'Databricks',
      'Senior Distributed Storage Engineer',
      'screening',
      '$340,000 - $390,000',
      'Seattle / Remote',
      '2026-11-05',
      '2026-11-24',
      'Initial technical recruiter screening completed. Preparing for Lakehouse architecture deep-dive.',
      now,
      now
    );
  }

  // 8. Career STAR Questions
  const qCount = (db.prepare('SELECT count(*) as cnt FROM career_questions WHERE user_id = ?').get(DEFAULT_USER_ID) as any)?.cnt || 0;
  if (qCount === 0) {
    const insertQuestion = db.prepare(`
      INSERT INTO career_questions (id, user_id, company, question, category, star_situation, star_task, star_action, star_result, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertQuestion.run(
      'q_1',
      DEFAULT_USER_ID,
      'Google',
      'Tell me about a high-severity production outage you mitigated under high pressure.',
      'behavioral',
      'During peak traffic, a Redis cluster split-brain event triggered cascading timeouts across payment checkout services.',
      'Halt cascading failovers and restore cache consistency without dropping in-flight credit card authorizations.',
      'Engaged read-through circuit breakers to fall back to read-replicas, applied rate limiting to non-critical traffic, and rebuilt the partitioned shard.',
      'Payment API P99 latency dropped from 9.2s back to 45ms within 4 minutes. Zero financial transactions lost.',
      'Frequently asked in Staff+ behavioral rounds.',
      now
    );
    insertQuestion.run(
      'q_2',
      DEFAULT_USER_ID,
      'Stripe',
      'Design an idempotent distributed payment processing engine with zero double-charge risk.',
      'system_design',
      'Network timeouts and retry storms can cause payment webhook duplicate executions.',
      'Ensure exactly-once semantics for payment intents even across server crashes and network retransmits.',
      'Used unique client idempotency keys combined with PostgreSQL row-level locks and Redis distributed locks.',
      'Achieved 100% financial transaction deduplication across millions of daily API calls.',
      'Deep dive into two-phase commit vs Saga pattern.',
      now
    );
  }

  // 9. Architecture Decision Records (ADRs)
  const adrCount = (db.prepare('SELECT count(*) as cnt FROM architecture_decisions WHERE user_id = ?').get(DEFAULT_USER_ID) as any)?.cnt || 0;
  if (adrCount === 0) {
    const insertAdr = db.prepare(`
      INSERT INTO architecture_decisions (id, user_id, project_id, adr_number, title, status, context, decision, consequences, mermaid_diagram, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertAdr.run(
      'adr_1',
      DEFAULT_USER_ID,
      'proj_devos_core',
      1,
      'Adopt Event-Driven Activity Bus over Database Polling',
      'accepted',
      'Multiple modules (tasks, projects, github, standup, heatmap) require real-time synchronization upon state changes.',
      'Implement a lightweight in-process pub/sub ActivityBus that persists events to SQLite and notifies listeners asynchronously.',
      'Eliminates polling overhead, ensures auditability, and provides zero-latency reactivity.',
      'graph LR\n  Task[Task Service] --> Bus[Activity Bus]\n  Bus --> DB[(SQLite Activities)]\n  Bus --> Heatmap[Heatmap Engine]\n  Bus --> Standup[Standup Generator]',
      now,
      now
    );
    insertAdr.run(
      'adr_2',
      DEFAULT_USER_ID,
      'proj_devos_core',
      2,
      'Use SQLite in WAL Mode for Single-Tenant Zero-Latency Storage',
      'accepted',
      'DevOS requires a single source of truth that runs completely locally without external cloud dependencies or network latency.',
      'Use Node 24 native node:sqlite with Write-Ahead Logging (WAL) and busy_timeout=10000ms.',
      'Zero docker dependencies required, sub-millisecond query latencies, safe across concurrent Next.js worker threads.',
      null,
      now,
      now
    );
  }

  // 10. Deployments & Environments
  const depCount = (db.prepare('SELECT count(*) as cnt FROM deployments WHERE user_id = ?').get(DEFAULT_USER_ID) as any)?.cnt || 0;
  if (depCount === 0) {
    const insertDeploy = db.prepare(`
      INSERT INTO deployments (id, user_id, project_id, environment, version_tag, commit_sha, status, rollback_plan, deployed_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertDeploy.run(
      'dep_1',
      DEFAULT_USER_ID,
      'proj_devos_core',
      'prod',
      'v2.0.0',
      'a4b5d89',
      'healthy',
      'Rollback target: v1.9.4. Run: git checkout v1.9.4 && npm run build && pm2 reload devos-prod',
      new Date(Date.now() - 3600000 * 4).toISOString(),
      now
    );
    insertDeploy.run(
      'dep_2',
      DEFAULT_USER_ID,
      'proj_devos_core',
      'staging',
      'v2.1.0-rc2',
      'd81e3a9',
      'healthy',
      'Rollback target: v2.0.0',
      new Date(Date.now() - 3600000 * 12).toISOString(),
      now
    );
    insertDeploy.run(
      'dep_3',
      DEFAULT_USER_ID,
      'proj_devos_core',
      'dev',
      'v2.2.0-nightly',
      'f491c01',
      'deploying',
      'Automatic trunk branch re-deployment upon git push.',
      new Date().toISOString(),
      now
    );
  }
}
