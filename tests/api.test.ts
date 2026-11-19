import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createDatabase } from '../src/db/client.ts';
import { ActivityBus } from '../src/domain/activity-bus.ts';
import { TaskService } from '../src/domain/task-service.ts';
import { ProjectService } from '../src/domain/project-service.ts';
import { DailyService } from '../src/domain/daily-service.ts';
import { GitHubService } from '../src/domain/github-service.ts';
import { DSAService } from '../src/domain/dsa-service.ts';
import { HeatmapService } from '../src/domain/heatmap-service.ts';
import { ApiRouter } from '../src/api/router.ts';

// In-memory HTTP Request/Response Mocks
class MockReq extends EventEmitter {
  public url: string;
  public method: string;
  public headers: Record<string, string>;

  constructor(url: string, method: string = 'GET', body?: unknown) {
    super();
    this.url = url;
    this.method = method;
    this.headers = { host: 'localhost' };

    process.nextTick(() => {
      if (body !== undefined) {
        this.emit('data', Buffer.from(JSON.stringify(body)));
      }
      this.emit('end');
    });
  }
}

class MockRes extends EventEmitter {
  public statusCode: number = 200;
  public headers: Record<string, string> = {};
  public body: string = '';

  public setHeader(k: string, v: string) {
    this.headers[k] = v;
  }

  public writeHead(code: number, headers?: Record<string, string>) {
    this.statusCode = code;
    if (headers) Object.assign(this.headers, headers);
  }

  public end(chunk?: string) {
    if (chunk) this.body += chunk;
    this.emit('finish');
  }

  public json(): any {
    return JSON.parse(this.body);
  }
}

test('ApiRouter - Phase 1 & 2 REST endpoints verification', async () => {
  const db = createDatabase(':memory:');
  const bus = new ActivityBus(db);
  const taskService = new TaskService(db, bus);
  const projectService = new ProjectService(db, bus);
  const dailyService = new DailyService(db, bus);
  const githubService = new GitHubService(db, bus);
  const dsaService = new DSAService(db, bus);
  const heatmapService = new HeatmapService(db);

  const router = new ApiRouter(
    taskService,
    projectService,
    dailyService,
    githubService,
    dsaService,
    heatmapService,
    bus
  );

  // 1. GET /api/health
  {
    const req = new MockReq('/api/health', 'GET') as any;
    const res = new MockRes() as any;
    await router.handle(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().status, 'ok');
  }

  // 2. GET /api/github/repos
  {
    const req = new MockReq('/api/github/repos', 'GET') as any;
    const res = new MockRes() as any;
    await router.handle(req, res);
    assert.equal(res.statusCode, 200);
    assert.ok(res.json().data.length >= 1);
  }

  // 3. GET /api/github/prs
  {
    const req = new MockReq('/api/github/prs', 'GET') as any;
    const res = new MockRes() as any;
    await router.handle(req, res);
    assert.equal(res.statusCode, 200);
    assert.ok(res.json().data.length >= 1);
  }

  // 4. GET /api/dsa/topics
  {
    const req = new MockReq('/api/dsa/topics', 'GET') as any;
    const res = new MockRes() as any;
    await router.handle(req, res);
    assert.equal(res.statusCode, 200);
    assert.ok(res.json().data.length >= 8);
  }

  // 5. GET /api/dsa/stats
  {
    const req = new MockReq('/api/dsa/stats', 'GET') as any;
    const res = new MockRes() as any;
    await router.handle(req, res);
    assert.equal(res.statusCode, 200);
    assert.ok(res.json().data.total > 0);
  }

  // 6. GET /api/analytics/heatmap
  {
    const req = new MockReq('/api/analytics/heatmap?days=30', 'GET') as any;
    const res = new MockRes() as any;
    await router.handle(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().data.contributions.length, 30);
  }
});
