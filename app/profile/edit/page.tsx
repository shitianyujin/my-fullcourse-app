// app/profile/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaCheck } from 'react-icons/fa';

// 💡 プリセット画像のリスト (DiceBear APIを使用)
// 好きなスタイルがあればここを変えるだけで雰囲気が変わります
const AVATAR_OPTIONS = [
  // 男性風
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  // 女性風
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Lilly",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sane",
  // 食べ物・キャラクター風
  "https://api.dicebear.com/7.x/bottts/svg?seed=Foodie",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Yummy",
  // シンプル
  "https://api.dicebear.com/7.x/identicon/svg?seed=FullCourse",
  "https://api.dicebear.com/7.x/identicon/svg?seed=App",
];

export default function ProfileEditPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 初期データの読み込み
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setName(session.user.name || '');
      // sessionにbioが含まれていない場合があるので、必要ならAPIから再取得推奨ですが
      // ここでは簡易的にsession利用、または空文字としています
      setImage(session.user.image || '');
      
      // ※ 本来はここで /api/user/profile 等を叩いて bio を取得すべきです
      // 今回はコード簡略化のため割愛しますが、必要なら追加してください
      fetchBio(); 
    }
  }, [status, session]);

  // 自己紹介文などをDBから取得する処理
  const fetchBio = async () => {
    try {
        const res = await fetch(`/api/user/profile`);
        if(res.ok) {
            const data = await res.json();
            setBio(data.user.bio || '');
            // 画像や名前もDBの最新値を優先
            setName(data.user.name || '');
            setImage(data.user.image || '');
        }
    } catch(e) {
        console.error(e);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, image }),
      });

      if (res.ok) {
        // セッション情報の更新
        await update({ name, image });
        alert('プロフィールを更新しました');
        router.back(); // 元の画面に戻る
        router.refresh();
      } else {
        alert('更新に失敗しました');
      }
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') return <div className="p-8 text-center">読み込み中...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">プロフィール編集</h1>

        <form onSubmit={handleSubmit}>
          
          {/* 1. アイコン選択セクション */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              プロフィール画像
            </label>
            
            {/* 現在のアイコン表示 */}
            <div className="flex items-center justify-center mb-6">
                <div className="relative w-24 h-24">
                    {image ? (
                        <img src={image} alt="Current" className="w-full h-full rounded-full object-cover border-4 border-indigo-100" />
                    ) : (
                        <FaUserCircle className="w-full h-full text-gray-300" />
                    )}
                </div>
            </div>

            {/* 選択グリッド */}
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {/* 「画像なし」に戻すボタン */}
                <button
                    type="button"
                    onClick={() => setImage('')}
                    className={`aspect-square rounded-full border-2 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition ${image === '' ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-gray-200'}`}
                    title="画像なし"
                >
                    <FaUserCircle className="text-gray-400 text-2xl" />
                </button>

                {/* プリセットアイコン */}
                {AVATAR_OPTIONS.map((url, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => setImage(url)}
                        className={`relative aspect-square rounded-full overflow-hidden border-2 transition hover:opacity-80 ${image === url ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent'}`}
                    >
                        <img src={url} alt={`Avatar ${index}`} className="w-full h-full object-cover" />
                        {image === url && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                <FaCheck className="text-white font-bold" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
                リストからアイコンを選択してください
            </p>
          </div>

          {/* 2. 名前入力 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* 3. 自己紹介入力 */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              自己紹介
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="好きな食べ物や、よく行くスーパーなど"
            />
          </div>

          {/* ボタンエリア */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-md hover:bg-gray-200 transition"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`flex-1 py-3 text-white font-bold rounded-md transition shadow-sm ${
                isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isLoading ? '保存中...' : '変更を保存'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}