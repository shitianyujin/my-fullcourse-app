// app/ranking/page.tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FaCrown, FaTrophy } from "react-icons/fa";
import CourseCard from "@/components/CourseCard";

// サーバーコンポーネントでデータ取得
async function getRankings() {
  // 1. 人気のコース (食べたい数順) TOP 10
  const courseRanking = await prisma.course.findMany({
    orderBy: [
      { wantsToEatCount: 'desc' },
      { createdAt: 'desc' } // 💡修正1: created_at ではなく createdAt
    ],
    take: 10,
    include: {
      user: { select: { id: true, name: true, image: true } },
    }
  });

  // 2. 人気の商品 (コース採用数順) TOP 10
  const productStats = await prisma.courseItem.groupBy({
    by: ['productId'],
    _count: {
      productId: true,
    },
    orderBy: {
      _count: {
        productId: 'desc',
      },
    },
    take: 10,
  });

  // 商品の詳細情報を取得
  const productIds = productStats.map(stat => stat.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds }
    }
  });

  // 集計データと商品情報を結合
  const productRanking = productStats.map(stat => {
    const product = products.find(p => p.id === stat.productId);
    // productが見つからない場合のガード
    if (!product) return null;
    return {
      ...product,
      count: stat._count.productId,
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  return { courseRanking, productRanking };
}

// 順位に応じた王冠アイコン
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <FaCrown className="text-yellow-400 text-2xl" />;
  if (rank === 2) return <FaCrown className="text-gray-400 text-2xl" />;
  if (rank === 3) return <FaCrown className="text-orange-400 text-2xl" />;
  return <span className="text-xl font-bold text-gray-500 w-6 text-center">{rank}</span>;
};

export default async function RankingPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const { courseRanking, productRanking } = await getRankings();
  const activeTab = searchParams.tab || 'course';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 flex justify-center items-center">
          <FaTrophy className="text-yellow-500 mr-3" />
          ランキング
        </h1>
        <p className="text-gray-500">
          みんなが選んだ『最強の組み合わせ』と、こだわりの逸品。
        </p>
      </div>

      {/* タブ切り替え */}
      <div className="flex justify-center mb-10">
        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
          <Link
            href="/ranking?tab=course"
            scroll={false}
            className={`px-6 py-2 rounded-md text-sm font-bold transition ${
              activeTab === 'course' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            人気のフルコース
          </Link>
          <Link
            href="/ranking?tab=product"
            scroll={false}
            className={`px-6 py-2 rounded-md text-sm font-bold transition ${
              activeTab === 'product' 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            よく使われる商品
          </Link>
        </div>
      </div>

      {/* コンテンツエリア */}
      {activeTab === 'course' ? (
        <div className="space-y-8">
          {courseRanking.length === 0 ? (
             <p className="text-center text-gray-500 py-10">集計データがありません。</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courseRanking.map((course, index) => {
                // 💡修正2: CourseCardに渡すために型を調整
                const formattedCourse = {
                  ...course,
                  averageRating: Number(course.averageRating) || 0,
                  totalRatingsCount: 0,
                  createdAt: course.createdAt.toISOString(),
                  user: {
                    ...course.user,
                    name: course.user.name || '名称未設定', 
                  },
                };

                return (
                  <div key={course.id} className="relative transform transition hover:-translate-y-1">
                    {/* 順位バッジ */}
                    <div className="absolute -top-4 -left-4 z-10 bg-white rounded-full p-2 shadow-md border border-gray-100 w-12 h-12 flex items-center justify-center">
                      <RankBadge rank={index + 1} />
                    </div>
                    
                    <CourseCard course={formattedCourse} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          {productRanking.length === 0 ? (
            <p className="text-center text-gray-500 py-10">集計データがありません。</p>
          ) : (
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {productRanking.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="flex items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                  >
                    <div className="w-12 flex-shrink-0 flex justify-center">
                       <RankBadge rank={index + 1} />
                    </div>
                    
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mx-4">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                        )}
                    </div>

                    <div className="flex-grow min-w-0 mr-4">
                        <h3 className="text-lg font-bold text-gray-800 truncate">
                            {product.name}
                        </h3>
                        <p className="text-sm text-indigo-600 font-medium truncate">
                            {product.manufacturer}
                        </p>
                    </div>

                    <div className="flex-shrink-0 text-right">
                        <div className="text-2xl font-bold text-gray-900">
                            {product.count}
                        </div>
                        <div className="text-xs text-gray-500">採用回数</div>
                    </div>
                  </div>
                ))}
             </div>
          )}
        </div>
      )}
    </div>
  );
}