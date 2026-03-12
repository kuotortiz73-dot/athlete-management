-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TrainingPlanSession" (
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
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrainingPlanSession_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TrainingPlanSession" ("cooldown", "createdAt", "dayOfWeek", "duration", "id", "intensity", "mainContent", "notes", "planId", "sessionTitle", "type", "warmup", "week") SELECT "cooldown", "createdAt", "dayOfWeek", "duration", "id", "intensity", "mainContent", "notes", "planId", "sessionTitle", "type", "warmup", "week" FROM "TrainingPlanSession";
DROP TABLE "TrainingPlanSession";
ALTER TABLE "new_TrainingPlanSession" RENAME TO "TrainingPlanSession";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
