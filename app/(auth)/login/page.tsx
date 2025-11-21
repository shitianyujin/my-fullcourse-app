// app/(auth)/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';

export default function AuthPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { status } = useSession();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    
    // URLパラメータ ?view=magiclink があれば初期値を切り替える
    const initialView = searchParams.get('view') === 'magiclink' ? 'magiclink' : 'password';
    const [authMode, setAuthMode] = useState<'password' | 'magiclink'>(initialView);

    useEffect(() => {
        if (status === 'authenticated') {
            router.push(callbackUrl);
        }
    }, [status, router, callbackUrl]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // ... (handleSubmitなどは変更なし) ...
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            if (authMode === 'password') {
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
                const result = await signIn('email', {
                    redirect: false,
                    email,
                    callbackUrl,
                });
                if (result?.error) {
                    setError('メールの送信に失敗しました。');
                } else {
                    setSuccessMessage('認証リンクをメールで送信しました。\nメールボックスを確認してください。');
                }
            }
        } catch (err) {
            setError('エラーが発生しました。');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    {authMode === 'password' ? 'ログイン' : 'メール認証 / 新規登録'}
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    {authMode === 'password' 
                        ? 'おかえりなさい' 
                        : 'メールアドレスのみで安全にログイン・登録できます'}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    
                    {/* タブ切り替え */}
                    <div className="flex border-b border-gray-200 mb-6">
                        <button
                            className={`flex-1 pb-2 text-sm font-medium text-center ${authMode === 'password' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => { setAuthMode('password'); setError(''); setSuccessMessage(''); }}
                        >
                            パスワード
                        </button>
                        <button
                            className={`flex-1 pb-2 text-sm font-medium text-center ${authMode === 'magiclink' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => { setAuthMode('magiclink'); setError(''); setSuccessMessage(''); }}
                        >
                            メール認証(新規)
                        </button>
                    </div>

                    {successMessage ? (
                        <div className="rounded-md bg-green-50 p-4">
                            {/* ... 成功メッセージ表示 (変更なし) ... */}
                             <div className="flex">
                                <div className="flex-shrink-0">
                                    <FaEnvelope className="h-5 w-5 text-green-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">送信完了</h3>
                                    <div className="mt-2 text-sm text-green-700 whitespace-pre-wrap">
                                        {successMessage}
                                    </div>
                                    <div className="mt-4">
                                        <p className="text-xs text-gray-500">
                                            ※開発環境(Ethereal)の場合、コンソールのURLを開くかEtherealの受信箱を確認してください。
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    メールアドレス
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaEnvelope className="text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            {authMode === 'password' && (
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                        パスワード
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaLock className="text-gray-400" />
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                                        />
                                    </div>
                                    <div className="text-right mt-1">
                                        <button
                                            type="button"
                                            onClick={() => setAuthMode('magiclink')}
                                            className="text-xs text-indigo-600 hover:text-indigo-500"
                                        >
                                            パスワードを忘れた場合
                                        </button>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200 text-center">
                                    {error}
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                                        ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                >
                                    {isLoading ? '処理中...' : (
                                        authMode === 'password' ? 'ログイン' : '認証リンクを送信'
                                    )}
                                    {!isLoading && <FaArrowRight className="ml-2 h-4 w-4" />}
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Or
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => {
                                    setAuthMode(authMode === 'password' ? 'magiclink' : 'password');
                                    setError('');
                                    setSuccessMessage('');
                                }}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                {authMode === 'password' 
                                    ? 'メール認証・新規登録はこちら' 
                                    : 'パスワードでログインはこちら'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}