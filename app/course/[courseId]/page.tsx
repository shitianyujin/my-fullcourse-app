// app/course/[courseId]/page.tsx

import React from 'react';
import { notFound } from 'next/navigation';
import { 
  FaUserCircle, 
  FaTag, 
  FaStar, 
  FaRegCommentDots
} from 'react-icons/fa';
import InteractiveBadge from '@/components/InteractiveBadge'; 

// サーバーサイドでのデータ取得関数 (変更なし)
async function getCourse(courseId: string) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    try {
        // キャッシュを無効化
        const res = await fetch(`${baseUrl}/api/courses/${courseId}`, {
            cache: 'no-store',
        });

        if (res.status === 404) return null;
        if (!res.ok) throw new Error('API Error');

        return res.json();
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}

export default async function CourseDetailPage({
    params,
}: {
    params: { courseId: string };
}) {
    const course = await getCourse(params.courseId);

    if (!course) {
        notFound();
    }

    const formattedRating = course.averageRating 
        ? Number(course.averageRating).toFixed(1) 
        : '-';

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* ヘッダー部分 */}
            <div className="border-b pb-6 mb-6">
                
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                    {course.title}
                </h1>
                
                {/* 💡修正: スタッツ（評価・カウンター）エリア */}
                <div className="flex flex-wrap gap-3 mb-6">
                    
                    {/* 食べたいバッジ (InteractiveBadgeへ変更) */}
                    <InteractiveBadge 
                        courseId={course.id} 
                        initialCount={course.wantsToEatCount}
                        initialIsActive={course.isWantsToEat}
                        type="wantsToEat" // 💡 typeを指定
                    />

                    {/* 食べたよ数 (InteractiveBadgeへ変更) */}
                    <InteractiveBadge 
                        courseId={course.id} 
                        initialCount={course.triedCount}
                        initialIsActive={course.isTried} // 💡 isTriedを渡す
                        type="tried" // 💡 typeを指定
                    />

                    {/* 平均評価 (静的なまま) */}
                    <div className="flex items-center px-3 py-1.5 bg-yellow-50 text-yellow-600 rounded-full border border-yellow-100 shadow-sm">
                        <FaStar className="mr-2" />
                        <span className="text-sm font-bold">{formattedRating}</span>
                        <span className="text-xs ml-1">評価</span>
                    </div>

                    {/* コメント数 (静的なまま) */}
                    <div className="flex items-center px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full border border-gray-200 shadow-sm">
                        <FaRegCommentDots className="mr-2" />
                        <span className="text-sm font-bold">{course.commentCount}</span>
                        <span className="text-xs ml-1">コメント</span>
                    </div>
                </div>

                {/* 説明文 */}
                <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                    {course.description}
                </p>
                
                {/* 作成者情報 */}
                <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-2 rounded-lg inline-block">
                    <div className="flex items-center">
                        {course.user.image ? (
                             <img src={course.user.image} alt={course.user.name} className="w-5 h-5 rounded-full mr-2" />
                        ) : (
                            <FaUserCircle className="w-5 h-5 mr-2 text-gray-400" />
                        )}
                        <span className="font-medium">作成者: {course.user.name || '不明なユーザー'}</span>
                    </div>
                </div>
            </div>

            {/* コースアイテムリスト (省略) */}
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
                コース構成
            </h2>
            
            {/* ... (コースアイテムのリスト部分は変更なし) ... */}
             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                {course.courseItems.map((item: any, index: number) => (
                    <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        
                        {/* タイムラインのドット */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-blue-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        
                        {/* カード本体 */}
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    <FaTag className="mr-1" />
                                    {item.role}
                                </span>
                            </div>

                            <div className="flex items-start space-x-4">
                                {item.product?.imageUrl ? (
                                    <img
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        className="w-20 h-20 object-cover rounded-lg border border-gray-100 shadow-sm flex-shrink-0"
                                    />
                                ) : (
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                        No Image
                                    </div>
                                )}
                                
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                                        {item.product ? item.product.name : '製品未選択'}
                                    </h3>
                                    {item.product?.manufacturer && (
                                        <p className="text-sm text-indigo-600 font-medium mb-1">
                                            {item.product.manufacturer}
                                        </p>
                                    )}
                                    {item.product?.priceReference && (
                                        <p className="text-sm text-gray-500">
                                            参考価格: ¥{item.product.priceReference.toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}