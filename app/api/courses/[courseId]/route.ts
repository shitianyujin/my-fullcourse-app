import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Decimal } from '@prisma/client/runtime/library'; 

interface Params {
    courseId: string;
}

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
        // 💡 ユーザーIDを取得できたらセット
        userId = userRecord?.id ?? null;
    }

    if (isNaN(courseId)) {
        return NextResponse.json({ message: "無効なIDです。" }, { status: 400 });
    }

    try {
        // ----------------------------------------------------
        // 1. コース情報の取得
        // ----------------------------------------------------
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
        
        // ----------------------------------------------------
        // 2. 評価の集計を Prisma に依頼 (Aggregation)
        // ----------------------------------------------------
        const ratingStats = await prisma.rating.aggregate({
            _avg: { score: true },
            _count: { score: true },
            where: { courseId: courseId }
        });
        
        let averageRatingCalculated: number | null = null;
        let totalRatings = ratingStats._count.score;

        // 平均評価のDecimal型をNumberに安全に変換
        if (ratingStats._avg.score) {
            const avgScoreValue = ratingStats._avg.score as unknown;
            averageRatingCalculated = avgScoreValue instanceof Decimal 
                ? parseFloat(avgScoreValue.toFixed(2)) // 小数点以下2桁に丸めてNumberに変換
                : (avgScoreValue as number);
        }

        console.log(`[API Debug] DB Raw Avg: ${ratingStats._avg.score}, Calculated Avg: ${averageRatingCalculated}, Total Ratings: ${totalRatings}`);
        
        // ----------------------------------------------------
        // 3. ユーザー固有の状態チェック
        // ----------------------------------------------------
        let isWantsToEat = false;
        let isTried = false;
        let userRatingScore: number | null = null; 

        if (userId !== null) { // 💡 userIdがnullでないことを確認
            const wantsToEatRecord = await prisma.wantsToEat.findUnique({
                where: { courseId_userId: { courseId: courseId, userId: userId } },
            });
            isWantsToEat = !!wantsToEatRecord;

            const triedRecord = await prisma.tried.findUnique({
                where: { courseId_userId: { courseId: courseId, userId: userId } },
            });
            isTried = !!triedRecord;
            
            // ユーザーの評価チェック
            const userRatingRecord = await prisma.rating.findUnique({
                where: { courseId_userId: { courseId: courseId, userId: userId } },
                select: { score: true }
            });

            if (userRatingRecord && userRatingRecord.score !== null) {
                const scoreValue = userRatingRecord.score as unknown; 
                // 💡 Decimal型またはnumber型から安全に整数値を取得
                userRatingScore = scoreValue instanceof Decimal 
                    ? scoreValue.toNumber() // Decimalを数値に変換
                    : (scoreValue as number);
                
                // 💡 スコアが整数であることを保証
                userRatingScore = Math.round(userRatingScore); 
            }

            console.log(`[API Debug] Logged-in User ID: ${userId}, User Rating Score: ${userRatingScore}`);
        }

        // ----------------------------------------------------
        // 4. 返却データ
        // ----------------------------------------------------
        
        const { 
            averageRating: _, 
            totalRatingsCount: __, 
            ...restOfCourse 
        } = course as any; 

        return NextResponse.json({
            ...restOfCourse,
            
            // 💡 Aggregationの結果を反映
            averageRating: averageRatingCalculated,
            totalRatingsCount: totalRatings, 
            
            // 💡 カウントフィールドはcourseから取得
            wantsToEatCount: Math.max(0, course.wantsToEatCount ?? 0),
            triedCount: Math.max(0, course.triedCount ?? 0),
            commentCount: Math.max(0, course.commentCount ?? 0),

            isWantsToEat: isWantsToEat,
            isTried: isTried,
            userRatingScore: userRatingScore, // 💡 ログインユーザーの評価スコアを返す
        });

    } catch (error) {
        console.error("コース詳細取得エラー:", error);
        return NextResponse.json(
            { message: "コース詳細の取得に失敗しました。" },
            { status: 500 }
        );
    }
}