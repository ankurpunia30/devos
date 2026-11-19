import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase, DEFAULT_USER_ID } from '../src/db/client.ts';
import { ActivityBus } from '../src/domain/activity-bus.ts';
import { GitHubService } from '../src/domain/github-service.ts';

test('GitHubService - Connect repo, record commits, and manage pull requests', () => {
  const db = createDatabase(':memory:');
  const bus = new ActivityBus(db);
  const service = new GitHubService(db, bus);

  // 1. Connect a repo
  const repo = service.connectRepository({
    userId: DEFAULT_USER_ID,
    githubRepoId: 99112233,
    name: 'algo-engine',
    fullName: 'ankur/algo-engine',
    htmlUrl: 'https://github.com/ankur/algo-engine',
    description: 'High performance graph algorithm implementations',
    isPrivate: false,
    stargazersCount: 42,
  });

  assert.ok(repo.id.startsWith('repo_'));
  assert.equal(repo.name, 'algo-engine');
  assert.equal(repo.stargazersCount, 42);

  // 2. Record Commit
  const commit = service.recordCommit({
    repositoryId: repo.id,
    sha: 'a1b2c3d',
    message: 'feat: add Tarjan strongly connected components',
    authorName: 'Lead Engineer',
    authorEmail: 'developer@devos.local',
    htmlUrl: 'https://github.com/ankur/algo-engine/commit/a1b2c3d',
  });

  assert.equal(commit.sha, 'a1b2c3d');
  assert.equal(commit.message, 'feat: add Tarjan strongly connected components');

  const commits = service.getRecentCommits(DEFAULT_USER_ID, 5);
  assert.ok(commits.some(c => c.sha === 'a1b2c3d'));

  // 3. Create and track Pull Request
  const pr = service.createPullRequest({
    repositoryId: repo.id,
    githubPrId: 554433,
    number: 7,
    title: 'Implement Dijkstra shortest path',
    authorLogin: 'ankur',
    htmlUrl: 'https://github.com/ankur/algo-engine/pull/7',
    state: 'open',
    reviewStatus: 'approved',
  });

  assert.equal(pr.number, 7);
  assert.equal(pr.reviewStatus, 'approved');

  const prs = service.getPullRequests(DEFAULT_USER_ID, 'open');
  assert.ok(prs.some(p => p.number === 7));
});
