import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DashboardCharts from "@/components/DashboardCharts";
import { calcBMI } from "@/lib/utils";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      className="p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div
        className="text-xs tracking-widest uppercase mb-2"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </div>
      <div
        className="text-3xl font-black font-mono"
        style={{ color: accent ?? "var(--neon)" }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

export default async function DashboardPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // 并行查询
  const [
    athletes,
    monthStrengthTests,
    monthPhysicalTests,
    allStrength,
    injuries,
  ] = await Promise.all([
    prisma.athlete.findMany({
      include: {
        strengthRecords: { orderBy: { recordDate: "desc" }, take: 2 },
        physicalTests: { orderBy: { testDate: "desc" }, take: 2 },
        bodyCompositions: { orderBy: { testDate: "desc" }, take: 1 },
      },
    }),
    prisma.strengthRecord.count({ where: { recordDate: { gte: monthStart } } }),
    prisma.physicalTest.count({ where: { testDate: { gte: monthStart } } }),
    // 近6个月每月力量数据（用于趋势图）
    prisma.strengthRecord.findMany({
      where: {
        recordDate: {
          gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
        },
      },
      orderBy: { recordDate: "asc" },
      include: { athlete: { select: { name: true } } },
    }),
    prisma.injury.findMany({
      where: { status: "recovering" },
      include: { athlete: { select: { name: true, sport: true } } },
    }),
  ]);

  // 统计
  const totalAthletes = athletes.length;
  const monthTests = monthStrengthTests + monthPhysicalTests;
  const injuredCount = new Set(injuries.map((i) => i.athleteId)).size;

  // 平均最新深蹲 1RM
  const squatValues = athletes
    .map((a) => a.strengthRecords[0]?.squat)
    .filter((v): v is number => v != null);
  const avgSquat =
    squatValues.length > 0
      ? Math.round(squatValues.reduce((a, b) => a + b, 0) / squatValues.length)
      : null;

  // 本月进步排行榜（力量：深蹲提升百分比）
  const progressRank = athletes
    .map((a) => {
      const cur = a.strengthRecords[0]?.squat;
      const prev = a.strengthRecords[1]?.squat;
      if (!cur || !prev || prev === 0) return null;
      const pct = ((cur - prev) / prev) * 100;
      return { name: a.name, sport: a.sport, cur, prev, pct };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5);

  // 雷达对比数据（所有运动员最新综合体能评分）
  const radarData = athletes
    .filter((a) => a.physicalTests[0]?.overallScore != null)
    .map((a) => ({
      name: a.name,
      overallScore: a.physicalTests[0]!.overallScore!,
      squat: a.strengthRecords[0]?.squat ?? 0,
      bodyFat: a.bodyCompositions[0]?.bodyFat ?? 0,
      bmi: calcBMI(
        a.bodyCompositions[0]?.weight,
        a.bodyCompositions[0] ? null : null // 身高从运动员取
      ),
    }));

  // 近6个月力量趋势（按月聚合平均深蹲）
  const trendMap: Record<string, number[]> = {};
  for (const r of allStrength) {
    const d = new Date(r.recordDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!trendMap[key]) trendMap[key] = [];
    if (r.squat) trendMap[key].push(r.squat);
  }
  const trendData = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, vals]) => ({
      month,
      平均深蹲: vals.length
        ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
        : null,
    }));

  return (
    <div className="space-y-6 max-w-7xl">
      {/* 顶部统计卡 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="运动员总数" value={totalAthletes} sub="全队" />
        <StatCard
          label="本月测试次数"
          value={monthTests}
          sub={`力量 ${monthStrengthTests} · 体能 ${monthPhysicalTests}`}
          accent="#7c8bff"
        />
        <StatCard
          label="平均深蹲 1RM"
          value={avgSquat ? `${avgSquat} kg` : "—"}
          sub="全队平均"
          accent="#00d4ff"
        />
        <StatCard
          label="伤病人数"
          value={injuredCount}
          sub="康复中"
          accent={injuredCount > 0 ? "#ff3b3b" : "#00e676"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 力量趋势图 + 雷达图（占 2/3 宽） */}
        <div className="lg:col-span-2 space-y-4">
          <DashboardCharts trendData={trendData} athletes={athletes} />
        </div>

        {/* 右侧：进步排行榜 + 伤病列表 */}
        <div className="space-y-4">
          {/* 进步排行榜 */}
          <div
            className="p-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4" style={{ background: "var(--neon)" }} />
              <h3
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: "var(--text-secondary)" }}
              >
                本月进步排行
              </h3>
            </div>
            {progressRank.length === 0 ? (
              <div className="text-xs py-6 text-center" style={{ color: "var(--text-muted)" }}>
                暂无足够的对比数据
              </div>
            ) : (
              <div className="space-y-2">
                {progressRank.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span
                      className="w-5 text-center text-xs font-black font-mono"
                      style={{
                        color: i === 0 ? "var(--neon)" : "var(--text-muted)",
                      }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
                        {p.name}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {p.prev} → {p.cur} kg
                      </div>
                    </div>
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: p.pct >= 0 ? "#00e676" : "#ff3b3b" }}
                    >
                      {p.pct >= 0 ? "▲" : "▼"} {Math.abs(p.pct).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 伤病监控 */}
          <div
            className="p-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4" style={{ background: "#ff3b3b" }} />
              <h3
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: "var(--text-secondary)" }}
              >
                伤病状态
              </h3>
            </div>
            {injuries.length === 0 ? (
              <div className="text-xs py-4 text-center" style={{ color: "#00e676" }}>
                ✓ 全队状态良好
              </div>
            ) : (
              <div className="space-y-2">
                {injuries.slice(0, 5).map((inj) => (
                  <div key={inj.id} className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                        {inj.athlete.name}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {inj.bodyPart} · {inj.injuryType}
                      </div>
                    </div>
                    <span
                      className="text-xs px-1.5 py-0.5 font-mono"
                      style={{
                        color:
                          inj.severity === "severe"
                            ? "#ff3b3b"
                            : inj.severity === "moderate"
                            ? "#ff9900"
                            : "#e8ff3a",
                        border: `1px solid ${
                          inj.severity === "severe"
                            ? "#ff3b3b"
                            : inj.severity === "moderate"
                            ? "#ff9900"
                            : "#e8ff3a"
                        }`,
                      }}
                    >
                      {inj.severity === "severe"
                        ? "严重"
                        : inj.severity === "moderate"
                        ? "中度"
                        : "轻微"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 快捷入口 */}
          <div
            className="p-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4" style={{ background: "var(--neon)" }} />
              <h3
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: "var(--text-secondary)" }}
              >
                快捷操作
              </h3>
            </div>
            <div className="space-y-2">
              <Link
                href="/athletes/new"
                className="block px-3 py-2 text-xs font-bold tracking-wider uppercase text-center"
                style={{ background: "var(--neon)", color: "#0d0d0d" }}
              >
                + 添加运动员
              </Link>
              <Link
                href="/"
                className="block px-3 py-2 text-xs font-bold tracking-wider uppercase text-center"
                style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              >
                查看全部运动员
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
