// app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid'; // crypto.randomUUID() でも可

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // セキュリティのため、ユーザーが存在しなくても成功したフリをする
      return NextResponse.json({ message: '送信しました' });
    }

    // トークン生成
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 1000 * 60 * 60 * 24); // 24時間有効

    // DBに保存
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // ---------------------------------------------------------
    // 💡 【重要】メール送信機能がないための代替措置
    // 本来はここでSendGridなどでメールを送る
    // ---------------------------------------------------------
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    console.log("========================================");
    console.log("【開発用】パスワードリセットリンク:");
    console.log(resetLink);
    console.log("========================================");

    // 開発用にレスポンスにも含めてしまう（本番では絶対NG）
    return NextResponse.json({ 
        message: 'リセットリンクを発行しました', 
        devLink: resetLink // 開発用
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'エラーが発生しました' }, { status: 500 });
  }
}