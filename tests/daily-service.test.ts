import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase, DEFAULT_USER_ID } from '../src/db/client.ts';
import { ActivityBus } from '../src/domain/activity-bus.ts';
import { TaskService } from '../src/domain/task-service.ts';
import { DailyService } from '../src/domain/daily-service.ts';

test('DailyService - Priorities, Pomodoro session, and Automated Standup Generator', () => {
  const db = createDatabase(':memory:');
  const bus = new ActivityBus(db);
  const taskService = new TaskService(db, bus);
  const dailyService = new DailyService(db, bus);

  const today = new Date().toISOString().slice(0, 10);

  // 1. Manage Daily Priorities
  const p1 = dailyService.setDailyPriority({
    userId: DEFAULT_USER_ID,
    date: today,
    rank: 1,
    customTitle: 'Deploy production auth worker',
  });
  assert.equal(p1.rank, 1);
  assert.equal(p1.customTitle, 'Deploy production auth worker');

  const priorities = dailyService.getDailyPriorities(DEFAULT_USER_ID, today);
  assert.ok(priorities.length >= 1);

  // 2. Record Pomodoro session
  const pomo = dailyService.recordPomodoro(DEFAULT_USER_ID, 25);
  assert.equal(pomo.durationMinutes, 25);

  // 3. Create a task and mark as completed to feed the standup generator
  taskService.createTask({
    userId: DEFAULT_USER_ID,
    title: 'Benchmarked SQLite native query throughput',
    status: 'completed',
  });

  // 4. Generate automated daily standup report
  const standup = dailyService.generateStandup(DEFAULT_USER_ID, today);
  assert.ok(standup.rawMarkdown.includes('Daily Standup Report'));
  assert.ok(standup.rawMarkdown.includes('Benchmarked SQLite native query throughput'));
  assert.ok(standup.yesterdayAccomplishments.length > 0);
  assert.ok(standup.todayPlan.length > 0);
});
