---
name: activity-stream
description: Use this skill whenever inspecting, querying, or subscribing to DevOS activity telemetry and cross-module event streams.
---

# DevOS Universal Activity Bus Runbook

Every entity mutation across tasks, projects, git commits, PRs, and DSA practice emits an immutable event to the `activities` table.

---

## 1. Emitting an Activity Event
```typescript
import { activityBus } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

activityBus.emit({
  userId: DEFAULT_USER_ID,
  eventType: 'project.updated',
  sourceDomain: 'projects',
  title: 'Project DevOS Platform progress updated to 85%',
  projectId: 'proj_devos_core',
  metadata: { progressPercentage: 85 }
});
```

## 2. Next.js API Route Endpoint
```http
GET /api/activities?limit=30
```
