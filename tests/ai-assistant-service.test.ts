import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../src/db/client.ts';
import { AiAssistantService } from '../src/domain/ai-assistant-service.ts';
import { TaskService } from '../src/domain/task-service.ts';
import { ActivityBus } from '../src/domain/activity-bus.ts';

test('AiAssistantService - Natural language task parser', () => {
  const db = createDatabase(':memory:');
  const ai = new AiAssistantService(db);

  // 1. Natural Language Task parsing
  const parsed1 = ai.parseNaturalLanguageTask(
    'Remind me to complete Redis caching implementation by Friday priority:high #backend #caching'
  );

  assert.equal(parsed1.title, 'complete Redis caching implementation');
  assert.equal(parsed1.priority, 'high');
  assert.ok(parsed1.dueDate !== undefined, 'Due date should be calculated');
  assert.deepEqual(parsed1.tags, ['backend', 'caching']);

  // 2. Urgent / Critical parsing
  const parsed2 = ai.parseNaturalLanguageTask('Fix memory leak in websocket server tomorrow priority:critical');
  assert.equal(parsed2.title, 'Fix memory leak in websocket server');
  assert.equal(parsed2.priority, 'critical');
  assert.ok(parsed2.dueDate !== undefined);
});

test('AiAssistantService - Grounded Q&A citations', () => {
  const db = createDatabase(':memory:');
  const bus = new ActivityBus(db);
  const taskService = new TaskService(db, bus);
  const ai = new AiAssistantService(db);

  const userId = 'usr_ai_test';
  db.prepare(`
    INSERT INTO users (id, email, name, timezone, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, 'ai@devos.local', 'AI Tester', 'UTC', new Date().toISOString());

  // Create a blocked critical task
  taskService.createTask({
    userId,
    title: 'Resolve database deadlock under load',
    priority: 'critical',
    status: 'blocked',
  });

  // Query blockers
  const answer = ai.answerGroundedQuery(userId, 'What are my blockers and critical tasks?');
  assert.ok(answer.answerMarkdown.includes('Resolve database deadlock under load'));
  assert.equal(answer.citations.length, 1);
  assert.equal(answer.citations[0].entity, 'task');
});
