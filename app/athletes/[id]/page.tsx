import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import AthleteTabLayout from "@/components/AthleteTabLayout";
import { calcBMI, calcRelativeStrength, DeltaBadge } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "在役", color: "#00e676" },
  injured: { label: "伤病", color: "#ff3b3b" },
  retired: { label: "退役", color: "#555555" },
};

const genderMap: Record<string, string> = { male: "男", female: "女" };

function StatBox({
  label,
  value,
  unit,
  prev,
  inverse,
}: {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  prev?: number | null;
  inverse?: boolean;
}) {
  return (
    <div
      className="p-3"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
    >
      <div
        className="text-xs tracking-wider uppercase mb-1"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </div>
      <div className="flex items-baseline gap-1 flex-wrap">
        <span
          className="text-xl font-black font-mono"
          style={{ color: value != null ? "var(--neon)" : "var(--text-muted)" }}
        >
          {value ?? "—"}
        </span>
        {unit && value != null && (
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {unit}
          </span>
        )}
      </div>
      {typeof value === "number" && prev != null && (
        <div className="mt-1">
          <DeltaBadge current={value} prev={prev} inverse={inverse} />
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-4" style={{ background: "var(--neon)" }} />
      <h3
        className="text-xs font-bold tracking-widest uppercase"
        style={{ color: "var(--text-secondary)" }}
      >
        {children}
      </h3>
    </div>
  );
}

export default async function AthletePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}) {
  const { id } = await params;
  const { success } = await searchParams;
  const athleteId = parseInt(id);
  if (isNaN(athleteId)) notFound();

  const [athlete, activePlans] = await Promise.all([
    prisma.athlete.findUnique({
      where: { id: athleteId },
      include: {
        strengthRecords: { orderBy: { recordDate: "desc" }, take: 10 },
        physicalTests: { orderBy: { testDate: "desc" }, take: 10 },
        bodyCompositions: { orderBy: { testDate: "desc" }, take: 10 },
        trainingLogs: { orderBy: { date: "desc" }, take: 20 },
        injuries: { orderBy: { injuryDate: "desc" } },
      },
    }),
    prisma.trainingPlanAssignment.findMany({
      where: { athleteId },
      include: {
        plan: {
          include: {
            sessions: { select: { id: true, completed: true } },
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    }),
  ]);

  if (!athlete) notFound();

  const latestStrength = athlete.strengthRecords[0];
  const prevStrength = athlete.strengthRecords[1];
  const latestPhysical = athlete.physicalTests[0];
  const prevPhysical = athlete.physicalTests[1];
  const latestBody = athlete.bodyCompositions[0];
  const prevBody = athlete.bodyCompositions[1];
  const st = statusConfig[athlete.status] ?? statusConfig.retired;

  // 自动计算 BMI 和相对力量
  const autoBMI = calcBMI(latestBody?.weight, athlete.height);
  const relSquat = calcRelativeStrength(latestStrength?.squat, latestBody?.weight ?? athlete.weight);
  const relDeadlift = calcRelativeStrength(latestStrength?.deadlift, latestBody?.weight ?? athlete.weight);

  // 训练类型标签
  const trainingTypeMap: Record<string, string> = {
    strength: "力量",
    cardio: "有氧",
    skill: "技术",
    recovery: "恢复",
    mixed: "综合",
  };

  const moodMap: Record<string, { label: string; color: string }> = {
    excellent: { label: "极佳", color: "#00e676" },
    good: { label: "良好", color: "var(--neon)" },
    normal: { label: "一般", color: "var(--text-secondary)" },
    poor: { label: "较差", color: "#ff3b3b" },
  };

  return (
    <div className="space-y-6">
      {/* 返回 */}
      <Link
        href="/"
        className="nav-link inline-flex items-center gap-2 text-xs tracking-wider uppercase transition-colors"
        style={{ color: "var(--text-muted)" }}
      >
        ← 返回列表
      </Link>

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
            {{
              created: "运动员创建成功",
              strength: "力量数据录入成功",
              physical: "体能数据录入成功",
              body: "身体成分录入成功",
              training: "训练日志录入成功",
            }[success] ?? "数据保存成功"}
          </span>
        </div>
      )}

      {/* 运动员基本信息卡 */}
      <div
        className="p-6"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* 左侧：姓名信息 */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
                {athlete.name}
              </h1>
              <span
                className="text-xs px-2 py-0.5 font-mono font-bold"
                style={{ color: st.color, border: `1px solid ${st.color}` }}
              >
                {st.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {genderMap[athlete.gender] ?? athlete.gender}
              </span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {athlete.age} 岁
              </span>
              <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {athlete.nationality}
              </span>
              <span
                className="text-sm font-bold px-2"
                style={{
                  background: "var(--bg-elevated)",
                  color: "var(--neon)",
                }}
              >
                {athlete.sport}
                {athlete.position && ` · ${athlete.position}`}
              </span>
              {athlete.team && (
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {athlete.team}
                </span>
              )}
            </div>
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            <Link
              href={`/athletes/${athlete.id}/records/new`}
              className="px-4 py-2 text-xs font-bold tracking-wider uppercase"
              style={{ background: "var(--neon)", color: "#0d0d0d" }}
            >
              + 录入数据
            </Link>
            <Link
              href={`/athletes/${athlete.id}/charts`}
              className="px-4 py-2 text-xs font-bold tracking-wider uppercase"
              style={{
                border: "1px solid var(--neon)",
                color: "var(--neon)",
              }}
            >
              图表分析
            </Link>
            <a
              href={`/api/pdf/${athlete.id}`}
              target="_blank"
              className="px-4 py-2 text-xs font-bold tracking-wider uppercase"
              style={{
                border: "1px solid #7c8bff",
                color: "#7c8bff",
              }}
            >
              导出 PDF
            </a>
          </div>
        </div>

        {/* 体格信息 */}
        {(athlete.height || athlete.weight) && (
          <div className="mt-4 flex gap-4" style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
            {athlete.height && (
              <div>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>身高 </span>
                <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>
                  {athlete.height} cm
                </span>
              </div>
            )}
            {athlete.weight && (
              <div>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>体重 </span>
                <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>
                  {athlete.weight} kg
                </span>
              </div>
            )}
            {athlete.coachName && (
              <div>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>教练 </span>
                <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>
                  {athlete.coachName}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tab 详情 */}
      <AthleteTabLayout>
        {/* Tab 0: 力量数据 */}
        <div className="space-y-6">
          <SectionTitle>最新 1RM 数据</SectionTitle>
          {latestStrength ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatBox label="深蹲" value={latestStrength.squat} unit="kg" prev={prevStrength?.squat} />
                <StatBox label="硬拉" value={latestStrength.deadlift} unit="kg" prev={prevStrength?.deadlift} />
                <StatBox label="卧推" value={latestStrength.benchPress} unit="kg" prev={prevStrength?.benchPress} />
                <StatBox label="高翻" value={latestStrength.powerClean} unit="kg" prev={prevStrength?.powerClean} />
                <StatBox label="抓举" value={latestStrength.snatch} unit="kg" prev={prevStrength?.snatch} />
                <StatBox label="挺举" value={latestStrength.cleanJerk} unit="kg" prev={prevStrength?.cleanJerk} />
              </div>
              {/* 相对力量自动计算 */}
              {(relSquat || relDeadlift) && (
                <div className="flex gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                  {relSquat && (
                    <span>深蹲相对力量：<span className="font-mono font-bold" style={{ color: "var(--neon)" }}>{relSquat}×BW</span></span>
                  )}
                  {relDeadlift && (
                    <span>硬拉相对力量：<span className="font-mono font-bold" style={{ color: "#00e676" }}>{relDeadlift}×BW</span></span>
                  )}
                </div>
              )}
            </>
          ) : (
            <EmptyState href={`/athletes/${athlete.id}/records/new`} type="strength" />
          )}

          {athlete.strengthRecords.length > 1 && (
            <>
              <SectionTitle>历史记录</SectionTitle>
              <div style={{ border: "1px solid var(--border)" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                      {["日期", "深蹲", "硬拉", "卧推", "高翻", "抓举", "挺举", ""].map((h) => (
                        <th key={h} className="px-3 py-2 text-left tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {athlete.strengthRecords.map((r, i) => (
                      <tr
                        key={r.id}
                        style={{
                          borderBottom: "1px solid var(--border)",
                          background: i % 2 === 0 ? "transparent" : "var(--bg-elevated)",
                        }}
                      >
                        <td className="px-3 py-2 font-mono" style={{ color: "var(--text-secondary)" }}>
                          {new Date(r.recordDate).toLocaleDateString("zh-CN")}
                        </td>
                        {[r.squat, r.deadlift, r.benchPress, r.powerClean, r.snatch, r.cleanJerk].map((v, vi) => (
                          <td key={vi} className="px-3 py-2 font-mono font-bold" style={{ color: v != null ? "var(--text-primary)" : "var(--text-muted)" }}>
                            {v ?? "—"}
                          </td>
                        ))}
                        <td className="px-3 py-2">
                          <Link
                            href={`/athletes/${athlete.id}/records/${r.id}/edit`}
                            className="text-xs font-bold tracking-wider uppercase"
                            style={{ color: "var(--neon)" }}
                          >
                            编辑
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Tab 1: 体能测试 */}
        <div className="space-y-6">
          <SectionTitle>最新体能数据</SectionTitle>
          {latestPhysical ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <StatBox label="100m" value={latestPhysical.sprint100m} unit="s" prev={prevPhysical?.sprint100m} inverse />
              <StatBox label="50m" value={latestPhysical.sprint50m} unit="s" prev={prevPhysical?.sprint50m} inverse />
              <StatBox label="3000m" value={latestPhysical.run3000m} unit="s" prev={prevPhysical?.run3000m} inverse />
              <StatBox label="VO₂max" value={latestPhysical.vo2max} unit="ml/kg" prev={prevPhysical?.vo2max} />
              <StatBox label="垂直跳" value={latestPhysical.verticalJump} unit="cm" prev={prevPhysical?.verticalJump} />
              <StatBox label="立定跳远" value={latestPhysical.broadJump} unit="cm" prev={prevPhysical?.broadJump} />
              <StatBox label="坐位体前屈" value={latestPhysical.sitAndReach} unit="cm" prev={prevPhysical?.sitAndReach} />
              <StatBox label="敏捷测试" value={latestPhysical.agilityTest} unit="s" prev={prevPhysical?.agilityTest} inverse />
              <StatBox label="综合评分" value={latestPhysical.overallScore} unit="分" prev={prevPhysical?.overallScore} />
            </div>
          ) : (
            <EmptyState href={`/athletes/${athlete.id}/records/new`} type="physical" />
          )}
        </div>

        {/* Tab 2: 身体成分 */}
        <div className="space-y-6">
          <SectionTitle>最新身体成分</SectionTitle>
          {latestBody ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatBox label="体重" value={latestBody.weight} unit="kg" prev={prevBody?.weight} />
              <StatBox label="体脂率" value={latestBody.bodyFat} unit="%" prev={prevBody?.bodyFat} inverse />
              <StatBox label="肌肉量" value={latestBody.muscleMass} unit="kg" prev={prevBody?.muscleMass} />
              <StatBox label="骨量" value={latestBody.boneMass} unit="kg" prev={prevBody?.boneMass} />
              <StatBox label="水分含量" value={latestBody.waterContent} unit="%" prev={prevBody?.waterContent} />
              <StatBox
                label="BMI"
                value={latestBody.bmi ?? autoBMI}
                prev={prevBody?.bmi ?? undefined}
              />
              <StatBox label="内脏脂肪" value={latestBody.visceralFat} unit="级" prev={prevBody?.visceralFat} inverse />
            </div>
          ) : (
            <EmptyState href={`/athletes/${athlete.id}/records/new`} type="body" />
          )}

          {athlete.bodyCompositions.length > 1 && (
            <>
              <SectionTitle>历史记录</SectionTitle>
              <div style={{ border: "1px solid var(--border)" }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border)" }}>
                      {["日期", "体重", "体脂率", "肌肉量", "BMI", ""].map((h) => (
                        <th key={h} className="px-3 py-2 text-left tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {athlete.bodyCompositions.map((b, i) => (
                      <tr key={b.id} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--bg-elevated)" }}>
                        <td className="px-3 py-2 font-mono" style={{ color: "var(--text-secondary)" }}>
                          {new Date(b.testDate).toLocaleDateString("zh-CN")}
                        </td>
                        <td className="px-3 py-2 font-mono font-bold" style={{ color: "var(--text-primary)" }}>{b.weight ?? "—"}</td>
                        <td className="px-3 py-2 font-mono font-bold" style={{ color: "var(--text-primary)" }}>{b.bodyFat != null ? `${b.bodyFat}%` : "—"}</td>
                        <td className="px-3 py-2 font-mono font-bold" style={{ color: "var(--text-primary)" }}>{b.muscleMass ?? "—"}</td>
                        <td className="px-3 py-2 font-mono font-bold" style={{ color: "var(--text-primary)" }}>{b.bmi ?? "—"}</td>
                        <td className="px-3 py-2">
                          <Link
                            href={`/athletes/${athlete.id}/records/${b.id}/edit`}
                            className="text-xs font-bold tracking-wider uppercase"
                            style={{ color: "var(--neon)" }}
                          >
                            编辑
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Tab 3: 训练日志 */}
        <div className="space-y-4">
          {/* 当前执行中的训练计划 */}
          {activePlans.length > 0 && (
            <div>
              <SectionTitle>当前训练计划</SectionTitle>
              <div className="space-y-2">
                {activePlans.map(({ plan }) => {
                  const totalSessions = plan.sessions.length;
                  const completedSessions = plan.sessions.filter((s) => s.completed).length;
                  const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
                  const statusColor =
                    plan.status === "active" ? "#00e676" : plan.status === "completed" ? "#7c8bff" : "#888888";
                  const statusLabel =
                    plan.status === "active" ? "进行中" : plan.status === "completed" ? "已完成" : plan.status === "draft" ? "草稿" : "已归档";
                  return (
                    <Link
                      key={plan.id}
                      href={`/training/${plan.id}`}
                      className="block p-4 nav-link"
                      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                              {plan.title}
                            </span>
                            <span
                              className="text-xs px-1.5 py-0.5 font-mono"
                              style={{ color: statusColor, border: `1px solid ${statusColor}` }}
                            >
                              {statusLabel}
                            </span>
                            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                              {plan.weeks} 周
                            </span>
                          </div>
                          {totalSessions > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>完成进度</span>
                                <span className="text-xs font-mono" style={{ color: progress === 100 ? "#00e676" : "var(--neon)" }}>
                                  {completedSessions}/{totalSessions} · {progress}%
                                </span>
                              </div>
                              <div className="w-full h-1" style={{ background: "var(--bg-elevated)" }}>
                                <div
                                  className="h-full"
                                  style={{
                                    width: `${progress}%`,
                                    background: progress === 100 ? "#00e676" : "var(--neon)",
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <span className="text-xs tracking-wider" style={{ color: "var(--neon)", flexShrink: 0 }}>
                          查看详情 →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <SectionTitle>训练日志（近 20 条）</SectionTitle>
          {athlete.trainingLogs.length === 0 ? (
            <EmptyState href={`/athletes/${athlete.id}/records/new`} type="training" />
          ) : (
            <div className="space-y-2">
              {athlete.trainingLogs.map((log) => {
                const mood = moodMap[log.mood ?? ""] ?? { label: "—", color: "var(--text-muted)" };
                return (
                  <div
                    key={log.id}
                    className="p-4"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold" style={{ color: "var(--neon)" }}>
                          {new Date(log.date).toLocaleDateString("zh-CN")}
                        </span>
                        <span
                          className="text-xs px-2 py-0.5"
                          style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}
                        >
                          {trainingTypeMap[log.type] ?? log.type}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {log.duration}min
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span style={{ color: "var(--text-muted)" }}>
                          强度{" "}
                          <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>
                            {log.intensity}/10
                          </span>
                        </span>
                        <span style={{ color: mood.color }}>{mood.label}</span>
                      </div>
                    </div>
                    {log.mainContent && (
                      <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                        {log.mainContent}
                      </p>
                    )}
                    {(log.heartRateAvg || log.heartRateMax) && (
                      <div className="mt-2 flex gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                        {log.heartRateAvg && <span>均心率 <span className="font-mono" style={{ color: "#ff3b3b" }}>{log.heartRateAvg}</span> bpm</span>}
                        {log.heartRateMax && <span>最大心率 <span className="font-mono" style={{ color: "#ff3b3b" }}>{log.heartRateMax}</span> bpm</span>}
                        {log.caloriesBurned && <span>消耗 <span className="font-mono" style={{ color: "var(--text-primary)" }}>{log.caloriesBurned}</span> kcal</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tab 4: 健康监控 */}
        <div className="space-y-6">
          <SectionTitle>伤病记录</SectionTitle>
          {athlete.injuries.length === 0 ? (
            <div
              className="p-8 text-center"
              style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}
            >
              <div className="text-2xl font-black" style={{ color: "#00e676" }}>
                STATUS: HEALTHY
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                暂无伤病记录
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {athlete.injuries.map((inj) => {
                const sevColor =
                  inj.severity === "severe"
                    ? "#ff3b3b"
                    : inj.severity === "moderate"
                    ? "#ff9900"
                    : "#e8ff3a";
                return (
                  <div
                    key={inj.id}
                    className="p-4"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border)",
                      borderLeft: `3px solid ${sevColor}`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                          {inj.bodyPart} — {inj.injuryType}
                        </span>
                        <span
                          className="ml-2 text-xs px-1.5 py-0.5"
                          style={{ color: sevColor, border: `1px solid ${sevColor}` }}
                        >
                          {inj.severity === "severe" ? "严重" : inj.severity === "moderate" ? "中度" : "轻微"}
                        </span>
                      </div>
                      <span
                        className="text-xs font-mono"
                        style={{ color: inj.status === "recovered" ? "#00e676" : "#ff9900" }}
                      >
                        {inj.status === "recovered" ? "已康复" : "康复中"}
                      </span>
                    </div>
                    <div className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(inj.injuryDate).toLocaleDateString("zh-CN")}
                      {inj.recoveryDate && ` → ${new Date(inj.recoveryDate).toLocaleDateString("zh-CN")}`}
                      {inj.treatment && ` | 治疗：${inj.treatment}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AthleteTabLayout>
    </div>
  );
}

function EmptyState({
  href,
  type,
}: {
  href: string;
  type: string;
}) {
  const labels: Record<string, string> = {
    strength: "力量",
    physical: "体能",
    body: "身体成分",
    training: "训练",
  };
  return (
    <div
      className="p-12 text-center"
      style={{ background: "var(--bg-card)", border: "1px dashed var(--border)" }}
    >
      <div className="text-lg font-black font-mono" style={{ color: "var(--text-muted)" }}>
        NO {type.toUpperCase()} DATA
      </div>
      <Link
        href={href}
        className="mt-4 inline-block px-4 py-2 text-xs font-bold tracking-wider uppercase"
        style={{ background: "var(--neon)", color: "#0d0d0d" }}
      >
        录入{labels[type] ?? ""}数据
      </Link>
    </div>
  );
}
