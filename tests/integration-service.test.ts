import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../src/db/client.ts';
import { IntegrationService } from '../src/domain/integration-service.ts';
import { GitHubService } from '../src/domain/github-service.ts';
import { DSAService } from '../src/domain/dsa-service.ts';
import { ActivityBus } from '../src/domain/activity-bus.ts';

test('IntegrationService - Save integration, mask tokens & handle webhooks', () => {
  const db = createDatabase(':memory:');
  const bus = new ActivityBus(db);
  const github = new GitHubService(db, bus);
  const dsa = new DSAService(db, bus);
  const integrationService = new IntegrationService(db, bus, github, dsa);

  const userId = 'usr_integration_test';
  db.prepare(`
    INSERT INTO users (id, email, name, timezone, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, 'int@devos.local', 'Integration Tester', 'UTC', new Date().toISOString());

  // 1. Save GitHub integration
  const savedGh = integrationService.saveIntegration({
    userId,
    provider: 'github',
    accountIdentifier: 'octocat',
    accessToken: 'ghp_super_secret_token_12345',
  });

  assert.equal(savedGh.provider, 'github');
  assert.equal(savedGh.status, 'connected');

  // 2. Verify token masking in list
  const list = integrationService.getIntegrations(userId);
  assert.equal(list.length, 1);
  assert.equal(list[0].accessToken, 'ghp_...2345'); // Masked!

  // 3. Connect a repo and simulate inbound GitHub push webhook
  const repo = github.connectRepository({
    userId,
    githubRepoId: 998877,
    name: 'devos-repo',
    fullName: 'octocat/devos-repo',
    htmlUrl: 'https://github.com/octocat/devos-repo',
  });

  // Ping Webhook
  const pingRes = integrationService.handleGitHubWebhook('ping', {});
  assert.equal(pingRes.action, 'pong');

  // Push Webhook
  const pushRes = integrationService.handleGitHubWebhook('push', {
    repository: { full_name: 'octocat/devos-repo' },
    commits: [
      {
        id: '9f8e7d6c5b',
        message: 'feat: add live 3rd party integrations',
        url: 'https://github.com/octocat/devos-repo/commit/9f8e7d6c5b',
        timestamp: new Date().toISOString(),
        author: { name: 'Lead Dev', email: 'lead@dev.com' },
      },
    ],
  });

  assert.equal(pushRes.processed, true);

  const commits = github.getRecentCommits(userId, 5);
  assert.equal(commits.length, 1);
  assert.equal(commits[0].sha, '9f8e7d6c5b');
});
