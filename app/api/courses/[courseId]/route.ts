// app/api/courses/[courseId]/route.ts (GET関数全体)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// ... (POST関数は省略) ...

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
            },
        });

        if (!course) {
            return NextResponse.json({ message: "コースが見つかりません。" }, { status: 404 });
        }

        // ログインユーザーが既に「食べたい」しているかチェック
        let isWantsToEat = false;
        let isTried = false; // 💡 追加

        if (userId) {
            const wantsToEatRecord = await prisma.wantsToEat.findUnique({
                where: {
                    courseId_userId: { 
                        courseId: courseId,
                        userId: userId,
                    },
                },
            });
            isWantsToEat = !!wantsToEatRecord;

            // 💡 ログインユーザーが既に「食べた」しているかチェック
            const triedRecord = await prisma.tried.findUnique({
                where: {
                    courseId_userId: { 
                        courseId: courseId,
                        userId: userId,
                    },
                },
            });
            isTried = !!triedRecord;
        }

        return NextResponse.json({
            ...course,
            isWantsToEat: isWantsToEat,
            isTried: isTried, // 💡 状態を追加
        });

    } catch (error) {
        console.error("コース詳細取得エラー:", error);
        return NextResponse.json(
            { message: "コース詳細の取得に失敗しました。" },
            { status: 500 }
        );
    }
}