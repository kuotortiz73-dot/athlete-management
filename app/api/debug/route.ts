import { NextResponse } from "next/server";

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  // 测试数据库连接
  let dbStatus = "not tested";
  let dbError = null;
  try {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (e: unknown) {
    dbStatus = "failed";
    dbError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json({
    env: {
      TURSO_DATABASE_URL: tursoUrl ? `set (${tursoUrl})` : "MISSING",
      TURSO_AUTH_TOKEN: tursoToken ? `set (length=${tursoToken.length})` : "MISSING",
    },
    db: { status: dbStatus, error: dbError },
  });
}
