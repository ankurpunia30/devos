/**
 * DevOS: Core Domain Entity Types (Phase 1)
 */

export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'blocked' | 'completed';
export type ProjectStatus = 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'archived';
export type ProjectCategory = 'personal' | 'professional' | 'learning' | 'experimental';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  timezone: string;
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  slug: string;
  description: string;
  status: ProjectStatus;
  category: ProjectCategory;
  techStack: string[];
  architectureOverview?: string;
  targetCompletionDate?: string;
  progressPercentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  dueDate?: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  projectId?: string | null;
  parentTaskId?: string | null;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string | null;
  estimatedMinutes?: number | null;
  actualMinutes: number;
  tags: string[];
  externalReference?: Record<string, unknown> | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskDependency {
  taskId: string;
  dependsOnTaskId: string;
}

export type ActivityEventType =
  | 'task.created'
  | 'task.updated'
  | 'task.completed'
  | 'project.created'
  | 'project.updated'
  | 'project.completed'
  | 'milestone.completed'
  | 'pomodoro.finished'
  | 'standup.generated'
  | 'quick_capture.saved';

export interface ActivityEvent {
  id: string;
  userId: string;
  eventType: ActivityEventType;
  sourceDomain: 'tasks' | 'projects' | 'daily' | 'github' | 'dsa' | 'knowledge' | 'system';
  projectId?: string | null;
  repositoryId?: string | null;
  taskId?: string | null;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
  externalId?: string | null;
  occurredAt: string;
  createdAt: string;
}

export interface DailyPriority {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  rank: 1 | 2 | 3;
  taskId?: string | null;
  customTitle?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
}

export interface PomodoroSession {
  id: string;
  userId: string;
  taskId?: string | null;
  durationMinutes: number;
  completedAt: string;
}

export interface StandupReport {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  yesterdayAccomplishments: string[];
  todayPlan: string[];
  blockers: string[];
  rawMarkdown: string;
  createdAt: string;
}
