// app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [devLink, setDevLink] = useState(''); // 開発用リンク表示

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setDevLink('');

    const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (res.ok) {
        setMessage('パスワードリセット用のリンクを発行しました。');
        // 開発用: 画面にもリンクを出す
        if (data.devLink) {
            setDevLink(data.devLink);
        }
    } else {
        setMessage('エラーが発生しました。');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">パスワードリセット</h2>
        
        {!message ? (
            <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
                登録しているメールアドレスを入力してください。<br/>
                リセット用のリンクを発行します。
            </p>
            <div>
                <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                送信
            </button>
            </form>
        ) : (
            <div className="text-center">
                <p className="text-green-600 font-bold mb-4">{message}</p>
                
                {/* 開発用リンク表示エリア */}
                {devLink && (
                    <div className="bg-yellow-50 p-4 rounded border border-yellow-200 mb-4 text-left">
                        <p className="text-xs text-yellow-800 font-bold mb-1">【開発モード用】擬似メール:</p>
                        <p className="text-xs text-gray-600 mb-2">本来はメールで届くリンクです。</p>
                        <a href={devLink} className="text-blue-600 underline text-sm break-all">
                            {devLink}
                        </a>
                    </div>
                )}
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