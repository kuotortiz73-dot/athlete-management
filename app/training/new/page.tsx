import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createTrainingPlanWithAthletes } from "@/app/actions";

const fieldStyle = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  padding: "0.5rem 0.75rem",
  width: "100%",
  fontSize: "0.875rem",
} as const;

const labelStyle = {
  display: "block",
  fontSize: "0.65rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "var(--text-muted)",
  marginBottom: "0.375rem",
};

// 预设训练模板
const TEMPLATES = [
  {
    id: "strength",
    name: "力量提升",
    phase: "preparatory",
    weeks: 8,
    goals: "以最大力量提升为核心，重点提高深蹲、硬拉、卧推等大肌群力量，目标8周内主项提升10%以上。",
    description: "基础力量积累阶段，采用线性周期化训练，每周3-4次大重量训练，强度逐步递增。",
  },
  {
    id: "explosive",
    name: "爆发力训练",
    phase: "competition",
    weeks: 6,
    goals: "提升快速力量与爆发力，改善起跳、冲刺、投掷等竞技能力，结合专项技术训练。",
    description: "速度-力量转化阶段，融合奥举（高翻/抓举）、跳跃训练与专项练习，每周4-5次训练。",
  },
  {
    id: "fitness",
    name: "体能提升",
    phase: "general",
    weeks: 4,
    goals: "全面提升有氧耐力与无氧能力，改善VO2max，降低体脂率，为专项训练打基础。",
    description: "基础体能强化阶段，融合有氧跑、间歇训练与功能性力量，每周5-6次训练。",
  },
];

export default async function NewTrainingPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string }>;
}) {
  const { template } = await searchParams;
  const selectedTemplate = TEMPLATES.find((t) => t.id === template);

  const athletes = await prisma.athlete.findMany({
    where: { status: { not: "retired" } },
    select: { id: true, name: true, sport: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/training"
        className="nav-link inline-flex items-center gap-2 text-xs tracking-wider uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        ← 返回训练计划
      </Link>

      <div className="flex items-center gap-3">
        <div className="w-1 h-5" style={{ background: "var(--neon)" }} />
        <h1 className="text-sm font-bold tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
          NEW TRAINING PLAN
        </h1>
      </div>

      {/* 模板选择 */}
      <div className="p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4" style={{ background: "#7c8bff" }} />
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
            快速模板
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {TEMPLATES.map((t) => (
            <Link
              key={t.id}
              href={`/training/new?template=${t.id}`}
              className="p-3 block transition-all"
              style={{
                background: selectedTemplate?.id === t.id ? "rgba(124,139,255,0.15)" : "var(--bg-elevated)",
                border: `1px solid ${selectedTemplate?.id === t.id ? "#7c8bff" : "var(--border)"}`,
              }}
            >
              <div
                className="text-sm font-bold mb-1"
                style={{ color: selectedTemplate?.id === t.id ? "#7c8bff" : "var(--text-primary)" }}
              >
                {t.name}
              </div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {t.weeks} 周 · {t.phase === "preparatory" ? "准备期" : t.phase === "competition" ? "比赛期" : "通用"}
              </div>
            </Link>
          ))}
        </div>
        {selectedTemplate && (
          <div className="mt-3 px-3 py-2 text-xs" style={{ background: "rgba(124,139,255,0.08)", border: "1px solid rgba(124,139,255,0.3)", color: "var(--text-secondary)" }}>
            已选模板「{selectedTemplate.name}」，表单已预填充，可按需修改
          </div>
        )}
      </div>

      <form action={createTrainingPlanWithAthletes} className="space-y-6">
        {/* 基本信息 */}
        <div className="p-6 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4" style={{ background: "var(--neon)" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
              基本信息
            </span>
          </div>

          <div>
            <label style={labelStyle}>
              计划名称 <span style={{ color: "var(--danger)" }}>*</span>
            </label>
            <input
              name="title"
              required
              placeholder="例：2026年春季力量周期"
              defaultValue={selectedTemplate ? `${selectedTemplate.name}训练计划` : ""}
              style={fieldStyle}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>适用项目</label>
              <input name="sport" placeholder="例：田径、篮球" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>教练</label>
              <input name="coachName" placeholder="教练姓名" style={fieldStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>训练阶段</label>
              <select name="phase" defaultValue={selectedTemplate?.phase ?? ""} style={fieldStyle}>
                <option value="">— 不指定 —</option>
                <option value="general">通用</option>
                <option value="preparatory">准备期</option>
                <option value="competition">比赛期</option>
                <option value="transition">过渡期</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>计划周数</label>
              <input
                name="weeks"
                type="number"
                min="1"
                max="52"
                defaultValue={selectedTemplate?.weeks ?? 4}
                style={fieldStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>开始日期</label>
              <input name="startDate" type="date" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>结束日期</label>
              <input name="endDate" type="date" style={fieldStyle} />
            </div>
          </div>
        </div>

        {/* 目标与说明 */}
        <div className="p-6 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4" style={{ background: "var(--neon)" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
              目标与说明
            </span>
          </div>

          <div>
            <label style={labelStyle}>训练目标</label>
            <textarea
              name="goals"
              rows={3}
              defaultValue={selectedTemplate?.goals ?? ""}
              placeholder="例：提升最大力量 10%，深蹲突破 200kg"
              style={{ ...fieldStyle, resize: "vertical" }}
            />
          </div>

          <div>
            <label style={labelStyle}>计划说明</label>
            <textarea
              name="description"
              rows={3}
              defaultValue={selectedTemplate?.description ?? ""}
              placeholder="训练计划的背景、方法论等"
              style={{ ...fieldStyle, resize: "vertical" }}
            />
          </div>
        </div>

        {/* 选择运动员 */}
        <div className="p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4" style={{ background: "#00d4ff" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
              分配运动员（可多选）
            </span>
          </div>
          {athletes.length === 0 ? (
            <p className="text-xs py-4 text-center" style={{ color: "var(--text-muted)" }}>暂无在役运动员</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {athletes.map((a) => (
                <label
                  key={a.id}
                  className="flex items-center gap-2 py-2 px-3 cursor-pointer"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                >
                  <input
                    type="checkbox"
                    name="athleteIds"
                    value={a.id}
                    style={{ accentColor: "var(--neon)" }}
                  />
                  <div className="min-w-0">
                    <div className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>{a.name}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{a.sport}</div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-2 text-sm font-bold tracking-wider uppercase"
            style={{ background: "var(--neon)", color: "#0d0d0d" }}
          >
            创建计划
          </button>
          <Link
            href="/training"
            className="px-6 py-2 text-sm font-bold tracking-wider uppercase"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
