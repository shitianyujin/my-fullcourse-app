// src/components/CommentBadge.tsx

'use client';

import { FaRegCommentDots } from 'react-icons/fa';
import { useState, useEffect, useCallback } from 'react';

interface CommentBadgeProps {
    courseId: number;
}

const CommentBadge: React.FC<CommentBadgeProps> = ({ courseId }) => {
    const [commentCount, setCommentCount] = useState(0);

    // 💡 コメント数をAPIから取得する関数
    const fetchCommentCount = useCallback(async () => {
        try {
            const res = await fetch(`/api/courses/${courseId}/comments`);
            if (res.ok) {
                const data = await res.json();
                // 💡 更新: 取得したコメント数でステートを更新
                setCommentCount(data.length); 
            }
        } catch (error) {
            console.error("コメント数取得エラー:", error);
        }
    }, [courseId]);

    // 💡 イベントリスナーのハンドラ
    const handleCommentPosted = () => {
        // イベントが発火されたら、コメント数を再取得
        fetchCommentCount();
    };

    useEffect(() => {
        // 1. 初期ロード時にコメント数を取得
        fetchCommentCount();
        
        // 2. イベントリスナーを登録
        window.addEventListener('commentPosted', handleCommentPosted);

        // 3. クリーンアップ関数でイベントリスナーを解除 (アンマウント時の重要処理)
        return () => {
            window.removeEventListener('commentPosted', handleCommentPosted);
        };
    }, [fetchCommentCount]); // fetchCommentCountが更新されたら再実行

    
    // コメントセクションへのスムーススクロール関数
    const scrollToComments = () => {
        const commentsSection = document.getElementById('comments');
        if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <button
            onClick={scrollToComments}
            className="flex items-center px-3 py-1.5 bg-gray-50 text-gray-600 rounded-full border border-gray-200 shadow-sm transition duration-150 hover:bg-gray-100 hover:border-gray-300"
            aria-label="コメントセクションへ移動"
        >
            <FaRegCommentDots className="mr-2" />
            <span className="text-sm font-bold">{commentCount}</span>
            <span className="text-xs ml-1">コメント</span>
        </button>
    );
};

export default CommentBadge;