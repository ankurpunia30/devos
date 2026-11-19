import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase, DEFAULT_USER_ID } from '../src/db/client.ts';
import { ActivityBus } from '../src/domain/activity-bus.ts';
import { TaskService } from '../src/domain/task-service.ts';
import { ProjectService } from '../src/domain/project-service.ts';

test('ProjectService - Milestone tracking and auto-calculated progress percentage', () => {
  const db = createDatabase(':memory:');
  const bus = new ActivityBus(db);
  const taskService = new TaskService(db, bus);
  const projectService = new ProjectService(db, bus);

  // 1. Create Project
  const project = projectService.createProject({
    userId: DEFAULT_USER_ID,
    name: 'DevOS Storage Engine',
    category: 'personal',
    techStack: ['Rust', 'SQLite'],
  });

  assert.ok(project.id.startsWith('proj_'));
  assert.equal(project.progressPercentage, 0);

  // 2. Add Milestones
  const ms = projectService.addMilestone({
    projectId: project.id,
    title: 'MVP Schema Migration',
    dueDate: '2026-12-01',
  });
  assert.equal(ms.title, 'MVP Schema Migration');

  // 3. Create 2 tasks under this project
  const t1 = taskService.createTask({
    userId: DEFAULT_USER_ID,
    projectId: project.id,
    title: 'Subtask 1',
    status: 'completed',
  });

  const t2 = taskService.createTask({
    userId: DEFAULT_USER_ID,
    projectId: project.id,
    title: 'Subtask 2',
    status: 'in_progress',
  });

  // 4. Verify progress calculation: 1 out of 2 completed = 50%
  const updatedProject = projectService.getProjectById(project.id, DEFAULT_USER_ID);
  assert.ok(updatedProject);
  assert.equal(updatedProject.progressPercentage, 50);

  // 5. Complete Subtask 2: 2 out of 2 completed = 100%
  taskService.updateTask(t2.id, DEFAULT_USER_ID, { status: 'completed' });
  const finalProject = projectService.getProjectById(project.id, DEFAULT_USER_ID);
  assert.ok(finalProject);
  assert.equal(finalProject.progressPercentage, 100);

  // 6. Link GitHub repository to project workspace
  projectService.linkRepository(project.id, 'ankurpunia30/storage-engine', DEFAULT_USER_ID);

  // 7. Toggle milestone
  projectService.toggleMilestone(ms.id, true);

  // 8. Fetch full project workspace
  const workspace = projectService.getProjectWorkspace(project.id, DEFAULT_USER_ID);
  assert.ok(workspace);
  assert.equal(workspace.project.name, 'DevOS Storage Engine');
  assert.ok(workspace.repository);
  assert.equal(workspace.repository.fullName, 'ankurpunia30/storage-engine');
  assert.equal(workspace.tasks.length, 2);
  assert.equal(workspace.milestones.length, 1);
  assert.equal(workspace.milestones[0].isCompleted, true);
  assert.ok(workspace.commits.length > 0);
  assert.ok(workspace.pullRequests.length > 0);
});
