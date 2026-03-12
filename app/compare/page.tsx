import { prisma } from "@/lib/prisma";
import CompareClient from "@/components/CompareClient";

export const dynamic = "force-dynamic";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const selectedIds = (ids ?? "")
    .split(",")
    .map((s) => parseInt(s.trim()))
    .filter((n) => !isNaN(n));

  const allAthletes = await prisma.athlete.findMany({
    select: { id: true, name: true, sport: true, status: true },
    orderBy: { name: "asc" },
  });

  const athletes =
    selectedIds.length > 0
      ? await prisma.athlete.findMany({
          where: { id: { in: selectedIds } },
          include: {
            strengthRecords: { orderBy: { recordDate: "desc" }, take: 1 },
            physicalTests: { orderBy: { testDate: "desc" }, take: 1 },
            bodyCompositions: { orderBy: { testDate: "desc" }, take: 1 },
          },
        })
      : [];

  return (
    <CompareClient
      allAthletes={allAthletes}
      athletes={athletes}
      selectedIds={selectedIds}
    />
  );
}
