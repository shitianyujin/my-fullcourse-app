// app/api/courses/[courseId]/route.ts

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/courses/[courseId]
 * 特定のフルコースの詳細情報と構成アイテムを取得するAPI
 */
export async function GET(
    request: Request,
    { params }: { params: { courseId: string } }
) {
    const courseId = params.courseId;

    if (!courseId) {
        return NextResponse.json(
            { message: "コースIDは必須です。" },
            { status: 400 } // Bad Request
        );
    }

    // IDが数値であることを確認
    const id = parseInt(courseId, 10);
    if (isNaN(id)) {
        return NextResponse.json(
            { message: "無効なコースIDです。" },
            { status: 400 }
        );
    }

    try {
        const course = await prisma.course.findUnique({
            where: { id: id },
            // 💡 関連データを結合して取得
            include: {
                user: { // 作成者
                    select: { id: true, name: true, email: true },
                },
                courseItems: {
                    orderBy: { order: 'asc' }, // 順番通りに
                    include: {
                        product: { // 製品情報
                            select: { 
                                id: true, 
                                name: true, 
                                imageUrl: true, 
                                priceReference: true,
                                manufacturer: true, // 💡 メーカー情報も取得
                            },
                        },
                    },
                },
            },
        });

        if (!course) {
            return NextResponse.json(
                { message: "指定されたフルコースは見つかりませんでした。" },
                { status: 404 } // Not Found
            );
        }

        return NextResponse.json(course);

    } catch (error) {
        console.error("コース取得中にエラーが発生しました:", error);
        return NextResponse.json(
            { message: "サーバーエラーによりコースの取得に失敗しました。" },
            { status: 500 }
        );
    }
}