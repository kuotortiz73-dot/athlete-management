import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updatePlanSession } from "@/app/actions";

export const dynamic = "force-dynamic";

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

const dayNames = ["", "周一", "周二", "周三", "周四", "周五", "周六", "周日"];

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string; sessionId: string }>;
}) {
  const { id, sessionId } = await params;
  const planId = parseInt(id);
  const sId = parseInt(sessionId);
  if (isNaN(planId) || isNaN(sId)) notFound();

  const [plan, session] = await Promise.all([
    prisma.trainingPlan.findUnique({ where: { id: planId }, select: { id: true, title: true, weeks: true } }),
    prisma.trainingPlanSession.findUnique({ where: { id: sId } }),
  ]);

  if (!plan || !session || session.planId !== planId) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    await updatePlanSession(sId, planId, formData);
  }

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
          EDIT SESSION — {plan.title}
        </h1>
      </div>

      <form action={handleUpdate} className="space-y-6">
        <div className="p-6 space-y-4" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label style={labelStyle}>周次</label>
              <select name="week" defaultValue={session.week} style={fieldStyle}>
                {Array.from({ length: plan.weeks }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>第 {w} 周</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>星期</label>
              <select name="dayOfWeek" defaultValue={session.dayOfWeek} style={fieldStyle}>
                {dayNames.slice(1).map((d, i) => (
                  <option key={i + 1} value={i + 1}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>训练类型</label>
              <select name="type" defaultValue={session.type} style={fieldStyle}>
                <option value="strength">力量</option>
                <option value="cardio">有氧</option>
                <option value="skill">技术</option>
                <option value="recovery">恢复</option>
                <option value="mixed">综合</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label style={labelStyle}>课次标题</label>
              <input name="sessionTitle" defaultValue={session.sessionTitle ?? ""} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>强度（1-10）</label>
              <input name="intensity" type="number" min="1" max="10" defaultValue={session.intensity ?? ""} style={fieldStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>热身</label>
            <input name="warmup" defaultValue={session.warmup ?? ""} style={fieldStyle} />
          </div>

          <div>
            <label style={labelStyle}>主要内容</label>
            <textarea name="mainContent" rows={4} defaultValue={session.mainContent ?? ""} style={{ ...fieldStyle, resize: "vertical" }} />
          </div>

          <div>
            <label style={labelStyle}>放松</label>
            <input name="cooldown" defaultValue={session.cooldown ?? ""} style={fieldStyle} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>时长（分钟）</label>
              <input name="duration" type="number" min="1" defaultValue={session.duration ?? ""} style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>备注</label>
              <input name="notes" defaultValue={session.notes ?? ""} style={fieldStyle} />
            </div>
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
