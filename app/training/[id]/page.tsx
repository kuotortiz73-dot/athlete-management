import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  createPlanSession,
  deletePlanSession,
  deleteTrainingPlan,
  updateTrainingPlanStatus,
  assignPlan,
  toggleSessionCompleted,
} from "@/app/actions";

export const dynamic = "force-dynamic";

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

const typeConfig: Record<string, { label: string; color: string }> = {
  strength: { label: "力量", color: "#e8ff3a" },
  cardio: { label: "有氧", color: "#00d4ff" },
  skill: { label: "技术", color: "#7c8bff" },
  recovery: { label: "恢复", color: "#00e676" },
  mixed: { label: "综合", color: "#ff9900" },
};

const dayNames = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];

const fieldStyle = {
  background: "var(--bg-base)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  padding: "0.4rem 0.6rem",
  fontSize: "0.8rem",
} as const;

const labelStyle = {
  display: "block",
  fontSize: "0.6rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "var(--text-muted)",
  marginBottom: "0.25rem",
};

export default async function TrainingPlanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;
  const planId = parseInt(id);
  if (isNaN(planId)) notFound();

  const [plan, allAthletes] = await Promise.all([
    prisma.trainingPlan.findUnique({
      where: { id: planId },
      include: {
        sessions: { orderBy: [{ week: "asc" }, { dayOfWeek: "asc" }] },
        assignments: { include: { athlete: { select: { id: true, name: true, sport: true, status: true } } } },
      },
    }),
    prisma.athlete.findMany({
      where: { status: { not: "retired" } },
      select: { id: true, name: true, sport: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!plan) notFound();

  const st = statusConfig[plan.status] ?? statusConfig.draft;
  const assignedIds = new Set(plan.assignments.map((a) => a.athleteId));

  // 按周分组课次
  const sessionsByWeek: Record<number, typeof plan.sessions> = {};
  for (const s of plan.sessions) {
    if (!sessionsByWeek[s.week]) sessionsByWeek[s.week] = [];
    sessionsByWeek[s.week].push(s);
  }

  // 整体完成进度
  const totalSessions = plan.sessions.length;
  const completedSessions = plan.sessions.filter((s) => s.completed).length;
  const overallProgress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  // 按类型统计
  const typeStats = Object.entries(typeConfig).map(([type, cfg]) => ({
    type,
    label: cfg.label,
    color: cfg.color,
    count: plan.sessions.filter((s) => s.type === type).length,
    completed: plan.sessions.filter((s) => s.type === type && s.completed).length,
  })).filter((t) => t.count > 0);

  // Server Actions (bound)
  async function deletePlan() {
    "use server";
    await deleteTrainingPlan(planId);
  }

  async function setActive() {
    "use server";
    await updateTrainingPlanStatus(planId, "active");
    redirect(`/training/${planId}?success=updated`);
  }

  async function setCompleted() {
    "use server";
    await updateTrainingPlanStatus(planId, "completed");
    redirect(`/training/${planId}?success=updated`);
  }

  async function addSession(formData: FormData) {
    "use server";
    await createPlanSession(planId, formData);
  }

  async function handleAssign(formData: FormData) {
    "use server";
    await assignPlan(planId, formData);
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* 返回 */}
      <Link
        href="/training"
        className="nav-link inline-flex items-center gap-2 text-xs tracking-wider uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        ← 返回训练计划
      </Link>

      {/* 成功提示 */}
      {success && (
        <div
          className="flex items-center gap-3 px-4 py-3 text-sm font-bold"
          style={{ background: "rgba(0,230,118,0.1)", border: "1px solid #00e676", color: "#00e676" }}
        >
          <span>✓</span>
          <span>
            {{ created: "训练计划已创建", updated: "已更新", session: "课次已保存", assigned: "运动员分配已更新" }[success] ?? "操作成功"}
          </span>
        </div>
      )}

      {/* 计划信息卡 */}
      <div className="p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black" style={{ color: "var(--text-primary)" }}>
                {plan.title}
              </h1>
              <span
                className="text-xs px-2 py-0.5 font-mono font-bold"
                style={{ color: st.color, border: `1px solid ${st.color}` }}
              >
                {st.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              {plan.sport && (
                <span className="text-sm font-bold px-2" style={{ background: "var(--bg-elevated)", color: "var(--neon)" }}>
                  {plan.sport}
                </span>
              )}
              {plan.phase && (
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {phaseConfig[plan.phase] ?? plan.phase}
                </span>
              )}
              <span className="text-sm font-mono" style={{ color: "var(--text-secondary)" }}>
                {plan.weeks} 周
              </span>
              {plan.coachName && (
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  教练：{plan.coachName}
                </span>
              )}
            </div>
            {(plan.startDate || plan.endDate) && (
              <div className="mt-2 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                {plan.startDate && new Date(plan.startDate).toLocaleDateString("zh-CN")}
                {plan.endDate && ` → ${new Date(plan.endDate).toLocaleDateString("zh-CN")}`}
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 flex-wrap flex-shrink-0">
            <Link
              href={`/training/${plan.id}/edit`}
              className="px-3 py-1.5 text-xs font-bold tracking-wider uppercase"
              style={{ border: "1px solid var(--neon)", color: "var(--neon)" }}
            >
              编辑
            </Link>
            {plan.status === "draft" && (
              <form action={setActive}>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold tracking-wider uppercase"
                  style={{ background: "#00e676", color: "#0d0d0d" }}
                >
                  启用
                </button>
              </form>
            )}
            {plan.status === "active" && (
              <form action={setCompleted}>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-bold tracking-wider uppercase"
                  style={{ border: "1px solid #7c8bff", color: "#7c8bff" }}
                >
                  完成
                </button>
              </form>
            )}
            <form action={deletePlan} onSubmit={(e) => { if (!confirm("确认删除此训练计划？")) e.preventDefault(); }}>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-bold tracking-wider uppercase"
                style={{ border: "1px solid var(--danger)", color: "var(--danger)" }}
              >
                删除
              </button>
            </form>
          </div>
        </div>

        {/* 整体进度条 */}
        {totalSessions > 0 && (
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
                整体完成进度
              </span>
              <span
                className="text-sm font-black font-mono"
                style={{ color: overallProgress === 100 ? "#00e676" : "var(--neon)" }}
              >
                {completedSessions} / {totalSessions} · {overallProgress}%
              </span>
            </div>
            <div className="w-full h-2" style={{ background: "var(--bg-elevated)" }}>
              <div
                className="h-full transition-all"
                style={{
                  width: `${overallProgress}%`,
                  background: overallProgress === 100 ? "#00e676" : "var(--neon)",
                }}
              />
            </div>
          </div>
        )}

        {/* 目标与描述 */}
        {(plan.goals || plan.description) && (
          <div
            className="mt-4 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {plan.goals && (
              <div>
                <div className="text-xs tracking-wider uppercase mb-1" style={{ color: "var(--text-muted)" }}>训练目标</div>
                <p style={{ color: "var(--text-secondary)" }}>{plan.goals}</p>
              </div>
            )}
            {plan.description && (
              <div>
                <div className="text-xs tracking-wider uppercase mb-1" style={{ color: "var(--text-muted)" }}>计划说明</div>
                <p style={{ color: "var(--text-secondary)" }}>{plan.description}</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：课次计划（占 2/3） */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4" style={{ background: "var(--neon)" }} />
            <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
              训练课次（{plan.sessions.length}）
            </h2>
          </div>

          {/* 按周展示课次（可展开/收起） */}
          {plan.weeks > 0 && (
            <div className="space-y-3">
              {Array.from({ length: plan.weeks }, (_, i) => i + 1).map((week) => {
                const sessions = sessionsByWeek[week] ?? [];
                const weekCompleted = sessions.filter((s) => s.completed).length;
                const weekProgress = sessions.length > 0 ? Math.round((weekCompleted / sessions.length) * 100) : 0;

                return (
                  <details key={week} open={sessions.length > 0} style={{ border: "1px solid var(--border)" }}>
                    <summary
                      className="flex items-center justify-between px-4 py-3 cursor-pointer"
                      style={{ background: "var(--bg-elevated)", listStyle: "none" }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold font-mono tracking-wider" style={{ color: "var(--neon)" }}>
                          WEEK {week}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {sessions.length} 课
                        </span>
                        {sessions.length > 0 && (
                          <span
                            className="text-xs font-mono"
                            style={{ color: weekProgress === 100 ? "#00e676" : "var(--text-muted)" }}
                          >
                            {weekCompleted}/{sessions.length} ✓
                          </span>
                        )}
                      </div>
                      {sessions.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1" style={{ background: "var(--bg-base)" }}>
                            <div
                              className="h-full"
                              style={{
                                width: `${weekProgress}%`,
                                background: weekProgress === 100 ? "#00e676" : "var(--neon)",
                              }}
                            />
                          </div>
                          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>▾</span>
                        </div>
                      )}
                    </summary>

                    {sessions.length > 0 && (
                      <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                        {sessions.map((s) => {
                          const tc = typeConfig[s.type] ?? typeConfig.mixed;
                          return (
                            <div
                              key={s.id}
                              className="px-4 py-3 flex items-start justify-between gap-3"
                              style={{
                                background: s.completed ? "rgba(0,230,118,0.04)" : undefined,
                                opacity: s.completed ? 0.8 : 1,
                              }}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* 完成标记按钮 */}
                                  <form
                                    action={async () => {
                                      "use server";
                                      await toggleSessionCompleted(s.id, planId, !s.completed);
                                    }}
                                  >
                                    <button
                                      type="submit"
                                      title={s.completed ? "标记为未完成" : "标记为已完成"}
                                      className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-xs font-bold border transition-all"
                                      style={{
                                        background: s.completed ? "#00e676" : "transparent",
                                        borderColor: s.completed ? "#00e676" : "var(--border)",
                                        color: s.completed ? "#0d0d0d" : "var(--text-muted)",
                                      }}
                                    >
                                      {s.completed ? "✓" : ""}
                                    </button>
                                  </form>
                                  <span className="text-xs font-mono font-bold" style={{ color: "var(--text-secondary)" }}>
                                    {dayNames[s.dayOfWeek]}
                                  </span>
                                  <span
                                    className="text-xs px-1.5 py-0.5 font-bold"
                                    style={{ color: tc.color, border: `1px solid ${tc.color}` }}
                                  >
                                    {tc.label}
                                  </span>
                                  {s.sessionTitle && (
                                    <span
                                      className="text-sm font-bold"
                                      style={{
                                        color: "var(--text-primary)",
                                        textDecoration: s.completed ? "line-through" : undefined,
                                      }}
                                    >
                                      {s.sessionTitle}
                                    </span>
                                  )}
                                  {s.duration && (
                                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{s.duration}min</span>
                                  )}
                                  {s.intensity && (
                                    <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                                      强度 {s.intensity}/10
                                    </span>
                                  )}
                                </div>
                                {s.mainContent && (
                                  <p className="mt-1 text-xs ml-7" style={{ color: "var(--text-secondary)" }}>
                                    {s.mainContent}
                                  </p>
                                )}
                                {(s.warmup || s.cooldown) && (
                                  <div className="mt-1 ml-7 flex gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                                    {s.warmup && <span>热身：{s.warmup}</span>}
                                    {s.cooldown && <span>放松：{s.cooldown}</span>}
                                  </div>
                                )}
                              </div>
                              <div className="flex gap-2 flex-shrink-0">
                                <Link
                                  href={`/training/${plan.id}/sessions/${s.id}/edit`}
                                  className="text-xs font-bold tracking-wider uppercase"
                                  style={{ color: "var(--neon)" }}
                                >
                                  编辑
                                </Link>
                                <form
                                  action={async () => {
                                    "use server";
                                    await deletePlanSession(s.id, planId);
                                  }}
                                >
                                  <button
                                    type="submit"
                                    className="text-xs font-bold tracking-wider uppercase"
                                    style={{ color: "var(--danger)" }}
                                  >
                                    删除
                                  </button>
                                </form>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </details>
                );
              })}
            </div>
          )}

          {/* 添加课次表单 */}
          <div className="p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-4" style={{ background: "var(--neon)" }} />
              <h3 className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
                添加课次
              </h3>
            </div>
            <form action={addSession} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label style={labelStyle}>周次</label>
                  <select name="week" style={fieldStyle}>
                    {Array.from({ length: plan.weeks }, (_, i) => i + 1).map((w) => (
                      <option key={w} value={w}>第 {w} 周</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>星期</label>
                  <select name="dayOfWeek" style={fieldStyle}>
                    {dayNames.slice(1).map((d, i) => (
                      <option key={i + 1} value={i + 1}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>训练类型</label>
                  <select name="type" style={fieldStyle}>
                    <option value="strength">力量</option>
                    <option value="cardio">有氧</option>
                    <option value="skill">技术</option>
                    <option value="recovery">恢复</option>
                    <option value="mixed">综合</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label style={labelStyle}>课次标题</label>
                  <input name="sessionTitle" placeholder="例：大重量深蹲日" style={{ ...fieldStyle, width: "100%" }} />
                </div>
                <div>
                  <label style={labelStyle}>强度（1-10）</label>
                  <input name="intensity" type="number" min="1" max="10" placeholder="7" style={{ ...fieldStyle, width: "100%" }} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>主要内容（训练动作、组数×次数×重量）</label>
                <textarea
                  name="mainContent"
                  rows={3}
                  placeholder={"深蹲 5×5@90kg\n硬拉 3×3@120kg\n卧推 4×8@70kg"}
                  style={{ ...fieldStyle, width: "100%", resize: "vertical" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>热身</label>
                  <input name="warmup" placeholder="热身内容" style={{ ...fieldStyle, width: "100%" }} />
                </div>
                <div>
                  <label style={labelStyle}>放松</label>
                  <input name="cooldown" placeholder="放松内容" style={{ ...fieldStyle, width: "100%" }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>时长（分钟）</label>
                  <input name="duration" type="number" min="1" placeholder="90" style={{ ...fieldStyle, width: "100%" }} />
                </div>
                <div>
                  <label style={labelStyle}>备注</label>
                  <input name="notes" placeholder="其他说明" style={{ ...fieldStyle, width: "100%" }} />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold tracking-wider uppercase"
                style={{ background: "var(--neon)", color: "#0d0d0d" }}
              >
                + 添加课次
              </button>
            </form>
          </div>
        </div>

        {/* 右侧 */}
        <div className="space-y-4">
          {/* 本周训练量统计 */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-4" style={{ background: "#ff9900" }} />
            <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
              训练量统计
            </h2>
          </div>

          <div className="p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <div className="space-y-3">
              {typeStats.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: "var(--text-muted)" }}>暂无课次数据</p>
              ) : (
                typeStats.map((t) => (
                  <div key={t.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold" style={{ color: t.color }}>{t.label}</span>
                      <span className="text-xs font-mono" style={{ color: "var(--text-secondary)" }}>
                        {t.completed}/{t.count} 课
                      </span>
                    </div>
                    <div className="w-full h-1" style={{ background: "var(--bg-elevated)" }}>
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.round((t.count / totalSessions) * 100)}%`,
                          background: t.color,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalSessions > 0 && (
              <div className="mt-4 pt-3 grid grid-cols-2 gap-3" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="text-center">
                  <div className="text-2xl font-black font-mono" style={{ color: "var(--neon)" }}>
                    {totalSessions}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>总课次</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black font-mono" style={{ color: "#00e676" }}>
                    {completedSessions}
                  </div>
                  <div className="text-xs" style={{ color: "var(--text-muted)" }}>已完成</div>
                </div>
              </div>
            )}
          </div>

          {/* 分配运动员 */}
          <div className="flex items-center gap-2">
            <div className="w-1 h-4" style={{ background: "#7c8bff" }} />
            <h2 className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
              分配运动员
            </h2>
          </div>

          <div className="p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
            <form action={handleAssign} className="space-y-3">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allAthletes.length === 0 ? (
                  <p className="text-xs py-4 text-center" style={{ color: "var(--text-muted)" }}>暂无在役运动员</p>
                ) : (
                  allAthletes.map((a) => (
                    <label
                      key={a.id}
                      className="flex items-center gap-3 py-2 px-3 cursor-pointer"
                      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                    >
                      <input
                        type="checkbox"
                        name="athleteIds"
                        value={a.id}
                        defaultChecked={assignedIds.has(a.id)}
                        style={{ accentColor: "var(--neon)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{a.name}</div>
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>{a.sport}</div>
                      </div>
                      {assignedIds.has(a.id) && (
                        <span className="text-xs font-mono" style={{ color: "var(--neon)" }}>✓</span>
                      )}
                    </label>
                  ))
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2 text-xs font-bold tracking-wider uppercase"
                style={{ background: "var(--neon)", color: "#0d0d0d" }}
              >
                保存分配
              </button>
            </form>
          </div>

          {/* 已分配运动员 */}
          {plan.assignments.length > 0 && (
            <div className="p-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <div className="text-xs tracking-wider uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                已分配（{plan.assignments.length}）
              </div>
              <div className="space-y-2">
                {plan.assignments.map((a) => (
                  <Link
                    key={a.athleteId}
                    href={`/athletes/${a.athleteId}`}
                    className="flex items-center justify-between py-1.5 px-2 nav-link"
                    style={{ borderBottom: "1px solid var(--border)" }}
                  >
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {a.athlete.name}
                    </span>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {a.athlete.sport}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
