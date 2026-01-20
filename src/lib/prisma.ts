import { PrismaClient } from "@/generated/prisma";
const globalForPrisma = global as unknown as { prisma: PrismaClient };
// Add this at the top of your file
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
