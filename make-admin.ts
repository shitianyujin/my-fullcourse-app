// make-admin.ts
// admin権限付与スクリプト
// npx ts-node make-admin.ts で実行可能
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // ↓↓↓ ここをあなたのメールアドレスに変えてください ↓↓↓
  const targetEmail = 'admin@gmail.com';

  const user = await prisma.user.update({
    where: { email: targetEmail },
    data: { isAdmin: true },
  });

  console.log(`Success! User ${user.name} (${user.email}) is now an Admin.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });