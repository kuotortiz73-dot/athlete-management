// 涨跌箭头和百分比计算工具
export function calcDelta(current: number | null | undefined, prev: number | null | undefined) {
  if (current == null || prev == null || prev === 0) return null;
  const pct = ((current - prev) / Math.abs(prev)) * 100;
  return { pct: Math.abs(pct).toFixed(1), up: pct >= 0 };
}

export function DeltaBadge({
  current,
  prev,
  inverse = false, // inverse=true 时数值下降为好（如体脂率、百米时间）
}: {
  current: number | null | undefined;
  prev: number | null | undefined;
  inverse?: boolean;
}) {
  const delta = calcDelta(current, prev);
  if (!delta) return null;

  const isGood = inverse ? !delta.up : delta.up;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs font-mono"
      style={{ color: isGood ? "#00e676" : "#ff3b3b" }}
    >
      {delta.up ? "▲" : "▼"} {delta.pct}%
    </span>
  );
}

// 计算 BMI
export function calcBMI(weight: number | null | undefined, height: number | null | undefined): number | null {
  if (!weight || !height) return null;
  return Math.round((weight / Math.pow(height / 100, 2)) * 10) / 10;
}

// 计算相对力量
export function calcRelativeStrength(
  oneRM: number | null | undefined,
  weight: number | null | undefined
): string | null {
  if (!oneRM || !weight) return null;
  return (oneRM / weight).toFixed(2);
}
