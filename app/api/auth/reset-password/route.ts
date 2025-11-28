// app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcrypt';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    // トークン検証
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({ message: '無効なトークンです' }, { status: 400 });
    }

    if (new Date() > resetToken.expires) {
      return NextResponse.json({ message: 'トークンの有効期限が切れています' }, { status: 400 });
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザー更新
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { hashedPassword },
    });

    // 使用済みトークン削除
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    return NextResponse.json({ message: 'パスワードを変更しました' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'エラーが発生しました' }, { status: 500 });
  }
}