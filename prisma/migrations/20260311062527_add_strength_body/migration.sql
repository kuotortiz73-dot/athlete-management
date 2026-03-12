/*
  Warnings:

  - You are about to drop the column `benchPress` on the `PhysicalTest` table. All the data in the column will be lost.
  - You are about to drop the column `deadlift` on the `PhysicalTest` table. All the data in the column will be lost.
  - You are about to drop the column `squat` on the `PhysicalTest` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "StrengthRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "athleteId" INTEGER NOT NULL,
    "recordDate" DATETIME NOT NULL,
    "squat" REAL,
    "deadlift" REAL,
    "benchPress" REAL,
    "powerClean" REAL,
    "snatch" REAL,
    "cleanJerk" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StrengthRecord_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BodyComposition" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "athleteId" INTEGER NOT NULL,
    "testDate" DATETIME NOT NULL,
    "weight" REAL,
    "bodyFat" REAL,
    "muscleMass" REAL,
    "boneMass" REAL,
    "waterContent" REAL,
    "bmi" REAL,
    "visceralFat" INTEGER,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BodyComposition_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PhysicalTest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "athleteId" INTEGER NOT NULL,
    "testDate" DATETIME NOT NULL,
    "tester" TEXT,
    "sprint100m" REAL,
    "sprint50m" REAL,
    "run3000m" REAL,
    "vo2max" REAL,
    "verticalJump" REAL,
    "broadJump" REAL,
    "sitAndReach" REAL,
    "agilityTest" REAL,
    "overallScore" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PhysicalTest_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PhysicalTest" ("agilityTest", "athleteId", "broadJump", "createdAt", "id", "notes", "overallScore", "run3000m", "sitAndReach", "sprint100m", "sprint50m", "testDate", "tester", "verticalJump", "vo2max") SELECT "agilityTest", "athleteId", "broadJump", "createdAt", "id", "notes", "overallScore", "run3000m", "sitAndReach", "sprint100m", "sprint50m", "testDate", "tester", "verticalJump", "vo2max" FROM "PhysicalTest";
DROP TABLE "PhysicalTest";
ALTER TABLE "new_PhysicalTest" RENAME TO "PhysicalTest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
