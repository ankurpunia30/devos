import { createDatabase } from '../db/client.ts';
import { ActivityBus } from '../domain/activity-bus.ts';
import { TaskService } from '../domain/task-service.ts';
import { ProjectService } from '../domain/project-service.ts';
import { DailyService } from '../domain/daily-service.ts';
import { GitHubService } from '../domain/github-service.ts';
import { DSAService } from '../domain/dsa-service.ts';
import { HeatmapService } from '../domain/heatmap-service.ts';

// Global singleton across hot-reloads
const globalForServices = globalThis as unknown as {
  db?: ReturnType<typeof createDatabase>;
  activityBus?: ActivityBus;
  taskService?: TaskService;
  projectService?: ProjectService;
  dailyService?: DailyService;
  githubService?: GitHubService;
  dsaService?: DSAService;
  heatmapService?: HeatmapService;
};

const db = globalForServices.db || createDatabase('./devos.db');
if (process.env.NODE_ENV !== 'production') globalForServices.db = db;

export const activityBus = globalForServices.activityBus || new ActivityBus(db);
if (process.env.NODE_ENV !== 'production') globalForServices.activityBus = activityBus;

export const taskService = globalForServices.taskService || new TaskService(db, activityBus);
if (process.env.NODE_ENV !== 'production') globalForServices.taskService = taskService;

export const projectService = globalForServices.projectService || new ProjectService(db, activityBus);
if (process.env.NODE_ENV !== 'production') globalForServices.projectService = projectService;

export const dailyService = globalForServices.dailyService || new DailyService(db, activityBus);
if (process.env.NODE_ENV !== 'production') globalForServices.dailyService = dailyService;

export const githubService = globalForServices.githubService || new GitHubService(db, activityBus);
if (process.env.NODE_ENV !== 'production') globalForServices.githubService = githubService;

export const dsaService = globalForServices.dsaService || new DSAService(db, activityBus);
if (process.env.NODE_ENV !== 'production') globalForServices.dsaService = dsaService;

export const heatmapService = globalForServices.heatmapService || new HeatmapService(db);
if (process.env.NODE_ENV !== 'production') globalForServices.heatmapService = heatmapService;
