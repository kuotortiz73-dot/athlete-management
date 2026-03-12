import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AthleteCharts from "@/components/AthleteCharts";

export const dynamic = "force-dynamic";

export default async function ChartsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const athleteId = parseInt(id);
  if (isNaN(athleteId)) notFound();

  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    include: {
      strengthRecords: {
        orderBy: { recordDate: "desc" },
        take: 20,
      },
      physicalTests: {
        orderBy: { testDate: "desc" },
        take: 20,
      },
      bodyCompositions: {
        orderBy: { testDate: "desc" },
        take: 20,
      },
    },
  });

  if (!athlete) notFound();

  return (
    <div className="space-y-6">
      {/* 返回 */}
      <Link
        href={`/athletes/${athlete.id}`}
        className="inline-flex items-center gap-2 text-xs tracking-wider uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        ← 返回 {athlete.name}
      </Link>

      {/* 标题 */}
      <div className="flex items-center justify-between">
        <div style={{ borderLeft: "3px solid var(--neon)", paddingLeft: "12px" }}>
          <h1
            className="text-xl font-black tracking-wider uppercase"
            style={{ color: "var(--text-primary)" }}
          >
            数据图表分析
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {athlete.name} · {athlete.sport}
          </p>
        </div>

        <Link
          href={`/athletes/${athlete.id}/records/new`}
          className="px-4 py-2 text-xs font-bold tracking-wider uppercase"
          style={{ background: "var(--neon)", color: "#0d0d0d" }}
        >
          + 录入数据
        </Link>
      </div>

      {/* 数据概览 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "力量记录", value: athlete.strengthRecords.length },
          { label: "体能测试", value: athlete.physicalTests.length },
          { label: "身体成分", value: athlete.bodyCompositions.length },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 text-center"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div
              className="text-2xl font-black font-mono"
              style={{ color: "var(--neon)" }}
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

      {/* 图表 */}
      <AthleteCharts
        strengthRecords={athlete.strengthRecords}
        physicalTests={athlete.physicalTests}
        bodyCompositions={athlete.bodyCompositions}
      />
    </div>
  );
}
