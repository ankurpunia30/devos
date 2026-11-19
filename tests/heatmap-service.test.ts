import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase, DEFAULT_USER_ID } from '../src/db/client.ts';
import { ActivityBus } from '../src/domain/activity-bus.ts';
import { HeatmapService } from '../src/domain/heatmap-service.ts';

test('HeatmapService - Aggregates cross-domain activities into contribution timeline', () => {
  const db = createDatabase(':memory:');
  const bus = new ActivityBus(db);
  const service = new HeatmapService(db);

  const today = new Date().toISOString().slice(0, 10);

  // Emit activities across domains
  bus.emit({
    userId: DEFAULT_USER_ID,
    eventType: 'task.completed',
    sourceDomain: 'tasks',
    title: 'Completed database index optimization',
  });

  bus.emit({
    userId: DEFAULT_USER_ID,
    eventType: 'github.commit_synced',
    sourceDomain: 'github',
    title: 'Pushed commit 1234567',
  });

  bus.emit({
    userId: DEFAULT_USER_ID,
    eventType: 'dsa.problem_solved',
    sourceDomain: 'dsa',
    title: 'Solved 3Sum',
  });

  const heatmap = service.getHeatmap(DEFAULT_USER_ID, 30);
  assert.equal(heatmap.contributions.length, 30);
  assert.ok(heatmap.totalContributions >= 3);
  assert.ok(heatmap.currentStreak >= 1);

  const todayEntry = heatmap.contributions.find(c => c.date === today);
  assert.ok(todayEntry);
  assert.ok(todayEntry.count >= 3);
  assert.ok(todayEntry.breakdown.tasks >= 1);
  assert.ok(todayEntry.breakdown.github >= 1);
  assert.ok(todayEntry.breakdown.dsa >= 1);
});
