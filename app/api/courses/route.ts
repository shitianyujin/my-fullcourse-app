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
    // ログインしていない、またはユーザー情報がない場合は拒否
    return NextResponse.json(
      { message: "投稿にはログインが必要です。" },
      { status: 401 } // Unauthorized
    );
  }
  
  // データベースから現在のユーザーIDを取得
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

  // ログインユーザーのIDと現在の投稿数
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
      { status: 400 } // Bad Request
    );
  }

  try {
    // ----------------------------------------------------
    // 3. トランザクション処理 (複数のDB操作を原子的に実行)
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
            order: index + 1, // 順番は1から開始
          },
        })
      );

      // 全ての CourseItem の作成を待機
      await Promise.all(courseItemCreations);

      // 3. User の投稿カウントをインクリメント
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          courseCount: currentCourseCount + 1,
        },
      });

      return { newCourse, updatedUser };
    }); // $transaction 終了

    // 4. 成功レスポンス
    return NextResponse.json(
      { 
        message: "フルコース投稿と関連データの登録が成功しました。",
        courseId: result.newCourse.id,
      },
      { status: 201 } // Created
    );

  } catch (error) {
    console.error("フルコース投稿トランザクション中にエラーが発生しました:", error);
    // トランザクション内でエラーが発生した場合、自動的にロールバックされます
    return NextResponse.json(
      { message: "フルコースの登録に失敗しました。サーバーログを確認してください。" },
      { status: 500 }
    );
  }
}

// 他のメソッド（GET, PUT, DELETE）も必要に応じて追加します。