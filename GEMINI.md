# DevOS Workspace Rules & Invariants

This workspace houses **DevOS**, the Personal Developer Operating System. When modifying or extending code in this repository, the agent must strictly comply with the following architectural invariants.

---

## 1. Architectural Invariants

- **Domain-Driven Layering**:
  - `src/types.ts`: Single source of truth for all domain interfaces and types.
  - `src/db/`: Persistence abstractions and schema migrations (`node:sqlite` local, PostgreSQL 16 compatible).
  - `src/domain/`: Pure business logic (`activity-bus.ts`, `task-service.ts`, `project-service.ts`, `daily-service.ts`). Domain services must never depend directly on HTTP transport abstractions.
  - `src/api/`: REST routing and transport translation.
  - `src/ui/`: Presentation layer and dashboard assets.
- **The Universal Activity Rule**:
  - Every consequential mutation (task created/completed, project status change, pomodoro finished) MUST emit an event through the `ActivityBus`.
  - Never mutate state in the database without an accompanying activity event.
- **Zero-Dependency Core**:
  - The application is engineered to run natively on Node 24 with native TypeScript type stripping (`--experimental-strip-types`), native SQLite (`node:sqlite`), and the native test runner (`node:test`). Do not add heavy external runtime dependencies without architectural approval.
- **Type-Only Imports**:
  - When importing TypeScript interfaces from `types.ts`, always use `import type { ... }` to ensure zero runtime emission issues in strip-only mode.

---

## 2. Testing Invariants

- All domain methods and API endpoints must have co-located or directory-scoped tests in `tests/`.
- Run tests via `npm test` before concluding any ticket or proposing changes.
- Never bypass the `Stop` verification hook when tests are failing.
