// app/(auth)/reset-password/page.tsx
"use client";

import { useState, Suspense } from 'react'; // Suspenseを追加
import { useRouter, useSearchParams } from 'next/navigation';

// コンポーネントを分割
function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
    });

    if (res.ok) {
        setIsSuccess(true);
        setMessage('パスワードを更新しました。新しいパスワードでログインしてください。');
        setTimeout(() => router.push('/login'), 3000);
    } else {
        setMessage('トークンが無効か、期限切れです。');
    }
  };

  if (!token) {
      return <p className="text-red-500 text-center">無効なアクセスです。</p>;
  }

  return (
    <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">新しいパスワードの設定</h2>
        
        {isSuccess ? (
            <div className="text-center">
                <p className="text-green-600 font-bold mb-4">{message}</p>
                <p className="text-sm text-gray-500">ログイン画面へ移動します...</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                {message && <p className="text-red-500 text-sm text-center">{message}</p>}
                <div>
                    <label className="block text-sm font-medium text-gray-700">新しいパスワード</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        placeholder="6文字以上"
                    />
                </div>
                <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                    パスワードを変更
                </button>
            </form>
        )}
    </div>
  );
}

// メインコンポーネントでSuspenseを使用
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <Suspense fallback={<div>読み込み中...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}