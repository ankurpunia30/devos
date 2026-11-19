import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../src/db/client.ts';
import { CareerService } from '../src/domain/career-service.ts';
import { ActivityBus } from '../src/domain/activity-bus.ts';

test('CareerService - Application Pipeline & STAR Stories', () => {
  const db = createDatabase(':memory:');
  const bus = new ActivityBus(db);
  const career = new CareerService(db, bus);

  const userId = 'usr_career_test';
  db.prepare(`
    INSERT INTO users (id, email, name, timezone, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, 'career@devos.local', 'Career Tester', 'UTC', new Date().toISOString());

  // 1. Create Application
  const app = career.createApplication({
    userId,
    company: 'Anthropic',
    role: 'Staff Systems Engineer',
    stage: 'applied',
    salaryRange: '$400k - $460k',
    location: 'San Francisco',
  });

  assert.equal(app.company, 'Anthropic');
  assert.equal(app.stage, 'applied');

  // 2. Update Stage to Technical
  const updated = career.updateApplicationStage(app.id, 'technical');
  assert.equal(updated, true);

  const apps = career.getApplications(userId);
  assert.equal(apps.length, 1);
  assert.equal(apps[0].stage, 'technical');

  // 3. Create STAR Question
  const question = career.createQuestion({
    userId,
    company: 'Anthropic',
    question: 'How do you handle ambiguous requirements?',
    category: 'behavioral',
    starSituation: 'Startup had no product spec',
    starTask: 'Define technical roadmap',
    starAction: 'Interviewed stakeholders and authored RFC',
    starResult: 'Delivered MVP 2 weeks early',
  });

  assert.equal(question.category, 'behavioral');
  const questions = career.getQuestions(userId);
  assert.equal(questions.length, 1);
  assert.equal(questions[0].starSituation, 'Startup had no product spec');
});
