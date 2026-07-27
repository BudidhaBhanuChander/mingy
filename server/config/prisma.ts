import "dotenv/config";
import { createRequire } from "node:module";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaNeon } from "@prisma/adapter-neon";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("../generated/prisma/index.js");

const databaseUrl = process.env.DATABASE_URL ?? "file:./dev.db";

const adapter = databaseUrl.startsWith("file:")
    ? new PrismaBetterSqlite3({ url: databaseUrl })
    : new PrismaNeon({ connectionString: databaseUrl });

export const prisma = new PrismaClient({ adapter });
