import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '..', 'prisma', 'dev.db').replace(/\\/g, '/');
const db = createClient({ url: 'file:' + dbPath });

const tables = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
console.log('现有表:', tables.rows.map(r => r.name).join(', '));

const hasPlan = tables.rows.some(r => r.name === 'TrainingPlan');
if (hasPlan) {
  console.log('TrainingPlan 表已存在，无需迁移');
} else {
  console.log('创建新表...');
  await db.execute(`CREATE TABLE "TrainingPlan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "sport" TEXT,
    "phase" TEXT,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "weeks" INTEGER NOT NULL DEFAULT 4,
    "description" TEXT,
    "goals" TEXT,
    "coachName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`);
  await db.execute(`CREATE TABLE "TrainingPlanSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "planId" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "sessionTitle" TEXT,
    "type" TEXT NOT NULL,
    "duration" INTEGER,
    "intensity" INTEGER,
    "warmup" TEXT,
    "mainContent" TEXT,
    "cooldown" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrainingPlanSession_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`);
  await db.execute(`CREATE TABLE "TrainingPlanAssignment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "planId" INTEGER NOT NULL,
    "athleteId" INTEGER NOT NULL,
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrainingPlanAssignment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TrainingPlanAssignment_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`);
  await db.execute(`CREATE UNIQUE INDEX "TrainingPlanAssignment_planId_athleteId_key" ON "TrainingPlanAssignment"("planId", "athleteId")`);
  console.log('✓ 三张新表创建成功');
}

// 验证
const after = await db.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
console.log('最终表列表:', after.rows.map(r => r.name).join(', '));
db.close();
