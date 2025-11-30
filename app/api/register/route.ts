// app/api/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, userId, code } = body;

    // 必須チェック
    if (!name || !email || !password || !userId || !code) {
      return NextResponse.json({ message: '必須項目が不足しています' }, { status: 400 });
    }

    // 1. メールアドレス重複チェック
    const existingUserEmail = await prisma.user.findUnique({ where: { email } });
    if (existingUserEmail) {
      return NextResponse.json({ message: 'このメールアドレスは既に登録されています' }, { status: 409 });
    }

    // 2. ユーザーID重複チェック
    const existingUserId = await prisma.user.findUnique({ where: { userId } });
    if (existingUserId) {
      return NextResponse.json({ message: 'このユーザーIDは既に使用されています' }, { status: 409 });
    }

    // 3. 認証コードの最終確認 (念のためDBと照合)
    const verification = await prisma.emailVerificationCode.findUnique({ where: { email } });
    if (!verification || verification.code !== code || new Date() > verification.expiresAt) {
      return NextResponse.json({ message: '認証コードが無効または期限切れです' }, { status: 400 });
    }

    // 4. パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. ユーザー作成
    await prisma.user.create({
      data: {
        userId, // 追加
        name,
        email,
        hashedPassword,
      },
    });

    // 6. 使用済み認証コードを削除
    await prisma.emailVerificationCode.delete({ where: { email } });

    return NextResponse.json({ message: '登録完了' });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'エラーが発生しました' }, { status: 500 });
  }
}