// src/components/CourseCard.tsx
import React from 'react';
import Link from 'next/link';
import { FaStar, FaHeart, FaUtensils } from 'react-icons/fa';

// ----------------------------------------------------
// 型定義
// ----------------------------------------------------
interface Course {
    id: number;
    title: string;
    description: string | null; 
    averageRating: number | null;
    totalRatingsCount: number; 
    wantsToEatCount: number;
    triedCount: number;
    // 💡 画像表示用に courseItems を追加
    courseItems?: {
        product: {
            imageUrl: string | null;
        };
    }[];
}

interface CourseCardProps {
    course: Course;
    // 下記プロパティは今回は使用しませんが、既存のコードとの互換性のために残すか、
    // 呼び出し元で使っていないなら削除してもOKです。一旦残します。
    showEditButton?: boolean;
    currentUserId?: number;
}

const formatAverageRating = (rating: number | null): string => {
    return rating === null ? 'N/A' : rating.toFixed(2);
};

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
    const formattedRating = formatAverageRating(course.averageRating);

    const images = course.courseItems
        ?.map(item => item.product.imageUrl)
        .filter((url): url is string => !!url) || [];

    return (
        <Link 
            href={`/course/${course.id}`} 
            className="block bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden transition-transform hover:shadow-xl hover:scale-[1.02] h-full flex flex-col"
        >
            {/* 画像エリア */}
            <div className="h-40 w-full bg-gray-100 relative flex">
                {images.length > 0 ? (
                    <>
                        {/* --- 画像がある場合 --- */}
                        {images.length === 1 && (
                            <img src={images[0]} alt={course.title} className="w-full h-full object-cover" />
                        )}
                        {images.length >= 2 && (
                            <>
                                <div className="w-1/2 h-full border-r border-white/20">
                                    <img src={images[0]} alt="Main 1" className="w-full h-full object-cover" />
                                </div>
                                <div className="w-1/2 h-full">
                                    <img src={images[1]} alt="Main 2" className="w-full h-full object-cover" />
                                </div>
                            </>
                        )}
                        {/* タイトル (白文字 + 黒グラデ背景) */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 pt-8">
                             <h3 className="text-white font-bold text-lg truncate drop-shadow-md">
                                {course.title}
                            </h3>
                        </div>
                    </>
                ) : (
                    // --- 💡 画像がない場合 (修正) ---
                    <div className="w-full h-full bg-slate-50 relative flex flex-col items-center justify-center text-slate-300">
                        {/* プレースホルダーアイコン */}
                        <div className="flex flex-col items-center mb-4">
                            <FaUtensils className="text-4xl mb-1" />
                            <span className="text-[10px] font-bold tracking-widest uppercase">No Image</span>
                        </div>
                        
                        {/* タイトル (黒文字 + 白グラデ背景) */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent">
                             <h3 className="text-gray-800 font-bold text-lg truncate">
                                {course.title}
                            </h3>
                        </div>
                    </div>
                )}
            </div>

            {/* ... (以下の統計情報エリアは変更なし) ... */}
            <div className="p-4 flex-grow flex flex-col justify-between">
                <div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 min-h-[2.5em]">
                        {course.description || '説明がありません。'}
                    </p>
                </div>

                <div className="flex justify-between items-center text-sm mt-auto">
                    <div className="flex items-center text-yellow-500">
                        <FaStar className="mr-1" />
                        <span className="font-bold text-gray-700">{formattedRating}</span>
                        <span className="text-xs text-gray-400 ml-1">({course.totalRatingsCount})</span>
                    </div>
                    
                    <div className="flex space-x-3 text-gray-500">
                        <div className="flex items-center">
                            <FaHeart className="mr-1 text-rose-400" />
                            <span className="font-medium text-xs">{course.wantsToEatCount}</span>
                        </div>
                        <div className="flex items-center">
                            <FaUtensils className="mr-1 text-emerald-500" />
                            <span className="font-medium text-xs">{course.triedCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default CourseCard;