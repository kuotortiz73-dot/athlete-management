"use client";

import Link from "next/link";
import {
  updateStrengthRecord,
  updatePhysicalTest,
  updateBodyComposition,
  updateTrainingLog,
} from "@/app/actions";

const inputStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  padding: "8px 12px",
  width: "100%",
  fontSize: "14px",
  outline: "none",
} as const;

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "11px",
  fontWeight: "bold",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--text-muted)",
  marginBottom: "6px",
};

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  unit,
  options,
  rows,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  unit?: string;
  options?: { value: string; label: string }[];
  rows?: number;
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
        {unit && <span style={{ color: "var(--text-muted)", fontWeight: "normal" }}> ({unit})</span>}
      </label>
      {options ? (
        <select
          name={name}
          defaultValue={String(defaultValue ?? "")}
          style={inputStyle}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : rows ? (
        <textarea
          name={name}
          rows={rows}
          defaultValue={String(defaultValue ?? "")}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      ) : (
        <input
          name={name}
          type={type}
          step={type === "number" ? "0.01" : undefined}
          defaultValue={String(defaultValue ?? "")}
          style={inputStyle}
        />
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-4" style={{ background: "var(--neon)" }} />
      <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--neon)" }}>
        {children}
      </h3>
    </div>
  );
}

function fmt(d: Date | string) {
  return new Date(d).toISOString().split("T")[0];
}

type StrengthRecord = {
  recordDate: Date;
  squat: number | null;
  deadlift: number | null;
  benchPress: number | null;
  powerClean: number | null;
  snatch: number | null;
  cleanJerk: number | null;
  notes: string | null;
};
type PhysicalTest = {
  testDate: Date;
  tester: string | null;
  sprint100m: number | null;
  sprint50m: number | null;
  run3000m: number | null;
  vo2max: number | null;
  verticalJump: number | null;
  broadJump: number | null;
  sitAndReach: number | null;
  agilityTest: number | null;
  overallScore: number | null;
  notes: string | null;
};
type BodyComposition = {
  testDate: Date;
  weight: number | null;
  bodyFat: number | null;
  muscleMass: number | null;
  boneMass: number | null;
  waterContent: number | null;
  bmi: number | null;
  visceralFat: number | null;
  notes: string | null;
};
type TrainingLog = {
  date: Date;
  duration: number;
  type: string;
  intensity: number;
  location: string | null;
  warmupNotes: string | null;
  mainContent: string | null;
  cooldownNotes: string | null;
  heartRateAvg: number | null;
  heartRateMax: number | null;
  caloriesBurned: number | null;
  mood: string | null;
  notes: string | null;
};

interface Props {
  athleteId: number;
  recordId: number;
  recordType: "strength" | "physical" | "body" | "training";
  record: StrengthRecord | PhysicalTest | BodyComposition | TrainingLog;
}

export default function EditRecordForm({ athleteId, recordId, recordType, record }: Props) {
  const handleStrength = updateStrengthRecord.bind(null, recordId, athleteId);
  const handlePhysical = updatePhysicalTest.bind(null, recordId, athleteId);
  const handleBody = updateBodyComposition.bind(null, recordId, athleteId);
  const handleTraining = updateTrainingLog.bind(null, recordId, athleteId);

  const submitRow = (
    <div className="flex justify-end gap-3 pt-2">
      <Link
        href={`/athletes/${athleteId}`}
        className="px-6 py-2 text-sm font-bold tracking-wider uppercase"
        style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
      >
        取消
      </Link>
      <button
        type="submit"
        className="px-8 py-2 text-sm font-black tracking-wider uppercase"
        style={{ background: "var(--neon)", color: "#0d0d0d" }}
      >
        保存修改
      </button>
    </div>
  );

  if (recordType === "strength") {
    const r = record as StrengthRecord;
    return (
      <form action={handleStrength} className="space-y-6">
        <section className="p-5 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <SectionTitle>力量 1RM 数据</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <Field label="测试日期" name="recordDate" type="date" defaultValue={fmt(r.recordDate)} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="深蹲" name="squat" type="number" unit="kg" defaultValue={r.squat} />
            <Field label="硬拉" name="deadlift" type="number" unit="kg" defaultValue={r.deadlift} />
            <Field label="卧推" name="benchPress" type="number" unit="kg" defaultValue={r.benchPress} />
            <Field label="高翻" name="powerClean" type="number" unit="kg" defaultValue={r.powerClean} />
            <Field label="抓举" name="snatch" type="number" unit="kg" defaultValue={r.snatch} />
            <Field label="挺举" name="cleanJerk" type="number" unit="kg" defaultValue={r.cleanJerk} />
          </div>
          <Field label="备注" name="notes" rows={2} defaultValue={r.notes} />
        </section>
        {submitRow}
      </form>
    );
  }

  if (recordType === "physical") {
    const r = record as PhysicalTest;
    return (
      <form action={handlePhysical} className="space-y-6">
        <section className="p-5 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <SectionTitle>体能测试数据</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <Field label="测试日期" name="testDate" type="date" defaultValue={fmt(r.testDate)} />
            <Field label="测试人员" name="tester" defaultValue={r.tester} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="100m" name="sprint100m" type="number" unit="s" defaultValue={r.sprint100m} />
            <Field label="50m" name="sprint50m" type="number" unit="s" defaultValue={r.sprint50m} />
            <Field label="3000m" name="run3000m" type="number" unit="s" defaultValue={r.run3000m} />
            <Field label="VO₂max" name="vo2max" type="number" defaultValue={r.vo2max} />
            <Field label="垂直跳" name="verticalJump" type="number" unit="cm" defaultValue={r.verticalJump} />
            <Field label="立定跳远" name="broadJump" type="number" unit="cm" defaultValue={r.broadJump} />
            <Field label="坐位体前屈" name="sitAndReach" type="number" unit="cm" defaultValue={r.sitAndReach} />
            <Field label="敏捷测试" name="agilityTest" type="number" unit="s" defaultValue={r.agilityTest} />
            <Field label="综合评分" name="overallScore" type="number" defaultValue={r.overallScore} />
          </div>
          <Field label="备注" name="notes" rows={2} defaultValue={r.notes} />
        </section>
        {submitRow}
      </form>
    );
  }

  if (recordType === "body") {
    const r = record as BodyComposition;
    return (
      <form action={handleBody} className="space-y-6">
        <section className="p-5 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <SectionTitle>身体成分数据</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <Field label="测量日期" name="testDate" type="date" defaultValue={fmt(r.testDate)} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Field label="体重" name="weight" type="number" unit="kg" defaultValue={r.weight} />
            <Field label="体脂率" name="bodyFat" type="number" unit="%" defaultValue={r.bodyFat} />
            <Field label="肌肉量" name="muscleMass" type="number" unit="kg" defaultValue={r.muscleMass} />
            <Field label="骨量" name="boneMass" type="number" unit="kg" defaultValue={r.boneMass} />
            <Field label="水分含量" name="waterContent" type="number" unit="%" defaultValue={r.waterContent} />
            <Field label="BMI" name="bmi" type="number" defaultValue={r.bmi} />
            <Field label="内脏脂肪等级" name="visceralFat" type="number" defaultValue={r.visceralFat} />
          </div>
          <Field label="备注" name="notes" rows={2} defaultValue={r.notes} />
        </section>
        {submitRow}
      </form>
    );
  }

  // training
  const r = record as TrainingLog;
  return (
    <form action={handleTraining} className="space-y-6">
      <section className="p-5 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <SectionTitle>训练日志</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="训练日期" name="date" type="date" defaultValue={fmt(r.date)} />
          <Field label="时长" name="duration" type="number" unit="分钟" defaultValue={r.duration} />
          <Field label="训练类型" name="type" options={[
            { value: "strength", label: "力量" },
            { value: "cardio", label: "有氧" },
            { value: "skill", label: "技术" },
            { value: "recovery", label: "恢复" },
            { value: "mixed", label: "综合" },
          ]} defaultValue={r.type} />
          <Field label="强度" name="intensity" options={Array.from({ length: 10 }, (_, i) => ({ value: String(i + 1), label: `${i + 1}/10` }))} defaultValue={r.intensity} />
          <Field label="状态" name="mood" options={[
            { value: "", label: "— 不填 —" },
            { value: "excellent", label: "极佳" },
            { value: "good", label: "良好" },
            { value: "normal", label: "一般" },
            { value: "poor", label: "较差" },
          ]} defaultValue={r.mood ?? ""} />
          <Field label="地点" name="location" defaultValue={r.location} />
        </div>
        <Field label="主训练内容" name="mainContent" rows={3} defaultValue={r.mainContent} />
        <div className="grid grid-cols-3 gap-4">
          <Field label="平均心率" name="heartRateAvg" type="number" unit="bpm" defaultValue={r.heartRateAvg} />
          <Field label="最大心率" name="heartRateMax" type="number" unit="bpm" defaultValue={r.heartRateMax} />
          <Field label="消耗热量" name="caloriesBurned" type="number" unit="kcal" defaultValue={r.caloriesBurned} />
        </div>
        <Field label="备注" name="notes" rows={2} defaultValue={r.notes} />
      </section>
      {submitRow}
    </form>
  );
}
