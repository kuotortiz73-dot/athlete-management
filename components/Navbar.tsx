"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        background: "var(--bg-card)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <span
              className="text-xs font-black tracking-widest uppercase"
              style={{ color: "var(--neon)", letterSpacing: "0.2em" }}
            >
              ▶ ATHLETE
            </span>
            <span
              className="text-xs font-light tracking-widest uppercase"
              style={{ color: "var(--text-secondary)" }}
            >
              MGMT
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-medium tracking-wider uppercase transition-all"
              style={{
                color:
                  pathname === "/"
                    ? "var(--neon)"
                    : "var(--text-secondary)",
                borderBottom:
                  pathname === "/" ? "2px solid var(--neon)" : "2px solid transparent",
              }}
            >
              运动员列表
            </Link>
            <Link
              href="/athletes/new"
              className="ml-2 px-3 py-1.5 text-xs font-bold tracking-wider uppercase transition-all"
              style={{
                background: "var(--neon)",
                color: "#0d0d0d",
              }}
            >
              + 添加运动员
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
