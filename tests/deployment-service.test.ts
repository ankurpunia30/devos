import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../src/db/client.ts';
import { DeploymentService } from '../src/domain/deployment-service.ts';
import { ActivityBus } from '../src/domain/activity-bus.ts';

test('DeploymentService - Environment release tracking and status transitions', () => {
  const db = createDatabase(':memory:');
  const bus = new ActivityBus(db);
  const deploy = new DeploymentService(db, bus);

  const userId = 'usr_deploy_test';
  db.prepare(`
    INSERT INTO users (id, email, name, timezone, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, 'deploy@devos.local', 'Deploy Tester', 'UTC', new Date().toISOString());

  // 1. Record Deployment
  const d = deploy.recordDeployment({
    userId,
    environment: 'prod',
    versionTag: 'v2.0.0',
    commitSha: 'a4b5d89',
    status: 'healthy',
    rollbackPlan: 'git checkout v1.9.4',
  });

  assert.equal(d.environment, 'prod');
  assert.equal(d.versionTag, 'v2.0.0');
  assert.equal(d.status, 'healthy');

  // 2. Update Status to Degraded
  const updated = deploy.updateDeploymentStatus(d.id, 'degraded');
  assert.equal(updated, true);

  const list = deploy.getDeployments(userId);
  assert.equal(list.length, 1);
  assert.equal(list[0].status, 'degraded');
});
