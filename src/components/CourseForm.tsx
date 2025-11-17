// src/components/CourseForm.tsx (メーカー対応と役割制御の修正 - 最終版)
"use client";

import React, { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ProductSelectionModal } from './ProductSelectionModal';

// 💡 必須: メーカー情報を追加
interface CourseItem {
  key: string; 
  role: string; 
  productId: number | null; 
  productName: string | null; 
  productImageUrl: string | null; 
  manufacturer: string | null; // <-- 必須
  isMandatory: boolean; 
}

// 役割の選択肢とデフォルト値
const roleOptions = ['前菜', 'つまみ', 'メインディッシュ', 'デザート', 'ドリンク', 'その他', '未選択'];
const DEFAULT_ROLE = '未選択';

// 💡 必須のコース構成にメーカー情報を追加
const INITIAL_MANDATORY_STRUCTURE: CourseItem[] = [
  { key: 'm-0', role: '前菜', productId: null, productName: null, productImageUrl: null, manufacturer: null, isMandatory: true },
  { key: 'm-1', role: 'つまみ', productId: null, productName: null, productImageUrl: null, manufacturer: null, isMandatory: true },
  { key: 'm-2', role: 'メインディッシュ', productId: null, productName: null, productImageUrl: null, manufacturer: null, isMandatory: true }, 
  { key: 'm-3', role: 'メインディッシュ', productId: null, productName: null, productImageUrl: null, manufacturer: null, isMandatory: true }, 
  { key: 'm-4', role: 'デザート', productId: null, productName: null, productImageUrl: null, manufacturer: null, isMandatory: true },
];


/**
 * フルコース投稿フォームコンポーネント
 */
export const CourseForm: React.FC = () => {
  const { status } = useSession();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseItems, setCourseItems] = useState<CourseItem[]>(INITIAL_MANDATORY_STRUCTURE); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [editingItemKey, setEditingItemKey] = useState<string | null>(null); 
  const [modalInitialRole, setModalInitialRole] = useState('その他'); 

  // --------------------------------------------------
  // 処理: モーダル連携 (選択・変更)
  // --------------------------------------------------

  // モーダルを開く処理
  const handleOpenModal = (itemKey: string, initialRole: string) => {
    setEditingItemKey(itemKey);
    setModalInitialRole(initialRole); 
    setIsModalOpen(true);
  };
  
  // 💡 モーダルから製品が選択されたときの処理（メーカー情報を受け取る）
  const handleProductSelected = useCallback((
    productId: number, 
    productName: string, 
    productImageUrl: string,
    selectedRole: string,
    manufacturer: string // <-- 受け取り
  ) => {
    const selectedProduct = { productId, productName, productImageUrl, manufacturer }; // <-- メーカー情報を含む

    if (editingItemKey === 'NEW_ITEM' || editingItemKey === null) {
        // 新規アイテムとして追加 (CourseForm.tsx内ではこのロジックが使用される)
        const newKey = `optional-${Date.now()}`;
        const newItem: CourseItem = { 
            key: newKey, 
            role: selectedRole, 
            ...selectedProduct,
            isMandatory: false 
        };
        setCourseItems(prev => [...prev, newItem]);
    } else {
        // 既存アイテムの更新
        setCourseItems(prevItems => prevItems.map(item => 
            item.key === editingItemKey 
                ? { ...item, ...selectedProduct, role: selectedRole } 
                : item
        ));
    }
    
    setEditingItemKey(null);
    setIsModalOpen(false); 
  }, [editingItemKey]);

  // 製品の削除（未選択状態に戻す）またはアイテムの削除 
  const handleRemoveItem = useCallback((itemKey: string) => {
    const itemToRemove = courseItems.find(item => item.key === itemKey);
    if (!itemToRemove) return;

    if (itemToRemove.isMandatory) {
      setCourseItems(prevItems => prevItems.map(item => 
        item.key === itemKey 
          // 製品情報とメーカー情報をリセット
          ? { ...item, productId: null, productName: null, productImageUrl: null, manufacturer: null } 
          : item
      ));
    } else {
      setCourseItems(prevItems => prevItems.filter(item => item.key !== itemKey));
    }
  }, [courseItems]);

  const handleRoleChange = useCallback((itemKey: string, newRole: string) => {
    setCourseItems(prevItems => prevItems.map(item => 
        item.key === itemKey 
            ? { ...item, role: newRole }
            : item
    ));
  }, []);

  // 商品追加ボタンを押した際の処理
  const handleAddOptionalItem = () => {
      // 💡 モーダルを新規追加モードで開き、役割の初期値として'その他'を渡す
      handleOpenModal('NEW_ITEM', 'その他'); 
  };
  
  // 全アイテムの順序変更 (上下ボタン)
  const handleMoveItem = useCallback((index: number, direction: 'up' | 'down') => {
    const newItems = [...courseItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      setCourseItems(newItems);
    }
  }, [courseItems]);

  // --------------------------------------------------
  // 処理: フォームの送信
  // --------------------------------------------------
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (status !== 'authenticated') {
      setError('ログインが必要です。');
      return;
    }
    
    // 必須チェックの強化
    const missingMandatory = courseItems
      .filter(item => item.isMandatory)
      .some(item => item.productId === null || item.role === DEFAULT_ROLE); 
      
    if (missingMandatory) {
      setError('必須アイテム（前菜、つまみ、メインディッシュ2品、デザート）のすべてに製品を選択し、有効な役割を設定してください。');
      return;
    }

    const apiData = {
      title,
      description,
      courseItems: courseItems
        .filter(item => item.productId !== null)
        .map((item, index) => ({
          productId: item.productId!,
          role: item.role, 
          order: index, 
        })),
    };
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        alert('フルコースの投稿が完了しました！');
        router.push('/');
      } else {
        const data = await response.json();
        setError(data.message || '投稿に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      setError('ネットワークエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }

  }, [status, title, description, courseItems, router]);


  if (status === 'loading') { return <div className="p-8 text-center">ロード中...</div>; }
  if (status === 'unauthenticated') { return <div className="p-8 text-center text-red-500">投稿するにはログインしてください。</div>; }

  // --------------------------------------------------
  // UI: フォーム表示
  // --------------------------------------------------
  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">フルコース投稿</h1>
      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-200 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* コースタイトル (省略) */}
        <div className="mb-6">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">コースタイトル (必須)</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* コース構成セクション */}
        <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-800">コース構成</h2>
            <button
                type="button"
                onClick={handleAddOptionalItem} 
                className="py-1 px-3 bg-purple-600 text-white text-sm font-bold rounded-md hover:bg-purple-700 transition duration-150"
            >
                + 商品を追加
            </button>
        </div>
        
        {/* コースアイテムリスト (全項目) */}
        <CourseItemList
          items={courseItems}
          onOpenModal={handleOpenModal}
          onRemoveItem={handleRemoveItem}
          onMoveItem={handleMoveItem}
          onRoleChange={handleRoleChange} 
          roleOptions={roleOptions} 
        />
        
        {/* ... (コメントと投稿ボタンは省略) ... */}
        <div className="mb-6 border border-gray-300 rounded-lg p-4 bg-gray-50 mt-6">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">コメント</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 text-white font-bold rounded-md transition duration-150 
            ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading ? '投稿中...' : 'フルコースを投稿'}
        </button>
      </form>

      {/* 製品選択モーダルのレンダリング (エラー報告箇所) */}
      <ProductSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProductSelect={handleProductSelected}
        initialRole={modalInitialRole} 
      />
    </div>
  );
};


// --------------------------------------------------
// 補助コンポーネント: CourseItemList (リスト表示の共通化)
// --------------------------------------------------
interface CourseItemListProps {
  items: CourseItem[];
  onOpenModal: (key: string, initialRole: string) => void; 
  onRemoveItem: (key: string) => void;
  onMoveItem: (index: number, direction: 'up' | 'down') => void;
  onRoleChange: (key: string, newRole: string) => void; 
  roleOptions: string[]; 
}

const CourseItemList: React.FC<CourseItemListProps> = ({ 
  items, 
  onOpenModal, 
  onRemoveItem, 
  onMoveItem,
  onRoleChange,
  roleOptions,
}) => {
  if (items.length === 0) {
    return <p className="text-center text-sm text-gray-500 py-4 border border-gray-200 rounded-lg">コースアイテムがありません。</p>;
  }
  
  return (
    <div className="border border-gray-200 rounded-lg">
      <div className="flex items-center text-xs font-semibold text-gray-600 bg-gray-100 p-2 rounded-t-lg">
          <div className="w-8 text-center">順</div>
          <div className="w-28">役割</div>
          <div className="flex-grow">商品名とメーカー</div> 
          <div className="w-32 text-center">操作</div>
      </div>

      <div className="p-2 space-y-1">
        {items.map((item, index) => (
          <div 
            key={item.key}
            className={`flex items-center text-sm space-x-2 p-2 rounded-md ${item.productId === null && item.isMandatory ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-100'}`}
          >
            {/* 順序 */}
            <div className="w-8 text-center text-gray-500">{index + 1}</div>

            {/* 💡 役割プルダウン (必須商品は無効化) */}
            <div className="w-28 font-medium text-gray-800 truncate">
                <select
                    value={item.role}
                    onChange={(e) => onRoleChange(item.key, e.target.value)}
                    disabled={item.isMandatory} // 💡 必須アイテムの場合は disabled
                    className={`w-full px-1 py-1 border rounded-md text-xs 
                        ${item.isMandatory ? 'border-red-300 bg-gray-100 cursor-not-allowed' : 'border-gray-300 bg-white'}`}
                >
                    {roleOptions.map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
                {item.isMandatory && <span className="text-red-500 ml-1 text-xs">*</span>}
            </div>
            
            {/* 商品名と画像 (メーカー表示) */}
            <div className="flex-grow flex items-center space-x-3">
              {item.productId ? (
                <>
                  <img 
                    src={item.productImageUrl!} 
                    alt={item.productName!} 
                    className="w-8 h-8 rounded-full object-cover border border-gray-300"
                  />
                  <div>
                    <span className="font-semibold text-gray-800">{item.productName}</span>
                    {/* 💡 メーカー名を商品名の下に表示 (黒以外の文字色: インディゴ) */}
                    {(item.manufacturer) && (
                        <p className="text-xs text-indigo-600/90 truncate">{item.manufacturer}</p>
                    )}
                  </div>
                </>
              ) : (
                <span className="text-sm text-red-500 italic">
                  {item.isMandatory ? '製品が未選択 (必須)' : '製品が未選択'}
                </span>
              )}
            </div>
            
            {/* 操作ボタン */}
            <div className="w-32 flex justify-end space-x-1">
              {/* 上下移動ボタン */}
              <button
                type="button"
                onClick={() => onMoveItem(index, 'up')}
                disabled={index === 0}
                className={`text-gray-500 hover:text-blue-600 transition disabled:opacity-30 disabled:cursor-not-allowed`}
                title="上に移動"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMoveItem(index, 'down')}
                disabled={index === items.length - 1}
                className={`text-gray-500 hover:text-blue-600 transition disabled:opacity-30 disabled:cursor-not-allowed`}
                title="下に移動"
              >
                ↓
              </button>

              <button
                type="button"
                onClick={() => onOpenModal(item.key, item.role)} 
                className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 transition"
                title={item.productId ? '製品を変更' : '製品を選択'}
              >
                {item.productId ? '変更' : '選択'}
              </button>
              
              {/* 削除 */}
              {(item.productId || !item.isMandatory) && (
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.key)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title={item.isMandatory ? '製品を解除' : 'アイテムを削除'}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};