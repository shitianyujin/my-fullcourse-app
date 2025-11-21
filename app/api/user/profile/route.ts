// app/api/user/profile/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * 認証済みユーザーのプロフィール情報を取得
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json(
                { message: "ログインが必要です。" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                bio: true,
            }
        });

        if (!user) {
            return NextResponse.json(
                { message: "ユーザーが見つかりません。" },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });

    } catch (error) {
        console.error("プロフィール取得エラー:", error);
        return NextResponse.json(
            { message: "プロフィールの取得中にエラーが発生しました。" },
            { status: 500 }
        );
    }
}

/**
 * プロフィール情報を更新
 */
export async function PATCH(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json(
                { message: "ログインが必要です。" },
                { status: 401 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json(
                { message: "ユーザーが見つかりません。" },
                { status: 404 }
            );
        }

        const body = await request.json();
        const { name, bio, image } = body;

        // バリデーション
        if (name && (typeof name !== 'string' || name.trim().length === 0)) {
            return NextResponse.json(
                { message: "名前を入力してください。" },
                { status: 400 }
            );
        }

        if (name && name.length > 100) {
            return NextResponse.json(
                { message: "名前は100文字以内で入力してください。" },
                { status: 400 }
            );
        }

        if (bio && typeof bio !== 'string') {
            return NextResponse.json(
                { message: "自己紹介の形式が正しくありません。" },
                { status: 400 }
            );
        }

        if (image && (typeof image !== 'string' || !image.startsWith('http'))) {
            return NextResponse.json(
                { message: "画像URLの形式が正しくありません。" },
                { status: 400 }
            );
        }

        // 更新データの準備
        const updateData: any = {};
        if (name !== undefined) updateData.name = name.trim();
        if (bio !== undefined) updateData.bio = bio.trim() || null;
        if (image !== undefined) updateData.image = image || null;

        // プロフィールを更新
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                bio: true,
            }
        });

        // キャッシュを無効化
        revalidatePath(`/profile/${user.id}`);
        revalidatePath('/profile/edit');

        return NextResponse.json({
            success: true,
            message: "プロフィールを更新しました。",
            user: updatedUser
        });

    } catch (error) {
        console.error("プロフィール更新エラー:", error);
        return NextResponse.json(
            { message: "プロフィールの更新中にエラーが発生しました。" },
            { status: 500 }
        );
    }
}
