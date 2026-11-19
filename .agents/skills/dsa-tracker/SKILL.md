---
name: dsa-tracker
description: Use this skill whenever tracking LeetCode/NeetCode problems, logging algorithm approaches, scheduling spaced-repetition revisions, or checking roadmap progress in DevOS.
---

# DevOS LeetCode & NeetCode 150 Practice Runbook

Track coding practice, maintain complexity notes, and automate spaced-repetition revision cycles.

---

## 1. Automated Spaced Repetition Logic
When a problem status is transitioned to `solved`, DevOS automatically computes:
$$\text{Next Revision Date} = \text{Today} + 3\text{ Days}$$
and emits `dsa.problem_solved` to the universal `ActivityBus`.

### Updating Problem Status Programmatically
```typescript
import { dsaService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

dsaService.updateProblem(problemId, DEFAULT_USER_ID, {
  status: 'solved',
  approachSummary: 'Two pointers technique keeping track of left_max and right_max.',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(1)'
});
```

---

## 2. Next.js API Route Endpoints
- `GET /api/dsa/topics`
- `GET /api/dsa/problems?topicId=arrays-hashing&status=solved`
- `PATCH /api/dsa/problems/:id`
- `GET /api/dsa/stats`
- `GET /api/analytics/heatmap?days=60`
