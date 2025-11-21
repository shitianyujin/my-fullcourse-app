'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaBoxOpen } from 'react-icons/fa';

export default function RequestProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // 入力フォーム状態
  const [productName, setProductName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [officialUrl, setOfficialUrl] = useState('');
  const [memo, setMemo] = useState('');
  
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 複数の入力項目を1つのテキストにまとめて、detailsとして送信する
    const details = `
【商品名】 ${productName}
【メーカー】 ${manufacturer}
【参考URL】 ${officialUrl || 'なし'}
【備考】
${memo}
    `.trim();

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PRODUCT_REQUEST', // 専用の種別を指定
          title: `【追加依頼】${productName}`, // 管理画面で見やすいようにタイトルを整形
          details: details,
          name: !session ? guestName : undefined,
          email: !session ? guestEmail : undefined,
        }),
      });

      if (res.ok) {
        alert('追加依頼を送信しました。\n運営チームが確認次第、対応いたします！');
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
        <div className="flex items-center mb-4">
          <div className="bg-indigo-100 p-3 rounded-full mr-4">
            <FaBoxOpen className="text-indigo-600 text-xl" />
          </div>
          <div>
             <h1 className="text-2xl font-bold text-gray-900">商品追加依頼</h1>
             <p className="text-sm text-gray-500">
               アプリに登録されていない冷凍食品がありましたら、ぜひ教えてください。
             </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 未ログイン時のみ表示 */}
          {!session && (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
              <div className="sm:col-span-2 mb-1">
                <p className="text-xs text-gray-500 font-medium">
                  ※ ログインしていないため、ご連絡先を入力してください。
                </p>
              </div>
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

          {/* 商品情報入力欄 */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                商品名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="例：本格炒め炒飯"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                メーカー名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="例：ニチレイフーズ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                参考URL（公式サイトやAmazonなど）
              </label>
              <input
                type="url"
                value={officialUrl}
                onChange={(e) => setOfficialUrl(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">備考</label>
              <textarea
                rows={3}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="JANコードがわかればこちらへ。その他補足があればご記入ください。"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {isLoading ? '送信中...' : '追加を依頼する'}
          </button>
        </form>
      </div>
    </div>
  );
}