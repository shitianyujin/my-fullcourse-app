// app/(auth)/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEnvelope, FaLock, FaUser, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';

export default function AuthPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { status } = useSession();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    
    // URLパラメータ ?mode=register なら新規登録モードにする
    const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
    const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login');

    // 既にログイン済みならリダイレクト
    useEffect(() => {
        if (status === 'authenticated') {
            router.push(callbackUrl);
        }
    }, [status, router, callbackUrl]);

    // モードがURLパラメータと同期するように監視（クライアントサイドでの遷移に対応）
    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'register') {
            setIsLoginMode(false);
        } else {
            setIsLoginMode(true);
        }
    }, [searchParams]);

    // フォーム状態
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (isLoginMode) {
                // --- ログイン処理 ---
                const result = await signIn('credentials', {
                    redirect: false,
                    email,
                    password,
                    callbackUrl,
                });

                if (result?.error) {
                    setError('メールアドレスまたはパスワードが違います。');
                } else {
                    router.push(callbackUrl);
                }
            } else {
                // --- 新規登録処理 ---
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }),
                });

                if (res.ok) {
                    alert('登録が完了しました！自動的にログインします。');
                    
                    // 登録成功後、そのままログイン処理を実行してシームレスに遷移
                    const result = await signIn('credentials', {
                        redirect: false,
                        email,
                        password,
                        callbackUrl,
                    });
                    
                    if (!result?.error) {
                        router.push(callbackUrl);
                    } else {
                        // 万が一ログインに失敗した場合はログイン画面へ
                        setIsLoginMode(true);
                    }
                } else {
                    const data = await res.json();
                    setError(data.message || '登録に失敗しました');
                }
            }
        } catch (err) {
            setError('エラーが発生しました。');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // モード切り替え（URLは変更せずStateのみ変更）
    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setError('');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {isLoginMode ? 'ログイン' : 'アカウント作成'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    『おれふる』へようこそ
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        
                        {/* 新規登録時のみ: 名前入力 */}
                        {!isLoginMode && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">ユーザー名</label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaUser className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required={!isLoginMode}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="フルコース太郎"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaEnvelope className="text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">パスワード</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            {isLoginMode && (
                                <div className="text-right mt-1">
                                    {/* パスワードリセット機能はまだ未実装のためリンクは保留、または実装済みなら有効化 */}
                                    <span className="text-xs text-gray-400 cursor-not-allowed">
                                        パスワードを忘れた場合
                                    </span>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200 text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                        >
                            {isLoading ? '処理中...' : (isLoginMode ? 'ログイン' : '登録してはじめる')}
                            {!isLoading && <FaArrowRight className="ml-2 h-4 w-4" />}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or</span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <button
                                onClick={toggleMode}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                {isLoginMode 
                                    ? 'アカウントをお持ちでない方はこちら（新規登録）' 
                                    : 'すでにアカウントをお持ちの方はこちら（ログイン）'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}