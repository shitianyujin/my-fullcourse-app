// src/components/CommentSection.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { FaUserCircle } from 'react-icons/fa';

// コメントデータの型定義 (APIから受け取るデータ構造)
interface Comment {
    id: number;
    courseId: number;
    userId: number;
    content: string;
    createdAt: string;
    user: {
        id: number;
        name: string | null;
        image: string | null;
    };
}

interface CommentSectionProps {
    courseId: number;
    // initialCommentCount は CommentBadge が管理するため不要
}

// 💡 外部からコメントを再取得するための関数
const triggerBadgeUpdate = () => {
    // カスタムイベントを発火させて CommentBadge を更新させる
    window.dispatchEvent(new Event('commentPosted'));
};

const CommentSection: React.FC<CommentSectionProps> = ({ 
    courseId,
}) => {
    const { data: session } = useSession();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPosting, setIsPosting] = useState(false);

    // ----------------------------------------------------
    // コメント取得ロジック
    // ----------------------------------------------------
    const fetchComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/courses/${courseId}/comments`);
            if (res.ok) {
                const data: Comment[] = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("コメント取得エラー:", error);
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    // ページロード時にコメントを取得
    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // ----------------------------------------------------
    // コメント投稿ロジック
    // ----------------------------------------------------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!session) {
            alert("コメントの投稿にはログインが必要です。");
            return;
        }

        if (newComment.trim() === '') return;

        setIsPosting(true);
        try {
            const res = await fetch(`/api/courses/${courseId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment }),
            });

            if (res.ok) {
                const postedComment: Comment = await res.json();
                setComments([postedComment, ...comments]); // コメント一覧を更新
                setNewComment(''); // 入力フィールドをクリア
                triggerBadgeUpdate(); // 💡 バッジの更新をトリガー
            } else if (res.status === 401) {
                alert("ログインが必要です。");
            } else {
                alert("コメントの投稿に失敗しました。");
            }
        } catch (error) {
            console.error("コメント投稿エラー:", error);
            alert("コメントの投稿中に予期せぬエラーが発生しました。");
        } finally {
            setIsPosting(false);
        }
    };

    // ----------------------------------------------------
    // レンダリング
    // ----------------------------------------------------
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <section>
            {/* コメント投稿フォーム */}
            <h3 className="text-xl font-bold text-gray-700 mb-4">コメントを投稿する</h3>
            <form onSubmit={handleSubmit} className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm mb-8">
                <textarea
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder={session ? "このコースについてのコメントをどうぞ..." : "コメントするにはログインが必要です。"}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={!session || isPosting}
                ></textarea>
                <div className="flex justify-end mt-3">
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-150 disabled:bg-gray-400"
                        disabled={!session || newComment.trim() === '' || isPosting}
                    >
                        {isPosting ? '投稿中...' : 'コメントを送信'}
                    </button>
                </div>
            </form>

            {/* コメント一覧 */}
            <h3 className="text-2xl font-bold text-gray-800 mb-5 border-b pb-2">
                コメント一覧 ({comments.length})
            </h3>
            
            {isLoading && <p className="text-gray-500">コメントを読み込み中...</p>}
            
            {!isLoading && comments.length === 0 && (
                <p className="text-gray-500">まだコメントはありません。最初のコメントを投稿してみましょう！</p>
            )}

            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-gray-50 border border-gray-100 rounded-lg shadow-sm">
                        <div className="flex items-center mb-2">
                            {comment.user.image ? (
                                <img src={comment.user.image} alt={comment.user.name || 'User'} className="w-8 h-8 rounded-full mr-3" />
                            ) : (
                                <FaUserCircle className="w-8 h-8 mr-3 text-gray-400" />
                            )}
                            <div>
                                <p className="font-semibold text-gray-800">{comment.user.name || '不明なユーザー'}</p>
                                <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                            </div>
                        </div>
                        <p className="text-gray-700 mt-3 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default CommentSection;