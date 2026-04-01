import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql"; 

// 1. สร้าง Adapter โดยส่ง Config (URL) เข้าไปตรงๆ (ไม่ต้อง import createClient แล้ว)
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 2. ยัด adapter เข้าไปใน PrismaClient
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;