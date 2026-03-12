"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// ─── 新增运动员 ───────────────────────────────────────────────
const AthleteSchema = z.object({
  name: z.string().min(1),
  gender: z.enum(["male", "female"]),
  age: z.coerce.number().int().min(1).max(100),
  nationality: z.string().default("中国"),
  sport: z.string().min(1),
  position: z.string().optional(),
  team: z.string().optional(),
  coachName: z.string().optional(),
  height: z.coerce.number().optional().nullable(),
  weight: z.coerce.number().optional().nullable(),
  phone: z.string().optional(),
  email: z.string().optional(),
  status: z.enum(["active", "injured", "retired"]).default("active"),
  notes: z.string().optional(),
});

export async function createAthlete(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const data = AthleteSchema.parse({
    ...raw,
    height: raw.height || null,
    weight: raw.weight || null,
  });
  const athlete = await prisma.athlete.create({ data });
  redirect(`/athletes/${athlete.id}?success=created`);
}

// ─── 力量记录 ─────────────────────────────────────────────────
function parseFloat_(formData: FormData, key: string) {
  const v = formData.get(key);
  if (!v || v === "") return null;
  return parseFloat(v as string) || null;
}

function parseInt_(formData: FormData, key: string) {
  const v = formData.get(key);
  if (!v || v === "") return null;
  return parseInt(v as string) || null;
}

export async function createStrengthRecord(athleteId: number, formData: FormData) {
  await prisma.strengthRecord.create({
    data: {
      athleteId,
      recordDate: new Date(formData.get("recordDate") as string),
      squat: parseFloat_(formData, "squat"),
      deadlift: parseFloat_(formData, "deadlift"),
      benchPress: parseFloat_(formData, "benchPress"),
      powerClean: parseFloat_(formData, "powerClean"),
      snatch: parseFloat_(formData, "snatch"),
      cleanJerk: parseFloat_(formData, "cleanJerk"),
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath(`/athletes/${athleteId}`);
  redirect(`/athletes/${athleteId}?success=strength`);
}

export async function updateStrengthRecord(recordId: number, athleteId: number, formData: FormData) {
  await prisma.strengthRecord.update({
    where: { id: recordId },
    data: {
      recordDate: new Date(formData.get("recordDate") as string),
      squat: parseFloat_(formData, "squat"),
      deadlift: parseFloat_(formData, "deadlift"),
      benchPress: parseFloat_(formData, "benchPress"),
      powerClean: parseFloat_(formData, "powerClean"),
      snatch: parseFloat_(formData, "snatch"),
      cleanJerk: parseFloat_(formData, "cleanJerk"),
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath(`/athletes/${athleteId}`);
  redirect(`/athletes/${athleteId}?success=strength`);
}

// ─── 体能测试 ─────────────────────────────────────────────────
export async function createPhysicalTest(athleteId: number, formData: FormData) {
  await prisma.physicalTest.create({
    data: {
      athleteId,
      testDate: new Date(formData.get("testDate") as string),
      tester: (formData.get("tester") as string) || null,
      sprint100m: parseFloat_(formData, "sprint100m"),
      sprint50m: parseFloat_(formData, "sprint50m"),
      run3000m: parseFloat_(formData, "run3000m"),
      vo2max: parseFloat_(formData, "vo2max"),
      verticalJump: parseFloat_(formData, "verticalJump"),
      broadJump: parseFloat_(formData, "broadJump"),
      sitAndReach: parseFloat_(formData, "sitAndReach"),
      agilityTest: parseFloat_(formData, "agilityTest"),
      overallScore: parseFloat_(formData, "overallScore"),
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath(`/athletes/${athleteId}`);
  redirect(`/athletes/${athleteId}?success=physical`);
}

export async function updatePhysicalTest(recordId: number, athleteId: number, formData: FormData) {
  await prisma.physicalTest.update({
    where: { id: recordId },
    data: {
      testDate: new Date(formData.get("testDate") as string),
      tester: (formData.get("tester") as string) || null,
      sprint100m: parseFloat_(formData, "sprint100m"),
      sprint50m: parseFloat_(formData, "sprint50m"),
      run3000m: parseFloat_(formData, "run3000m"),
      vo2max: parseFloat_(formData, "vo2max"),
      verticalJump: parseFloat_(formData, "verticalJump"),
      broadJump: parseFloat_(formData, "broadJump"),
      sitAndReach: parseFloat_(formData, "sitAndReach"),
      agilityTest: parseFloat_(formData, "agilityTest"),
      overallScore: parseFloat_(formData, "overallScore"),
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath(`/athletes/${athleteId}`);
  redirect(`/athletes/${athleteId}?success=physical`);
}

// ─── 身体成分 ─────────────────────────────────────────────────
export async function createBodyComposition(athleteId: number, formData: FormData) {
  await prisma.bodyComposition.create({
    data: {
      athleteId,
      testDate: new Date(formData.get("testDate") as string),
      weight: parseFloat_(formData, "weight"),
      bodyFat: parseFloat_(formData, "bodyFat"),
      muscleMass: parseFloat_(formData, "muscleMass"),
      boneMass: parseFloat_(formData, "boneMass"),
      waterContent: parseFloat_(formData, "waterContent"),
      bmi: parseFloat_(formData, "bmi"),
      visceralFat: parseInt_(formData, "visceralFat"),
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath(`/athletes/${athleteId}`);
  redirect(`/athletes/${athleteId}?success=body`);
}

export async function updateBodyComposition(recordId: number, athleteId: number, formData: FormData) {
  await prisma.bodyComposition.update({
    where: { id: recordId },
    data: {
      testDate: new Date(formData.get("testDate") as string),
      weight: parseFloat_(formData, "weight"),
      bodyFat: parseFloat_(formData, "bodyFat"),
      muscleMass: parseFloat_(formData, "muscleMass"),
      boneMass: parseFloat_(formData, "boneMass"),
      waterContent: parseFloat_(formData, "waterContent"),
      bmi: parseFloat_(formData, "bmi"),
      visceralFat: parseInt_(formData, "visceralFat"),
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath(`/athletes/${athleteId}`);
  redirect(`/athletes/${athleteId}?success=body`);
}

// ─── 训练日志 ─────────────────────────────────────────────────
export async function createTrainingLog(athleteId: number, formData: FormData) {
  await prisma.trainingLog.create({
    data: {
      athleteId,
      date: new Date(formData.get("date") as string),
      duration: parseInt(formData.get("duration") as string) || 60,
      type: formData.get("type") as string,
      intensity: parseInt(formData.get("intensity") as string) || 5,
      location: (formData.get("location") as string) || null,
      warmupNotes: (formData.get("warmupNotes") as string) || null,
      mainContent: (formData.get("mainContent") as string) || null,
      cooldownNotes: (formData.get("cooldownNotes") as string) || null,
      heartRateAvg: parseInt_(formData, "heartRateAvg"),
      heartRateMax: parseInt_(formData, "heartRateMax"),
      caloriesBurned: parseInt_(formData, "caloriesBurned"),
      mood: (formData.get("mood") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath(`/athletes/${athleteId}`);
  redirect(`/athletes/${athleteId}?success=training`);
}

export async function updateTrainingLog(recordId: number, athleteId: number, formData: FormData) {
  await prisma.trainingLog.update({
    where: { id: recordId },
    data: {
      date: new Date(formData.get("date") as string),
      duration: parseInt(formData.get("duration") as string) || 60,
      type: formData.get("type") as string,
      intensity: parseInt(formData.get("intensity") as string) || 5,
      location: (formData.get("location") as string) || null,
      warmupNotes: (formData.get("warmupNotes") as string) || null,
      mainContent: (formData.get("mainContent") as string) || null,
      cooldownNotes: (formData.get("cooldownNotes") as string) || null,
      heartRateAvg: parseInt_(formData, "heartRateAvg"),
      heartRateMax: parseInt_(formData, "heartRateMax"),
      caloriesBurned: parseInt_(formData, "caloriesBurned"),
      mood: (formData.get("mood") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath(`/athletes/${athleteId}`);
  redirect(`/athletes/${athleteId}?success=training`);
}

// ─── 训练计划 ─────────────────────────────────────────────────
export async function createTrainingPlan(formData: FormData) {
  const plan = await prisma.trainingPlan.create({
    data: {
      title: formData.get("title") as string,
      sport: (formData.get("sport") as string) || null,
      phase: (formData.get("phase") as string) || null,
      startDate: formData.get("startDate") ? new Date(formData.get("startDate") as string) : null,
      endDate: formData.get("endDate") ? new Date(formData.get("endDate") as string) : null,
      weeks: parseInt(formData.get("weeks") as string) || 4,
      description: (formData.get("description") as string) || null,
      goals: (formData.get("goals") as string) || null,
      coachName: (formData.get("coachName") as string) || null,
      status: "draft",
    },
  });
  revalidatePath("/training");
  redirect(`/training/${plan.id}?success=created`);
}

export async function updateTrainingPlan(planId: number, formData: FormData) {
  await prisma.trainingPlan.update({
    where: { id: planId },
    data: {
      title: formData.get("title") as string,
      sport: (formData.get("sport") as string) || null,
      phase: (formData.get("phase") as string) || null,
      startDate: formData.get("startDate") ? new Date(formData.get("startDate") as string) : null,
      endDate: formData.get("endDate") ? new Date(formData.get("endDate") as string) : null,
      weeks: parseInt(formData.get("weeks") as string) || 4,
      description: (formData.get("description") as string) || null,
      goals: (formData.get("goals") as string) || null,
      coachName: (formData.get("coachName") as string) || null,
      status: (formData.get("status") as string) || "draft",
    },
  });
  revalidatePath("/training");
  revalidatePath(`/training/${planId}`);
  redirect(`/training/${planId}?success=updated`);
}

export async function deleteTrainingPlan(planId: number) {
  await prisma.trainingPlan.delete({ where: { id: planId } });
  revalidatePath("/training");
  redirect("/training?success=deleted");
}

export async function updateTrainingPlanStatus(planId: number, status: string) {
  await prisma.trainingPlan.update({ where: { id: planId }, data: { status } });
  revalidatePath("/training");
  revalidatePath(`/training/${planId}`);
}

export async function createPlanSession(planId: number, formData: FormData) {
  await prisma.trainingPlanSession.create({
    data: {
      planId,
      week: parseInt(formData.get("week") as string) || 1,
      dayOfWeek: parseInt(formData.get("dayOfWeek") as string) || 1,
      sessionTitle: (formData.get("sessionTitle") as string) || null,
      type: (formData.get("type") as string) || "mixed",
      duration: parseInt_(formData, "duration"),
      intensity: parseInt_(formData, "intensity"),
      warmup: (formData.get("warmup") as string) || null,
      mainContent: (formData.get("mainContent") as string) || null,
      cooldown: (formData.get("cooldown") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath(`/training/${planId}`);
  redirect(`/training/${planId}?success=session`);
}

export async function updatePlanSession(sessionId: number, planId: number, formData: FormData) {
  await prisma.trainingPlanSession.update({
    where: { id: sessionId },
    data: {
      week: parseInt(formData.get("week") as string) || 1,
      dayOfWeek: parseInt(formData.get("dayOfWeek") as string) || 1,
      sessionTitle: (formData.get("sessionTitle") as string) || null,
      type: (formData.get("type") as string) || "mixed",
      duration: parseInt_(formData, "duration"),
      intensity: parseInt_(formData, "intensity"),
      warmup: (formData.get("warmup") as string) || null,
      mainContent: (formData.get("mainContent") as string) || null,
      cooldown: (formData.get("cooldown") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  });
  revalidatePath(`/training/${planId}`);
  redirect(`/training/${planId}?success=session`);
}

export async function deletePlanSession(sessionId: number, planId: number) {
  await prisma.trainingPlanSession.delete({ where: { id: sessionId } });
  revalidatePath(`/training/${planId}`);
  redirect(`/training/${planId}`);
}

export async function assignPlan(planId: number, formData: FormData) {
  const athleteIds = formData.getAll("athleteIds").map((v) => parseInt(v as string)).filter((n) => !isNaN(n));
  // 先删再插，实现覆盖式分配
  await prisma.trainingPlanAssignment.deleteMany({ where: { planId } });
  if (athleteIds.length > 0) {
    await prisma.trainingPlanAssignment.createMany({
      data: athleteIds.map((athleteId) => ({ planId, athleteId })),
    });
  }
  revalidatePath(`/training/${planId}`);
  redirect(`/training/${planId}?success=assigned`);
}

export async function toggleSessionCompleted(sessionId: number, planId: number, completed: boolean) {
  await prisma.trainingPlanSession.update({
    where: { id: sessionId },
    data: { completed },
  });
  revalidatePath(`/training/${planId}`);
}

export async function createTrainingPlanWithAthletes(formData: FormData) {
  const plan = await prisma.trainingPlan.create({
    data: {
      title: formData.get("title") as string,
      sport: (formData.get("sport") as string) || null,
      phase: (formData.get("phase") as string) || null,
      startDate: formData.get("startDate") ? new Date(formData.get("startDate") as string) : null,
      endDate: formData.get("endDate") ? new Date(formData.get("endDate") as string) : null,
      weeks: parseInt(formData.get("weeks") as string) || 4,
      description: (formData.get("description") as string) || null,
      goals: (formData.get("goals") as string) || null,
      coachName: (formData.get("coachName") as string) || null,
      status: "draft",
    },
  });

  const athleteIds = formData.getAll("athleteIds").map((v) => parseInt(v as string)).filter((n) => !isNaN(n));
  if (athleteIds.length > 0) {
    await prisma.trainingPlanAssignment.createMany({
      data: athleteIds.map((athleteId) => ({ planId: plan.id, athleteId })),
    });
  }

  revalidatePath("/training");
  redirect(`/training/${plan.id}?success=created`);
}
