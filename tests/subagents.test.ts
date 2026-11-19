import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase, DEFAULT_USER_ID } from '../src/db/client.ts';
import { AiAssistantService } from '../src/domain/ai-assistant-service.ts';
import { DEVOS_SUBAGENTS } from '../src/domain/subagents-catalog.ts';

test('Subagents Catalog & Dispatcher - 8 Domain Subagents verified', () => {
  const db = createDatabase(':memory:');
  const ai = new AiAssistantService(db);

  // 1. Catalog completeness
  assert.equal(DEVOS_SUBAGENTS.length, 8);
  const agentIds = DEVOS_SUBAGENTS.map((a) => a.id);
  assert.ok(agentIds.includes('dashboard_agent'));
  assert.ok(agentIds.includes('kanban_agent'));
  assert.ok(agentIds.includes('dsa_agent'));
  assert.ok(agentIds.includes('github_agent'));
  assert.ok(agentIds.includes('daily_agent'));
  assert.ok(agentIds.includes('architecture_agent'));
  assert.ok(agentIds.includes('career_agent'));
  assert.ok(agentIds.includes('toolbox_agent'));

  // 2. Dispatch to Dashboard Agent
  const dashRes = ai.invokeSubagent('dashboard_agent', 'Status report', DEFAULT_USER_ID);
  assert.ok(dashRes.answerMarkdown.includes('Dashboard Telemetry Agent'));
  assert.ok(dashRes.answerMarkdown.includes('Operational Systems Health'));

  // 3. Dispatch to LeetCode DSA Agent
  const dsaRes = ai.invokeSubagent('dsa_agent', 'Explain revision schedule', DEFAULT_USER_ID);
  assert.ok(dsaRes.answerMarkdown.includes('LeetCode DSA Tutor'));
  assert.ok(dsaRes.answerMarkdown.includes('Two Pointers'));

  // 4. Dispatch to Architecture ADR Agent
  const archRes = ai.invokeSubagent('architecture_agent', 'Review ADRs', DEFAULT_USER_ID);
  assert.ok(archRes.answerMarkdown.includes('Systems Architecture & ADR Specialist'));
  assert.ok(archRes.answerMarkdown.includes('sequenceDiagram'));

  // 5. Dispatch to Daily Standup Agent
  const dailyRes = ai.invokeSubagent('daily_agent', 'Draft standup', DEFAULT_USER_ID);
  assert.ok(dailyRes.answerMarkdown.includes('Daily Standup & Focus Agent'));
  assert.ok(dailyRes.answerMarkdown.includes('Top 3 Daily Rocks'));
});
