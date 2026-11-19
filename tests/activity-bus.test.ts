import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase, DEFAULT_USER_ID } from '../src/db/client.ts';
import { ActivityBus } from '../src/domain/activity-bus.ts';

test('ActivityBus - Emits, persists, and notifies subscribers', () => {
  const db = createDatabase(':memory:');
  const bus = new ActivityBus(db);

  let notified = false;
  bus.subscribe('task.completed', (event) => {
    assert.equal(event.title, 'Completed unit test suite');
    notified = true;
  });

  const event = bus.emit({
    userId: DEFAULT_USER_ID,
    eventType: 'task.completed',
    sourceDomain: 'tasks',
    title: 'Completed unit test suite',
    description: 'All 5 test suites passed.',
  });

  assert.ok(event.id.startsWith('act_'));
  assert.equal(notified, true);

  // Verify persistence in SQLite
  const activities = bus.getRecentActivities(DEFAULT_USER_ID, 10);
  const found = activities.find(a => a.id === event.id);
  assert.ok(found);
  assert.equal(found.title, 'Completed unit test suite');
});
