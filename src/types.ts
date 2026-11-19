/**
 * DevOS: Core Domain Entity Types (Phases 1 & 2)
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
  | 'quick_capture.saved'
  | 'github.repo_connected'
  | 'github.commit_synced'
  | 'github.pr_opened'
  | 'github.pr_merged'
  | 'dsa.problem_solved'
  | 'dsa.problem_revision_scheduled'
  | 'dsa.submission_logged';

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

// ==========================================
// Phase 2: GitHub Integration Types
// ==========================================
export interface GitHubRepository {
  id: string;
  userId: string;
  projectId?: string | null;
  githubRepoId: number;
  name: string;
  fullName: string;
  htmlUrl: string;
  description?: string;
  isPrivate: boolean;
  defaultBranch: string;
  openIssuesCount: number;
  stargazersCount: number;
  lastSyncedAt?: string;
  createdAt: string;
}

export interface GitHubCommit {
  id: string;
  repositoryId: string;
  sha: string;
  message: string;
  authorName: string;
  authorEmail: string;
  htmlUrl: string;
  committedAt: string;
  createdAt: string;
}

export interface GitHubPullRequest {
  id: string;
  repositoryId: string;
  taskId?: string | null;
  githubPrId: number;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  authorLogin: string;
  htmlUrl: string;
  reviewStatus: 'pending' | 'approved' | 'changes_requested';
  mergedAt?: string | null;
  createdAt: string;
}

// ==========================================
// Phase 2: LeetCode & NeetCode Types
// ==========================================
export type DSADifficulty = 'easy' | 'medium' | 'hard';
export type DSAStatus = 'pending' | 'attempted' | 'solved' | 'revision_needed';

export interface DSATopic {
  id: string;
  name: string;
  displayOrder: number;
}

export interface DSAProblem {
  id: string;
  userId: string;
  topicId: string;
  title: string;
  slug: string;
  difficulty: DSADifficulty;
  leetcodeUrl: string;
  neetcodeRoadmapFlag: boolean;
  status: DSAStatus;
  notes?: string;
  approachSummary?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  nextRevisionDate?: string | null;
  lastSolvedAt?: string | null;
  createdAt: string;
}

export interface DSASubmission {
  id: string;
  problemId: string;
  status: 'Accepted' | 'Wrong Answer' | 'Time Limit Exceeded';
  code?: string;
  runtimeMs?: number;
  memoryMb?: number;
  submittedAt: string;
}

// ==========================================
// Phase 2: Activity Heatmap Types
// ==========================================
export interface DailyContribution {
  date: string; // YYYY-MM-DD
  count: number;
  breakdown: {
    tasks: number;
    github: number;
    dsa: number;
    daily: number;
  };
}

export interface HeatmapStats {
  contributions: DailyContribution[];
  currentStreak: number;
  longestStreak: number;
  totalContributions: number;
}
