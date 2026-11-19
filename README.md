# DevOS — The Personal Developer Operating System (Phase 1 MVP)

> **Single Source of Truth for Your Development Life**  
> Consolidating tasks, projects, daily operations, telemetry, and automated engineering standups.

---

## ⚡ What is DevOS?

**DevOS** is not another todo list. It is an **event-driven developer operating system** that connects your software projects, sprint tasks, focus sessions, and daily engineering reflections into one unified graph.

### Phase 1 MVP Capabilities (Shipped & Verified)

1. **Executive Dashboard (Module A)**:
   - Reactive metrics: Today's Rocks, Active Projects, In-Flight Tasks, Completed items.
   - Interactive Top 3 Daily Rocks checklist.
   - Active Project progress trackers with real-time percentage completion.
   - Live Universal Activity feed.
   - Global Quick Capture input (create notes or tasks with `todo: ...` prefix).

2. **Unified Task Management & Kanban (Module B)**:
   - 5-column Kanban board: `Backlog`, `Todo`, `In Progress`, `Blocked`, and `Completed`.
   - Priorities: `Critical`, `High`, `Medium`, and `Low`.
   - Subtasks, tags, estimated minutes, and project linking.
   - Instant state updates that automatically recalculate parent project progress.

3. **Project Management Hub (Module E)**:
   - Project cards with tech stack badges, category (`personal`, `learning`, `professional`), and target completion dates.
   - Automated progress calculation based on task completion ratio.
   - Project milestones and architectural descriptions.

4. **Daily Operations & Standup Generator (Module H)**:
   - Interactive 25-minute Pomodoro focus timer with auto-logging to the activity stream.
   - Today's Top 3 priorities manager.
   - **Automated Daily Standup Generator**: One-click synthesis of actual database events into formatted markdown (`Accomplishments`, `Today's Plan`, `Blockers & Risks`) with 1-click clipboard copy.

5. **Universal Activity Bus (Section 3)**:
   - Centralized pub/sub event ledger capturing all mutations across tasks, projects, and daily focus.
   - Grounded data source for zero-hallucination reporting.

---

## 🚀 Quick Start

### 1. Zero-Dependency Native Run (Recommended)
DevOS is engineered to run on **Node 24** natively with **zero external npm runtime dependencies**:
- Uses Node native TypeScript type stripping (`--experimental-strip-types`).
- Uses Node native SQLite (`node:sqlite`).
- Uses Node native test runner (`node:test`).

```bash
cd /Users/ankur/.gemini/antigravity/scratch/devos

# Run the local server & UI
npm start
```

Open your browser to:
👉 **`http://localhost:3000`**

### 2. Run Tests
Execute the full unit and integration test suite:
```bash
npm test
```
*All 5 test suites pass in ~100ms with zero network or external dependencies.*

---

## 🐳 Optional: PostgreSQL 16 + Redis + pgvector

For production containerized deployment:
```bash
docker compose up -d
```
Spins up PostgreSQL 16 with `pgvector` enabled and Redis 7 on ports `5432` and `6379`.

---

## 📁 Repository Structure

```text
devos/
├── .agents/
│   ├── hooks.json                     # Lifecycle Hook definitions
│   ├── hooks/
│   │   ├── pre_tool_guard.sh          # PreToolUse security guard
│   │   ├── post_tool_format.sh        # PostToolUse formatter
│   │   └── verify_tests.sh            # Stop hook test verification
│   └── skills/
│       ├── task-ops/                  # Task management runbook
│       ├── standup-generator/         # Automated standup synthesis runbook
│       └── activity-stream/           # Activity bus telemetry runbook
├── GEMINI.md                          # Antigravity architectural invariants & rules
├── docker-compose.yml                  # PostgreSQL 16 + Redis + pgvector
├── package.json
├── tsconfig.json
├── src/
│   ├── types.ts                       # Core domain entity interfaces
│   ├── db/
│   │   ├── schema.sql                 # DDL schema (PostgreSQL & SQLite compatible)
│   │   └── client.ts                  # SQLite client & initial starter seed
│   ├── domain/
│   │   ├── activity-bus.ts            # Centralized activity event bus
│   │   ├── task-service.ts            # Task CRUD, status & dependency engine
│   │   ├── project-service.ts         # Projects, milestones & progress calculation
│   │   └── daily-service.ts           # Daily rocks, Pomodoro & Standup generator
│   ├── api/
│   │   └── router.ts                  # Clean REST API router
│   ├── ui/
│   │   └── dashboard.html             # High-density developer console UI
│   └── server.ts                      # HTTP Server entrypoint
└── tests/
    ├── activity-bus.test.ts           # Event emission & subscriber tests
    ├── task-service.test.ts           # Task lifecycle & filtering tests
    ├── project-service.test.ts        # Progress calculation & milestone tests
    ├── daily-service.test.ts          # Standup generation & Pomodoro tests
    └── api.test.ts                    # In-memory REST API endpoint tests
```
