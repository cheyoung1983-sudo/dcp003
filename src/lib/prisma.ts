import { pool } from "./serverDb";

let prismaClient: any;

try {
  const { PrismaClient } = require("@prisma/client");
  const { PrismaPg } = require("@prisma/adapter-pg");
  const adapter = new PrismaPg(pool);
  prismaClient = new PrismaClient({ adapter });
} catch {
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({})
  };
  prismaClient = new Proxy({}, { get: () => noOp });
}

export const prisma = prismaClient;
export default prisma;

