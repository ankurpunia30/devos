---
name: dsa-tracker
description: Use this skill whenever tracking LeetCode/NeetCode problems, logging algorithm approaches, scheduling spaced-repetition revisions, or checking roadmap progress.
---

# DevOS LeetCode & NeetCode 150 Practice Runbook

This skill manages Data Structures & Algorithms problem tracking and spaced repetition in DevOS.

---

## 1. Marking Problem as Solved & Scheduling Spaced Repetition

Marking a problem `solved` automatically computes `next_revision_date = today + 3 days`:

```typescript
dsaService.updateProblem(problemId, DEFAULT_USER_ID, {
  status: 'solved',
  approachSummary: 'Two pointers technique with left_max and right_max.',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(1)'
});
```

This also emits `dsa.problem_solved` to the universal `ActivityBus`.

## 2. Querying Roadmap Stats

```typescript
const stats = dsaService.getStats(DEFAULT_USER_ID);
console.log(`Curriculum Mastery: ${stats.masteryPercentage}%`);
```

## 3. REST API Endpoints
- `GET /api/dsa/topics`
- `GET /api/dsa/problems?topicId=arrays-hashing&status=solved`
- `PATCH /api/dsa/problems/:id`
- `POST /api/dsa/submissions`
- `GET /api/dsa/stats`
- `GET /api/analytics/heatmap?days=60`
