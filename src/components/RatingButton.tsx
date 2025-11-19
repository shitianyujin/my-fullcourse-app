// src/components/RatingButton.tsx

'use client';

import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import RatingModal from './RatingModal';
// 💡 ご自身の環境に合わせて相対パス '../lib/utils' または エイリアス '@/lib/utils' を使用してください
import { formatAverageRating } from '../lib/utils'; 

interface RatingButtonProps {
  courseId: number;
  initialAverageRating: number | null;
  initialTotalRatingsCount: number;
  initialUserRatingScore: number | null;
}

/**
 * 評価ボタンコンポーネント
 * - 平均評価を表示
 * - クリックで評価モーダルを開く（未ログイン時はアラート表示後にログインへリダイレクト）
 */
export default function RatingButton({
  courseId,
  initialAverageRating,
  initialTotalRatingsCount,
  initialUserRatingScore,
}: RatingButtonProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [totalRatingsCount, setTotalRatingsCount] = useState(initialTotalRatingsCount);
  const [userRatingScore, setUserRatingScore] = useState(initialUserRatingScore);

  // クリック時の認証チェックを行うハンドラ関数
  const handleButtonClick = () => {
    // ログイン状態を確認
    if (status === 'loading') {
        // ロード中は何もしない
        return;
    }
    
    if (!session) {
      // 💡 修正点: アラートを表示
      alert("この操作にはログインが必要です。");
      
      // 未ログインの場合、ログイン画面へリダイレクト
      router.push(`/login?callbackUrl=/course/${courseId}`);
      return;
    }

    // ログイン済みの場合、モーダルを開く
    setIsModalOpen(true);
  };

  const handleRatingSubmit = (newAverage: number, newTotalCount: number, newUserScore: number) => {
    setAverageRating(newAverage);
    setTotalRatingsCount(newTotalCount);
    setUserRatingScore(newUserScore);
    setIsModalOpen(false); // モーダルを閉じる
  };

  const formattedRating = formatAverageRating(averageRating);
  
  // バッジのスタイルを決定
  const isActive = userRatingScore !== null;
  const activeBg = isActive ? 'bg-yellow-50' : 'bg-gray-50';
  const activeText = isActive ? 'text-yellow-700' : 'text-gray-500';
  const activeBorder = isActive ? 'border-yellow-200' : 'border-gray-200';
  
  const dynamicClasses = `${activeBg} ${activeText} ${activeBorder}`;

  // ロード中はボタンを無効化
  const isLoading = status === 'loading';

  return (
    <>
      <button
        onClick={handleButtonClick} 
        disabled={isLoading}
        className={`
          flex items-center space-x-1 py-1.5 px-3 rounded-full 
          text-sm font-semibold border transition duration-150 ease-in-out
          ${dynamicClasses}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-100 hover:border-yellow-300'}
        `}
        aria-label="評価ボタン"
      >
        <FaStar className="w-4 h-4" />
        {/* 平均評価と総評価数を表示 */}
        <span>
          {formattedRating} 
          <span className="ml-1 text-xs font-normal text-gray-400">({totalRatingsCount})</span>
        </span>
      </button>

      {/* 評価モーダル */}
      {isModalOpen && (
        <RatingModal
          courseId={courseId}
          initialScore={userRatingScore}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </>
  );
}