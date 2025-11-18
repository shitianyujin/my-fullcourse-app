// app/api/courses/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// フルコース投稿リクエストボディの型定義
interface CourseItemData {
  productId: number;
  role: string; 
}

interface CourseCreateRequest {
  title: string;
  description: string;
  image: string;
  courseItems: CourseItemData[];
}

/**
 * POST /api/courses
 * フルコースの投稿と、関連する CourseItem の登録を行うAPI
 */
export async function POST(request: Request) {
  
  // ----------------------------------------------------
  // 1. 認証保護 (ログインチェック)
  // ----------------------------------------------------
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.email) {
    return NextResponse.json(
      { message: "投稿にはログインが必要です。" },
      { status: 401 }
    );
  }
  
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, courseCount: true }
  });

  if (!currentUser) {
    return NextResponse.json(
      { message: "ユーザー情報が見つかりません。" },
      { status: 404 }
    );
  }

  const userId = currentUser.id;
  const currentCourseCount = currentUser.courseCount;
  
  // ----------------------------------------------------
  // 2. リクエストボディの取得とバリデーション
  // ----------------------------------------------------
  const body: CourseCreateRequest = await request.json();
  const { title, description, image, courseItems } = body;

  if (!title || !description || !courseItems || courseItems.length === 0) {
    return NextResponse.json(
      { message: "タイトル、説明、コース構成要素は必須です。" },
      { status: 400 }
    );
  }

  try {
    // ----------------------------------------------------
    // 3. トランザクション処理
    // ----------------------------------------------------
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Course レコードの作成
      const newCourse = await tx.course.create({
        data: {
          title,
          description,
          userId: userId, 
        },
      });

      // 2. 複数の CourseItem レコードの作成
      const courseItemCreations = courseItems.map((item, index) => 
        tx.courseItem.create({
          data: { 
            courseId: newCourse.id,
            productId: item.productId,
            role: item.role, 
            order: index + 1,
          },
        })
      );

      await Promise.all(courseItemCreations);

      // 3. User の投稿カウントをインクリメント
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          courseCount: currentCourseCount + 1,
        },
      });

      return { newCourse, updatedUser };
    });

    return NextResponse.json(
      { 
        message: "フルコース投稿と関連データの登録が成功しました。",
        courseId: result.newCourse.id,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("フルコース投稿トランザクション中にエラーが発生しました:", error);
    return NextResponse.json(
      { message: "フルコースの登録に失敗しました。サーバーログを確認してください。" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/courses
 * 最新のフルコース一覧を取得するAPI
 * (ページネーション対応: ?page=1&limit=10)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;

  try {
    // コース一覧を取得 (作成日時の新しい順)
    const courses = await prisma.course.findMany({
      take: limit,
      skip: skip,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, image: true },
        },
        // 一覧表示用に、コース内のアイテム（特に画像）を一部取得
        courseItems: {
          orderBy: { order: 'asc' },
          take: 4, // サムネイルとして最大4つまで製品画像を表示
          include: {
            product: {
              select: { imageUrl: true },
            },
          },
        },
      },
    });

    const total = await prisma.course.count();

    return NextResponse.json({
      courses,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("コース一覧取得エラー:", error);
    return NextResponse.json(
      { message: "コースの取得に失敗しました。" },
      { status: 500 }
    );
  }
}