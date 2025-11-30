// app/(auth)/login/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaEnvelope, FaLock, FaUser, FaArrowRight, FaKey, FaIdCard } from 'react-icons/fa';
import Link from 'next/link';

export default function AuthPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { status } = useSession();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    
    // URLパラメータ ?mode=register なら新規登録モードにする
    const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
    const [isLoginMode, setIsLoginMode] = useState(initialMode === 'login');

    // 登録ステップ管理: 1=Email, 2=OTP, 3=UserDetails
    const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);

    // フォームデータ
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [userId, setUserId] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    // 既にログイン済みならリダイレクト
    useEffect(() => {
        if (status === 'authenticated') {
            router.push(callbackUrl);
        }
    }, [status, router, callbackUrl]);

    // ▼ 修正ポイント1: URLパラメータ変更時（Navbar遷移など）に状態をリセット
    useEffect(() => {
        const mode = searchParams.get('mode');
        
        // メッセージとエラーをクリア
        setMessage('');
        setError('');
        
        if (mode === 'register') {
            setIsLoginMode(false);
            // 新規登録ボタンを押したときは、最初(Step1)から入力させる
            setRegisterStep(1);
        } else {
            setIsLoginMode(true);
        }
    }, [searchParams]);

    // ---------------------------------------------------------
    // アクションハンドラ
    // ---------------------------------------------------------

    // [Login] ログイン処理
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage(''); // 念のためクリア
        setIsLoading(true);

        const result = await signIn('credentials', {
            redirect: false,
            email,
            password,
            callbackUrl,
        });

        if (result?.error) {
            setError('メールアドレスまたはパスワードが違います。');
            setIsLoading(false);
        } else {
            router.push(callbackUrl);
        }
    };

    // [Register Step 1] 認証コード送信
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            setMessage('認証コードをメールに送信しました。');
            setRegisterStep(2); 
        } catch (err: any) {
            setError(err.message || '送信に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    // [Register Step 2] 認証コード検証
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        // setMessage(''); // ★ここはあえて消さない（"送信しました"を残した方が親切な場合もあるが、次のステップに進むので消すのが自然）
        setMessage(''); 
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otpCode }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            // 検証成功
            setRegisterStep(3);
        } catch (err: any) {
            setError(err.message || '認証に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    // [Register Step 3] ユーザー本登録
    const handleRegisterComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    code: otpCode,
                    userId, 
                    name, 
                    password 
                }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message);

            alert('登録が完了しました！自動的にログインします。');
            
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
                callbackUrl,
            });
            
            if (!result?.error) {
                router.push(callbackUrl);
            } else {
                setIsLoginMode(true);
            }
        } catch (err: any) {
            setError(err.message || '登録に失敗しました');
        } finally {
            setIsLoading(false);
        }
    };

    // モード切り替え（手動クリック用）
    const toggleMode = () => {
        // URLパラメータの書き換えは行わずStateのみ変更する場合
        // searchParamsの監視が発火しないため、ここで手動リセットが必要
        const newMode = !isLoginMode;
        setIsLoginMode(newMode);
        setError('');
        setMessage('');
        setRegisterStep(1); 
    };

    // ▼ 修正ポイント2: ステップを戻す際のリセット処理
    const handleBackToStep1 = () => {
        setRegisterStep(1);
        setMessage('');
        setError('');
    };

    // ---------------------------------------------------------
    // レンダリング (UI)
    // ---------------------------------------------------------
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
                    
                    {error && (
                        <div className="mb-4 text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200 text-center">
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="mb-4 text-green-600 text-sm bg-green-50 p-2 rounded border border-green-200 text-center">
                            {message}
                        </div>
                    )}

                    {/* === ログインモード === */}
                    {isLoginMode && (
                        <form className="space-y-6" onSubmit={handleLogin}>
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
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="text-right mt-1">
                                    <Link 
                                        href="/forgot-password" 
                                        className="text-xs text-indigo-600 hover:text-indigo-500 hover:underline"
                                    >
                                        パスワードを忘れた場合
                                    </Link>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {isLoading ? '処理中...' : 'ログイン'}
                            </button>
                        </form>
                    )}

                    {/* === 新規登録モード === */}
                    {!isLoginMode && (
                        <>
                            {/* Step 1: メール入力 */}
                            {registerStep === 1 && (
                                <form onSubmit={handleSendOtp} className="space-y-6">
                                    <p className="text-sm text-gray-500 mb-4">
                                        まずはメールアドレスを入力してください。認証コードを送信します。
                                    </p>
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
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {isLoading ? '送信中...' : '認証コードを送信'}
                                    </button>
                                </form>
                            )}

                            {/* Step 2: OTP入力 */}
                            {registerStep === 2 && (
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <p className="text-sm text-gray-500 mb-4">
                                        {email} 宛に6桁のコードを送信しました。
                                    </p>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">認証コード (数字6桁)</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaKey className="text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                maxLength={6}
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value)}
                                                className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-indigo-500 focus:border-indigo-500 tracking-widest"
                                                placeholder="123456"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {isLoading ? '確認中...' : '次へ進む'}
                                    </button>
                                    <div className="text-center">
                                        {/* ▼ 修正: 直接 setRegisterStep(1) せず、ラッパー関数を呼ぶ */}
                                        <button 
                                            type="button" 
                                            onClick={handleBackToStep1}
                                            className="text-xs text-indigo-500 hover:underline"
                                        >
                                            メールアドレスを修正する
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Step 3: 詳細情報入力 */}
                            {registerStep === 3 && (
                                <form onSubmit={handleRegisterComplete} className="space-y-6">
                                    <p className="text-sm text-gray-500 mb-4">
                                        最後にユーザー情報を設定してください。
                                    </p>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">ユーザーID (英数字)</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaIdCard className="text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                pattern="[a-zA-Z0-9_-]+"
                                                value={userId}
                                                onChange={(e) => setUserId(e.target.value)}
                                                className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="my_user_id"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">※半角英数字、アンダースコア、ハイフンのみ</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">表示名 (ニックネーム)</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <FaUser className="text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder="フルコース太郎"
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
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {isLoading ? '登録処理中...' : '登録してはじめる'}
                                    </button>
                                </form>
                            )}
                        </>
                    )}

                    {/* モード切り替えリンク */}
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