import { PrismaClient } from '@prisma/client';

// 開発時のホットリロード対策として、PrismaClientインスタンスをグローバルに保持
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // 開発時に実行されるSQLクエリをコンソールに出力
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

// 開発環境以外では、グローバルオブジェクトに保持したClientを破棄しない
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;