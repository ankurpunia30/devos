import { createDatabase } from '../db/client.ts';
import { ActivityBus } from '../domain/activity-bus.ts';
import { TaskService } from '../domain/task-service.ts';
import { ProjectService } from '../domain/project-service.ts';
import { DailyService } from '../domain/daily-service.ts';
import { GitHubService } from '../domain/github-service.ts';
import { DSAService } from '../domain/dsa-service.ts';
import { HeatmapService } from '../domain/heatmap-service.ts';
import { CareerService } from '../domain/career-service.ts';
import { ArchitectureService } from '../domain/architecture-service.ts';
import { DeploymentService } from '../domain/deployment-service.ts';
import { AiAssistantService } from '../domain/ai-assistant-service.ts';
import { IntegrationService } from '../domain/integration-service.ts';

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
  careerService?: CareerService;
  architectureService?: ArchitectureService;
  deploymentService?: DeploymentService;
  aiAssistantService?: AiAssistantService;
  integrationService?: IntegrationService;
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

export const careerService = globalForServices.careerService || new CareerService(db, activityBus);
if (process.env.NODE_ENV !== 'production') globalForServices.careerService = careerService;

export const architectureService = globalForServices.architectureService || new ArchitectureService(db, activityBus);
if (process.env.NODE_ENV !== 'production') globalForServices.architectureService = architectureService;

export const deploymentService = globalForServices.deploymentService || new DeploymentService(db, activityBus);
if (process.env.NODE_ENV !== 'production') globalForServices.deploymentService = deploymentService;

export const aiAssistantService = globalForServices.aiAssistantService || new AiAssistantService(db);
if (process.env.NODE_ENV !== 'production') globalForServices.aiAssistantService = aiAssistantService;

export const integrationService = globalForServices.integrationService || new IntegrationService(db, activityBus, githubService, dsaService);
if (process.env.NODE_ENV !== 'production') globalForServices.integrationService = integrationService;
