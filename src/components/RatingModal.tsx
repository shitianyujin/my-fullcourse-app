'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // 💡 useRouterをインポート

interface RatingModalProps {
    courseId: number;
    initialScore: number | null;
    onClose: () => void;
    onSubmit: (newAverage: number, newTotalCount: number, newUserScore: number) => void; 
}

/**
 * インラインSVGのスターアイコン (モーダル用)
 */
const StarIcon: React.FC<{ size: number, color: string, className?: string, onClick?: () => void, onMouseEnter?: () => void, onMouseLeave?: () => void }> = ({
    size,
    color,
    className = "",
    onClick,
    onMouseEnter,
    onMouseLeave
}) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill={color}
        stroke="currentColor" 
        strokeWidth="1.5"
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
);

export default function RatingModal({
    courseId,
    initialScore,
    onClose,
    onSubmit,
}: RatingModalProps) {
    // 💡 useRouterフックを初期化
    const router = useRouter();

    const [currentScore, setCurrentScore] = useState(initialScore || 0);
    const [hoverScore, setHoverScore] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false); 
    const [message, setMessage] = useState<string | null>(null); 

    const renderStars = () => {
        const scoreToDisplay = hoverScore !== null ? hoverScore : currentScore;
        const totalStars = 5;

        return Array.from({ length: totalStars }, (_, index) => {
            const ratingValue = index + 1;
            return (
                <StarIcon
                    key={index}
                    size={30}
                    color={ratingValue <= scoreToDisplay ? "#ffc107" : "#e4e5e9"}
                    className="cursor-pointer transition-colors"
                    onClick={() => setCurrentScore(ratingValue)}
                    onMouseEnter={() => setHoverScore(ratingValue)}
                    onMouseLeave={() => setHoverScore(null)}
                />
            );
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (currentScore === 0) {
            setMessage("星を選択してください。");
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`/api/courses/${courseId}/rating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ score: currentScore }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "評価の送信中に不明なエラーが発生しました。");
            }

            const data = await response.json();
            
            // 1. 親コンポーネントの状態を更新
            onSubmit(
                data.averageRating, 
                data.totalRatingsCount, 
                data.score
            );
            
            // 2. Next.jsのキャッシュを強制的に更新 (重要!)
            // これにより、評価後のデータ不整合が解消されます。
            router.refresh(); 

            setMessage("評価を送信しました！");
            onClose(); 

        } catch (error) {
            console.error("評価送信エラー:", error);
            setMessage(`エラー: ${error instanceof Error ? error.message : '評価送信に失敗'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm transform transition-all"
                onClick={(e) => e.stopPropagation()} 
            >
                <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">このコースを評価する</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-center space-x-1 mb-4">
                        {renderStars()}
                    </div>
                    <div className="text-center text-lg text-gray-600 mb-6">
                        スコア: <span className="font-bold text-indigo-600">{currentScore}</span> / 5
                    </div>
                    
                    {message && (
                        <div className={`mb-4 p-2 text-sm rounded ${message.startsWith('エラー') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {message}
                        </div>
                    )}

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button" 
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={currentScore === 0 || isLoading}
                            className={`px-4 py-2 rounded-lg text-white font-semibold transition ${
                                currentScore === 0 || isLoading
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                            } flex items-center`}
                        >
                            {isLoading && (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            評価を送信
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}