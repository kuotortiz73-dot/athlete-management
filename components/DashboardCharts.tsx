"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";

const NEON = "#e8ff3a";
const COLORS = ["#e8ff3a", "#00e676", "#7c8bff", "#ff9900", "#ff3b3b"];

const tooltipStyle = {
  backgroundColor: "#1a1a1a",
  border: "1px solid #2a2a2a",
  borderRadius: 0,
  color: "#f0f0f0",
  fontSize: "12px",
};

const axisStyle = { fill: "#555555", fontSize: 11 };

interface TrendPoint {
  month: string;
  平均深蹲: number | null;
}

interface AthleteRow {
  name: string;
  physicalTests: { overallScore: number | null }[];
  strengthRecords: {
    squat: number | null;
    deadlift: number | null;
    benchPress: number | null;
    snatch: number | null;
    cleanJerk: number | null;
  }[];
}

function ChartBox({
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
      <div className="flex items-center gap-2 mb-4">
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

export default function DashboardCharts({
  trendData,
  athletes,
}: {
  trendData: TrendPoint[];
  athletes: AthleteRow[];
}) {
  // 综合能力雷达对比数据
  // 取最多 5 名有体能评分的运动员
  const radarAthletes = athletes
    .filter((a) => a.physicalTests[0]?.overallScore != null)
    .slice(0, 5);

  const radarSubjects = ["综合评分", "深蹲", "硬拉", "卧推", "抓举", "挺举"];

  // 将每个运动员的数据归一化到 0-100
  const maxValues: Record<string, number> = {
    综合评分: 100,
    深蹲: 300,
    硬拉: 350,
    卧推: 250,
    抓举: 200,
    挺举: 220,
  };

  const radarData = radarSubjects.map((subject) => {
    const entry: Record<string, string | number> = { subject };
    for (const a of radarAthletes) {
      let raw = 0;
      const s = a.strengthRecords[0];
      if (subject === "综合评分") raw = a.physicalTests[0]?.overallScore ?? 0;
      else if (subject === "深蹲") raw = s?.squat ?? 0;
      else if (subject === "硬拉") raw = s?.deadlift ?? 0;
      else if (subject === "卧推") raw = s?.benchPress ?? 0;
      else if (subject === "抓举") raw = s?.snatch ?? 0;
      else if (subject === "挺举") raw = s?.cleanJerk ?? 0;
      // 归一化到百分制
      entry[a.name] = Math.round((raw / maxValues[subject]) * 100);
    }
    return entry;
  });

  return (
    <>
      {/* 团队力量趋势 */}
      <ChartBox title="团队平均深蹲 1RM 趋势（近 6 个月）">
        {trendData.length < 2 ? (
          <div
            className="flex items-center justify-center text-xs"
            style={{ height: 200, color: "var(--text-muted)" }}
          >
            需要至少 2 个月的数据才能显示趋势
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis
                dataKey="month"
                tick={axisStyle}
                axisLine={{ stroke: "#2a2a2a" }}
                tickLine={false}
              />
              <YAxis
                tick={axisStyle}
                axisLine={{ stroke: "#2a2a2a" }}
                tickLine={false}
                unit=" kg"
                width={55}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="平均深蹲"
                stroke={NEON}
                strokeWidth={2.5}
                dot={{ fill: NEON, r: 4, strokeWidth: 0 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartBox>

      {/* 综合能力雷达对比 */}
      <ChartBox title="综合能力雷达对比（归一化）">
        {radarAthletes.length === 0 ? (
          <div
            className="flex items-center justify-center text-xs"
            style={{ height: 260, color: "var(--text-muted)" }}
          >
            暂无运动员体能数据
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2a2a2a" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#888", fontSize: 11 }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={{ fill: "#555", fontSize: 10 }}
              />
              {radarAthletes.map((a, i) => (
                <Radar
                  key={a.name}
                  name={a.name}
                  dataKey={a.name}
                  stroke={COLORS[i % COLORS.length]}
                  fill={COLORS[i % COLORS.length]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11, color: "#888" }} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </ChartBox>
    </>
  );
}
