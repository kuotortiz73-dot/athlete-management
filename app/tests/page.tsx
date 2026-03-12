import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TestsPage() {
  const [strengthRecords, physicalTests] = await Promise.all([
    prisma.strengthRecord.findMany({
      orderBy: { recordDate: "desc" },
      take: 30,
      include: { athlete: { select: { id: true, name: true, sport: true } } },
    }),
    prisma.physicalTest.findMany({
      orderBy: { testDate: "desc" },
      take: 30,
      include: { athlete: { select: { id: true, name: true, sport: true } } },
    }),
  ]);

  return (
    <div className="max-w-7xl space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 力量记录 */}
        <div
          className="p-5"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4" style={{ background: "var(--neon)" }} />
            <h2
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "var(--text-secondary)" }}
            >
              最新力量测试 ({strengthRecords.length})
            </h2>
          </div>
          {strengthRecords.length === 0 ? (
            <div className="py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
              暂无测试记录
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["运动员", "日期", "深蹲", "硬拉", "卧推"].map((h) => (
                      <th
                        key={h}
                        className="pb-2 text-left pr-3"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {strengthRecords.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="py-2 pr-3">
                        <Link
                          href={`/athletes/${r.athlete.id}`}
                          className="font-bold hover:underline"
                          style={{ color: "var(--neon)" }}
                        >
                          {r.athlete.name}
                        </Link>
                      </td>
                      <td className="py-2 pr-3 font-mono" style={{ color: "var(--text-muted)" }}>
                        {new Date(r.recordDate).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}
                      </td>
                      <td className="py-2 pr-3 font-mono" style={{ color: "var(--text-primary)" }}>{r.squat ?? "—"}</td>
                      <td className="py-2 pr-3 font-mono" style={{ color: "var(--text-primary)" }}>{r.deadlift ?? "—"}</td>
                      <td className="py-2 pr-3 font-mono" style={{ color: "var(--text-primary)" }}>{r.benchPress ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 体能测试 */}
        <div
          className="p-5"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4" style={{ background: "#7c8bff" }} />
            <h2
              className="text-xs font-bold tracking-widest uppercase"
              style={{ color: "var(--text-secondary)" }}
            >
              最新体能测试 ({physicalTests.length})
            </h2>
          </div>
          {physicalTests.length === 0 ? (
            <div className="py-8 text-center text-xs" style={{ color: "var(--text-muted)" }}>
              暂无测试记录
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["运动员", "日期", "100m", "垂直跳", "综合分"].map((h) => (
                      <th key={h} className="pb-2 text-left pr-3" style={{ color: "var(--text-muted)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {physicalTests.map((t) => (
                    <tr key={t.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="py-2 pr-3">
                        <Link
                          href={`/athletes/${t.athlete.id}`}
                          className="font-bold hover:underline"
                          style={{ color: "var(--neon)" }}
                        >
                          {t.athlete.name}
                        </Link>
                      </td>
                      <td className="py-2 pr-3 font-mono" style={{ color: "var(--text-muted)" }}>
                        {new Date(t.testDate).toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}
                      </td>
                      <td className="py-2 pr-3 font-mono" style={{ color: "var(--text-primary)" }}>{t.sprint100m ?? "—"}</td>
                      <td className="py-2 pr-3 font-mono" style={{ color: "var(--text-primary)" }}>{t.verticalJump ?? "—"}</td>
                      <td className="py-2 pr-3 font-mono" style={{ color: t.overallScore ? "var(--neon)" : "var(--text-muted)" }}>
                        {t.overallScore ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
