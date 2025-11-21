import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// リクエストボディの型定義
interface ContactRequestBody {
  type: 'REQUEST' | 'BUG_REPORT' | 'ACCOUNT' | 'PRODUCT_REQUEST' | 'OTHER';
  title: string;
  details: string;
  // 未ログイン時用
  name?: string;
  email?: string;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body: ContactRequestBody = await request.json();

    const { type, title, details, name, email } = body;

    // 必須チェック
    if (!type || !title || !details) {
      return NextResponse.json(
        { message: '必須項目が不足しています。' },
        { status: 400 }
      );
    }

    // ログインしている場合: userIdを紐付け、メルアドはDBから引く
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (user) {
        await prisma.contactSubmission.create({
          data: {
            userId: user.id,
            submitterEmail: user.email, // 念のため保存
            type,
            title,
            details,
          },
        });
        return NextResponse.json({ message: '送信しました。' });
      }
    }

    // 未ログインの場合: 入力された名前とメアドを使用
    if (!email) {
      return NextResponse.json(
        { message: 'メールアドレスは必須です。' },
        { status: 400 }
      );
    }

    await prisma.contactSubmission.create({
      data: {
        submitterName: name || 'ゲスト',
        submitterEmail: email,
        type,
        title,
        details,
      },
    });

    return NextResponse.json({ message: '送信しました。' });

  } catch (error) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { message: '送信中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}