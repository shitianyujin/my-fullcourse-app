// app/api/courses/[courseId]/rating/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/**
 * POST /api/courses/[courseId]/rating
 * ユーザーが特定のコースを評価するAPI
 */
export async function POST(
    request: Request,
    { params }: { params: { courseId: string } }
) {
    const session = await getServerSession(authOptions);
    
    // 1. 認証チェック
    if (!session || !session.user || !session.user.email) {
        return NextResponse.json(
            { message: "ログインが必要です。" },
            { status: 401 }
        );
    }
    
    const courseId = parseInt(params.courseId, 10);
    const body = await request.json();
    const score = parseInt(body.score, 10); // 評価スコア (1-5)

    // 2. 入力値チェック
    if (isNaN(courseId) || isNaN(score) || score < 1 || score > 5) {
        return NextResponse.json({ message: "無効な評価スコアまたはコースIDです。" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
    });
    if (!user) {
        return NextResponse.json({ message: "ユーザーが見つかりません。" }, { status: 404 });
    }
    const userId = user.id;

    try {
        // 3. 既存の評価レコードをチェック
        const existingRating = await prisma.rating.findUnique({
            where: {
                courseId_userId: { 
                    courseId: courseId,
                    userId: userId,
                },
            },
        });

        let updatedRating: number;

        if (existingRating) {
            // --- 既に存在する場合: 更新 ---
            const result = await prisma.rating.update({
                where: {
                    courseId_userId: { 
                        courseId: courseId,
                        userId: userId,
                    },
                },
                data: { score: score },
            });
            updatedRating = result.score;
            
        } else {
            // --- 存在しない場合: 新規作成 ---
            const result = await prisma.rating.create({
                data: {
                    userId: userId,
                    courseId: courseId,
                    score: score,
                },
            });
            updatedRating = result.score;
        }

        // 4. 新しい評価総数と平均評価を計算し、返却
        const ratings = await prisma.rating.findMany({
            where: { courseId: courseId },
            select: { score: true }
        });
        
        const totalRatings = ratings.length;
        const sum = ratings.reduce((acc, r) => acc + r.score, 0);
        const averageRating = totalRatings > 0 ? sum / totalRatings : null;


        return NextResponse.json({ 
            score: updatedRating, 
            averageRating: averageRating,
            totalRatingsCount: totalRatings
        });

    } catch (error) {
        console.error("Rating処理中にエラーが発生しました:", error);
        return NextResponse.json(
            { message: "サーバーエラーにより処理に失敗しました。" },
            { status: 500 }
        );
    }
}