import { IncomingMessage, ServerResponse } from 'node:http';
import { TaskService } from '../domain/task-service.ts';
import { ProjectService } from '../domain/project-service.ts';
import { DailyService } from '../domain/daily-service.ts';
import { ActivityBus } from '../domain/activity-bus.ts';
import { DEFAULT_USER_ID } from '../db/client.ts';

export class ApiRouter {
  private taskService: TaskService;
  private projectService: ProjectService;
  private dailyService: DailyService;
  private activityBus: ActivityBus;

  constructor(
    taskService: TaskService,
    projectService: ProjectService,
    dailyService: DailyService,
    activityBus: ActivityBus
  ) {
    this.taskService = taskService;
    this.projectService = projectService;
    this.dailyService = dailyService;
    this.activityBus = activityBus;
  }

  public async handle(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
    const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;
    const method = req.method?.toUpperCase();

    // CORS & JSON Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return true;
    }

    if (!pathname.startsWith('/api/')) {
      return false; // Not an API route
    }

    try {
      // 1. Healthcheck
      if (pathname === '/api/health' && method === 'GET') {
        this.json(res, 200, { status: 'ok', service: 'DevOS Core API', timestamp: new Date().toISOString() });
        return true;
      }

      // 2. Tasks
      if (pathname === '/api/tasks' && method === 'GET') {
        const projectId = url.searchParams.get('projectId') || undefined;
        const status = (url.searchParams.get('status') as any) || undefined;
        const priority = (url.searchParams.get('priority') as any) || undefined;
        const tasks = this.taskService.getTasks(DEFAULT_USER_ID, { projectId, status, priority });
        this.json(res, 200, { success: true, data: tasks });
        return true;
      }

      if (pathname === '/api/tasks' && method === 'POST') {
        const body = await this.readBody(req);
        const task = this.taskService.createTask({
          userId: DEFAULT_USER_ID,
          title: body.title,
          description: body.description,
          projectId: body.projectId,
          priority: body.priority,
          status: body.status,
          dueDate: body.dueDate,
          estimatedMinutes: body.estimatedMinutes,
          tags: body.tags,
        });
        this.json(res, 201, { success: true, data: task });
        return true;
      }

      if (pathname.startsWith('/api/tasks/') && method === 'PATCH') {
        const taskId = pathname.replace('/api/tasks/', '');
        const body = await this.readBody(req);
        const updated = this.taskService.updateTask(taskId, DEFAULT_USER_ID, body);
        if (!updated) {
          this.json(res, 404, { success: false, error: 'Task not found' });
          return true;
        }
        this.json(res, 200, { success: true, data: updated });
        return true;
      }

      if (pathname.startsWith('/api/tasks/') && method === 'DELETE') {
        const taskId = pathname.replace('/api/tasks/', '');
        const deleted = this.taskService.deleteTask(taskId, DEFAULT_USER_ID);
        this.json(res, deleted ? 200 : 404, { success: deleted });
        return true;
      }

      // 3. Projects
      if (pathname === '/api/projects' && method === 'GET') {
        const projects = this.projectService.getProjects(DEFAULT_USER_ID);
        this.json(res, 200, { success: true, data: projects });
        return true;
      }

      if (pathname === '/api/projects' && method === 'POST') {
        const body = await this.readBody(req);
        const project = this.projectService.createProject({
          userId: DEFAULT_USER_ID,
          name: body.name,
          description: body.description,
          category: body.category,
          techStack: body.techStack,
          architectureOverview: body.architectureOverview,
          targetCompletionDate: body.targetCompletionDate,
        });
        this.json(res, 201, { success: true, data: project });
        return true;
      }

      if (pathname.match(/^\/api\/projects\/[^/]+\/status$/) && method === 'PATCH') {
        const projectId = pathname.split('/')[3];
        const body = await this.readBody(req);
        const updated = this.projectService.updateProjectStatus(projectId, DEFAULT_USER_ID, body.status);
        if (!updated) {
          this.json(res, 404, { success: false, error: 'Project not found' });
          return true;
        }
        this.json(res, 200, { success: true, data: updated });
        return true;
      }

      // 4. Daily Operations
      if (pathname === '/api/daily/priorities' && method === 'GET') {
        const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
        const priorities = this.dailyService.getDailyPriorities(DEFAULT_USER_ID, date);
        this.json(res, 200, { success: true, data: priorities });
        return true;
      }

      if (pathname === '/api/daily/priorities' && method === 'POST') {
        const body = await this.readBody(req);
        const priority = this.dailyService.setDailyPriority({
          userId: DEFAULT_USER_ID,
          date: body.date || new Date().toISOString().slice(0, 10),
          rank: body.rank,
          taskId: body.taskId,
          customTitle: body.customTitle,
        });
        this.json(res, 201, { success: true, data: priority });
        return true;
      }

      if (pathname.match(/^\/api\/daily\/priorities\/[^/]+\/toggle$/) && method === 'POST') {
        const id = pathname.split('/')[4];
        const state = this.dailyService.togglePriorityCompleted(id, DEFAULT_USER_ID);
        this.json(res, 200, { success: true, data: { isCompleted: state } });
        return true;
      }

      if (pathname === '/api/daily/pomodoro' && method === 'POST') {
        const body = await this.readBody(req);
        const pomo = this.dailyService.recordPomodoro(DEFAULT_USER_ID, body.durationMinutes || 25, body.taskId);
        this.json(res, 201, { success: true, data: pomo });
        return true;
      }

      if (pathname === '/api/daily/standup' && method === 'GET') {
        const date = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
        const standup = this.dailyService.generateStandup(DEFAULT_USER_ID, date);
        this.json(res, 200, { success: true, data: standup });
        return true;
      }

      // 5. Activities
      if (pathname === '/api/activities' && method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit') || '30', 10);
        const activities = this.activityBus.getRecentActivities(DEFAULT_USER_ID, limit);
        this.json(res, 200, { success: true, data: activities });
        return true;
      }

      // 6. Quick Capture
      if (pathname === '/api/quick-capture' && method === 'POST') {
        const body = await this.readBody(req);
        const note = body.text || '';

        // If note looks like a task, auto-create task
        let createdTask = null;
        if (note.toLowerCase().startsWith('todo:') || note.toLowerCase().startsWith('fix') || note.toLowerCase().startsWith('implement')) {
          const cleanTitle = note.replace(/^todo:\s*/i, '').trim();
          createdTask = this.taskService.createTask({
            userId: DEFAULT_USER_ID,
            title: cleanTitle,
            priority: 'high',
            tags: ['quick-capture'],
          });
        }

        this.activityBus.emit({
          userId: DEFAULT_USER_ID,
          eventType: 'quick_capture.saved',
          sourceDomain: 'daily',
          title: `Captured: ${note.slice(0, 50)}...`,
          description: note,
          taskId: createdTask ? createdTask.id : null,
        });

        this.json(res, 201, { success: true, data: { captured: true, task: createdTask } });
        return true;
      }

      this.json(res, 404, { success: false, error: 'Endpoint not found' });
      return true;
    } catch (err: any) {
      console.error('API Error:', err);
      this.json(res, 500, { success: false, error: err.message || 'Internal Server Error' });
      return true;
    }
  }

  private json(res: ServerResponse, status: number, body: unknown) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(body));
  }

  private readBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => (body += chunk));
      req.on('end', () => {
        try {
          resolve(body ? JSON.parse(body) : {});
        } catch (e) {
          reject(new Error('Invalid JSON payload'));
        }
      });
      req.on('error', reject);
    });
  }
}
