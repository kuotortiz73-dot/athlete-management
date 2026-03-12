"use client";

import { useState } from "react";

const TABS = [
  { id: "strength", label: "力量数据" },
  { id: "physical", label: "体能测试" },
  { id: "body", label: "身体成分" },
  { id: "training", label: "训练日志" },
  { id: "health", label: "健康监控" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  defaultTab?: TabId;
  children: React.ReactNode[];
}

export default function AthleteTabLayout({ defaultTab = "strength", children }: Props) {
  const [active, setActive] = useState<TabId>(defaultTab);
  const idx = TABS.findIndex((t) => t.id === active);

  return (
    <div>
      {/* Tab 导航 */}
      <div
        className="flex overflow-x-auto"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {TABS.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className="px-5 py-3 text-xs font-bold tracking-widest uppercase whitespace-nowrap transition-all"
              style={{
                color: isActive ? "var(--neon)" : "var(--text-muted)",
                borderBottom: isActive
                  ? "2px solid var(--neon)"
                  : "2px solid transparent",
                background: "transparent",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 内容 */}
      <div className="mt-6">{children[idx]}</div>
    </div>
  );
}
