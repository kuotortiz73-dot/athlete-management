import { prisma } from "@/lib/prisma";
import Link from "next/link";
import AthleteFilter from "./AthleteFilter";

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "草稿", color: "#555555" },
  active: { label: "进行中", color: "#00e676" },
  completed: { label: "已完成", color: "#7c8bff" },
  archived: { label: "已归档", color: "#444444" },
};

const phaseConfig: Record<string, string> = {
  preparatory: "准备期",
  competition: "比赛期",
  transition: "过渡期",
  general: "通用",
};

export default async function TrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; athleteId?: string }>;
}) {
  const { success, athleteId } = await searchParams;
  const filterAthleteId = athleteId ? parseInt(athleteId) : undefined;

  const [plans, athletes] = await Promise.all([
    prisma.trainingPlan.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { sessions: true, assignments: true } },
        sessions: { select: { id: true, completed: true } },
        assignments: {
          include: { athlete: { select: { id: true, name: true } } },
        },
      },
    }),
    prisma.athlete.findMany({
      where: { status: { not: "retired" } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // 按运动员筛选
  const filteredPlans = filterAthleteId
    ? plans.filter((p) => p.assignments.some((a) => a.athleteId === filterAthleteId))
    : plans;

  const stats = {
    total: filteredPlans.length,
    active: filteredPlans.filter((p) => p.status === "active").length,
    draft: filteredPlans.filter((p) => p.status === "draft").length,
    completed: filteredPlans.filter((p) => p.status === "completed").length,
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* 成功提示 */}
      {success && (
        <div
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold"
          style={{
            background: "rgba(0,230,118,0.1)",
            border: "1px solid #00e676",
            color: "#00e676",
          }}
        >
          <span>✓</span>
          <span>
            {{ created: "训练计划已创建", updated: "训练计划已更新", deleted: "训练计划已删除" }[success] ?? "操作成功"}
          </span>
        </div>
      )}

      {/* 统计概览 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "计划总数", value: stats.total, accent: "var(--neon)" },
          { label: "进行中", value: stats.active, accent: "#00e676" },
          { label: "草稿", value: stats.draft, accent: "#888888" },
          { label: "已完成", value: stats.completed, accent: "#7c8bff" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="text-3xl font-black font-mono" style={{ color: s.accent }}>
              {String(s.value).padStart(2, "0")}
            </div>
            <div className="text-xs mt-1 tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* 标题栏 + 筛选 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5" style={{ background: "var(--neon)" }} />
          <h1 className="text-sm font-bold tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
            TRAINING PLANS
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* 运动员筛选 */}
          <form method="get">
            <AthleteFilter athletes={athletes} selectedId={filterAthleteId} />
          </form>
          <Link
            href="/training/new"
            className="px-4 py-2 text-xs font-bold tracking-wider uppercase whitespace-nowrap"
            style={{ background: "var(--neon)", color: "#0d0d0d" }}
          >
            + 创建新计划
          </Link>
        </div>
      </div>

      {/* 计划列表 */}
      {filteredPlans.length === 0 ? (
        <div
          className="p-20 text-center"
          style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}
        >
          <div className="text-4xl font-black tracking-widest" style={{ color: "var(--text-muted)" }}>
            NO PLANS
          </div>
          <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
            {filterAthleteId ? "该运动员暂无训练计划" : "暂无训练计划，点击右上角创建"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPlans.map((plan) => {
            const st = statusConfig[plan.status] ?? statusConfig.draft;
            const totalSessions = plan.sessions.length;
            const completedSessions = plan.sessions.filter((s) => s.completed).length;
            const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

            return (
              <Link
                key={plan.id}
                href={`/training/${plan.id}`}
                className="athlete-card block p-5 transition-all"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                        {plan.title}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 font-mono"
                        style={{ color: st.color, border: `1px solid ${st.color}` }}
                      >
                        {st.label}
                      </span>
                      {plan.phase && (
                        <span
                          className="text-xs px-2 py-0.5 font-bold"
                          style={{ background: "var(--bg-elevated)", color: "var(--neon)" }}
                        >
                          {phaseConfig[plan.phase] ?? plan.phase}
                        </span>
                      )}
                      {plan.sport && (
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {plan.sport}
                        </span>
                      )}
                    </div>
                    {plan.description && (
                      <p className="mt-1 text-xs truncate" style={{ color: "var(--text-muted)" }}>
                        {plan.description}
                      </p>
                    )}

                    {/* 进度条 */}
                    {totalSessions > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            完成进度
                          </span>
                          <span className="text-xs font-mono font-bold" style={{ color: progress === 100 ? "#00e676" : "var(--neon)" }}>
                            {completedSessions}/{totalSessions} 课 · {progress}%
                          </span>
                        </div>
                        <div
                          className="w-full h-1.5"
                          style={{ background: "var(--bg-elevated)", borderRadius: 0 }}
                        >
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${progress}%`,
                              background: progress === 100 ? "#00e676" : "var(--neon)",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* 已分配运动员 */}
                    {plan.assignments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {plan.assignments.slice(0, 5).map((a) => (
                          <span
                            key={a.athleteId}
                            className="text-xs px-1.5 py-0.5"
                            style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                          >
                            {a.athlete.name}
                          </span>
                        ))}
                        {plan.assignments.length > 5 && (
                          <span className="text-xs px-1.5 py-0.5" style={{ color: "var(--text-muted)" }}>
                            +{plan.assignments.length - 5}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-6 text-center flex-shrink-0">
                    <div>
                      <div className="text-lg font-black font-mono" style={{ color: "var(--text-primary)" }}>
                        {plan.weeks}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>周</div>
                    </div>
                    <div>
                      <div className="text-lg font-black font-mono" style={{ color: "var(--text-primary)" }}>
                        {plan._count.sessions}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>课次</div>
                    </div>
                    <div>
                      <div
                        className="text-lg font-black font-mono"
                        style={{ color: plan._count.assignments > 0 ? "var(--neon)" : "var(--text-muted)" }}
                      >
                        {plan._count.assignments}
                      </div>
                      <div className="text-xs" style={{ color: "var(--text-muted)" }}>运动员</div>
                    </div>
                  </div>
                </div>

                {(plan.startDate || plan.coachName) && (
                  <div className="mt-3 flex gap-4 text-xs" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: "0.75rem" }}>
                    {plan.startDate && (
                      <span>
                        {new Date(plan.startDate).toLocaleDateString("zh-CN")}
                        {plan.endDate && ` → ${new Date(plan.endDate).toLocaleDateString("zh-CN")}`}
                      </span>
                    )}
                    {plan.coachName && <span>教练：{plan.coachName}</span>}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
