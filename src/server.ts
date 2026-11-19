import http from 'node:http';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createDatabase } from './db/client.ts';
import { ActivityBus } from './domain/activity-bus.ts';
import { TaskService } from './domain/task-service.ts';
import { ProjectService } from './domain/project-service.ts';
import { DailyService } from './domain/daily-service.ts';
import { GitHubService } from './domain/github-service.ts';
import { DSAService } from './domain/dsa-service.ts';
import { HeatmapService } from './domain/heatmap-service.ts';
import { ApiRouter } from './api/router.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function createServer(dbPath: string = './devos.db') {
  // 1. Initialize SQLite Database
  const db = createDatabase(dbPath);

  // 2. Initialize Domain Services & Activity Bus
  const activityBus = new ActivityBus(db);
  const taskService = new TaskService(db, activityBus);
  const projectService = new ProjectService(db, activityBus);
  const dailyService = new DailyService(db, activityBus);
  const githubService = new GitHubService(db, activityBus);
  const dsaService = new DSAService(db, activityBus);
  const heatmapService = new HeatmapService(db);

  // 3. Initialize REST Router
  const apiRouter = new ApiRouter(
    taskService,
    projectService,
    dailyService,
    githubService,
    dsaService,
    heatmapService,
    activityBus
  );

  // 4. Fallback message (App has migrated to Next.js 16)
  const dashboardHtml = '<!DOCTYPE html><html><body><h1>DevOS runs on Next.js 16. Please run "npm run dev" to launch the modern App Router application.</h1></body></html>';

  // 5. Create HTTP Server
  const server = http.createServer(async (req, res) => {
    // Attempt API routing first
    const handledByApi = await apiRouter.handle(req, res);
    if (handledByApi) return;

    // Serve UI for all other paths
    if (req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(dashboardHtml);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });

  return {
    server,
    db,
    activityBus,
    taskService,
    projectService,
    dailyService,
    githubService,
    dsaService,
    heatmapService,
  };
}

// Auto-start only when run directly as main script
const isMainModule = process.argv[1] && process.argv[1].endsWith('server.ts');
if (isMainModule && process.env.NODE_ENV !== 'test') {
  const port = parseInt(process.env.PORT || '3000', 10);
  const { server } = createServer('./devos.db');

  server.listen(port, () => {
    console.log(`\n======================================================`);
    console.log(`⚡ DevOS: Personal Developer Operating System v2.0`);
    console.log(`🚀 Server running on: http://localhost:${port}`);
    console.log(`📊 Unified Dashboard: http://localhost:${port}`);
    console.log(`🔌 REST API Base:     http://localhost:${port}/api/health`);
    console.log(`======================================================\n`);
  });
}
