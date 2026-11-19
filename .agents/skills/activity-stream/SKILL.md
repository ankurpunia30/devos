---
name: activity-stream
description: Use this skill whenever inspecting, querying, or subscribing to DevOS activity telemetry and cross-module events.
---

# DevOS Universal Activity Bus Runbook

Every entity mutation in DevOS emits an immutable event to the `activities` table.

---

## 1. Emitting an Event

```typescript
activityBus.emit({
  userId: DEFAULT_USER_ID,
  eventType: 'task.completed',
  sourceDomain: 'tasks',
  title: 'Closed issue #42',
  description: 'Resolved memory leak in worker thread.',
  projectId: 'proj_devos_core',
  taskId: 'task_123',
  metadata: { duration_minutes: 30 }
});
```

## 2. Subscribing to Events

```typescript
// Specific event
activityBus.subscribe('project.completed', (event) => {
  console.log(`Celebration! ${event.title}`);
});

// Wildcard listener
activityBus.subscribe('*', (event) => {
  telemetryLogger.log(event);
});
```

## 3. Querying Event Stream
```http
GET /api/activities?limit=30
```
