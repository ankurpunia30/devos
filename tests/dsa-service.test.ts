import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase, DEFAULT_USER_ID } from '../src/db/client.ts';
import { ActivityBus } from '../src/domain/activity-bus.ts';
import { DSAService } from '../src/domain/dsa-service.ts';

test('DSAService - LeetCode problem tracking, status transitions, spaced repetition, and stats', () => {
  const db = createDatabase(':memory:');
  const bus = new ActivityBus(db);
  const service = new DSAService(db, bus);

  // 1. Verify pre-seeded topics
  const topics = service.getTopics();
  assert.ok(topics.length >= 8);
  assert.ok(topics.some(t => t.id === 'arrays-hashing'));
  assert.ok(topics.some(t => t.id === 'trees'));

  // 2. Query problems
  const problems = service.getProblems(DEFAULT_USER_ID);
  assert.ok(problems.length >= 10);
  const twoSum = problems.find(p => p.slug === 'two-sum');
  assert.ok(twoSum);

  // 3. Mark problem as solved -> verify spaced repetition date
  const trappingRainWater = problems.find(p => p.slug === 'trapping-rain-water');
  assert.ok(trappingRainWater);
  assert.equal(trappingRainWater.status, 'pending');

  const solved = service.updateProblem(trappingRainWater.id, DEFAULT_USER_ID, {
    status: 'solved',
    approachSummary: 'Two pointers technique keeping track of left_max and right_max.',
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  });

  assert.ok(solved);
  assert.equal(solved.status, 'solved');
  assert.ok(solved.lastSolvedAt);
  // Spaced repetition sets nextRevisionDate to ~3 days from now
  assert.ok(solved.nextRevisionDate);

  // 4. Record a submission
  const sub = service.recordSubmission({
    problemId: trappingRainWater.id,
    status: 'Accepted',
    code: 'class Solution: pass',
    runtimeMs: 48,
    memoryMb: 16.4,
  });
  assert.equal(sub.status, 'Accepted');
  assert.equal(sub.runtimeMs, 48);

  // 5. Get statistics
  const stats = service.getStats(DEFAULT_USER_ID);
  assert.ok(stats.total >= 10);
  assert.ok(stats.solved >= 1);
  assert.ok(stats.masteryPercentage > 0);
  assert.ok(stats.topics.length >= 8);

  // 6. Dynamic Problem Creation & Bulk Import
  const custom = service.createProblem(DEFAULT_USER_ID, {
    title: 'Course Schedule IV',
    slug: 'course-schedule-iv',
    difficulty: 'medium',
    status: 'solved',
  });
  assert.equal(custom.title, 'Course Schedule IV');
  assert.equal(custom.status, 'solved');

  const count = service.bulkImportProblems(DEFAULT_USER_ID, [
    { title: 'Candy', slug: 'candy', difficulty: 'hard', status: 'solved' },
    { title: 'Gas Station', slug: 'gas-station', difficulty: 'medium', status: 'solved' },
  ]);
  assert.equal(count, 2);

  const updatedStats = service.getStats(DEFAULT_USER_ID);
  assert.equal(updatedStats.total, stats.total + 3);
});
