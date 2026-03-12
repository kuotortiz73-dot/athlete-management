"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface StrengthRecord {
  recordDate: Date;
  squat: number | null;
  deadlift: number | null;
  benchPress: number | null;
  powerClean: number | null;
  snatch: number | null;
  cleanJerk: number | null;
}

interface PhysicalTest {
  testDate: Date;
  sprint100m: number | null;
  verticalJump: number | null;
  vo2max: number | null;
  overallScore: number | null;
}

interface BodyComposition {
  testDate: Date;
  weight: number | null;
  bodyFat: number | null;
  muscleMass: number | null;
  bmi: number | null;
}

interface Props {
  strengthRecords: StrengthRecord[];
  physicalTests: PhysicalTest[];
  bodyCompositions: BodyComposition[];
}

const NEON = "#e8ff3a";
const COLORS = ["#e8ff3a", "#00e676", "#7c8bff", "#ff9900", "#ff3b3b", "#00d4ff"];

const tooltipStyle = {
  backgroundColor: "#1a1a1a",
  border: "1px solid #2a2a2a",
  borderRadius: 0,
  color: "#f0f0f0",
  fontSize: "12px",
};

const axisStyle = { fill: "#555555", fontSize: 11 };

function ChartSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-4" style={{ background: NEON }} />
        <h3
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: "var(--text-secondary)" }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height: 200, color: "var(--text-muted)", fontSize: 12 }}
    >
      {message}
    </div>
  );
}

export default function AthleteCharts({
  strengthRecords,
  physicalTests,
  bodyCompositions,
}: Props) {
  // 力量趋势数据
  const strengthData = [...strengthRecords]
    .reverse()
    .map((r) => ({
      date: new Date(r.recordDate).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" }),
      深蹲: r.squat ?? undefined,
      硬拉: r.deadlift ?? undefined,
      卧推: r.benchPress ?? undefined,
      高翻: r.powerClean ?? undefined,
      抓举: r.snatch ?? undefined,
      挺举: r.cleanJerk ?? undefined,
    }));

  // 最新力量雷达图数据
  const latest = strengthRecords[0];
  const radarData = latest
    ? [
        { subject: "深蹲", value: latest.squat ?? 0, fullMark: 300 },
        { subject: "硬拉", value: latest.deadlift ?? 0, fullMark: 300 },
        { subject: "卧推", value: latest.benchPress ?? 0, fullMark: 250 },
        { subject: "高翻", value: latest.powerClean ?? 0, fullMark: 200 },
        { subject: "抓举", value: latest.snatch ?? 0, fullMark: 200 },
        { subject: "挺举", value: latest.cleanJerk ?? 0, fullMark: 220 },
      ]
    : [];

  // 体能趋势
  const physicalData = [...physicalTests]
    .reverse()
    .map((t) => ({
      date: new Date(t.testDate).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" }),
      综合评分: t.overallScore ?? undefined,
      垂直跳: t.verticalJump ?? undefined,
    }));

  // 身体成分趋势
  const bodyData = [...bodyCompositions]
    .reverse()
    .map((b) => ({
      date: new Date(b.testDate).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" }),
      体重: b.weight ?? undefined,
      体脂率: b.bodyFat ?? undefined,
      肌肉量: b.muscleMass ?? undefined,
    }));

  // 体能雷达（取最近一次，标准化到百分制）
  const latestPhysical = physicalTests[0];
  const physicalRadar = latestPhysical
    ? [
        {
          subject: "速度",
          value: latestPhysical.sprint100m
            ? Math.max(0, 100 - (latestPhysical.sprint100m - 10) * 10)
            : 0,
          fullMark: 100,
        },
        { subject: "弹跳", value: latestPhysical.verticalJump ? Math.min(100, latestPhysical.verticalJump * 1.4) : 0, fullMark: 100 },
        { subject: "有氧", value: latestPhysical.vo2max ? Math.min(100, latestPhysical.vo2max * 1.5) : 0, fullMark: 100 },
        { subject: "综合", value: latestPhysical.overallScore ?? 0, fullMark: 100 },
      ]
    : [];

  return (
    <div className="space-y-5">
      {/* 力量趋势折线图 */}
      <ChartSection title="力量 1RM 趋势">
        {strengthData.length < 2 ? (
          <EmptyChart message="需要至少 2 次力量测试数据" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={strengthData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" tick={axisStyle} axisLine={{ stroke: "#2a2a2a" }} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={{ stroke: "#2a2a2a" }} tickLine={false} unit="kg" width={45} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#888" }} />
              {["深蹲", "硬拉", "卧推", "高翻", "抓举", "挺举"].map((key, i) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[i]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[i], r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartSection>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 力量雷达图 */}
        <ChartSection title="力量雷达（最新）">
          {radarData.length === 0 ? (
            <EmptyChart message="暂无力量数据" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#2a2a2a" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#888", fontSize: 11 }} />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, "dataMax"]}
                  tick={{ fill: "#555", fontSize: 10 }}
                />
                <Radar
                  name="1RM"
                  dataKey="value"
                  stroke={NEON}
                  fill={NEON}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </ChartSection>

        {/* 体能雷达图 */}
        <ChartSection title="体能雷达（最新）">
          {physicalRadar.length === 0 ? (
            <EmptyChart message="暂无体能数据" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={physicalRadar}>
                <PolarGrid stroke="#2a2a2a" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#888", fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#555", fontSize: 10 }} />
                <Radar
                  name="体能"
                  dataKey="value"
                  stroke="#00e676"
                  fill="#00e676"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </ChartSection>
      </div>

      {/* 体能测试趋势 */}
      <ChartSection title="体能测试趋势">
        {physicalData.length < 2 ? (
          <EmptyChart message="需要至少 2 次体能测试数据" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={physicalData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" tick={axisStyle} axisLine={{ stroke: "#2a2a2a" }} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={{ stroke: "#2a2a2a" }} tickLine={false} width={40} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#888" }} />
              <Line type="monotone" dataKey="综合评分" stroke={NEON} strokeWidth={2} dot={{ fill: NEON, r: 3 }} connectNulls />
              <Line type="monotone" dataKey="垂直跳" stroke="#00e676" strokeWidth={2} dot={{ fill: "#00e676", r: 3 }} connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartSection>

      {/* 身体成分趋势 */}
      <ChartSection title="身体成分趋势">
        {bodyData.length < 2 ? (
          <EmptyChart message="需要至少 2 次身体成分数据" />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={bodyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" tick={axisStyle} axisLine={{ stroke: "#2a2a2a" }} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={{ stroke: "#2a2a2a" }} tickLine={false} width={45} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#888" }} />
              <Line type="monotone" dataKey="体重" stroke={NEON} strokeWidth={2} dot={{ fill: NEON, r: 3 }} unit="kg" connectNulls />
              <Line type="monotone" dataKey="体脂率" stroke="#ff3b3b" strokeWidth={2} dot={{ fill: "#ff3b3b", r: 3 }} unit="%" connectNulls />
              <Line type="monotone" dataKey="肌肉量" stroke="#00e676" strokeWidth={2} dot={{ fill: "#00e676", r: 3 }} unit="kg" connectNulls />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartSection>
    </div>
  );
}
