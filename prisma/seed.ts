import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../app/generated/prisma/client";
import path from "path";

const dbPath = path.resolve(__dirname, "../prisma/dev.db").replace(/\\/g, "/");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient({ adapter } as any);

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log("🌱 开始清空旧数据...");
  await prisma.injury.deleteMany();
  await prisma.trainingLog.deleteMany();
  await prisma.bodyComposition.deleteMany();
  await prisma.physicalTest.deleteMany();
  await prisma.strengthRecord.deleteMany();
  await prisma.competitionRecord.deleteMany();
  await prisma.athlete.deleteMany();
  console.log("✓ 旧数据清理完毕");

  // ─── 5 名运动员 ─────────────────────────────────────────────
  const athletesData = [
    {
      name: "张宇轩",
      gender: "male",
      age: 24,
      sport: "举重",
      position: "85kg级",
      team: "省队",
      coachName: "王教练",
      height: 178,
      weight: 84,
      nationality: "中国",
      status: "active",
    },
    {
      name: "李思敏",
      gender: "female",
      age: 22,
      sport: "短跑",
      position: "100m/200m",
      team: "市队",
      coachName: "陈教练",
      height: 168,
      weight: 58,
      nationality: "中国",
      status: "active",
    },
    {
      name: "王浩然",
      gender: "male",
      age: 26,
      sport: "力量举",
      position: "93kg级",
      team: "省队",
      coachName: "李教练",
      height: 182,
      weight: 92,
      nationality: "中国",
      status: "injured",
    },
    {
      name: "刘嘉欣",
      gender: "female",
      age: 20,
      sport: "体操",
      position: "全能",
      team: "国家队",
      coachName: "赵教练",
      height: 155,
      weight: 48,
      nationality: "中国",
      status: "active",
    },
    {
      name: "陈志远",
      gender: "male",
      age: 28,
      sport: "橄榄球",
      position: "前锋",
      team: "职业队",
      coachName: "张教练",
      height: 188,
      weight: 102,
      nationality: "中国",
      status: "active",
    },
  ];

  console.log("👤 创建运动员...");
  const athletes = await Promise.all(
    athletesData.map((data) => prisma.athlete.create({ data }))
  );
  console.log(`✓ 创建了 ${athletes.length} 名运动员`);

  // ─── 张宇轩：举重运动员 ──────────────────────────────────────
  const [zhang, li, wang, liu, chen] = athletes;

  // 力量记录（6个月，每月1条，逐步提升）
  const zhangStrength = [
    { squat: 185, deadlift: 200, benchPress: 130, powerClean: 130, snatch: 120, cleanJerk: 148 },
    { squat: 188, deadlift: 205, benchPress: 132, powerClean: 133, snatch: 122, cleanJerk: 151 },
    { squat: 192, deadlift: 210, benchPress: 135, powerClean: 136, snatch: 125, cleanJerk: 155 },
    { squat: 195, deadlift: 212, benchPress: 136, powerClean: 138, snatch: 127, cleanJerk: 157 },
    { squat: 200, deadlift: 218, benchPress: 138, powerClean: 140, snatch: 130, cleanJerk: 160 },
    { squat: 205, deadlift: 225, benchPress: 140, powerClean: 143, snatch: 133, cleanJerk: 164 },
  ];
  for (let i = 0; i < zhangStrength.length; i++) {
    await prisma.strengthRecord.create({
      data: { athleteId: zhang.id, recordDate: daysAgo(150 - i * 25), ...zhangStrength[i] },
    });
  }

  // 体能测试（3次）
  const zhangPhysical = [
    { sprint100m: 11.2, sprint50m: 6.1, run3000m: 900, vo2max: 52, verticalJump: 62, broadJump: 245, sitAndReach: 12, agilityTest: 9.8, overallScore: 82 },
    { sprint100m: 11.0, sprint50m: 6.0, run3000m: 890, vo2max: 54, verticalJump: 64, broadJump: 248, sitAndReach: 13, agilityTest: 9.6, overallScore: 84 },
    { sprint100m: 10.8, sprint50m: 5.9, run3000m: 875, vo2max: 55, verticalJump: 66, broadJump: 252, sitAndReach: 14, agilityTest: 9.4, overallScore: 86 },
  ];
  for (let i = 0; i < zhangPhysical.length; i++) {
    await prisma.physicalTest.create({
      data: { athleteId: zhang.id, testDate: daysAgo(120 - i * 40), tester: "王教练", ...zhangPhysical[i] },
    });
  }

  // 身体成分（4次）
  for (let i = 0; i < 4; i++) {
    await prisma.bodyComposition.create({
      data: {
        athleteId: zhang.id,
        testDate: daysAgo(90 - i * 28),
        weight: 84 + i * 0.3,
        bodyFat: 13.5 - i * 0.4,
        muscleMass: 68 + i * 0.5,
        boneMass: 3.4,
        waterContent: 61 + i * 0.2,
        bmi: 26.5,
        visceralFat: 6,
      },
    });
  }

  // 训练日志（近20天，每隔1天）
  for (let i = 0; i < 10; i++) {
    await prisma.trainingLog.create({
      data: {
        athleteId: zhang.id,
        date: daysAgo(i * 2),
        duration: 100 + Math.floor(Math.random() * 20),
        type: ["strength", "strength", "mixed", "skill", "recovery"][i % 5],
        intensity: 7 + (i % 3),
        location: "训练馆A",
        mainContent: ["深蹲 5×5 @190kg，挺举技术训练", "硬拉 4×4 @210kg，高翻 3×3 @135kg", "综合力量训练，辅助动作", "抓举技术精练，轻重量多组", "拉伸放松，恢复性有氧"][i % 5],
        heartRateAvg: 140 + i * 2,
        heartRateMax: 175 + i,
        caloriesBurned: 650 + i * 20,
        mood: ["excellent", "good", "good", "normal", "excellent"][i % 5],
      },
    });
  }

  // ─── 李思敏：短跑运动员 ──────────────────────────────────────
  const liStrength = [
    { squat: 90, deadlift: 105, benchPress: 65, powerClean: 60, snatch: null, cleanJerk: null },
    { squat: 95, deadlift: 110, benchPress: 67, powerClean: 63, snatch: null, cleanJerk: null },
    { squat: 98, deadlift: 115, benchPress: 68, powerClean: 65, snatch: null, cleanJerk: null },
    { squat: 100, deadlift: 118, benchPress: 70, powerClean: 67, snatch: null, cleanJerk: null },
  ];
  for (let i = 0; i < liStrength.length; i++) {
    await prisma.strengthRecord.create({
      data: { athleteId: li.id, recordDate: daysAgo(90 - i * 28), ...liStrength[i] },
    });
  }

  const liPhysical = [
    { sprint100m: 11.8, sprint50m: 6.6, run3000m: 780, vo2max: 60, verticalJump: 55, broadJump: 220, sitAndReach: 20, agilityTest: 8.9, overallScore: 85 },
    { sprint100m: 11.5, sprint50m: 6.4, run3000m: 770, vo2max: 62, verticalJump: 57, broadJump: 225, sitAndReach: 22, agilityTest: 8.7, overallScore: 87 },
    { sprint100m: 11.3, sprint50m: 6.2, run3000m: 758, vo2max: 64, verticalJump: 59, broadJump: 230, sitAndReach: 23, agilityTest: 8.5, overallScore: 90 },
  ];
  for (let i = 0; i < liPhysical.length; i++) {
    await prisma.physicalTest.create({
      data: { athleteId: li.id, testDate: daysAgo(80 - i * 35), tester: "陈教练", ...liPhysical[i] },
    });
  }

  for (let i = 0; i < 4; i++) {
    await prisma.bodyComposition.create({
      data: {
        athleteId: li.id,
        testDate: daysAgo(90 - i * 28),
        weight: 58 - i * 0.2,
        bodyFat: 18 - i * 0.5,
        muscleMass: 44 + i * 0.3,
        boneMass: 2.8,
        waterContent: 58 + i * 0.2,
        bmi: 20.5,
        visceralFat: 3,
      },
    });
  }

  for (let i = 0; i < 10; i++) {
    await prisma.trainingLog.create({
      data: {
        athleteId: li.id,
        date: daysAgo(i * 2 + 1),
        duration: 80 + Math.floor(Math.random() * 20),
        type: ["cardio", "strength", "skill", "cardio", "recovery"][i % 5],
        intensity: 8 - (i % 3),
        location: "田径场",
        mainContent: ["100m冲刺训练 10×80m", "辅助力量训练，深蹲 4×6", "起跑技术，蹬地动作精练", "200m节奏跑 5组", "放松跑 + 拉伸"][i % 5],
        heartRateAvg: 155 + i * 2,
        heartRateMax: 188,
        caloriesBurned: 520 + i * 15,
        mood: ["good", "excellent", "good", "normal", "good"][i % 5],
      },
    });
  }

  // ─── 王浩然：力量举（伤病） ──────────────────────────────────
  const wangStrength = [
    { squat: 240, deadlift: 280, benchPress: 170, powerClean: null, snatch: null, cleanJerk: null },
    { squat: 245, deadlift: 285, benchPress: 172, powerClean: null, snatch: null, cleanJerk: null },
    { squat: 250, deadlift: 290, benchPress: 175, powerClean: null, snatch: null, cleanJerk: null },
    { squat: 255, deadlift: 295, benchPress: 177, powerClean: null, snatch: null, cleanJerk: null },
    { squat: 260, deadlift: 300, benchPress: 180, powerClean: null, snatch: null, cleanJerk: null },
  ];
  for (let i = 0; i < wangStrength.length; i++) {
    await prisma.strengthRecord.create({
      data: { athleteId: wang.id, recordDate: daysAgo(120 - i * 25), ...wangStrength[i] },
    });
  }

  await prisma.physicalTest.create({
    data: { athleteId: wang.id, testDate: daysAgo(60), tester: "李教练", sprint100m: 12.1, sprint50m: 6.8, run3000m: 1020, vo2max: 45, verticalJump: 50, broadJump: 210, sitAndReach: 5, agilityTest: 10.5, overallScore: 75 },
  });
  await prisma.physicalTest.create({
    data: { athleteId: wang.id, testDate: daysAgo(30), tester: "李教练", sprint100m: 12.0, sprint50m: 6.7, run3000m: 1000, vo2max: 46, verticalJump: 52, broadJump: 212, sitAndReach: 6, agilityTest: 10.3, overallScore: 77 },
  });

  for (let i = 0; i < 3; i++) {
    await prisma.bodyComposition.create({
      data: { athleteId: wang.id, testDate: daysAgo(90 - i * 40), weight: 92 + i * 0.5, bodyFat: 18 - i * 0.3, muscleMass: 72 + i * 0.5, boneMass: 3.8, waterContent: 59, bmi: 27.8, visceralFat: 8 },
    });
  }

  // 伤病记录
  await prisma.injury.create({
    data: {
      athleteId: wang.id,
      injuryDate: daysAgo(45),
      bodyPart: "腰部",
      injuryType: "肌肉拉伤",
      severity: "moderate",
      treatment: "物理治疗 + 休息",
      doctor: "运动医学科",
      status: "recovering",
      notes: "深蹲时受伤，目前正在康复中",
    },
  });

  for (let i = 0; i < 8; i++) {
    await prisma.trainingLog.create({
      data: {
        athleteId: wang.id,
        date: daysAgo(i * 3 + 2),
        duration: 60,
        type: "recovery",
        intensity: 3 + (i % 2),
        location: "康复中心",
        mainContent: "物理治疗，轻度有氧，核心稳定性训练",
        heartRateAvg: 120,
        heartRateMax: 145,
        caloriesBurned: 350,
        mood: "normal",
      },
    });
  }

  // ─── 刘嘉欣：体操 ───────────────────────────────────────────
  const liuStrength = [
    { squat: 70, deadlift: 80, benchPress: 45, powerClean: null, snatch: null, cleanJerk: null },
    { squat: 73, deadlift: 83, benchPress: 47, powerClean: null, snatch: null, cleanJerk: null },
    { squat: 75, deadlift: 85, benchPress: 48, powerClean: null, snatch: null, cleanJerk: null },
  ];
  for (let i = 0; i < liuStrength.length; i++) {
    await prisma.strengthRecord.create({
      data: { athleteId: liu.id, recordDate: daysAgo(80 - i * 35), ...liuStrength[i] },
    });
  }

  const liuPhysical = [
    { sprint100m: 13.5, sprint50m: 7.4, run3000m: 850, vo2max: 55, verticalJump: 52, broadJump: 195, sitAndReach: 32, agilityTest: 8.2, overallScore: 88 },
    { sprint100m: 13.2, sprint50m: 7.2, run3000m: 840, vo2max: 57, verticalJump: 54, broadJump: 198, sitAndReach: 34, agilityTest: 8.0, overallScore: 90 },
  ];
  for (let i = 0; i < liuPhysical.length; i++) {
    await prisma.physicalTest.create({
      data: { athleteId: liu.id, testDate: daysAgo(60 - i * 40), tester: "赵教练", ...liuPhysical[i] },
    });
  }

  for (let i = 0; i < 3; i++) {
    await prisma.bodyComposition.create({
      data: { athleteId: liu.id, testDate: daysAgo(70 - i * 30), weight: 48 - i * 0.2, bodyFat: 16 - i * 0.5, muscleMass: 36 + i * 0.3, boneMass: 2.3, waterContent: 57, bmi: 19.9, visceralFat: 2 },
    });
  }

  for (let i = 0; i < 10; i++) {
    await prisma.trainingLog.create({
      data: {
        athleteId: liu.id,
        date: daysAgo(i),
        duration: 180,
        type: ["skill", "skill", "strength", "skill", "recovery"][i % 5],
        intensity: 9 - (i % 3),
        location: "体操馆",
        mainContent: ["全套动作连贯训练", "平衡木：高难度动作", "辅助力量：拉单杠、双杠", "自由操：跳跃动作", "拉伸 + 柔韧性训练"][i % 5],
        heartRateAvg: 150,
        heartRateMax: 182,
        caloriesBurned: 580,
        mood: "excellent",
      },
    });
  }

  // ─── 陈志远：橄榄球 ─────────────────────────────────────────
  const chenStrength = [
    { squat: 200, deadlift: 230, benchPress: 160, powerClean: 130, snatch: null, cleanJerk: null },
    { squat: 205, deadlift: 235, benchPress: 163, powerClean: 133, snatch: null, cleanJerk: null },
    { squat: 210, deadlift: 240, benchPress: 165, powerClean: 135, snatch: null, cleanJerk: null },
    { squat: 215, deadlift: 245, benchPress: 168, powerClean: 138, snatch: null, cleanJerk: null },
    { squat: 220, deadlift: 250, benchPress: 170, powerClean: 140, snatch: null, cleanJerk: null },
  ];
  for (let i = 0; i < chenStrength.length; i++) {
    await prisma.strengthRecord.create({
      data: { athleteId: chen.id, recordDate: daysAgo(100 - i * 22), ...chenStrength[i] },
    });
  }

  const chenPhysical = [
    { sprint100m: 11.5, sprint50m: 6.3, run3000m: 860, vo2max: 58, verticalJump: 68, broadJump: 255, sitAndReach: 8, agilityTest: 9.0, overallScore: 88 },
    { sprint100m: 11.3, sprint50m: 6.1, run3000m: 845, vo2max: 60, verticalJump: 70, broadJump: 260, sitAndReach: 9, agilityTest: 8.8, overallScore: 90 },
  ];
  for (let i = 0; i < chenPhysical.length; i++) {
    await prisma.physicalTest.create({
      data: { athleteId: chen.id, testDate: daysAgo(60 - i * 40), tester: "张教练", ...chenPhysical[i] },
    });
  }

  for (let i = 0; i < 4; i++) {
    await prisma.bodyComposition.create({
      data: { athleteId: chen.id, testDate: daysAgo(90 - i * 28), weight: 102 - i * 0.3, bodyFat: 15 - i * 0.4, muscleMass: 83 + i * 0.5, boneMass: 4.2, waterContent: 60, bmi: 28.9, visceralFat: 7 },
    });
  }

  for (let i = 0; i < 12; i++) {
    await prisma.trainingLog.create({
      data: {
        athleteId: chen.id,
        date: daysAgo(i),
        duration: 110,
        type: ["mixed", "strength", "cardio", "skill", "strength"][i % 5],
        intensity: 8 + (i % 2),
        location: "球队训练场",
        mainContent: ["全队对抗训练", "深蹲 5×5 + 高翻 4×4", "间歇跑 + 变向跑", "战术演练", "卧推 + 辅助动作"][i % 5],
        heartRateAvg: 158 + i,
        heartRateMax: 192,
        caloriesBurned: 720 + i * 15,
        mood: ["excellent", "good", "good", "excellent", "normal"][i % 5],
      },
    });
  }

  console.log("✅ 种子数据创建完成！");
  console.log("   运动员: 5名");
  console.log("   力量记录: 23条");
  console.log("   体能测试: 10条");
  console.log("   身体成分: 14条");
  console.log("   训练日志: 50条");
  console.log("   伤病记录: 1条");
}

main()
  .catch((e) => {
    console.error("❌ Seed 失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
