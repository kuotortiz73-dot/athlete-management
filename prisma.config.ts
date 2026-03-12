import "dotenv/config";
import { defineConfig } from "prisma/config";
import path from "path";

const dbPath = path
  .resolve(process.cwd(), "prisma", "dev.db")
  .replace(/\\/g, "/");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: `file:${dbPath}`,
  },
});
