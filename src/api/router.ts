import { IncomingMessage, ServerResponse } from 'node:http';
import { TaskService } from '../domain/task-service.ts';
import { ProjectService } from '../domain/project-service.ts';
import { DailyService } from '../domain/daily-service.ts';
import { GitHubService } from '../domain/github-service.ts';
import { DSAService } from '../domain/dsa-service.ts';
import { HeatmapService } from '../domain/heatmap-service.ts';
import { ActivityBus } from '../domain/activity-bus.ts';
import { DEFAULT_USER_ID } from '../db/client.ts';

export class ApiRouter {
  private taskService: TaskService;
  private projectService: ProjectService;
  private dailyService: DailyService;
  private githubService: GitHubService;
  private dsaService: DSAService;
  private heatmapService: HeatmapService;
  private activityBus: ActivityBus;

  constructor(
    taskService: TaskService,
    projectService: ProjectService,
    dailyService: DailyService,
    githubService: GitHubService,
    dsaService: DSAService,
    heatmapService: HeatmapService,
    activityBus: ActivityBus
  ) {
    this.taskService = taskService;
    this.projectService = projectService;
    this.dailyService = dailyService;
    this.githubService = githubService;
    this.dsaService = dsaService;
    this.heatmapService = heatmapService;
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

      // 5. GitHub Endpoints (Phase 2)
      if (pathname === '/api/github/repos' && method === 'GET') {
        const repos = this.githubService.getRepositories(DEFAULT_USER_ID);
        this.json(res, 200, { success: true, data: repos });
        return true;
      }

      if (pathname === '/api/github/repos' && method === 'POST') {
        const body = await this.readBody(req);
        const repo = this.githubService.connectRepository({
          userId: DEFAULT_USER_ID,
          projectId: body.projectId,
          githubRepoId: body.githubRepoId || Math.floor(Math.random() * 90000000) + 10000000,
          name: body.name,
          fullName: body.fullName || `${body.name}/${body.name}`,
          htmlUrl: body.htmlUrl || `https://github.com/${body.name}`,
          description: body.description,
          isPrivate: body.isPrivate,
          defaultBranch: body.defaultBranch || 'main',
          openIssuesCount: body.openIssuesCount || 0,
          stargazersCount: body.stargazersCount || 0,
        });
        this.json(res, 201, { success: true, data: repo });
        return true;
      }

      if (pathname === '/api/github/prs' && method === 'GET') {
        const state = (url.searchParams.get('state') as any) || undefined;
        const prs = this.githubService.getPullRequests(DEFAULT_USER_ID, state);
        this.json(res, 200, { success: true, data: prs });
        return true;
      }

      if (pathname === '/api/github/prs' && method === 'POST') {
        const body = await this.readBody(req);
        const pr = this.githubService.createPullRequest({
          repositoryId: body.repositoryId,
          taskId: body.taskId,
          githubPrId: body.githubPrId || Math.floor(Math.random() * 9000000) + 1000000,
          number: body.number || 1,
          title: body.title,
          state: body.state || 'open',
          authorLogin: body.authorLogin || 'developer',
          htmlUrl: body.htmlUrl || 'https://github.com/developer/repo/pull/1',
          reviewStatus: body.reviewStatus || 'pending',
        });
        this.json(res, 201, { success: true, data: pr });
        return true;
      }

      if (pathname === '/api/github/commits' && method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit') || '10', 10);
        const commits = this.githubService.getRecentCommits(DEFAULT_USER_ID, limit);
        this.json(res, 200, { success: true, data: commits });
        return true;
      }

      if (pathname === '/api/github/commits' && method === 'POST') {
        const body = await this.readBody(req);
        const commit = this.githubService.recordCommit({
          repositoryId: body.repositoryId,
          sha: body.sha || Math.random().toString(36).substring(2, 9),
          message: body.message,
          authorName: body.authorName || 'Lead Engineer',
          authorEmail: body.authorEmail || 'developer@devos.local',
          htmlUrl: body.htmlUrl || 'https://github.com',
          committedAt: body.committedAt,
        });
        this.json(res, 201, { success: true, data: commit });
        return true;
      }

      // 6. LeetCode Endpoints (Phase 2)
      if (pathname === '/api/dsa/topics' && method === 'GET') {
        const topics = this.dsaService.getTopics();
        this.json(res, 200, { success: true, data: topics });
        return true;
      }

      if (pathname === '/api/dsa/problems' && method === 'GET') {
        const topicId = url.searchParams.get('topicId') || undefined;
        const status = (url.searchParams.get('status') as any) || undefined;
        const difficulty = (url.searchParams.get('difficulty') as any) || undefined;
        const problems = this.dsaService.getProblems(DEFAULT_USER_ID, { topicId, status, difficulty });
        this.json(res, 200, { success: true, data: problems });
        return true;
      }

      if (pathname.startsWith('/api/dsa/problems/') && method === 'PATCH') {
        const id = pathname.replace('/api/dsa/problems/', '');
        const body = await this.readBody(req);
        const updated = this.dsaService.updateProblem(id, DEFAULT_USER_ID, body);
        if (!updated) {
          this.json(res, 404, { success: false, error: 'Problem not found' });
          return true;
        }
        this.json(res, 200, { success: true, data: updated });
        return true;
      }

      if (pathname === '/api/dsa/submissions' && method === 'POST') {
        const body = await this.readBody(req);
        const submission = this.dsaService.recordSubmission({
          problemId: body.problemId,
          status: body.status || 'Accepted',
          code: body.code,
          runtimeMs: body.runtimeMs,
          memoryMb: body.memoryMb,
        });
        this.json(res, 201, { success: true, data: submission });
        return true;
      }

      if (pathname === '/api/dsa/stats' && method === 'GET') {
        const stats = this.dsaService.getStats(DEFAULT_USER_ID);
        this.json(res, 200, { success: true, data: stats });
        return true;
      }

      // 7. Developer Analytics & Heatmap (Phase 2)
      if (pathname === '/api/analytics/heatmap' && method === 'GET') {
        const days = parseInt(url.searchParams.get('days') || '60', 10);
        const heatmap = this.heatmapService.getHeatmap(DEFAULT_USER_ID, days);
        this.json(res, 200, { success: true, data: heatmap });
        return true;
      }

      // 8. Activities
      if (pathname === '/api/activities' && method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit') || '30', 10);
        const activities = this.activityBus.getRecentActivities(DEFAULT_USER_ID, limit);
        this.json(res, 200, { success: true, data: activities });
        return true;
      }

      // 9. Quick Capture
      if (pathname === '/api/quick-capture' && method === 'POST') {
        const body = await this.readBody(req);
        const note = body.text || '';

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
