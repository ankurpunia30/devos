---
name: standup-generator
description: Use this skill whenever generating, inspecting, or formatting engineering daily standup reports in DevOS.
---

# DevOS Daily Standup Generator Runbook

DevOS generates 100% grounded, zero-hallucination daily standups by synthesizing real database activities, completed tasks, and blockers.

---

## Standup Synthesis Structure

The generator synthesizes:
1. **Yesterday / Recent Accomplishments**: Top 5 recently completed tasks with timestamps.
2. **Today's Working Plan**: Top 3 daily rocks and in-progress sprint tasks sorted by priority.
3. **Blockers & Risks**: Any task marked with status `blocked`.

### Generating a Standup Programmatically
```typescript
const standup = dailyService.generateStandup(DEFAULT_USER_ID, "2026-11-20");
console.log(standup.rawMarkdown);
```

### API Endpoint
```http
GET /api/daily/standup?date=2026-11-20
```

Returns:
```json
{
  "success": true,
  "data": {
    "rawMarkdown": "### 📋 Daily Standup Report...",
    "yesterdayAccomplishments": [...],
    "todayPlan": [...],
    "blockers": [...]
  }
}
```
