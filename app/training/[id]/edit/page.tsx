import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateTrainingPlan } from "@/app/actions";

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

export default async function EditTrainingPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const planId = parseInt(id);
  if (isNaN(planId)) notFound();

  const plan = await prisma.trainingPlan.findUnique({ where: { id: planId } });
  if (!plan) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateTrainingPlan(planId, formData);
  }

  const toDateInput = (d: Date | null) => (d ? new Date(d).toISOString().split("T")[0] : "");

  return (
    <div className="max-w-2xl space-y-6">
      <Link
        href={`/training/${plan.id}`}
        className="nav-link inline-flex items-center gap-2 text-xs tracking-wider uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        ← 返回计划详情
      </Link>

      <div className="flex items-center gap-3">
        <div className="w-1 h-5" style={{ background: "var(--neon)" }} />
        <h1 className="text-sm font-bold tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
          EDIT TRAINING PLAN
        </h1>
      </div>

      <form action={handleUpdate} className="space-y-6">
        <div className="p-6 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4" style={{ background: "var(--neon)" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
              基本信息
            </span>
          </div>

          <div>
            <label style={labelStyle}>计划名称 <span style={{ color: "var(--danger)" }}>*</span></label>
            <input name="title" required defaultValue={plan.title} style={fieldStyle} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>适用项目</label>
              <input name="sport" defaultValue={plan.sport ?? ""} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>教练</label>
              <input name="coachName" defaultValue={plan.coachName ?? ""} style={fieldStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>训练阶段</label>
              <select name="phase" defaultValue={plan.phase ?? ""} style={fieldStyle}>
                <option value="">— 不指定 —</option>
                <option value="general">通用</option>
                <option value="preparatory">准备期</option>
                <option value="competition">比赛期</option>
                <option value="transition">过渡期</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>计划周数</label>
              <input name="weeks" type="number" min="1" max="52" defaultValue={plan.weeks} style={fieldStyle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>开始日期</label>
              <input name="startDate" type="date" defaultValue={toDateInput(plan.startDate)} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>结束日期</label>
              <input name="endDate" type="date" defaultValue={toDateInput(plan.endDate)} style={fieldStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>状态</label>
            <select name="status" defaultValue={plan.status} style={fieldStyle}>
              <option value="draft">草稿</option>
              <option value="active">进行中</option>
              <option value="completed">已完成</option>
              <option value="archived">已归档</option>
            </select>
          </div>
        </div>

        <div className="p-6 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4" style={{ background: "var(--neon)" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-secondary)" }}>
              目标与说明
            </span>
          </div>

          <div>
            <label style={labelStyle}>训练目标</label>
            <textarea name="goals" rows={3} defaultValue={plan.goals ?? ""} style={{ ...fieldStyle, resize: "vertical" }} />
          </div>

          <div>
            <label style={labelStyle}>计划说明</label>
            <textarea name="description" rows={3} defaultValue={plan.description ?? ""} style={{ ...fieldStyle, resize: "vertical" }} />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-2 text-sm font-bold tracking-wider uppercase"
            style={{ background: "var(--neon)", color: "#0d0d0d" }}
          >
            保存修改
          </button>
          <Link
            href={`/training/${plan.id}`}
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
