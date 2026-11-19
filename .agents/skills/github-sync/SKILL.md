---
name: github-sync
description: Use this skill whenever connecting GitHub repositories, recording git commits, syncing pull requests, or reviewing code turnaround in DevOS.
---

# DevOS GitHub Integration Runbook

This skill manages the synchronization of repositories, commits, and pull requests in DevOS.

---

## 1. Connecting a Repository Programmatically

```typescript
const repo = githubService.connectRepository({
  userId: DEFAULT_USER_ID,
  githubRepoId: 12345678,
  name: 'my-service',
  fullName: 'organization/my-service',
  htmlUrl: 'https://github.com/organization/my-service',
  projectId: 'proj_devos_core', // Optional link to project
  stargazersCount: 15
});
```

## 2. Syncing Pull Requests & Emitting Telemetry

```typescript
// Open PR
const pr = githubService.createPullRequest({
  repositoryId: repo.id,
  githubPrId: 98765,
  number: 42,
  title: 'feat: add Redis cache layer',
  authorLogin: 'octocat',
  htmlUrl: 'https://github.com/organization/my-service/pull/42',
  state: 'open',
  reviewStatus: 'approved'
});
```

## 3. REST API Endpoints
- `GET /api/github/repos`
- `POST /api/github/repos`
- `GET /api/github/prs?state=open`
- `POST /api/github/prs`
- `GET /api/github/commits?limit=10`
