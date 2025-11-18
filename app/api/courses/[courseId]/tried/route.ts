// app/api/courses/[courseId]/tried/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/courses/[courseId]/tried
 * ユーザーが特定のコースを「食べた」リストに追加・削除するAPI
 */
export async function POST(
    request: Request,
    { params }: { params: { courseId: string } }
) {
    const session = await getServerSession(authOptions);
    
    // ----------------------------------------------------
    // 1. 認証チェック
    // ----------------------------------------------------
    if (!session || !session.user || !session.user.email) {
        return NextResponse.json(
            { message: "ログインが必要です。" },
            { status: 401 }
        );
    }
    
    const courseId = parseInt(params.courseId, 10);
    
    // ----------------------------------------------------
    // 2. ユーザーIDとコースIDの確認
    // ----------------------------------------------------
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });

    if (!user) {
        return NextResponse.json({ message: "ユーザーが見つかりません。" }, { status: 404 });
    }
    if (isNaN(courseId)) {
        return NextResponse.json({ message: "無効なコースIDです。" }, { status: 400 });
    }

    const userId = user.id;

    try {
        // ----------------------------------------------------
        // 3. 既存の Tried レコードをチェック
        // ----------------------------------------------------
        const existingRecord = await prisma.tried.findUnique({
            where: {
                // schema.prisma の定義 (courseId, userId) に合わせる
                courseId_userId: { 
                    courseId: courseId,
                    userId: userId,
                },
            },
        });

        if (existingRecord) {
            // --- 既に存在する場合: 削除（食べたを解除）---
            await prisma.$transaction([
                // 1. Tried レコードの削除
                prisma.tried.delete({
                    where: {
                        courseId_userId: { 
                            courseId: courseId,
                            userId: userId,
                        },
                    },
                }),
                // 2. Course の triedCount をデクリメント
                prisma.course.update({
                    where: { id: courseId },
                    data: { triedCount: { decrement: 1 } },
                }),
            ]);
            
            return NextResponse.json(
                { added: false, message: "「食べた」を解除しました。" }
            );

        } else {
            // --- 存在しない場合: 作成（食べたに追加）---
            await prisma.$transaction([
                // 1. Tried レコードの作成
                prisma.tried.create({
                    data: {
                        userId: userId,
                        courseId: courseId,
                    },
                }),
                // 2. Course の triedCount をインクリメント
                prisma.course.update({
                    where: { id: courseId },
                    data: { triedCount: { increment: 1 } },
                }),
            ]);
            
            return NextResponse.json(
                { added: true, message: "「食べた」に追加しました。" }
            );
        }

    } catch (error) {
        console.error("Tried処理中にエラーが発生しました:", error);
        return NextResponse.json(
            { message: "サーバーエラーにより処理に失敗しました。" },
            { status: 500 }
        );
    }
}