'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaPaperPlane } from 'react-icons/fa';

const submissionTypes = [
  { value: 'REQUEST', label: 'ご要望' },
  { value: 'BUG_REPORT', label: '不具合報告' },
  { value: 'ACCOUNT', label: 'アカウントについて' },
  { value: 'OTHER', label: 'その他' },
];

export default function ContactPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // フォーム状態
  const [type, setType] = useState('OTHER');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          details,
          // 未ログイン時のみ送信
          name: !session ? guestName : undefined,
          email: !session ? guestEmail : undefined,
        }),
      });

      if (res.ok) {
        alert('お問い合わせを受け付けました。\nありがとうございます。');
        router.push('/');
      } else {
        alert('送信に失敗しました。');
      }
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') return <div className="p-8 text-center">読み込み中...</div>;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow rounded-lg p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">お問い合わせ</h1>
        <p className="text-sm text-gray-500 mb-6">
          サービスに関するご質問やご要望、不具合の報告はこちらからお願いします。
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 未ログイン時のみ表示する入力欄 */}
          {!session && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">お名前</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* 問い合わせ種別 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">種別</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {submissionTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* 件名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">件名</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="例：ログインができない"
            />
          </div>

          {/* 内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700">お問い合わせ内容</label>
            <textarea
              required
              rows={5}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="詳細をご記入ください"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            <FaPaperPlane className="mr-2" />
            {isLoading ? '送信中...' : '送信する'}
          </button>
        </form>
      </div>
    </div>
  );
}