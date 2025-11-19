// app/api/courses/[courseId]/comments/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/courses/[courseId]/comments
 * コースに紐づくコメント一覧を取得する
 */
export async function GET(
    request: Request,
    { params }: { params: { courseId: string } }
) {
    const courseId = parseInt(params.courseId, 10);

    if (isNaN(courseId)) {
        return NextResponse.json({ message: "無効なコースIDです。" }, { status: 400 });
    }

    try {
        const comments = await prisma.comment.findMany({
            where: { courseId: courseId },
            orderBy: { createdAt: 'desc' }, // 新しいコメントを上に表示
            include: {
                user: {
                    select: { id: true, name: true, image: true },
                },
            },
        });

        return NextResponse.json(comments);

    } catch (error) {
        console.error("コメント取得エラー:", error);
        return NextResponse.json(
            { message: "コメント一覧の取得に失敗しました。" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/courses/[courseId]/comments
 * コメントを投稿する
 */
export async function POST(
    request: Request,
    { params }: { params: { courseId: string } }
) {
    const session = await getServerSession(authOptions);
    
    // 認証チェック
    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "ログインが必要です。" }, { status: 401 });
    }

    const courseId = parseInt(params.courseId, 10);
    const { content } = await request.json();

    if (isNaN(courseId) || !content || content.trim() === "") {
        return NextResponse.json({ message: "無効なデータです。" }, { status: 400 });
    }
    
    try {
        // ユーザーIDの取得
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ message: "ユーザーが見つかりません。" }, { status: 404 });
        }

        // コメントの作成
        const newComment = await prisma.comment.create({
            data: {
                courseId: courseId,
                userId: user.id,
                content: content,
            },
            include: {
                user: {
                    select: { id: true, name: true, image: true },
                },
            },
        });

        return NextResponse.json(newComment, { status: 201 });

    } catch (error) {
        console.error("コメント投稿エラー:", error);
        return NextResponse.json(
            { message: "コメントの投稿に失敗しました。" },
            { status: 500 }
        );
    }
}