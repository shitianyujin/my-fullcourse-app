// app/page.tsx
import Link from 'next/link';
import { FaUtensils, FaArrowRight } from 'react-icons/fa';
import CourseCard from '@/components/CourseCard';

// コースの型定義
interface CourseSummary {
  id: number;
  title: string;
  description: string;
  averageRating: number | null;
  totalRatingsCount: number;
  wantsToEatCount: number;
  triedCount: number;
  createdAt: string;
  user: {
    id: number;
    name: string;
    image: string | null;
  };
  _count: {
    courseItems: number;
  };
}

// データ取得関数
async function getLatestCourses(): Promise<CourseSummary[]> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    // キャッシュを無効化して常に最新を取得
    const res = await fetch(`${baseUrl}/api/courses?limit=12`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.courses || [];
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

export default async function Home() {
  const courses = await getLatestCourses();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ヒーローセクション的なヘッダー */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          みんなのフルコースを見つけよう
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          最高の組み合わせ、こだわりの逸品。
          あなただけの特別なフルコースを共有し、新しい発見を楽しみましょう。
        </p>
      </div>

      {/* コース一覧グリッド */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              showEditButton={false}
            />
          ))}
        </div>
      ) : (
        // データがない場合
        <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <FaUtensils className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">まだ投稿がありません</h3>
          <p className="mt-1 text-gray-500">最初のフルコースを投稿してみませんか？</p>
          <div className="mt-6">
            <Link
              href="/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
            >
              <FaArrowRight className="mr-2 -ml-1 h-5 w-5" />
              投稿を作成する
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}