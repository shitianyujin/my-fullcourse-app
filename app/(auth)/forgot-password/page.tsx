// app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
        const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });

        if (res.ok) {
            setMessage('パスワード再設定用のメールを送信しました。メールをご確認ください。');
        } else {
            setMessage('エラーが発生しました。時間をおいて再度お試しください。');
        }
    } catch (error) {
        setMessage('通信エラーが発生しました。');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">パスワードリセット</h2>
        
        {!message ? (
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">
                    登録しているメールアドレスを入力してください。<br/>
                    再設定用のリンクをお送りします。
                </p>
                <div>
                    <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="your@email.com"
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className={`w-full text-white py-2 rounded transition-colors
                        ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                >
                    {isLoading ? '送信中...' : '送信'}
                </button>
            </form>
        ) : (
            <div className="text-center">
                <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md text-sm font-medium">
                    {message}
                </div>
                <p className="text-sm text-gray-500 mb-4">
                    メールが届かない場合は、迷惑メールフォルダもご確認ください。
                </p>
            </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-indigo-600 hover:underline">
            ログイン画面に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}