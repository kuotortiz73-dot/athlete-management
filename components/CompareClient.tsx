"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type AthleteSummary = {
  id: number;
  name: string;
  sport: string;
  status: string;
};

type AthleteDetail = {
  id: number;
  name: string;
  sport: string;
  status: string;
  strengthRecords: Array<{
    squat: number | null;
    deadlift: number | null;
    benchPress: number | null;
    powerClean: number | null;
    snatch: number | null;
    cleanJerk: number | null;
  }>;
  physicalTests: Array<{
    sprint100m: number | null;
    sprint50m: number | null;
    run3000m: number | null;
    vo2max: number | null;
    verticalJump: number | null;
    broadJump: number | null;
    overallScore: number | null;
  }>;
  bodyCompositions: Array<{
    weight: number | null;
    bodyFat: number | null;
    muscleMass: number | null;
    bmi: number | null;
  }>;
};

const NEON_COLORS = ["#e8ff3a", "#00e676", "#7c8bff", "#ff6b6b"];
const STATUS_MAP: Record<string, string> = {
  active: "在役",
  injured: "伤病",
  retired: "退役",
};

function normalize(value: number | null | undefined, min: number, max: number): number {
  if (value == null) return 0;
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
}

function buildRadarData(athletes: AthleteDetail[]) {
  const axes = [
    { key: "深蹲", getValue: (a: AthleteDetail) => a.strengthRecords[0]?.squat, min: 60, max: 300 },
    { key: "硬拉", getValue: (a: AthleteDetail) => a.strengthRecords[0]?.deadlift, min: 80, max: 360 },
    { key: "卧推", getValue: (a: AthleteDetail) => a.strengthRecords[0]?.benchPress, min: 40, max: 220 },
    { key: "VO₂max", getValue: (a: AthleteDetail) => a.physicalTests[0]?.vo2max, min: 30, max: 80 },
    { key: "垂直跳", getValue: (a: AthleteDetail) => a.physicalTests[0]?.verticalJump, min: 20, max: 100 },
    { key: "立定跳远", getValue: (a: AthleteDetail) => a.physicalTests[0]?.broadJump, min: 150, max: 320 },
    { key: "综合评分", getValue: (a: AthleteDetail) => a.physicalTests[0]?.overallScore, min: 50, max: 100 },
  ];

  return axes.map(({ key, getValue, min, max }) => {
    const entry: Record<string, number | string> = { subject: key };
    athletes.forEach((a) => {
      entry[a.name] = Math.round(normalize(getValue(a), min, max));
    });
    return entry;
  });
}

const cellStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  padding: "10px 14px",
} as const;

const labelStyle = {
  fontSize: "10px",
  color: "var(--text-muted)",
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  marginBottom: "2px",
};

const valueStyle = {
  fontSize: "18px",
  fontWeight: 900,
  fontFamily: "monospace",
  color: "var(--neon)",
};

function fmt(v: number | null | undefined, unit = "") {
  if (v == null) return "—";
  return `${v}${unit}`;
}

export default function CompareClient({
  allAthletes,
  athletes,
  selectedIds,
}: {
  allAthletes: AthleteSummary[];
  athletes: AthleteDetail[];
  selectedIds: number[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>(selectedIds);

  function toggle(id: number) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  }

  function apply() {
    if (selected.length === 0) {
      router.push("/compare");
    } else {
      router.push(`/compare?ids=${selected.join(",")}`);
    }
  }

  const radarData = athletes.length >= 2 ? buildRadarData(athletes) : [];

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div style={{ borderLeft: "3px solid var(--neon)", paddingLeft: "12px" }}>
        <h1 className="text-xl font-black tracking-wider uppercase" style={{ color: "var(--text-primary)" }}>
          运动员对比
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          选择 2–4 名运动员进行横向数据对比
        </p>
      </div>

      {/* 运动员选择器 */}
      <div className="p-4 space-y-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
          选择运动员 ({selected.length}/4)
        </div>
        <div className="flex flex-wrap gap-2">
          {allAthletes.map((a) => {
            const isSelected = selected.includes(a.id);
            const idx = selected.indexOf(a.id);
            const color = idx >= 0 ? NEON_COLORS[idx] : undefined;
            return (
              <button
                key={a.id}
                onClick={() => toggle(a.id)}
                className="px-3 py-1.5 text-xs font-bold tracking-wider transition-all"
                style={{
                  border: `1px solid ${isSelected ? (color ?? "var(--border)") : "var(--border)"}`,
                  background: isSelected ? `${color}22` : "transparent",
                  color: isSelected ? (color ?? "var(--text-primary)") : "var(--text-secondary)",
                  cursor: !isSelected && selected.length >= 4 ? "not-allowed" : "pointer",
                  opacity: !isSelected && selected.length >= 4 ? 0.4 : 1,
                }}
              >
                {a.name}
                <span className="ml-1.5 font-normal" style={{ color: isSelected ? (color ?? "var(--text-muted)") : "var(--text-muted)" }}>
                  {a.sport}
                </span>
              </button>
            );
          })}
        </div>
        <button
          onClick={apply}
          disabled={selected.length < 2}
          className="px-6 py-2 text-xs font-black tracking-wider uppercase"
          style={{
            background: selected.length >= 2 ? "var(--neon)" : "var(--bg-elevated)",
            color: selected.length >= 2 ? "#0d0d0d" : "var(--text-muted)",
            cursor: selected.length < 2 ? "not-allowed" : "pointer",
          }}
        >
          {selected.length < 2 ? `还需选择 ${2 - selected.length} 名` : "开始对比"}
        </button>
      </div>

      {athletes.length >= 2 && (
        <>
          {/* 雷达图 */}
          <div className="p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4" style={{ background: "var(--neon)" }} />
              <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--neon)" }}>
                综合能力雷达图
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <RadarChart data={radarData} margin={{ top: 10, right: 40, bottom: 10, left: 40 }}>
                <PolarGrid stroke="#2a2a2a" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "#888888", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "#555555", fontSize: 9 }}
                />
                {athletes.map((a, i) => (
                  <Radar
                    key={a.id}
                    name={a.name}
                    dataKey={a.name}
                    stroke={NEON_COLORS[i]}
                    fill={NEON_COLORS[i]}
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                ))}
                <Tooltip
                  contentStyle={{
                    background: "#1a1a1a",
                    border: "1px solid #2a2a2a",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", color: "#888888" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* 并排数据对比 */}
          {/* 力量数据 */}
          <CompareSection title="力量 1RM (kg)">
            {[
              { label: "深蹲", get: (a: AthleteDetail) => a.strengthRecords[0]?.squat },
              { label: "硬拉", get: (a: AthleteDetail) => a.strengthRecords[0]?.deadlift },
              { label: "卧推", get: (a: AthleteDetail) => a.strengthRecords[0]?.benchPress },
              { label: "高翻", get: (a: AthleteDetail) => a.strengthRecords[0]?.powerClean },
              { label: "抓举", get: (a: AthleteDetail) => a.strengthRecords[0]?.snatch },
              { label: "挺举", get: (a: AthleteDetail) => a.strengthRecords[0]?.cleanJerk },
            ].map(({ label, get }) => (
              <CompareRow key={label} label={label} athletes={athletes} getValue={get} unit="kg" />
            ))}
          </CompareSection>

          {/* 体能数据 */}
          <CompareSection title="体能测试">
            {[
              { label: "100m", get: (a: AthleteDetail) => a.physicalTests[0]?.sprint100m, unit: "s", inverse: true },
              { label: "50m", get: (a: AthleteDetail) => a.physicalTests[0]?.sprint50m, unit: "s", inverse: true },
              { label: "3000m", get: (a: AthleteDetail) => a.physicalTests[0]?.run3000m, unit: "s", inverse: true },
              { label: "VO₂max", get: (a: AthleteDetail) => a.physicalTests[0]?.vo2max, unit: "ml/kg" },
              { label: "垂直跳", get: (a: AthleteDetail) => a.physicalTests[0]?.verticalJump, unit: "cm" },
              { label: "立定跳远", get: (a: AthleteDetail) => a.physicalTests[0]?.broadJump, unit: "cm" },
              { label: "综合评分", get: (a: AthleteDetail) => a.physicalTests[0]?.overallScore, unit: "分" },
            ].map(({ label, get, unit, inverse }) => (
              <CompareRow key={label} label={label} athletes={athletes} getValue={get} unit={unit} inverse={inverse} />
            ))}
          </CompareSection>

          {/* 身体成分 */}
          <CompareSection title="身体成分">
            {[
              { label: "体重", get: (a: AthleteDetail) => a.bodyCompositions[0]?.weight, unit: "kg" },
              { label: "体脂率", get: (a: AthleteDetail) => a.bodyCompositions[0]?.bodyFat, unit: "%", inverse: true },
              { label: "肌肉量", get: (a: AthleteDetail) => a.bodyCompositions[0]?.muscleMass, unit: "kg" },
              { label: "BMI", get: (a: AthleteDetail) => a.bodyCompositions[0]?.bmi },
            ].map(({ label, get, unit, inverse }) => (
              <CompareRow key={label} label={label} athletes={athletes} getValue={get} unit={unit} inverse={inverse} />
            ))}
          </CompareSection>
        </>
      )}

      {athletes.length === 0 && selectedIds.length === 0 && (
        <div
          className="p-16 text-center"
          style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}
        >
          <div className="text-2xl font-black font-mono" style={{ color: "var(--text-muted)" }}>
            SELECT ATHLETES
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            从上方选择 2–4 名运动员开始对比
          </p>
        </div>
      )}
    </div>
  );
}

function CompareSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 space-y-3" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4" style={{ background: "var(--neon)" }} />
        <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--neon)" }}>
          {title}
        </h3>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CompareRow({
  label,
  athletes,
  getValue,
  unit = "",
  inverse = false,
}: {
  label: string;
  athletes: AthleteDetail[];
  getValue: (a: AthleteDetail) => number | null | undefined;
  unit?: string;
  inverse?: boolean;
}) {
  const values = athletes.map((a) => getValue(a));
  const numericValues = values.filter((v) => v != null) as number[];

  let best: number | null = null;
  if (numericValues.length > 0) {
    best = inverse ? Math.min(...numericValues) : Math.max(...numericValues);
  }

  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `120px repeat(${athletes.length}, 1fr)` }}>
      <div className="flex items-center text-xs" style={{ color: "var(--text-muted)" }}>
        {label}
      </div>
      {athletes.map((a, i) => {
        const v = getValue(a);
        const isBest = v != null && v === best && numericValues.length > 1;
        return (
          <div
            key={a.id}
            className="px-3 py-2 text-center"
            style={{
              background: isBest ? `${NEON_COLORS[i]}18` : "var(--bg-elevated)",
              border: `1px solid ${isBest ? NEON_COLORS[i] : "var(--border)"}`,
            }}
          >
            <span
              className="font-mono font-bold text-sm"
              style={{ color: isBest ? NEON_COLORS[i] : v != null ? "var(--text-primary)" : "var(--text-muted)" }}
            >
              {v != null ? `${v}${unit}` : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
