// app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// 1. 自分のプロフィールを取得 (Navbar等で使用中)
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true, // 自己紹介文も取得
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}

// 2. 自分のプロフィールを更新 (💡今回追加)
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, bio, image } = body;

    // 更新処理
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        bio,
        image,
      },
    });

    return NextResponse.json({
      message: 'Profile updated',
      user: {
        name: updatedUser.name,
        image: updatedUser.image,
        bio: updatedUser.bio,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: 'Update failed' }, { status: 500 });
  }
}