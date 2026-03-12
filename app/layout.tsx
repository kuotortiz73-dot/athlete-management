import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "运动员信息管理系统",
  description: "运动员基本信息、体能测试、比赛记录、训练日志综合管理平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
      >
        <Sidebar />
        <Topbar />
        {/* 主内容区：左边距 = 侧边栏宽度(224px)，顶部边距 = 顶部栏高度(56px) */}
        <main
          style={{
            marginLeft: "224px",
            marginTop: "56px",
            minHeight: "calc(100vh - 56px)",
            padding: "32px",
          }}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
