# Scoped Rules: Domain Business Logic (`src/domain/**`)

These rules apply strictly to all core domain services within this directory.

---

## Domain Service Invariants

1. **Pure Domain Model**:
   - Zero coupling to Next.js or React. Do not import `NextRequest`, `NextResponse`, `React`, or JSX.
   - Accept typed TypeScript parameters; return typed domain models.

2. **Mandatory Activity Bus Telemetry**:
   - Every state-mutating method (`create*`, `update*`, `delete*`, `record*`, `toggle*`) must call:
     ```typescript
     this.activityBus.emit({
       userId,
       eventType: 'domain.action',
       sourceDomain: 'tasks' | 'projects' | 'daily' | 'github' | 'dsa',
       title: 'Action summary',
       ...
     });
     ```
   - Un-emitted mutations break the live dashboard, daily standup generator, and activity heatmap.

3. **Explicit Class Property Assignments**:
   - Do not use TypeScript parameter properties (`constructor(private db: DatabaseSync)`).
   - Declare properties explicitly at class level and assign in constructor for native TypeScript strip-only compatibility:
     ```typescript
     export class MyService {
       private db: DatabaseSync;
       private activityBus: ActivityBus;

       constructor(db: DatabaseSync, activityBus: ActivityBus) {
         this.db = db;
         this.activityBus = activityBus;
       }
     }
     ```

4. **Idempotent Identifiers**:
   - Use `randomUUID()` prefixed by entity type (e.g., `task_${randomUUID()}`, `proj_${randomUUID()}`, `act_${randomUUID()}`) for unique IDs.
