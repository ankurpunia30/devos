---
name: standup-generator
description: Use this skill whenever generating, previewing, or exporting daily engineering standups or sprint updates in DevOS.
---

# DevOS Automated Daily Standup Generator Runbook

DevOS synthesizes **100% grounded, zero-hallucination daily standups** directly from real database telemetry.

---

## 1. Standup Synthesis Logic
The generator aggregates:
1. **Recent Accomplishments**: Completed tasks ordered by `completed_at DESC`.
2. **Today's Working Plan**: Top 3 daily rocks and in-progress tasks ordered by priority (`critical` > `high`).
3. **Blockers & Risks**: Any task flagged with status `blocked`.

### Generating a Standup Programmatically
```typescript
import { dailyService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

const standup = dailyService.generateStandup(DEFAULT_USER_ID, "2026-11-20");
console.log(standup.rawMarkdown);
```

### Next.js API Route Endpoint
```http
GET /api/daily/standup?date=YYYY-MM-DD
```

Response Envelope:
```json
{
  "success": true,
  "data": {
    "date": "2026-11-20",
    "yesterdayAccomplishments": ["..."],
    "todayPlan": ["..."],
    "blockers": ["..."],
    "rawMarkdown": "### 📋 Daily Standup Report..."
  }
}
```
