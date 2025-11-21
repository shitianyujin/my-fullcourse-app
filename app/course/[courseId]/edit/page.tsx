// app/course/[courseId]/edit/page.tsx
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CourseForm } from "@/components/CourseForm";

interface PageProps {
  params: {
    courseId: string;
  };
}

// データを取得する関数
async function getCourseForEdit(courseId: number) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      user: true,
      courseItems: {
        include: {
          product: true, // 商品情報（名前、画像、メーカー）も必要
        },
        orderBy: {
            order: 'asc',
        }
      },
    },
  });
  return course;
}

export default async function CourseEditPage({ params }: PageProps) {
  const courseId = parseInt(params.courseId);
  if (isNaN(courseId)) return notFound();

  // 1. 認証チェック
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    redirect("/api/auth/signin"); // またはログインページへ
  }

  // 2. データ取得
  const course = await getCourseForEdit(courseId);
  
  if (!course) {
    return notFound();
  }

  // 3. 権限チェック (自分のコースでなければリダイレクト)
  if (course.user.email !== session.user.email) {
    redirect("/"); // トップページへ弾く
  }

  // 4. クライアントコンポーネント用にデータを整形
  const initialData = {
    title: course.title,
    description: course.description || "",
    courseItems: course.courseItems.map((item) => ({
      id: item.id,
      role: item.role,
      order: item.order,
      productId: item.productId,
      product: {
        name: item.product.name,
        imageUrl: item.product.imageUrl,
        manufacturer: item.product.manufacturer,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <CourseForm 
            courseId={courseId} 
            initialData={initialData} 
        />
      </div>
    </div>
  );
}