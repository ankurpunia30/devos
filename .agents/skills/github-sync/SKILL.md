---
name: github-sync
description: Use this skill whenever connecting GitHub repositories, recording git commits, tracking pull requests, or reviewing code turnaround in DevOS.
---

# DevOS GitHub Integration Runbook

Connect repositories, pull requests, and commits to DevOS projects and tasks.

---

## 1. Domain Service Reference
GitHub telemetry is managed via `githubService` in `@/lib/services`.

### Connecting a Repository Programmatically
```typescript
import { githubService } from '@/lib/services';
import { DEFAULT_USER_ID } from '@/db/client';

const repo = githubService.connectRepository({
  userId: DEFAULT_USER_ID,
  githubRepoId: 98765432,
  name: 'devos',
  fullName: 'organization/devos',
  htmlUrl: 'https://github.com/organization/devos',
  projectId: 'proj_devos_core', // Links repository to DevOS project
  stargazersCount: 28,
  openIssuesCount: 4
});
```

### Tracking Pull Requests & Code Reviews
```typescript
const pr = githubService.createPullRequest({
  repositoryId: repo.id,
  githubPrId: 101,
  number: 14,
  title: 'feat: add Next.js 15 App Router UI',
  authorLogin: 'lead-engineer',
  htmlUrl: 'https://github.com/organization/devos/pull/14',
  state: 'open',
  reviewStatus: 'approved' // 'pending' | 'approved' | 'changes_requested'
});
```

---

## 2. Next.js API Route Endpoints
- `GET /api/github/repos`
- `POST /api/github/repos`
- `GET /api/github/prs?state=open`
- `POST /api/github/prs`
- `GET /api/github/commits?limit=10`
- `POST /api/github/commits`
