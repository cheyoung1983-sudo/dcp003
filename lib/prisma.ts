import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

let prismaClient: any;

try {
  prismaClient = global.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prismaClient;
  }
} catch {
  console.warn('[AI Studio] Database not connected — using Prisma mock');
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
