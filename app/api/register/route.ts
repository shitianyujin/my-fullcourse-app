// app/api/register/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ message: '必須項目が不足しています' }, { status: 400 });
    }

    // 重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'このメールアドレスは既に登録されています' }, { status: 409 });
    }

    // パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザー作成
    await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });

    return NextResponse.json({ message: '登録完了' });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'エラーが発生しました' }, { status: 500 });
  }
}