import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function RecoveryPage() {
  const injuries = await prisma.injury.findMany({
    orderBy: { injuryDate: "desc" },
    include: {
      athlete: { select: { id: true, name: true, sport: true } },
    },
  });

  const recovering = injuries.filter((i) => i.status === "recovering");
  const recovered = injuries.filter((i) => i.status === "recovered");

  const sevMap: Record<string, { label: string; color: string }> = {
    severe: { label: "严重", color: "#ff3b3b" },
    moderate: { label: "中度", color: "#ff9900" },
    mild: { label: "轻微", color: "#e8ff3a" },
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* 状态概览 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="text-2xl font-black font-mono" style={{ color: "#ff3b3b" }}>{recovering.length}</div>
          <div className="text-xs mt-1 tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>康复中</div>
        </div>
        <div className="p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="text-2xl font-black font-mono" style={{ color: "#00e676" }}>{recovered.length}</div>
          <div className="text-xs mt-1 tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>已康复</div>
        </div>
        <div className="p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="text-2xl font-black font-mono" style={{ color: "var(--neon)" }}>{injuries.length}</div>
          <div className="text-xs mt-1 tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>历史记录</div>
        </div>
      </div>

      {/* 康复中 */}
      <div className="p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4" style={{ background: "#ff3b3b" }} />
          <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
            康复中 ({recovering.length})
          </h2>
        </div>
        {recovering.length === 0 ? (
          <div className="py-6 text-center text-sm font-bold" style={{ color: "#00e676" }}>
            ✓ 全队状态良好，无人员处于伤病康复中
          </div>
        ) : (
          <div className="space-y-3">
            {recovering.map((inj) => {
              const sev = sevMap[inj.severity] ?? { label: inj.severity, color: "#888" };
              return (
                <div key={inj.id} className="p-4" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", borderLeft: `3px solid ${sev.color}` }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/athletes/${inj.athlete.id}`} className="font-bold" style={{ color: "var(--neon)" }}>
                        {inj.athlete.name}
                      </Link>
                      <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>{inj.athlete.sport}</span>
                    </div>
                    <span className="text-xs px-1.5 py-0.5" style={{ color: sev.color, border: `1px solid ${sev.color}` }}>
                      {sev.label}
                    </span>
                  </div>
                  <div className="mt-2 text-sm" style={{ color: "var(--text-primary)" }}>
                    {inj.bodyPart} — {inj.injuryType}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                    受伤日期：{new Date(inj.injuryDate).toLocaleDateString("zh-CN")}
                    {inj.treatment && ` · 治疗方案：${inj.treatment}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 历史记录 */}
      {recovered.length > 0 && (
        <div className="p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4" style={{ background: "#00e676" }} />
            <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
              已康复历史 ({recovered.length})
            </h2>
          </div>
          <div className="space-y-2">
            {recovered.map((inj) => (
              <div key={inj.id} className="flex items-center justify-between p-3" style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}>
                <div>
                  <Link href={`/athletes/${inj.athlete.id}`} className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    {inj.athlete.name}
                  </Link>
                  <span className="text-xs ml-2" style={{ color: "var(--text-muted)" }}>
                    {inj.bodyPart} · {inj.injuryType}
                  </span>
                </div>
                <span className="text-xs font-mono" style={{ color: "#00e676" }}>已康复</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
