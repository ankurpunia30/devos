---
name: task-ops
description: Use this skill whenever creating, updating, deleting, or filtering sprint tasks, backlog items, or subtasks in DevOS.
---

# DevOS Task Operations Runbook

Manage tasks and sprint workflows while maintaining complete activity bus telemetry and automatic project progress updates.

---

## 1. Domain Service Reference
Tasks are managed via `taskService` in `@/lib/services`.

### Creating a Task Programmatically
```typescript
import { taskService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

const task = taskService.createTask({
  userId: DEFAULT_USER_ID,
  title: "Implement Next.js App Router Server Components",
  priority: "critical", // 'critical' | 'high' | 'medium' | 'low'
  status: "todo",       // 'backlog' | 'todo' | 'in_progress' | 'blocked' | 'completed'
  projectId: "proj_devos_core",
  tags: ["nextjs", "frontend", "architecture"]
});
```

### Status Transitions & Progress Calculation
Setting status to `completed` automatically:
1. Records ISO `completed_at` timestamp.
2. Emits `task.completed` event on `ActivityBus`.
3. Automatically triggers `projectService.recalculateProjectProgress()` on the linked project!

```typescript
taskService.updateTask(taskId, DEFAULT_USER_ID, {
  status: "completed"
});
```

---

## 2. Next.js 15 API Route Endpoints
- `GET /api/tasks?projectId=...&status=in_progress&priority=critical`
- `POST /api/tasks` (Payload: `{ title, description, priority, projectId, status, tags }`)
- `PATCH /api/tasks/:id` (Payload: `{ status, priority, title, ... }`)
- `DELETE /api/tasks/:id`

---

## 3. Verification
Verify task lifecycle changes:
```bash
npm test
```
