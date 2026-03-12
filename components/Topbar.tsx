"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "数据看板",
  "/": "运动员列表",
  "/training": "训练计划",
  "/tests": "测试记录",
  "/recovery": "恢复监控",
  "/compare": "运动员对比",
  "/athletes/new": "添加运动员",
};

function getTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.includes("/charts")) return "数据图表";
  if (pathname.includes("/records/new")) return "录入数据";
  if (pathname.includes("/records/") && pathname.includes("/edit")) return "编辑记录";
  if (pathname.match(/\/athletes\/\d+/)) return "运动员详情";
  return "运动员管理";
}

export default function Topbar() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header
      className="fixed top-0 right-0 h-14 flex items-center justify-between px-6 z-30"
      style={{
        left: "224px", // 56 * 4 = 224px (w-56)
        background: "var(--bg-base)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <h1
        className="text-sm font-bold tracking-widest uppercase"
        style={{ color: "var(--text-secondary)" }}
      >
        {title}
      </h1>

      <Link
        href="/athletes/new"
        className="px-4 py-1.5 text-xs font-black tracking-wider uppercase"
        style={{ background: "var(--neon)", color: "#0d0d0d" }}
      >
        + 添加运动员
      </Link>
    </header>
  );
}
