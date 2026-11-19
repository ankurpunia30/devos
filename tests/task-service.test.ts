import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase, DEFAULT_USER_ID } from '../src/db/client.ts';
import { ActivityBus } from '../src/domain/activity-bus.ts';
import { TaskService } from '../src/domain/task-service.ts';

test('TaskService - Full CRUD and Status Lifecycle', () => {
  const db = createDatabase(':memory:');
  const bus = new ActivityBus(db);
  const service = new TaskService(db, bus);

  // 1. Create Task
  const task = service.createTask({
    userId: DEFAULT_USER_ID,
    title: 'Implement Redis Caching Layer',
    priority: 'critical',
    status: 'todo',
    tags: ['redis', 'backend'],
  });

  assert.ok(task.id.startsWith('task_'));
  assert.equal(task.title, 'Implement Redis Caching Layer');
  assert.equal(task.priority, 'critical');
  assert.equal(task.status, 'todo');
  assert.equal(task.completedAt, null);

  // 2. Update Status to In Progress
  const inProgress = service.updateTask(task.id, DEFAULT_USER_ID, {
    status: 'in_progress',
  });
  assert.ok(inProgress);
  assert.equal(inProgress.status, 'in_progress');

  // 3. Complete Task
  const completed = service.updateTask(task.id, DEFAULT_USER_ID, {
    status: 'completed',
  });
  assert.ok(completed);
  assert.equal(completed.status, 'completed');
  assert.ok(completed.completedAt);

  // 4. Filter tasks
  const completedTasks = service.getTasks(DEFAULT_USER_ID, { status: 'completed' });
  assert.ok(completedTasks.some(t => t.id === task.id));
});
