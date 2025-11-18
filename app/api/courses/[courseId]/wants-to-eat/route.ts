// app/api/courses/[courseId]/wants-to-eat/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/courses/[courseId]/wants-to-eat
 * ユーザーが特定のコースを「食べたい」リストに追加・削除するAPI
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
        // 3. 既存の WantsToEat レコードをチェック
        // ----------------------------------------------------
        const existingRecord = await prisma.wantsToEat.findUnique({
            where: {
                courseId_userId: {
                    userId: userId,
                    courseId: courseId,
                },
            },
        });

        if (existingRecord) {
            // --- 既に存在する場合: 削除（食べたいを解除）---
            await prisma.$transaction([
                // 1. WantsToEat レコードの削除
                prisma.wantsToEat.delete({
                    where: {
                        courseId_userId: {
                            userId: userId,
                            courseId: courseId,
                        },
                    },
                }),
                // 2. Course の wantsToEatCount をデクリメント
                prisma.course.update({
                    where: { id: courseId },
                    data: { wantsToEatCount: { decrement: 1 } },
                }),
            ]);
            
            return NextResponse.json(
                { added: false, message: "「食べたい」を解除しました。" }
            );

        } else {
            // --- 存在しない場合: 作成（食べたいに追加）---
            await prisma.$transaction([
                // 1. WantsToEat レコードの作成
                prisma.wantsToEat.create({
                    data: {
                        userId: userId,
                        courseId: courseId,
                    },
                }),
                // 2. Course の wantsToEatCount をインクリメント
                prisma.course.update({
                    where: { id: courseId },
                    data: { wantsToEatCount: { increment: 1 } },
                }),
            ]);
            
            return NextResponse.json(
                { added: true, message: "「食べたい」に追加しました。" }
            );
        }

    } catch (error) {
        console.error("WantsToEat処理中にエラーが発生しました:", error);
        return NextResponse.json(
            { message: "サーバーエラーにより処理に失敗しました。" },
            { status: 500 }
        );
    }
}