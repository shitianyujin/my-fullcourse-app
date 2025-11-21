// app/course/[courseId]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { 
    FaUserCircle, 
    FaTag,
} from 'react-icons/fa';
import InteractiveBadge from '@/components/InteractiveBadge';
import RatingButton from '@/components/RatingButton'; 
import CommentSection from '@/components/CommentSection'; 
import CommentBadge from '@/components/CommentBadge'; 
import RatingModal from '@/components/RatingModal';
import { ProductDetailModal, Product } from '@/components/ProductDetailModal';

interface CourseData {
    id: number;
    title: string;
    description: string;
    averageRating: number | null;
    totalRatingsCount: number;
    userRatingScore: number | null;
    wantsToEatCount: number;
    triedCount: number;
    isWantsToEat: boolean;
    isTried: boolean;
    user: {
        name: string;
        image: string | null;
    };
    courseItems: Array<any>;
}

async function getCourse(courseId: string): Promise<CourseData | null> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    
    try {
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

export default function CourseDetailPage({
    params,
}: {
    params: { courseId: string };
}) {
    const courseId = params.courseId;
    const router = useRouter();
    
    const [course, setCourse] = useState<CourseData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // 商品詳細モーダル用のstate
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    
    useEffect(() => {
        const fetchCourseData = async () => {
            setIsLoading(true);
            const data = await getCourse(courseId);
            if (!data) {
                router.replace('/404'); 
                return;
            }
            setCourse(data);
            setIsLoading(false);
        };
        fetchCourseData();
    }, [courseId, router]);

    const handleRatingSubmit = (newAverage: number, newTotalCount: number, newUserScore: number) => {
        if (!course) return;

        setCourse(prevData => {
            if (!prevData) return null;
            return {
                ...prevData,
                averageRating: newAverage,
                totalRatingsCount: newTotalCount,
                userRatingScore: newUserScore,
            };
        });
        
        setIsModalOpen(false);
        router.refresh(); 
    };

    // 商品クリック時のハンドラー (デバッグログ追加)
    const handleProductClick = (product: any) => {
        console.log("Card clicked:", product); // クリックされたか確認用
        if (!product) return;
        setSelectedProduct(product);
        setIsProductModalOpen(true);
    };

    if (isLoading || !course) {
        if (!course && !isLoading) {
            notFound();
        }
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                <p className="ml-3 text-gray-600">コースデータを読み込み中...</p>
            </div>
        );
    }
    
    const initialUserRatingScore = course.userRatingScore ?? null;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* ヘッダー部分 */}
            <div className="border-b pb-6 mb-6">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                    {course.title}
                </h1>
                
                <div className="flex flex-wrap gap-3 mb-6">
                    <RatingButton
                        courseId={course.id}
                        initialAverageRating={course.averageRating}
                        initialTotalRatingsCount={course.totalRatingsCount}
                        initialUserRatingScore={initialUserRatingScore}
                        onOpenModal={() => setIsModalOpen(true)}
                    />
                    <InteractiveBadge 
                        courseId={course.id} 
                        initialCount={course.wantsToEatCount}
                        initialIsActive={course.isWantsToEat}
                        type="wantsToEat"
                    />
                    <InteractiveBadge 
                        courseId={course.id} 
                        initialCount={course.triedCount}
                        initialIsActive={course.isTried}
                        type="tried"
                    />
                    <CommentBadge courseId={course.id} />
                </div>

                <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                    {course.description}
                </p>
                
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

            {/* コースアイテムリスト */}
            <h2 className="text-2xl font-bold text-gray-800 mb-5">
                コース構成
            </h2>
            
             {/* タイムラインの線 (z-indexの関係でクリックを阻害しないよう pointer-events-none を念のため推奨しますが、まずはカードの z-index で対応します) */}
             <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-300 before:to-transparent">
                {course.courseItems.map((item: any, index: number) => (
                    <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        
                        {/* タイムラインのドット */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-blue-500 text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                            <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        
                        {/* カード本体 
                            💡 修正点: relative と z-10 を追加してタイムラインより前面に表示
                        */}
                        <div 
                            className={`
                                relative z-10 
                                w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] 
                                p-4 bg-white border border-gray-200 rounded-xl shadow-sm 
                                transition-all duration-200 
                                ${item.product ? 'cursor-pointer hover:shadow-md hover:border-indigo-200 hover:bg-indigo-50/30' : ''}
                            `}
                            onClick={() => handleProductClick(item.product)}
                        >
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
                                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                                        No Image
                                    </div>
                                )}
                                
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                                        {item.product ? item.product.name : '製品未選択'}
                                    </h3>
                                    {item.product?.manufacturer && (
                                        <p className="text-sm text-indigo-600 font-medium mb-1">
                                            {item.product.manufacturer}
                                        </p>
                                    )}
                                    {item.product?.priceReference && (
                                        <p className="text-sm text-gray-500">
                                            参考価格: ¥{parseInt(item.product.priceReference).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* コメントセクション */}
            <div className="mt-12 pt-8 border-t border-gray-200" id="comments">
                <CommentSection
                    courseId={course.id}
                />
            </div>

            {/* RatingModal */}
            {isModalOpen && (
                <RatingModal 
                    courseId={course.id}
                    initialScore={initialUserRatingScore}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleRatingSubmit}
                />
            )}

            {/* 商品詳細モーダル */}
            <ProductDetailModal
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                product={selectedProduct}
            />
        </div>
    );
}