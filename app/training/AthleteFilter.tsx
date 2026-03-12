"use client";

export default function AthleteFilter({
  athletes,
  selectedId,
}: {
  athletes: { id: number; name: string }[];
  selectedId?: number;
}) {
  return (
    <select
      name="athleteId"
      onChange={(e) => (e.target.form as HTMLFormElement).submit()}
      defaultValue={selectedId ?? ""}
      className="text-xs px-3 py-2 font-bold"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        color: selectedId ? "var(--neon)" : "var(--text-muted)",
      }}
    >
      <option value="">全部运动员</option>
      {athletes.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  );
}
