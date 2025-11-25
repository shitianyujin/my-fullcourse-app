// app/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FaArrowRight, FaCrown, FaSearch } from "react-icons/fa";
// 💡 修正: キラキラアイコンを bs パッケージからインポート
import { BsStars } from "react-icons/bs"; 
import CourseCard from "@/components/CourseCard";

// データ取得関数
async function getHomeData() {
  // 共通のinclude設定
  const commonInclude = {
    user: { select: { id: true, name: true, image: true } },
    // 💡 追加: メインディッシュの画像を最大2枚取得
    courseItems: {
      where: { role: 'メインディッシュ' },
      take: 2,
      include: {
        product: { select: { imageUrl: true } }
      }
    }
  };

  // 1. 人気ランキング TOP3
  const rankingCourses = await prisma.course.findMany({
    orderBy: [
      { wantsToEatCount: 'desc' },
      { createdAt: 'desc' }
    ],
    take: 3,
    include: commonInclude,
  });

  // 2. 新着コース TOP6
  const latestCourses = await prisma.course.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: commonInclude,
  });

  return { rankingCourses, latestCourses };
}

// データ整形用ヘルパー関数
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

export default async function Home() {
  const { rankingCourses, latestCourses } = await getHomeData();

  return (
    <div className="pb-20">
      
      {/* 1. ヒーローセクション */}
      <section className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        {/* 装飾用の円（背景） */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 opacity-10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            みんなのフルコースを<br className="hidden sm:inline" />見つけよう
          </h1>
          
          <p className="text-lg sm:text-xl text-indigo-100 mb-10 leading-relaxed">
            最高の組み合わせ、こだわりの逸品。<br />
            あなただけの特別なフルコースを共有し、<br className="sm:hidden" />
            新しい発見を楽しみましょう。
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/ranking" 
              className="px-8 py-3 bg-white text-indigo-900 font-bold rounded-full hover:bg-gray-100 transition shadow-lg flex items-center justify-center"
            >
              <FaCrown className="mr-2 text-yellow-500" />
              人気のコースを見る
            </Link>
            <Link 
              href="/create" 
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full hover:bg-indigo-500 transition shadow-lg border border-indigo-400 flex items-center justify-center"
            >
              自分で作る
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 2. 人気ランキングセクション */}
        <section className="py-16 border-b border-gray-200">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <FaCrown className="text-yellow-500 mr-2" />
                人気のフルコース
              </h2>
              <p className="text-gray-500 text-sm mt-1">みんなが「食べたい！」と思った注目のコース</p>
            </div>
            <Link href="/ranking" className="text-indigo-600 font-bold text-sm hover:underline flex items-center">
              ランキングを見る <FaArrowRight className="ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {rankingCourses.map((course, index) => (
              <div key={course.id} className="relative transform transition hover:-translate-y-1">
                {/* 1位〜3位のバッジ */}
                <div 
                  className="absolute -top-3 -left-3 z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md border-2 border-white"
                  style={{ backgroundColor: index === 0 ? '#FACC15' : index === 1 ? '#9CA3AF' : '#FB923C' }}
                >
                  {index + 1}
                </div>
                <CourseCard course={formatForCard(course)} />
              </div>
            ))}
            {rankingCourses.length === 0 && (
              <p className="col-span-3 text-center text-gray-500 py-8">まだランキングデータがありません。</p>
            )}
          </div>
        </section>

        {/* 3. 新着コースセクション (デザイン強化) */}
        <section className="py-16 my-8 bg-gray-50 rounded-3xl px-4 sm:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900 flex justify-center items-center gap-2">
              {/* 💡 修正: FaSparkles -> BsStars */}
              <BsStars className="text-yellow-400 text-3xl" />
              新着のフルコース
              <BsStars className="text-yellow-400 text-3xl" />
            </h2>
            <p className="text-gray-500 text-sm mt-2">できたてのこだわりコースをチェック！</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestCourses.map((course) => (
              <div key={course.id} className="relative group">
                {/* NEWバッジ */}
                <div className="absolute -top-2 -right-2 z-10 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md border-2 border-white transform rotate-12 group-hover:rotate-0 transition-transform">
                  NEW
                </div>
                <CourseCard course={formatForCard(course)} />
              </div>
            ))}
            {latestCourses.length === 0 && (
              <p className="col-span-3 text-center text-gray-500 py-8">まだ投稿がありません。最初の投稿者になりましょう！</p>
            )}
          </div>

          {latestCourses.length >= 6 && (
            <div className="text-center mt-10">
              <Link 
                href="/search" 
                className="px-8 py-2.5 bg-white border border-gray-300 text-gray-600 font-medium rounded-full hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-300 transition shadow-sm inline-flex items-center"
              >
                もっと見る <FaArrowRight className="ml-2 text-xs" />
              </Link>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}