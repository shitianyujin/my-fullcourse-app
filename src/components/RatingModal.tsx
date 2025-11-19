// src/components/RatingModal.tsx

import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

interface RatingModalProps {
  courseId: number;
  initialScore: number | null;
  onClose: () => void;
  onSubmit: (newAverage: number, newTotalCount: number, newUserScore: number) => void;
}

/**
 * 評価モーダルコンポーネント
 * - 星の選択と評価の送信を行う
 */
export default function RatingModal({
  courseId,
  initialScore,
  onClose,
  onSubmit,
}: RatingModalProps) {
  const router = useRouter();
  const [score, setScore] = useState(initialScore); // 送信する評価点
  const [hoverScore, setHoverScore] = useState<number | null>(null); // ホバー中の評価点
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 星をクリックしたときの処理
  const handleStarClick = (selectedScore: number) => {
    setScore(selectedScore);
  };

  // 評価送信処理
  const handleSubmit = async () => {
    if (!score) {
      setError('星を選択してください。');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/courses/${courseId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ score }),
      });

      if (res.status === 401) {
        router.push(`/login?callbackUrl=/course/${courseId}`);
        return;
      }

      if (!res.ok) {
        throw new Error('評価の投稿に失敗しました。');
      }

      const data = await res.json();
      
      // 親コンポーネントの状態を更新
      onSubmit(data.averageRating, data.totalRatingsCount, data.score);

    } catch (err: any) {
      console.error(err);
      setError(err.message || '評価中に予期せぬエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  const ratingStars = [1, 2, 3, 4, 5];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative">
        <h3 className="text-xl font-bold mb-4">このコースを評価する</h3>
        
        {/* エラーメッセージ */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* 星の選択UI */}
        <div 
          className="flex justify-center space-x-1 mb-5"
          onMouseLeave={() => setHoverScore(null)}
        >
          {ratingStars.map((starIndex) => (
            <FaStar
              key={starIndex}
              className={`
                w-10 h-10 cursor-pointer transition-colors duration-200
                ${
                  (hoverScore !== null ? hoverScore : score || 0) >= starIndex
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }
              `}
              onMouseEnter={() => setHoverScore(starIndex)}
              onClick={() => handleStarClick(starIndex)}
            />
          ))}
        </div>

        {/* 現在の評価表示 */}
        <p className="text-center text-sm mb-6">
          {score ? `あなたの評価: ${score} 点` : '星を選択してください'}
        </p>

        {/* ボタンエリア */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            disabled={loading}
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            className={`
              px-4 py-2 text-white font-semibold rounded-lg transition-opacity
              ${loading || !score ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
            `}
            disabled={loading || !score}
          >
            {loading ? '送信中...' : '評価を送信'}
          </button>
        </div>
      </div>
    </div>
  );
}