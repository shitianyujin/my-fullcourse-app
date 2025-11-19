// app/api/courses/[courseId]/route.ts (完全なGET関数とPOST関数)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/courses/[courseId]
 * 特定のフルコースの詳細を取得するAPI
 */
export async function GET(
    request: Request,
    { params }: { params: { courseId: string } }
) {
    const courseId = parseInt(params.courseId, 10);
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email 
        ? (await prisma.user.findUnique({ 
            where: { email: session.user.email }, 
            select: { id: true } 
        }))?.id 
        : null;

    if (isNaN(courseId)) {
        return NextResponse.json({ message: "無効なIDです。" }, { status: 400 });
    }

    try {
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                user: {
                    select: { id: true, name: true, image: true },
                },
                courseItems: {
                    orderBy: { order: 'asc' },
                    include: {
                        product: true,
                    },
                },
                ratings: {
                    select: { score: true }
                }
            },
        });

        if (!course) {
            return NextResponse.json({ message: "コースが見つかりません。" }, { status: 404 });
        }

        // ----------------------------------------------------
        // ユーザー固有の状態チェック
        // ----------------------------------------------------
        let isWantsToEat = false;
        let isTried = false;
        let userRatingScore: number | null = null; 

        if (userId) {
            // 食べたいチェック
            const wantsToEatRecord = await prisma.wantsToEat.findUnique({
                where: { courseId_userId: { courseId: courseId, userId: userId } },
            });
            isWantsToEat = !!wantsToEatRecord;

            // 食べたチェック
            const triedRecord = await prisma.tried.findUnique({
                where: { courseId_userId: { courseId: courseId, userId: userId } },
            });
            isTried = !!triedRecord;
            
            // ユーザーの評価チェック
            const userRatingRecord = await prisma.rating.findUnique({
                where: { courseId_userId: { courseId: courseId, userId: userId } },
                select: { score: true }
            });
            userRatingScore = userRatingRecord ? userRatingRecord.score : null;
        }

        // ----------------------------------------------------
        // 平均評価の計算
        // ----------------------------------------------------
        let averageRating: number | null = null;
        const totalRatings = course.ratings.length;

        if (totalRatings > 0) {
            const sum = course.ratings.reduce((acc, rating) => acc + rating.score, 0);
            averageRating = sum / totalRatings;
        }

        // ----------------------------------------------------
        // 返却データ
        // ----------------------------------------------------
        return NextResponse.json({
            ...course,
            averageRating: averageRating,
            isWantsToEat: isWantsToEat,
            isTried: isTried,
            userRatingScore: userRatingScore,
            totalRatingsCount: totalRatings,
            ratings: undefined, 
        });

    } catch (error) {
        console.error("コース詳細取得エラー:", error);
        return NextResponse.json(
            { message: "コース詳細の取得に失敗しました。" },
            { status: 500 }
        );
    }
}