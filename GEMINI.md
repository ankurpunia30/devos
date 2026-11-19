# DevOS System Architecture & Architectural Invariants

DevOS is the personal **Developer Operating System**—a unified productivity, engineering management, and telemetry platform. When working within this codebase, the agent must strictly adhere to the non-negotiable architectural invariants and standards outlined below.

---

## 1. Core Architectural Invariants

- **Next.js 15 App Router & React 19 Paradigm**:
  - **Server Components by Default**: All page and layout components in `src/app/` must remain React Server Components unless client-side state, event handlers (`onClick`, `onChange`), or browser APIs are explicitly required.
  - **Client Component Boundary**: Mark interactive client components with `'use client'` at the very top. Keep client component trees as small as possible; pass server-fetched data as props from server components.
  - **Route Handlers**: API endpoints live exclusively in `src/app/api/**/route.ts` using `NextRequest` and `NextResponse`.
- **Domain Layer Isolation**:
  - `src/types.ts`: The single source of truth for all domain interfaces. Always use `import type { ... }` when importing interfaces to guarantee zero runtime emission issues in TypeScript strip-only mode.
  - `src/domain/`: Pure domain business logic (`task-service.ts`, `project-service.ts`, `github-service.ts`, `dsa-service.ts`, `daily-service.ts`, `heatmap-service.ts`, `activity-bus.ts`).
  - **Zero Transport Leakage**: Domain services must never import Next.js request/response objects, React hooks, or HTTP abstractions.
- **The Universal Activity Invariant (Mandatory)**:
  - Every state mutation (task completed, project status altered, commit synced, PR opened/merged, DSA problem solved, pomodoro completed) **MUST** emit an event via `activityBus.emit(...)`.
  - Zero un-audited database writes. The `activities` table is the ground-truth telemetry log feeding the live dashboard, daily standup generator, heatmap, and AI assistant.
- **Persistence & Singleton Services**:
  - Use the service singletons exported from `@/lib/services` to ensure shared in-memory database handles and event subscriptions.
  - Schema changes must update `src/db/schema.sql` maintaining dual compatibility with SQLite (`node:sqlite`) and PostgreSQL 16.

---

## 2. Code & Type Safety Standards

- **TypeScript Constructors**:
  - Avoid TypeScript parameter properties (`constructor(private db: DatabaseSync)`) as they are incompatible with Node native strip-only mode. Always declare class properties explicitly:
    ```typescript
    private db: DatabaseSync;
    constructor(db: DatabaseSync) {
      this.db = db;
    }
    ```
- **Standardized API Response Envelopes**:
  - Success: `NextResponse.json({ success: true, data: T }, { status: 200 | 201 })`
  - Error: `NextResponse.json({ success: false, error: string }, { status: 400 | 404 | 500 })`

---

## 3. Verification & Test Gate

- Any modification to domain services or API routes must be accompanied by corresponding unit or integration tests in `tests/`.
- Always verify all 8 test suites pass via `npm test` before declaring any ticket or feature complete.
- The `Stop` verification hook will reject termination if any test fails.
