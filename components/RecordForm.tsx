"use client";

import { useState } from "react";
import Link from "next/link";
import {
  createStrengthRecord,
  createPhysicalTest,
  createBodyComposition,
  createTrainingLog,
} from "@/app/actions";

const RECORD_TYPES = [
  { id: "strength", label: "力量 1RM" },
  { id: "physical", label: "体能测试" },
  { id: "body", label: "身体成分" },
  { id: "training", label: "训练日志" },
] as const;

type RecordType = (typeof RECORD_TYPES)[number]["id"];

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
  placeholder,
  unit,
  required,
  options,
  defaultValue,
  rows,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  unit?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  rows?: number;
}) {
  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "var(--neon)");
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    (e.target.style.borderColor = "var(--border)");

  return (
    <div>
      <label style={labelStyle}>
        {label}
        {unit && <span style={{ color: "var(--text-muted)", fontWeight: "normal" }}> ({unit})</span>}
        {required && <span style={{ color: "var(--neon)" }}> *</span>}
      </label>
      {options ? (
        <select name={name} required={required} defaultValue={defaultValue} style={inputStyle} onFocus={focusBorder} onBlur={blurBorder}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ) : rows ? (
        <textarea
          name={name}
          rows={rows}
          placeholder={placeholder}
          style={{ ...inputStyle, resize: "vertical" }}
          onFocus={focusBorder}
          onBlur={blurBorder}
        />
      ) : (
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          defaultValue={defaultValue}
          style={inputStyle}
          step={type === "number" ? "0.01" : undefined}
          onFocus={focusBorder}
          onBlur={blurBorder}
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

export default function RecordForm({ athleteId }: { athleteId: number }) {
  const [activeType, setActiveType] = useState<RecordType>("strength");
  const today = new Date().toISOString().split("T")[0];

  const handleStrength = createStrengthRecord.bind(null, athleteId);
  const handlePhysical = createPhysicalTest.bind(null, athleteId);
  const handleBody = createBodyComposition.bind(null, athleteId);
  const handleTraining = createTrainingLog.bind(null, athleteId);

  return (
    <div>
      {/* 类型选择 */}
      <div className="flex overflow-x-auto mb-6" style={{ borderBottom: "1px solid var(--border)" }}>
        {RECORD_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveType(t.id)}
            className="px-5 py-3 text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-all"
            style={{
              color: activeType === t.id ? "var(--neon)" : "var(--text-muted)",
              borderBottom: activeType === t.id ? "2px solid var(--neon)" : "2px solid transparent",
              background: "transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 力量 1RM */}
      {activeType === "strength" && (
        <form action={handleStrength} className="space-y-6">
          <section className="p-5 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <SectionTitle>基础信息</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <Field label="测试日期" name="recordDate" type="date" required defaultValue={today} />
            </div>
          </section>

          <section className="p-5 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <SectionTitle>力量 1RM 数据</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="深蹲" name="squat" type="number" unit="kg" placeholder="200" />
              <Field label="硬拉" name="deadlift" type="number" unit="kg" placeholder="230" />
              <Field label="卧推" name="benchPress" type="number" unit="kg" placeholder="140" />
              <Field label="高翻" name="powerClean" type="number" unit="kg" placeholder="140" />
              <Field label="抓举" name="snatch" type="number" unit="kg" placeholder="130" />
              <Field label="挺举" name="cleanJerk" type="number" unit="kg" placeholder="160" />
            </div>
            <Field label="备注" name="notes" rows={2} placeholder="测试备注..." />
          </section>

          <SubmitRow athleteId={athleteId} />
        </form>
      )}

      {/* 体能测试 */}
      {activeType === "physical" && (
        <form action={handlePhysical} className="space-y-6">
          <section className="p-5 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <SectionTitle>测试信息</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <Field label="测试日期" name="testDate" type="date" required defaultValue={today} />
              <Field label="测试人员" name="tester" placeholder="李教练" />
            </div>
          </section>

          <section className="p-5 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <SectionTitle>速度 / 耐力</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="100米跑" name="sprint100m" type="number" unit="秒" placeholder="11.5" />
              <Field label="50米跑" name="sprint50m" type="number" unit="秒" placeholder="6.2" />
              <Field label="3000米跑" name="run3000m" type="number" unit="秒" placeholder="840" />
              <Field label="VO₂max" name="vo2max" type="number" unit="ml/kg/min" placeholder="55" />
            </div>
          </section>

          <section className="p-5 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <SectionTitle>爆发力 / 柔韧 / 敏捷</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="垂直跳" name="verticalJump" type="number" unit="cm" placeholder="60" />
              <Field label="立定跳远" name="broadJump" type="number" unit="cm" placeholder="240" />
              <Field label="坐位体前屈" name="sitAndReach" type="number" unit="cm" placeholder="15" />
              <Field label="敏捷测试（T型跑）" name="agilityTest" type="number" unit="秒" placeholder="9.5" />
              <Field label="综合评分" name="overallScore" type="number" unit="分" placeholder="85" />
            </div>
            <Field label="备注" name="notes" rows={2} placeholder="测试备注..." />
          </section>

          <SubmitRow athleteId={athleteId} />
        </form>
      )}

      {/* 身体成分 */}
      {activeType === "body" && (
        <form action={handleBody} className="space-y-6">
          <section className="p-5 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <SectionTitle>测量信息</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <Field label="测量日期" name="testDate" type="date" required defaultValue={today} />
            </div>
          </section>

          <section className="p-5 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <SectionTitle>身体成分数据</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="体重" name="weight" type="number" unit="kg" placeholder="80.5" />
              <Field label="体脂率" name="bodyFat" type="number" unit="%" placeholder="12.5" />
              <Field label="肌肉量" name="muscleMass" type="number" unit="kg" placeholder="65" />
              <Field label="骨量" name="boneMass" type="number" unit="kg" placeholder="3.5" />
              <Field label="水分含量" name="waterContent" type="number" unit="%" placeholder="60" />
              <Field label="BMI" name="bmi" type="number" placeholder="22.5" />
              <Field label="内脏脂肪等级" name="visceralFat" type="number" placeholder="5" />
            </div>
            <Field label="备注" name="notes" rows={2} placeholder="测量备注..." />
          </section>

          <SubmitRow athleteId={athleteId} />
        </form>
      )}

      {/* 训练日志 */}
      {activeType === "training" && (
        <form action={handleTraining} className="space-y-6">
          <section className="p-5 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <SectionTitle>训练基础信息</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="训练日期" name="date" type="date" required defaultValue={today} />
              <Field label="训练时长" name="duration" type="number" unit="分钟" required placeholder="90" />
              <Field
                label="训练类型"
                name="type"
                required
                options={[
                  { value: "strength", label: "力量" },
                  { value: "cardio", label: "有氧" },
                  { value: "skill", label: "技术" },
                  { value: "recovery", label: "恢复" },
                  { value: "mixed", label: "综合" },
                ]}
              />
              <Field
                label="训练强度"
                name="intensity"
                options={Array.from({ length: 10 }, (_, i) => ({
                  value: String(i + 1),
                  label: `${i + 1} / 10`,
                }))}
                defaultValue="7"
              />
              <Field
                label="训练状态"
                name="mood"
                options={[
                  { value: "", label: "— 不填 —" },
                  { value: "excellent", label: "极佳" },
                  { value: "good", label: "良好" },
                  { value: "normal", label: "一般" },
                  { value: "poor", label: "较差" },
                ]}
              />
              <Field label="训练地点" name="location" placeholder="训练馆A" />
            </div>
          </section>

          <section className="p-5 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <SectionTitle>训练内容</SectionTitle>
            <Field label="热身内容" name="warmupNotes" rows={2} placeholder="5分钟慢跑，动态拉伸..." />
            <Field label="主训练内容" name="mainContent" rows={4} placeholder="深蹲 5×5 @ 180kg，硬拉 3×3 @ 200kg..." />
            <Field label="放松内容" name="cooldownNotes" rows={2} placeholder="静态拉伸，泡沫轴..." />
          </section>

          <section className="p-5 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <SectionTitle>生理数据</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="平均心率" name="heartRateAvg" type="number" unit="bpm" placeholder="140" />
              <Field label="最大心率" name="heartRateMax" type="number" unit="bpm" placeholder="175" />
              <Field label="消耗热量" name="caloriesBurned" type="number" unit="kcal" placeholder="600" />
            </div>
            <Field label="备注" name="notes" rows={2} placeholder="训练备注..." />
          </section>

          <SubmitRow athleteId={athleteId} />
        </form>
      )}
    </div>
  );
}

function SubmitRow({ athleteId }: { athleteId: number }) {
  return (
    <div className="flex justify-end gap-3">
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
        保存记录
      </button>
    </div>
  );
}
