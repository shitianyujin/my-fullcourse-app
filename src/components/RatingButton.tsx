// src/components/RatingButton.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { formatAverageRating } from '@/lib/utils'; 

interface RatingButtonProps {
    courseId: number;
    initialAverageRating: number | null;
    initialTotalRatingsCount: number;
    initialUserRatingScore: number | null;
    onOpenModal: () => void; 
}

/**
 * インラインSVGのスターアイコン (RatingButton用)
 * isHighlightedがtrueの場合、黄色で表示されます
 */
const StarIcon: React.FC<{ className?: string, isHighlighted: boolean }> = ({ className = "", isHighlighted }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        fill={isHighlighted ? "#fbbf24" : "currentColor"} 
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

export default function RatingButton({
    courseId,
    initialAverageRating,
    initialTotalRatingsCount,
    initialUserRatingScore,
    onOpenModal,
}: RatingButtonProps) {
    const router = useRouter();
    const { data: session, status } = useSession();
    
    const [loginMessage, setLoginMessage] = useState<string | null>(null);
    
    const [averageRating, setAverageRating] = useState(initialAverageRating);
    const [totalRatingsCount, setTotalRatingsCount] = useState(initialTotalRatingsCount);
    const [userRatingScore, setUserRatingScore] = useState(initialUserRatingScore);

    useEffect(() => {
        setAverageRating(initialAverageRating);
        setTotalRatingsCount(initialTotalRatingsCount);
        setUserRatingScore(initialUserRatingScore);
    }, [initialAverageRating, initialTotalRatingsCount, initialUserRatingScore]);

    const handleButtonClick = () => {
        if (status === 'loading') return;
        
        if (!session) {
            setLoginMessage("この操作にはログインが必要です。ログイン画面に移動します...");
            setTimeout(() => {
                router.push(`/login?callbackUrl=/course/${courseId}`);
            }, 1500);
            return;
        }

        onOpenModal();
    };

    const formattedRating = formatAverageRating(averageRating);
    
    // 評価が存在するかどうか
    const hasRatings = totalRatingsCount > 0;
    
    // 自分の評価があるかどうかに基づいてスタイルを決定
    const isActive = userRatingScore !== null;
    const isStarHighlighted = isActive; 
    
    // スタイル定義 (Tailwind CSS classes)
    const activeBg = isActive ? 'bg-yellow-100' : 'bg-gray-50';
    const activeText = hasRatings ? 'text-gray-800' : 'text-gray-400';
    const activeBorder = isActive ? 'border-yellow-300' : 'border-gray-200';
    const dynamicClasses = `${activeBg} ${activeText} ${activeBorder}`;

    const isLoading = status === 'loading';

    return (
        <>
            {/* ログインメッセージ表示 */}
            {loginMessage && (
                <div className="fixed top-4 right-4 z-50 p-3 bg-red-500 text-white rounded-lg shadow-xl text-sm transition-opacity duration-500">
                    {loginMessage}
                </div>
            )}

            <button
                onClick={handleButtonClick} 
                disabled={isLoading}
                className={`
                    flex items-center space-x-1 py-1.5 px-3 rounded-full 
                    text-sm font-semibold border transition duration-150 ease-in-out
                    ${dynamicClasses}
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-100/70 hover:border-yellow-300'}
                `}
                aria-label="評価ボタン"
            >
                {/* スターアイコン */}
                <StarIcon 
                    className="w-4 h-4" 
                    isHighlighted={hasRatings ? isStarHighlighted : false} 
                />
                
                {hasRatings ? (
                    <span>
                        {/* 平均評価と総評価数 */}
                        {formattedRating} 
                        <span className="ml-1 text-xs font-normal text-gray-500">({totalRatingsCount})</span>
                    </span>
                ) : (
                    <span className="text-xs">未評価</span>
                )}
            </button>
        </>
    );
}