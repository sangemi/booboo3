import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL ??
  "postgresql://booboo3_user:placeholder@localhost:5432/booboo3";
const adapter = new PrismaPg(connectionString, {
  schema: new URL(connectionString).searchParams.get("schema") ?? "public",
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
