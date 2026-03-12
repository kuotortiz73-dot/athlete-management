-- CreateTable
CREATE TABLE "Athlete" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "birthDate" DATETIME,
    "nationality" TEXT NOT NULL DEFAULT '中国',
    "sport" TEXT NOT NULL,
    "position" TEXT,
    "team" TEXT,
    "coachName" TEXT,
    "height" REAL,
    "weight" REAL,
    "phone" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "avatarUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PhysicalTest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "athleteId" INTEGER NOT NULL,
    "testDate" DATETIME NOT NULL,
    "tester" TEXT,
    "sprint100m" REAL,
    "sprint50m" REAL,
    "benchPress" REAL,
    "squat" REAL,
    "deadlift" REAL,
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

-- CreateTable
CREATE TABLE "CompetitionRecord" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "athleteId" INTEGER NOT NULL,
    "competitionName" TEXT NOT NULL,
    "level" TEXT,
    "date" DATETIME NOT NULL,
    "location" TEXT,
    "event" TEXT,
    "rank" INTEGER,
    "score" TEXT,
    "medalType" TEXT,
    "result" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompetitionRecord_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TrainingLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "athleteId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "intensity" INTEGER NOT NULL,
    "location" TEXT,
    "warmupNotes" TEXT,
    "mainContent" TEXT,
    "cooldownNotes" TEXT,
    "heartRateAvg" INTEGER,
    "heartRateMax" INTEGER,
    "caloriesBurned" INTEGER,
    "mood" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TrainingLog_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Injury" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "athleteId" INTEGER NOT NULL,
    "injuryDate" DATETIME NOT NULL,
    "recoveryDate" DATETIME,
    "bodyPart" TEXT NOT NULL,
    "injuryType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "treatment" TEXT,
    "doctor" TEXT,
    "status" TEXT NOT NULL DEFAULT 'recovering',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Injury_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
