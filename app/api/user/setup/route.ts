// app/api/user/setup/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import * as bcrypt from 'bcrypt';

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
        return NextResponse.json({ message: '認証されていません' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, password } = body;

        if (!name || !password) {
            return NextResponse.json({ message: '名前とパスワードは必須です' }, { status: 400 });
        }

        // パスワードをハッシュ化
        const hashedPassword = await bcrypt.hash(password, 12);

        // ユーザー情報を更新
        await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name: name,
                hashedPassword: hashedPassword,
            },
        });

        return NextResponse.json({ message: '設定完了' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'エラーが発生しました' }, { status: 500 });
    }
}