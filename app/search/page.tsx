// app/search/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FaSearch, FaSortAmountDown, FaUser } from "react-icons/fa";
import CourseCard from "@/components/CourseCard";

// 1ページあたりの表示件数
const PAGE_SIZE = 12;

// データ取得関数
async function getCourses({ 
  query, 
  userQuery, 
  sort, 
  page 
}: { 
  query: string; 
  userQuery: string; 
  sort: string; 
  page: number 
}) {
  const skip = (page - 1) * PAGE_SIZE;

  // 並び替え
  let orderBy: any = { createdAt: 'desc' };
  if (sort === 'popular') orderBy = { wantsToEatCount: 'desc' };
  if (sort === 'rating') orderBy = { averageRating: 'desc' };

  // 検索条件 (AND条件ベース)
  const where: any = {};

  // 1. キーワード検索 (タイトル OR 説明 OR 商品名)
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { description: { contains: query } },
      // 💡追加: コースに含まれる「商品名」も検索対象にする
      {
        courseItems: {
          some: {
            product: {
              name: { contains: query }
            }
          }
        }
      }
    ];
  }

  // 2. ユーザー名検索 (AND条件)
  if (userQuery) {
    where.user = {
      name: { contains: userQuery }
    };
  }

  // データ取得
  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      include: {
        user: { select: { id: true, name: true, image: true } },
        // 商品名検索のために必要だが、CourseCard表示には直接使わないためincludeは最小限でOK
      },
    }),
    prisma.course.count({ where }),
  ]);

  return { courses, total };
}

// データ整形用ヘルパー
const formatForCard = (course: any) => ({
  ...course,
  averageRating: Number(course.averageRating) || 0,
  totalRatingsCount: 0,
  createdAt: course.createdAt.toISOString(),
  user: {
    ...course.user,
    name: course.user.name || '名称未設定',
  },
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; user?: string; sort?: string; page?: string };
}) {
  const query = searchParams.q || '';
  const userQuery = searchParams.user || '';
  const sort = searchParams.sort || 'latest';
  const currentPage = Number(searchParams.page) || 1;

  const { courses, total } = await getCourses({ 
    query, 
    userQuery, 
    sort, 
    page: currentPage 
  });
  
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">コースを探す</h1>
        
        {/* 検索・ソートフォーム */}
        <form className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* 1. キーワード検索 (商品名含む) */}
            <div className="relative flex-grow">
              <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">キーワード (コース名・商品名)</label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  name="q"
                  defaultValue={query}
                  type="text"
                  placeholder="例: 中華、チャーハン..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 2. ユーザー検索 */}
            <div className="relative md:w-1/3">
              <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">投稿ユーザー</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  name="user"
                  defaultValue={userQuery}
                  type="text"
                  placeholder="ユーザー名"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* 3. ソート選択 */}
            <div className="relative w-full md:w-48">
              <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">並び替え</label>
              <div className="relative">
                <FaSortAmountDown className="absolute left-3 top-3.5 text-gray-400" />
                <select
                  name="sort"
                  defaultValue={sort}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
                >
                  <option value="latest">新着順</option>
                  <option value="popular">人気順 (食べたい)</option>
                  <option value="rating">評価順</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition whitespace-nowrap shadow-sm"
            >
              検索する
            </button>
          </div>
        </form>
      </div>

      {/* 検索結果表示 */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-gray-600">
          <span className="font-bold text-gray-900 text-lg mr-1">{total}</span> 
          件のコースが見つかりました
        </p>
        {/* 検索条件クリアリンク (条件がある時のみ表示) */}
        {(query || userQuery) && (
            <Link href="/search" className="text-sm text-red-500 hover:underline">
                × 条件をクリア
            </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
          <p className="text-gray-500 text-lg">条件に一致するコースはありませんでした。</p>
          <p className="text-gray-400 text-sm mt-2">別のキーワードやユーザー名で試してみてください。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={formatForCard(course)} />
          ))}
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center space-x-2">
          {currentPage > 1 ? (
            <Link
              href={`/search?q=${query}&user=${userQuery}&sort=${sort}&page=${currentPage - 1}`}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 bg-white"
            >
              前へ
            </Link>
          ) : (
            <span className="px-4 py-2 border border-gray-200 rounded-md text-gray-300 cursor-not-allowed bg-gray-50">
              前へ
            </span>
          )}

          <span className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-md border border-indigo-600">
            {currentPage} / {totalPages}
          </span>

          {currentPage < totalPages ? (
            <Link
              href={`/search?q=${query}&user=${userQuery}&sort=${sort}&page=${currentPage + 1}`}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 bg-white"
            >
              次へ
            </Link>
          ) : (
            <span className="px-4 py-2 border border-gray-200 rounded-md text-gray-300 cursor-not-allowed bg-gray-50">
              次へ
            </span>
          )}
        </div>
      )}
    </div>
  );
}