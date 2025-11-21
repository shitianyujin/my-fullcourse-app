// app/api/courses/[courseId]/rating/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from 'next/cache'; 

export const dynamic = 'force-dynamic'; 

interface Params {
    courseId: string;
}

/**
 * ヘルパー関数: 認証とユーザーIDの取得
 */
async function getAuthData() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return { error: "ログインが必要です。", status: 401 };
    }

    const userRecord = await prisma.user.findUnique({ 
        where: { email: session.user.email }, 
        select: { id: true } 
    });
    const userId = userRecord?.id;

    if (!userId) {
        return { error: "ユーザーが見つかりません。", status: 404 };
    }
    
    return { userId };
}

/**
 * POST: 評価を送信 (作成または更新)
 */
export async function POST(
    request: Request,
    { params }: { params: Params }
) {
    const courseId = parseInt(params.courseId, 10);
    
    const authResult = await getAuthData();
    if (authResult.error) {
        return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    const userId = authResult.userId as number;

    if (isNaN(courseId)) {
        return NextResponse.json({ message: "無効なコースIDです。" }, { status: 400 });
    }

    try {
        const body = await request.json();
        const score = parseInt(body.score, 10); 
        
        if (isNaN(score) || score < 1 || score > 5) {
            return NextResponse.json({ message: "スコアは1から5の整数である必要があります。" }, { status: 400 });
        }

        // ⭐️ 修正: 既存の評価を検索
        const existingRating = await prisma.rating.findUnique({
            where: {
                courseId_userId: {
                    courseId: courseId,
                    userId: userId,
                },
            },
        });

        let rating;
        if (existingRating) {
            // 更新
            rating = await prisma.rating.update({
                where: {
                    id: existingRating.id,
                },
                data: {
                    score: score,
                    updatedAt: new Date(),
                },
            });
        } else {
            // 新規作成
            rating = await prisma.rating.create({
                data: {
                    courseId: courseId,
                    userId: userId,
                    score: score,
                },
            });
        }

        // ⭐️ 追加: コースの平均評価と評価数を計算
        const ratings = await prisma.rating.findMany({
            where: { courseId: courseId },
            select: { score: true },
        });

        const totalRatingsCount = ratings.length;
        const averageRating = totalRatingsCount > 0
            ? ratings.reduce((sum, r) => sum + r.score, 0) / totalRatingsCount
            : 0;

        // キャッシュ無効化
        revalidatePath(`/course/${courseId}`);
        revalidatePath(`/api/courses/${courseId}`);
        
        // ⭐️ 修正: フロントエンドが期待するデータを返す
        return NextResponse.json({ 
            success: true, 
            message: "評価が正常に送信されました。",
            score: rating.score,
            averageRating: averageRating,
            totalRatingsCount: totalRatingsCount,
        });

    } catch (error) {
        console.error("評価送信エラー:", error);
        return NextResponse.json(
            { message: "評価の送信中に予期せぬエラーが発生しました。" },
            { status: 500 }
        );
    }
}

/**
 * DELETE: 評価を削除 (評価の取り消し)
 */
export async function DELETE(
    request: Request,
    { params }: { params: Params }
) {
    const courseId = parseInt(params.courseId, 10);
    
    const authResult = await getAuthData();
    if (authResult.error) {
        return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    }
    const userId = authResult.userId as number;

    if (isNaN(courseId)) {
        return NextResponse.json({ message: "無効なコースIDです。" }, { status: 400 });
    }

    try {
        // ⭐️ 修正: 既存の評価を検索してから削除
        const existingRating = await prisma.rating.findUnique({
            where: {
                courseId_userId: {
                    courseId: courseId,
                    userId: userId,
                },
            },
        });

        if (!existingRating) {
            return NextResponse.json({ 
                message: "削除対象の評価が見つかりませんでした。", 
                success: true 
            }, { status: 200 });
        }

        await prisma.rating.delete({
            where: {
                id: existingRating.id,
            },
        });
        
        // キャッシュ無効化
        revalidatePath(`/course/${courseId}`);
        revalidatePath(`/api/courses/${courseId}`);

        return NextResponse.json({ 
            success: true, 
            message: "評価が正常に取り消されました。",
        });

    } catch (error: any) {
        console.error("評価削除エラー:", error);
        return NextResponse.json(
            { message: "評価の削除中に予期せぬエラーが発生しました。" },
            { status: 500 }
        );
    }
}