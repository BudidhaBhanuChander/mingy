import "dotenv/config";
import { createRequire } from "node:module";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("../generated/prisma/index.js");

const adapter = new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL ?? "file:./dev.db",
});

export const prisma = new PrismaClient({ adapter });
