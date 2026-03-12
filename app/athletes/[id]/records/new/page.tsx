import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import RecordForm from "@/components/RecordForm";

export default async function NewRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const athleteId = parseInt(id);
  if (isNaN(athleteId)) notFound();

  const athlete = await prisma.athlete.findUnique({
    where: { id: athleteId },
    select: { id: true, name: true, sport: true },
  });
  if (!athlete) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href={`/athletes/${athlete.id}`}
        className="inline-flex items-center gap-2 text-xs tracking-wider uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        ← 返回 {athlete.name}
      </Link>

      <div style={{ borderLeft: "3px solid var(--neon)", paddingLeft: "12px" }}>
        <h1
          className="text-xl font-black tracking-wider uppercase"
          style={{ color: "var(--text-primary)" }}
        >
          录入数据
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          {athlete.name} · {athlete.sport}
        </p>
      </div>

      <RecordForm athleteId={athlete.id} />
    </div>
  );
}
