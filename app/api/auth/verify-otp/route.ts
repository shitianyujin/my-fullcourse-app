// app/api/auth/verify-otp/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    const record = await prisma.emailVerificationCode.findUnique({
      where: { email },
    });

    if (!record) {
      return NextResponse.json({ message: 'コードが見つかりません。再送信してください。' }, { status: 400 });
    }

    if (record.code !== code) {
      return NextResponse.json({ message: '認証コードが間違っています。' }, { status: 400 });
    }

    if (new Date() > record.expiresAt) {
      return NextResponse.json({ message: '認証コードの有効期限が切れています。' }, { status: 400 });
    }

    return NextResponse.json({ message: '認証成功' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ message: 'エラーが発生しました' }, { status: 500 });
  }
}