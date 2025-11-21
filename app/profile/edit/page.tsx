// app/profile/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaSave, FaTimes } from 'react-icons/fa';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    image: string | null;
    bio: string | null;
}

async function getCurrentUserProfile(): Promise<UserProfile | null> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
    
    try {
        const res = await fetch(`${baseUrl}/api/user/profile`, {
            cache: 'no-store',
        });

        if (!res.ok) return null;
        const data = await res.json();
        return data.user;
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
}

export default function ProfileEditPage() {
    const router = useRouter();
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    
    // フォームの状態
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [image, setImage] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            const data = await getCurrentUserProfile();
            if (!data) {
                router.replace('/login');
                return;
            }
            setProfile(data);
            setName(data.name);
            setBio(data.bio || '');
            setImage(data.image || '');
            setIsLoading(false);
        };
        fetchProfile();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        
        if (!name.trim()) {
            setMessage({ type: 'error', text: '名前を入力してください。' });
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim(),
                    bio: bio.trim(),
                    image: image.trim() || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'プロフィールの更新に失敗しました。');
            }

            setMessage({ type: 'success', text: 'プロフィールを更新しました！' });
            
            // 2秒後にプロフィールページへ遷移
            setTimeout(() => {
                router.push(`/profile/${data.user.id}`);
            }, 2000);

        } catch (error) {
            console.error('プロフィール更新エラー:', error);
            setMessage({ 
                type: 'error', 
                text: error instanceof Error ? error.message : 'プロフィールの更新に失敗しました。' 
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || !profile) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                <p className="ml-3 text-gray-600">プロフィールを読み込み中...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 md:p-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                {/* ヘッダー */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">
                        プロフィール編集
                    </h1>
                    <button
                        onClick={() => router.back()}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <FaTimes className="w-6 h-6" />
                    </button>
                </div>

                {/* メッセージ表示 */}
                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg ${
                            message.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* フォーム */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* プロフィール画像プレビュー */}
                    <div className="flex justify-center">
                        {image ? (
                            <img
                                src={image}
                                alt="プロフィール画像"
                                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100"
                            />
                        ) : (
                            <FaUserCircle className="w-32 h-32 text-gray-300" />
                        )}
                    </div>

                    {/* 画像URL */}
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                            プロフィール画像URL
                        </label>
                        <input
                            type="url"
                            id="image"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            画像のURLを入力してください（後で画像アップロード機能を追加予定）
                        </p>
                    </div>

                    {/* 名前 */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            名前 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={100}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            {name.length} / 100文字
                        </p>
                    </div>

                    {/* メールアドレス（表示のみ） */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={profile.email}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                            メールアドレスは変更できません
                        </p>
                    </div>

                    {/* 自己紹介 */}
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                            自己紹介
                        </label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={5}
                            placeholder="あなたについて教えてください..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* ボタン */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            disabled={isSaving}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !name.trim()}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    保存中...
                                </>
                            ) : (
                                <>
                                    <FaSave className="mr-2" />
                                    保存
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
