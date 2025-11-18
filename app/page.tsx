// app/page.tsx
import Link from 'next/link';
import { FaUserCircle, FaUtensils, FaArrowRight } from 'react-icons/fa';

// コースの型定義
interface CourseSummary {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  user: {
    name: string | null;
    image: string | null;
  };
  courseItems: {
    product: {
      imageUrl: string | null;
    } | null;
  }[];
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
            <Link href={`/course/${course.id}`} key={course.id} className="group">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                
                {/* サムネイルエリア (コース内の製品画像をコラージュ風に表示) */}
                <div className="h-48 bg-gray-100 relative flex flex-wrap gap-0.5 p-0.5 overflow-hidden">
                   {course.courseItems.length > 0 ? (
                     course.courseItems.slice(0, 4).map((item, i) => (
                       item.product?.imageUrl ? (
                         <div key={i} className="flex-1 min-w-[45%] h-full relative">
                            <img 
                              src={item.product.imageUrl} 
                              alt="product" 
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                         </div>
                       ) : (
                         <div key={i} className="flex-1 min-w-[45%] h-full bg-gray-200 flex items-center justify-center text-gray-400">
                           <FaUtensils />
                         </div>
                       )
                     ))
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400">
                       <span className="text-sm">No Images</span>
                     </div>
                   )}
                   {/* オーバーレイ (ホバー時) */}
                   <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
                </div>

                {/* カード本文 */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-1">
                    {course.description}
                  </p>
                  
                  {/* フッター: ユーザー情報と日付 */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      {course.user.image ? (
                        <img src={course.user.image} alt={course.user.name || ''} className="w-6 h-6 rounded-full mr-2" />
                      ) : (
                        <FaUserCircle className="w-6 h-6 mr-2 text-gray-400" />
                      )}
                      <span className="truncate max-w-[100px]">{course.user.name || '名無し'}</span>
                    </div>
                    <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Link>
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
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
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