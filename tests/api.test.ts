import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { createDatabase } from '../src/db/client.ts';
import { ActivityBus } from '../src/domain/activity-bus.ts';
import { TaskService } from '../src/domain/task-service.ts';
import { ProjectService } from '../src/domain/project-service.ts';
import { DailyService } from '../src/domain/daily-service.ts';
import { ApiRouter } from '../src/api/router.ts';

// In-memory HTTP Request/Response Mocks for socket-free testing
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

test('ApiRouter - In-memory REST endpoints verification', async () => {
  const db = createDatabase(':memory:');
  const bus = new ActivityBus(db);
  const taskService = new TaskService(db, bus);
  const projectService = new ProjectService(db, bus);
  const dailyService = new DailyService(db, bus);
  const router = new ApiRouter(taskService, projectService, dailyService, bus);

  // 1. GET /api/health
  {
    const req = new MockReq('/api/health', 'GET') as any;
    const res = new MockRes() as any;
    await router.handle(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().status, 'ok');
  }

  // 2. GET /api/projects
  {
    const req = new MockReq('/api/projects', 'GET') as any;
    const res = new MockRes() as any;
    await router.handle(req, res);
    assert.equal(res.statusCode, 200);
    assert.ok(res.json().data.length >= 2);
  }

  // 3. POST /api/tasks
  let createdTaskId: string;
  {
    const req = new MockReq('/api/tasks', 'POST', {
      title: 'Mock In-Memory Task',
      priority: 'high',
      status: 'todo',
    }) as any;
    const res = new MockRes() as any;
    await router.handle(req, res);
    assert.equal(res.statusCode, 201);
    const data = res.json().data;
    assert.equal(data.title, 'Mock In-Memory Task');
    createdTaskId = data.id;
  }

  // 4. PATCH /api/tasks/:id
  {
    const req = new MockReq(`/api/tasks/${createdTaskId}`, 'PATCH', {
      status: 'completed',
    }) as any;
    const res = new MockRes() as any;
    await router.handle(req, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.json().data.status, 'completed');
  }

  // 5. GET /api/daily/standup
  {
    const req = new MockReq('/api/daily/standup', 'GET') as any;
    const res = new MockRes() as any;
    await router.handle(req, res);
    assert.equal(res.statusCode, 200);
    assert.ok(res.json().data.rawMarkdown.includes('Daily Standup Report'));
  }

  // 6. GET /api/activities
  {
    const req = new MockReq('/api/activities?limit=10', 'GET') as any;
    const res = new MockRes() as any;
    await router.handle(req, res);
    assert.equal(res.statusCode, 200);
    assert.ok(res.json().data.length > 0);
  }
});
