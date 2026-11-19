# DevOS — The Personal Developer Operating System (Phase 1 & 2 Release)

> **Single Source of Truth for Your Development Life**  
> Consolidating tasks, projects, GitHub repositories, code reviews, LeetCode/NeetCode mastery, and cross-module activity heatmaps.

---

## ⚡ What is DevOS?

**DevOS** is an **event-driven developer operating system** that connects your software projects, sprint tasks, GitHub repositories, pull requests, coding practice, and focus sessions into one unified, grounded graph.

---

## 🚀 Shipped Modules & Capabilities

### Phase 1: Core Productivity Foundation
1. **Executive Dashboard (Module A)**:
   - Reactive metrics: Current Streak, NeetCode Mastery, Open PRs, In-Flight Tasks.
   - Interactive Top 3 Daily Rocks checklist.
   - Active Project progress trackers with real-time percentage completion.
   - Live 30-Day Heatmap Strip & Universal Activity feed.
   - Global Quick Capture drawer (`todo: ...` auto-scaffolds tasks).
2. **Unified Task Management & Kanban (Module B)**:
   - 5-column Kanban: `Backlog`, `Todo`, `In Progress`, `Blocked`, and `Completed`.
   - Priorities (`Critical`, `High`, `Medium`, `Low`), subtasks, tags, and project linking.
3. **Project Management Hub (Module E)**:
   - Project cards with tech stack badges, categories, and target completion dates.
   - Automated completion percentage recalculated upon task transitions.
4. **Daily Operations & Standup Generator (Module H)**:
   - Interactive 25-minute Pomodoro timer logging directly to the activity bus.
   - Top 3 daily rocks manager.
   - **Automated Daily Standup Generator**: Grounded 1-click synthesis of actual database events (`Accomplishments`, `Today's Plan`, `Blockers & Risks`) with 1-click clipboard copy.

### Phase 2: Developer Integrations & DSA Mastery (NEW)
1. **GitHub Integration (Module C)**:
   - Connect GitHub repositories with stargazers, open issues, and default branch tracking.
   - Pull Request tracker with review state (`pending`, `approved`, `changes_requested`).
   - Recent Git Commits timeline with commit hashes and author metadata.
   - Linking PRs to DevOS projects and tasks.
2. **LeetCode & NeetCode Practice Hub (Module D)**:
   - Pre-seeded **NeetCode 150 Core Roadmap** spanning:
     - *Arrays & Hashing*, *Two Pointers*, *Sliding Window*, *Stack*, *Binary Search*, *Trees*, *Graphs*, *Dynamic Programming*.
   - Filter by topic and status (`Pending`, `Attempted`, `Solved`, `Needs Revision`).
   - Automated **Spaced Repetition Scheduler**: Marking a problem `solved` automatically schedules `next_revision_date` 3 days into the future and emits `dsa.problem_solved`.
   - Track approach notes, time complexity ($O(N)$), space complexity ($O(1)$), and submission runtimes.
3. **Developer Activity Heatmap & Consistency (Section 5.C)**:
   - 60-day visual contribution grid (Tasks completed + Git commits + PR merges + DSA solved + Pomodoro sessions).
   - Current streak and longest streak counter with zero vanity gamification.

---

## 📁 Repository Structure

```text
devos/
├── .agents/
│   ├── hooks.json                     # PreToolUse, PostToolUse, and Stop test-runner hooks
│   ├── hooks/
│   │   ├── pre_tool_guard.sh          # Blocks destructive shell commands (rm -rf, drops)
│   │   ├── post_tool_format.sh        # Formatting automation hook
│   │   └── verify_tests.sh            # Gating hook ensuring 100% passing tests before completion
│   └── skills/
│       ├── task-ops/                  # Task management runbook
│       ├── standup-generator/         # Automated standup synthesis runbook
│       ├── activity-stream/           # Activity bus telemetry runbook
│       ├── github-sync/               # GitHub repos, commits & PR sync runbook
│       └── dsa-tracker/               # LeetCode/NeetCode practice & spaced repetition runbook
├── GEMINI.md                          # Antigravity architectural invariants & rules
├── docker-compose.yml                  # PostgreSQL 16 (with pgvector) + Redis 7
├── package.json                       # Zero external npm dependencies
├── tsconfig.json                      # Strict NodeNext TypeScript configuration
├── src/
│   ├── types.ts                       # Core domain entities (Tasks, Projects, GitHub, DSA, Heatmap)
│   ├── db/
│   │   ├── schema.sql                 # DDL schema (PostgreSQL 16 & SQLite compatible)
│   │   └── client.ts                  # SQLite client & starter seeds (NeetCode 150, GitHub repos)
│   ├── domain/
│   │   ├── activity-bus.ts            # Centralized Activity Event Bus (Pub/Sub + Persistence)
│   │   ├── task-service.ts            # Task CRUD, status updates & dependency resolution
│   │   ├── project-service.ts         # Project hub, milestones & auto-calculated progress %
│   │   ├── daily-service.ts           # Top 3 daily rocks, Pomodoro & Standup Generator
│   │   ├── github-service.ts          # Repositories, PR reviews, commits & project linking
│   │   ├── dsa-service.ts             # NeetCode roadmap, status transitions & spaced repetition
│   │   └── heatmap-service.ts         # 60-day cross-domain contribution aggregator & streak calculator
│   ├── api/
│   │   └── router.ts                  # REST API Router (/api/tasks, /api/github, /api/dsa, etc.)
│   ├── ui/
│   │   └── dashboard.html             # High-density Developer Console UI (Tailwind CSS)
│   └── server.ts                      # HTTP Server entrypoint
└── tests/
    ├── activity-bus.test.ts           # Event emission & subscriber tests
    ├── task-service.test.ts           # Task lifecycle & filtering tests
    ├── project-service.test.ts        # Progress calculation & milestone tests
    ├── daily-service.test.ts          # Standup generation & Pomodoro tests
    ├── github-service.test.ts         # GitHub repo, PR, and commit tests
    ├── dsa-service.test.ts            # NeetCode roadmap, spaced repetition & stats tests
    ├── heatmap-service.test.ts        # Cross-domain heatmap & streak tests
    └── api.test.ts                    # In-memory REST API endpoint tests
```

---

## 🧪 Verification & Test Suite

DevOS is engineered to run on **Node 24** natively with **zero external npm runtime dependencies**:
*   Uses Node native TypeScript type stripping (`--experimental-strip-types`).
*   Uses Node native SQLite (`node:sqlite`).
*   Uses Node native test runner (`node:test`).

Run all 8 test suites:
```bash
cd /Users/ankur/.gemini/antigravity/scratch/devos
npm test
```

```text
✔ ActivityBus - Emits, persists, and notifies subscribers (2.5ms)
✔ ApiRouter - Phase 1 & 2 REST endpoints verification (5.7ms)
✔ DailyService - Priorities, Pomodoro session, and Automated Standup Generator (10.2ms)
✔ DSAService - NeetCode roadmap, status transitions, spaced repetition, and stats (4.2ms)
✔ GitHubService - Connect repo, record commits, and manage pull requests (3.0ms)
✔ HeatmapService - Aggregates cross-domain activities into contribution timeline (5.9ms)
✔ ProjectService - Milestone tracking and auto-calculated progress percentage (7.1ms)
✔ TaskService - Full CRUD and Status Lifecycle (2.3ms)
ℹ tests 8 | pass 8 | fail 0 (133ms)
```

---

## 🚀 How to Run DevOS

Start the local server and UI console:
```bash
cd /Users/ankur/.gemini/antigravity/scratch/devos
npm start
```

Then open your browser to:
👉 **`http://localhost:3000`**

*(Optional: Run `docker compose up -d` whenever you want to test against containerized PostgreSQL 16 with pgvector and Redis 7).*
