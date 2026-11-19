# Scoped Rules: Next.js API Route Handlers (`src/app/api/**`)

These rules apply strictly to all HTTP Route Handlers (`route.ts`) in this directory.

---

## Route Handler Standards

1. **Singleton Service Delegation**:
   - Always import services from `@/lib/services` (e.g. `taskService`, `projectService`, `githubService`, `dsaService`, `dailyService`, `heatmapService`, `activityBus`).
   - Route handlers are translation layers: parse HTTP parameters/body, delegate to domain service methods, and format the response envelope.
   - **Never write raw SQL queries directly in route handlers.**

2. **HTTP Methods & Status Codes**:
   - `GET`: Read operations. Return status `200`.
   - `POST`: Create operations. Return status `201` on creation.
   - `PATCH`: Partial updates. Return status `200` with updated entity, or `404` if not found.
   - `DELETE`: Deletions. Return status `200` with `{ success: true }` or `404`.

3. **Response Envelope Protocol**:
   - Success envelope:
     ```typescript
     return NextResponse.json({ success: true, data: result });
     ```
   - Error envelope:
     ```typescript
     return NextResponse.json({ success: false, error: 'Entity not found' }, { status: 404 });
     ```

4. **Next.js 15 Async Route Params**:
   - In Next.js 15, dynamic route params must be awaited:
     ```typescript
     export async function PATCH(
       request: Request,
       { params }: { params: Promise<{ id: string }> }
     ) {
       const { id } = await params;
       // ...
     }
     ```
