import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  active: { label: "在役", color: "#00e676", dot: "#00e676" },
  injured: { label: "伤病", color: "#ff3b3b", dot: "#ff3b3b" },
  retired: { label: "退役", color: "#555555", dot: "#555555" },
};

const genderMap: Record<string, string> = { male: "男", female: "女" };

export default async function HomePage() {
  const athletes = await prisma.athlete.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          strengthRecords: true,
          physicalTests: true,
          trainingLogs: true,
          competitionRecords: true,
        },
      },
    },
  });

  const stats = {
    total: athletes.length,
    active: athletes.filter((a) => a.status === "active").length,
    injured: athletes.filter((a) => a.status === "injured").length,
    sports: new Set(athletes.map((a) => a.sport)).size,
  };

  return (
    <div className="space-y-6">
      {/* 统计概览 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "运动员总数", value: stats.total, accent: "var(--neon)" },
          { label: "在役状态", value: stats.active, accent: "#00e676" },
          { label: "伤病人数", value: stats.injured, accent: "#ff3b3b" },
          { label: "运动项目", value: stats.sports, accent: "#7c8bff" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="text-3xl font-black font-mono"
              style={{ color: s.accent }}
            >
              {String(s.value).padStart(2, "0")}
            </div>
            <div
              className="text-xs mt-1 tracking-widest uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-1 h-5"
            style={{ background: "var(--neon)" }}
          />
          <h1
            className="text-sm font-bold tracking-widest uppercase"
            style={{ color: "var(--text-secondary)" }}
          >
            ATHLETE ROSTER
          </h1>
        </div>
        <span
          className="text-xs font-mono"
          style={{ color: "var(--text-muted)" }}
        >
          {athletes.length} RECORDS
        </span>
      </div>

      {/* 列表 */}
      {athletes.length === 0 ? (
        <div
          className="p-20 text-center"
          style={{
            background: "var(--bg-card)",
            border: "1px dashed var(--border)",
          }}
        >
          <div
            className="text-4xl font-black tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            NO DATA
          </div>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            暂无运动员数据
          </p>
          <Link
            href="/athletes/new"
            className="mt-6 inline-block px-6 py-2 text-sm font-bold tracking-wider"
            style={{ background: "var(--neon)", color: "#0d0d0d" }}
          >
            添加第一位运动员
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {athletes.map((athlete) => {
            const st = statusConfig[athlete.status] ?? statusConfig.retired;
            return (
              <Link
                key={athlete.id}
                href={`/athletes/${athlete.id}`}
                className="athlete-card block p-4 transition-all"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                {/* 顶部：姓名 + 状态 */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: st.dot }}
                      />
                      <span className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                        {athlete.name}
                      </span>
                    </div>
                    <div
                      className="text-xs mt-0.5 ml-4"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {genderMap[athlete.gender] ?? athlete.gender} ·{" "}
                      {athlete.age}岁 · {athlete.nationality}
                    </div>
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 font-mono"
                    style={{ color: st.color, border: `1px solid ${st.color}` }}
                  >
                    {st.label}
                  </span>
                </div>

                {/* 项目信息 */}
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className="text-xs px-2 py-0.5 font-bold tracking-wider"
                    style={{ background: "var(--bg-elevated)", color: "var(--neon)" }}
                  >
                    {athlete.sport}
                  </span>
                  {athlete.position && (
                    <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                      {athlete.position}
                    </span>
                  )}
                  {athlete.team && (
                    <span className="text-xs ml-auto" style={{ color: "var(--text-muted)" }}>
                      {athlete.team}
                    </span>
                  )}
                </div>

                {/* 数据统计 */}
                <div
                  className="mt-3 pt-3 grid grid-cols-4 gap-2 text-center"
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  {[
                    { label: "力量", val: athlete._count.strengthRecords },
                    { label: "体能", val: athlete._count.physicalTests },
                    { label: "训练", val: athlete._count.trainingLogs },
                    { label: "比赛", val: athlete._count.competitionRecords },
                  ].map((d) => (
                    <div key={d.label}>
                      <div
                        className="text-base font-black font-mono"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {d.val}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {d.label}
                      </div>
                    </div>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
