---
name: task-ops
description: Use this skill whenever creating, updating, deleting, or managing tasks, sprint items, or subtasks in DevOS.
---

# DevOS Task Operations Runbook

Follow this runbook to manage tasks and dependencies while maintaining full activity telemetry and project progress tracking.

---

## 1. Domain Service Reference
Tasks are managed via `TaskService` in `src/domain/task-service.ts`.

### Creating a Task Programmatically
```typescript
const task = taskService.createTask({
  userId: DEFAULT_USER_ID,
  title: "Implement Redis Caching",
  priority: "critical", // 'critical' | 'high' | 'medium' | 'low'
  status: "todo",       // 'backlog' | 'todo' | 'in_progress' | 'blocked' | 'completed'
  projectId: "proj_123", // Optional
  tags: ["backend", "redis"]
});
```

### Updating a Task & Status Transitions
Updating status to `completed` automatically:
1. Sets `completed_at` to the current ISO timestamp.
2. Emits a `task.completed` event on `ActivityBus`.
3. Triggers `ProjectService.recalculateProjectProgress()`.

```typescript
taskService.updateTask(taskId, DEFAULT_USER_ID, {
  status: "completed"
});
```

---

## 2. Verification
Always verify changes by running:
```bash
npm test
```
