// app/api/user/[userId]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Decimal } from '@prisma/client/runtime/library';

export const dynamic = 'force-dynamic';

interface Params {
    userId: string;
}

/**
 * GET: ユーザー情報とその投稿コース一覧を取得
 */
export async function GET(
    request: Request,
    { params }: { params: Params }
) {
    const userId = parseInt(params.userId, 10);

    if (isNaN(userId)) {
        return NextResponse.json(
            { message: "無効なユーザーIDです。" },
            { status: 400 }
        );
    }

    try {
        // セッション取得（現在のログインユーザー）
        const session = await getServerSession(authOptions);
        const currentUserEmail = session?.user?.email;
        
        let currentUserId: number | null = null;
        if (currentUserEmail) {
            const currentUser = await prisma.user.findUnique({
                where: { email: currentUserEmail },
                select: { id: true }
            });
            currentUserId = currentUser?.id || null;
        }

        // ユーザー情報取得
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                image: true,
                bio: true,
                courseCount: true,
                createdAt: true,
            }
        });

        if (!user) {
            return NextResponse.json(
                { message: "ユーザーが見つかりません。" },
                { status: 404 }
            );
        }

        // ユーザーが投稿したコース一覧を取得
        const courses = await prisma.course.findMany({
            where: { userId: userId },
            select: {
                id: true,
                title: true,
                description: true,
                wantsToEatCount: true,
                triedCount: true,
                createdAt: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                },
                _count: {
                    select: {
                        courseItems: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // データを整形（評価をリアルタイムで集計）
        const formattedCourses = await Promise.all(courses.map(async (course) => {
            // 各コースの評価を集計
            const ratingStats = await prisma.rating.aggregate({
                _avg: { score: true },
                _count: { score: true },
                where: { courseId: course.id }
            });

            let averageRatingNumber: number | null = null;
            
            // 平均評価のDecimal型をNumberに安全に変換（コース詳細APIと同じ処理）
            if (ratingStats._avg.score) {
                const avgScoreValue = ratingStats._avg.score as unknown;
                averageRatingNumber = avgScoreValue instanceof Decimal 
                    ? parseFloat((avgScoreValue as Decimal).toFixed(1)) // 小数点1桁
                    : (avgScoreValue as number);
            }

            return {
                id: course.id,
                title: course.title,
                description: course.description,
                averageRating: averageRatingNumber, // リアルタイム集計
                totalRatingsCount: ratingStats._count.score, // リアルタイム集計
                wantsToEatCount: course.wantsToEatCount,
                triedCount: course.triedCount,
                createdAt: course.createdAt,
                user: course.user,
                _count: {
                    courseItems: course._count.courseItems
                }
            };
        }));

        return NextResponse.json({
            user,
            courses: formattedCourses,
            isOwnProfile: currentUserId === userId
        });

    } catch (error) {
        console.error("ユーザー情報取得エラー:", error);
        return NextResponse.json(
            { message: "ユーザー情報の取得中にエラーが発生しました。" },
            { status: 500 }
        );
    }
}