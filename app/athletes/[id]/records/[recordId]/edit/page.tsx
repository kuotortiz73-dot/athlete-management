import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditRecordForm from "@/components/EditRecordForm";

export const dynamic = "force-dynamic";

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ id: string; recordId: string }>;
}) {
  const { id, recordId } = await params;
  const athleteId = parseInt(id);
  const rId = parseInt(recordId);
  if (isNaN(athleteId) || isNaN(rId)) notFound();

  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    select: { id: true, name: true, sport: true },
  });
  if (!athlete) notFound();

  // 尝试从各个表中查找这条记录（通过 URL 的 type query 参数区分）
  // 简化实现：按 recordId 在各表中查找
  const [strength, physical, body, training] = await Promise.all([
    prisma.strengthRecord.findFirst({ where: { id: rId, athleteId } }),
    prisma.physicalTest.findFirst({ where: { id: rId, athleteId } }),
    prisma.bodyComposition.findFirst({ where: { id: rId, athleteId } }),
    prisma.trainingLog.findFirst({ where: { id: rId, athleteId } }),
  ]);

  const record = strength ?? physical ?? body ?? training;
  if (!record) notFound();

  const recordType = strength
    ? "strength"
    : physical
    ? "physical"
    : body
    ? "body"
    : "training";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={`/athletes/${athlete.id}`}
        className="nav-link inline-flex items-center gap-2 text-xs tracking-wider uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        ← 返回 {athlete.name}
      </Link>

      <div style={{ borderLeft: "3px solid var(--neon)", paddingLeft: "12px" }}>
        <h1
          className="text-xl font-black tracking-wider uppercase"
          style={{ color: "var(--text-primary)" }}
        >
          编辑记录
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {athlete.name} · {athlete.sport}
        </p>
      </div>

      <EditRecordForm
        athleteId={athlete.id}
        recordId={rId}
        recordType={recordType}
        record={record}
      />
    </div>
  );
}
