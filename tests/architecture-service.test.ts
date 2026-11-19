import test from 'node:test';
import assert from 'node:assert/strict';
import { createDatabase } from '../src/db/client.ts';
import { ArchitectureService } from '../src/domain/architecture-service.ts';
import { ActivityBus } from '../src/domain/activity-bus.ts';

test('ArchitectureService - ADR number sequencing & status updates', () => {
  const db = createDatabase(':memory:');
  const bus = new ActivityBus(db);
  const arch = new ArchitectureService(db, bus);

  const userId = 'usr_arch_test';
  db.prepare(`
    INSERT INTO users (id, email, name, timezone, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, 'arch@devos.local', 'Arch Tester', 'UTC', new Date().toISOString());

  // 1. Create ADR 1
  const adr1 = arch.createADR({
    userId,
    title: 'Adopt Next.js 16 App Router',
    status: 'accepted',
    context: 'Need modern React 19 server components',
    decision: 'Use Next.js 16 App Router',
    consequences: 'Zero client JS bundle for server-rendered dashboards',
  });

  assert.equal(adr1.adrNumber, 1);
  assert.equal(adr1.status, 'accepted');

  // 2. Create ADR 2
  const adr2 = arch.createADR({
    userId,
    title: 'Use SQLite WAL Mode',
    status: 'proposed',
    context: 'Concurrent reads and writes lock database',
    decision: 'Enable WAL mode',
    consequences: 'Eliminates lock contention across worker threads',
  });

  assert.equal(adr2.adrNumber, 2);

  // 3. Update status
  const updated = arch.updateADRStatus(adr2.id, 'accepted');
  assert.equal(updated, true);

  const allAdrs = arch.getADRs(userId);
  assert.equal(allAdrs.length, 2);
  assert.equal(allAdrs[1].status, 'accepted');
});
