// app/api/courses/[courseId]/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Decimal } from '@prisma/client/runtime/library'; 

interface Params {
    courseId: string;
}

// ====================================================================
// GET: コース詳細取得 (既存のコード - 変更なし)
// ====================================================================
export async function GET(
    request: Request,
    { params }: { params: Params }
) {
    const courseId = parseInt(params.courseId, 10);
    
    // 認証情報の取得
    const session = await getServerSession(authOptions);
    let userId: number | null = null;
    
    if (session?.user?.email) {
        const userRecord = await prisma.user.findUnique({ 
            where: { email: session.user.email }, 
            select: { id: true } 
        });
        userId = userRecord?.id ?? null;
    }

    if (isNaN(courseId)) {
        return NextResponse.json({ message: "無効なIDです。" }, { status: 400 });
    }

    try {
        // 1. コース情報の取得
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                user: { select: { id: true, name: true, image: true } },
                courseItems: { orderBy: { order: 'asc' }, include: { product: true } },
            },
        });

        if (!course) {
            return NextResponse.json({ message: "コースが見つかりません。" }, { status: 404 });
        }
        
        // 2. 評価の集計
        const ratingStats = await prisma.rating.aggregate({
            _avg: { score: true },
            _count: { score: true },
            where: { courseId: courseId }
        });
        
        let averageRatingCalculated: number | null = null;
        let totalRatings = ratingStats._count.score;

        if (ratingStats._avg.score) {
            const avgScoreValue = ratingStats._avg.score as unknown;
            averageRatingCalculated = avgScoreValue instanceof Decimal 
                ? parseFloat(avgScoreValue.toFixed(2))
                : (avgScoreValue as number);
        }

        // 3. ユーザー固有の状態チェック
        let isWantsToEat = false;
        let isTried = false;
        let userRatingScore: number | null = null; 

        if (userId !== null) { 
            const wantsToEatRecord = await prisma.wantsToEat.findUnique({
                where: { courseId_userId: { courseId: courseId, userId: userId } },
            });
            isWantsToEat = !!wantsToEatRecord;

            const triedRecord = await prisma.tried.findUnique({
                where: { courseId_userId: { courseId: courseId, userId: userId } },
            });
            isTried = !!triedRecord;
            
            const userRatingRecord = await prisma.rating.findUnique({
                where: { courseId_userId: { courseId: courseId, userId: userId } },
                select: { score: true }
            });

            if (userRatingRecord && userRatingRecord.score !== null) {
                const scoreValue = userRatingRecord.score as unknown; 
                userRatingScore = scoreValue instanceof Decimal 
                    ? scoreValue.toNumber() 
                    : (scoreValue as number);
                userRatingScore = Math.round(userRatingScore); 
            }
        }

        // 4. 返却データ
        const { 
            averageRating: _, 
            totalRatingsCount: __, 
            ...restOfCourse 
        } = course as any; 

        return NextResponse.json({
            ...restOfCourse,
            averageRating: averageRatingCalculated,
            totalRatingsCount: totalRatings, 
            wantsToEatCount: Math.max(0, course.wantsToEatCount ?? 0),
            triedCount: Math.max(0, course.triedCount ?? 0),
            commentCount: Math.max(0, course.commentCount ?? 0),
            isWantsToEat: isWantsToEat,
            isTried: isTried,
            userRatingScore: userRatingScore, 
        });

    } catch (error) {
        console.error("コース詳細取得エラー:", error);
        return NextResponse.json(
            { message: "コース詳細の取得に失敗しました。" },
            { status: 500 }
        );
    }
}

// ====================================================================
// PUT: コース情報の更新 (新規追加)
// ====================================================================
export async function PUT(
    request: Request,
    { params }: { params: Params }
) {
    const courseId = parseInt(params.courseId, 10);
    const session = await getServerSession(authOptions);

    // 1. 認証チェック
    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }

    if (isNaN(courseId)) {
        return NextResponse.json({ message: "無効なIDです" }, { status: 400 });
    }

    // 2. 権限チェック: 投稿者本人かどうか
    const existingCourse = await prisma.course.findUnique({
        where: { id: courseId },
        include: { user: true },
    });

    if (!existingCourse) {
        return NextResponse.json({ message: "コースが見つかりません" }, { status: 404 });
    }

    // メールアドレスで本人確認（簡易的ですが安全です）
    if (existingCourse.user.email !== session.user.email) {
        return NextResponse.json({ message: "編集権限がありません" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { title, description, courseItems } = body;

        // タイトルなどは必須
        if (!title || !courseItems) {
             return NextResponse.json({ message: "入力内容に不備があります" }, { status: 400 });
        }

        // 3. 更新処理 (トランザクション)
        await prisma.$transaction(async (tx) => {
            // コース本体の更新
            await tx.course.update({
                where: { id: courseId },
                data: { title, description },
            });

            // 構成要素の洗い替え（既存を削除して作り直すのが最も安全）
            await tx.courseItem.deleteMany({
                where: { courseId: courseId },
            });

            // 新しい構成要素を登録
            if (courseItems.length > 0) {
                const newItems = courseItems.map((item: any, index: number) => ({
                    courseId: courseId,
                    productId: item.productId,
                    role: item.role,
                    order: index + 1, // 1始まり
                }));
                await tx.courseItem.createMany({
                    data: newItems,
                });
            }
        });

        return NextResponse.json({ message: "コースを更新しました" });

    } catch (error) {
        console.error("Update error:", error);
        return NextResponse.json({ message: "更新に失敗しました" }, { status: 500 });
    }
}

// ====================================================================
// DELETE: コースの削除 (新規追加)
// ====================================================================
export async function DELETE(
    request: Request,
    { params }: { params: Params }
) {
    const courseId = parseInt(params.courseId, 10);
    const session = await getServerSession(authOptions);

    // 1. 認証チェック
    if (!session || !session.user?.email) {
        return NextResponse.json({ message: "認証が必要です" }, { status: 401 });
    }

    if (isNaN(courseId)) {
        return NextResponse.json({ message: "無効なIDです" }, { status: 400 });
    }

    // 2. 権限チェック
    const existingCourse = await prisma.course.findUnique({
        where: { id: courseId },
        include: { user: true },
    });

    if (!existingCourse) {
        return NextResponse.json({ message: "コースが見つかりません" }, { status: 404 });
    }

    if (existingCourse.user.email !== session.user.email) {
        return NextResponse.json({ message: "削除権限がありません" }, { status: 403 });
    }

    try {
        // 3. 削除処理 (トランザクション)
        await prisma.$transaction(async (tx) => {
            // コース削除 (Cascade設定があれば関連データも消えますが、念のため)
            await tx.course.delete({
                where: { id: courseId },
            });

            // ユーザーの投稿数を減らす
            await tx.user.update({
                where: { id: existingCourse.userId },
                data: {
                    courseCount: { decrement: 1 },
                },
            });
        });

        return NextResponse.json({ message: "コースを削除しました" });

    } catch (error) {
        console.error("Delete error:", error);
        return NextResponse.json({ message: "削除に失敗しました" }, { status: 500 });
    }
}