// src/components/CourseCard.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { FaUserCircle, FaStar, FaHeart, FaUtensils } from 'react-icons/fa';

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    description: string | null;
    averageRating: number | null;
    totalRatingsCount: number;
    wantsToEatCount: number;
    triedCount: number;
    createdAt?: string;
    user?: {
      id: number;
      name: string;
      image: string | null;
    };
    _count?: {
      courseItems: number;
    };
  };
  showEditButton?: boolean;
  currentUserId?: number;
}

export default function CourseCard({ course, showEditButton = false, currentUserId }: CourseCardProps) {
  const isOwnCourse = currentUserId && course.user ? currentUserId === course.user.id : false;
  const formattedDate = course.createdAt ? new Date(course.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }) : '';

  // 評価の表示形式を統一
  const formatAverageRating = (rating: number | null): string => {
    return rating === null ? 'N/A' : rating.toFixed(1);
  };

  // 評価数が0の場合は特別な表示
  const hasRatings = course.totalRatingsCount > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <Link href={`/course/${course.id}`} className="block">
        {/* 仮の画像エリア */}
        <div className="h-32 bg-indigo-500/20 flex items-center justify-center text-indigo-700 font-bold text-lg p-4">
          <span className="line-clamp-2 text-center">{course.title}</span>
        </div>

        <div className="p-5">
          {/* タイトル */}
          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-indigo-600 transition-colors line-clamp-2">
            {course.title}
          </h3>

          {/* 説明文 */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {course.description || '説明がありません。'}
          </p>

          {/* 統計情報 */}
          <div className="flex flex-wrap gap-3 mb-4">
            {/* 評価 - 評価が存在する場合のみ表示 */}
            {hasRatings ? (
              <div className="flex items-center text-sm text-gray-600">
                <FaStar className="text-yellow-500 mr-1" />
                <span className="font-semibold">{formatAverageRating(course.averageRating)}</span>
                <span className="ml-1 text-xs text-gray-500">({course.totalRatingsCount})</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-gray-400">
                <FaStar className="text-gray-300 mr-1" />
                <span className="text-xs">未評価</span>
              </div>
            )}

            {/* 食べたい数 */}
            <div className="flex items-center text-sm text-gray-600">
              <FaHeart className="text-pink-500 mr-1" />
              <span>{course.wantsToEatCount}</span>
            </div>

            {/* 食べたよ数 */}
            <div className="flex items-center text-sm text-gray-600">
              <FaUtensils className="text-green-500 mr-1" />
              <span>{course.triedCount}</span>
            </div>

            {/* アイテム数 */}
            {course._count?.courseItems && (
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-gray-400 mr-1">🍽</span>
                <span>{course._count.courseItems}品</span>
              </div>
            )}
          </div>

          {/* 作成者情報（userがある場合のみ） */}
          {course.user && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-500">
                {course.user.image ? (
                  <img
                    src={course.user.image}
                    alt={course.user.name}
                    className="w-6 h-6 rounded-full mr-2"
                  />
                ) : (
                  <FaUserCircle className="w-6 h-6 mr-2 text-gray-400" />
                )}
                <span>{course.user.name}</span>
              </div>
              {formattedDate && (
                <div className="text-xs text-gray-400">
                  {formattedDate}
                </div>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* 編集ボタン（自分のコースのみ） */}
      {showEditButton && isOwnCourse && (
        <div className="px-5 pb-4">
          <Link
            href={`/course/${course.id}/edit`}
            className="block w-full text-center px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            コースを編集
          </Link>
        </div>
      )}
    </div>
  );
}