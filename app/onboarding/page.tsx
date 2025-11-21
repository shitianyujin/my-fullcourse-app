// app/onboarding/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// 💡 signOut を追加
import { useSession, signOut } from 'next-auth/react';

export default function OnboardingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login');
        }
        // すでに名前がある場合はトップへ
        if (session?.user?.name) {
             router.replace('/');
        }
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/user/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || '設定に失敗しました');
            }

            // 💡 修正箇所: update() ではなく signOut() を実行
            alert('プロフィールの設定が完了しました！\nセキュリティのため、新しいパスワードで再ログインしてください。');
            
            // ログアウト処理を行い、完了後にログイン画面へ遷移
            await signOut({ callbackUrl: '/login' });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'loading') return <div className="min-h-screen flex justify-center items-center">読み込み中...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            {/* ... (UI部分は変更なし、そのまま) ... */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    プロフィールの設定
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    はじめまして！<br/>
                    アプリで使用する名前と、次回以降のログイン用パスワードを設定してください。
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                ユーザー名 (必須)
                            </label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="例: フルコース太郎"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                パスワード (必須)
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                次回からこのパスワードでログインできます。
                            </p>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                    ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {isLoading ? '設定を保存して始める' : '設定を保存して始める'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}