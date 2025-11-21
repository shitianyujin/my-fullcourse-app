// src/components/CourseForm.tsx (編集対応版)
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ProductSelectionModal } from './ProductSelectionModal';

interface CourseItem {
  key: string; 
  role: string; 
  productId: number | null; 
  productName: string | null; 
  productImageUrl: string | null; 
  manufacturer: string | null;
  isMandatory: boolean; 
}

// 編集用のデータ型
interface InitialData {
  title: string;
  description: string;
  courseItems: any[];
}

interface CourseFormProps {
  courseId?: number;         // 編集時のみ渡される
  initialData?: InitialData; // 編集時のみ渡される
}

const roleOptions = ['前菜', 'つまみ', 'メインディッシュ', 'デザート', 'ドリンク', 'その他', '未選択'];
const DEFAULT_ROLE = '未選択';

// デフォルトの必須構造（新規作成用）
const INITIAL_MANDATORY_STRUCTURE: CourseItem[] = [
  { key: 'm-0', role: '前菜', productId: null, productName: null, productImageUrl: null, manufacturer: null, isMandatory: true },
  { key: 'm-1', role: 'つまみ', productId: null, productName: null, productImageUrl: null, manufacturer: null, isMandatory: true },
  { key: 'm-2', role: 'メインディッシュ', productId: null, productName: null, productImageUrl: null, manufacturer: null, isMandatory: true }, 
  { key: 'm-3', role: 'メインディッシュ', productId: null, productName: null, productImageUrl: null, manufacturer: null, isMandatory: true }, 
  { key: 'm-4', role: 'デザート', productId: null, productName: null, productImageUrl: null, manufacturer: null, isMandatory: true },
];

export const CourseForm: React.FC<CourseFormProps> = ({ courseId, initialData }) => {
  const { data: session, status } = useSession(); 
  const router = useRouter();
  const isEditMode = !!courseId; // 編集モードかどうか

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseItems, setCourseItems] = useState<CourseItem[]>(INITIAL_MANDATORY_STRUCTURE); 
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [editingItemKey, setEditingItemKey] = useState<string | null>(null); 
  const [modalInitialRole, setModalInitialRole] = useState('その他'); 

  // --------------------------------------------------
  // 初期データのロード処理 (編集モード用)
  // --------------------------------------------------
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');

      // DBのアイテムをUI用のCourseItem形式に変換
      if (initialData.courseItems && initialData.courseItems.length > 0) {
        // order順にソート
        const sortedItems = [...initialData.courseItems].sort((a, b) => a.order - b.order);
        
        const loadedItems: CourseItem[] = [];

        // 最初の5つは必須枠に割り当て
        for (let i = 0; i < 5; i++) {
          const dbItem = sortedItems[i]; // 存在するかもしれないし、ないかもしれない
          if (dbItem) {
            loadedItems.push({
              key: `m-${i}`,
              role: dbItem.role || INITIAL_MANDATORY_STRUCTURE[i].role,
              productId: dbItem.productId,
              productName: dbItem.product?.name || null,
              productImageUrl: dbItem.product?.imageUrl || null,
              manufacturer: dbItem.product?.manufacturer || null,
              isMandatory: true,
            });
          } else {
            // DBにデータが足りない場合はデフォルト構造を使う
            loadedItems.push(INITIAL_MANDATORY_STRUCTURE[i]);
          }
        }

        // 6つ目以降は任意枠として追加
        for (let i = 5; i < sortedItems.length; i++) {
          const dbItem = sortedItems[i];
          loadedItems.push({
            key: `optional-${i}`,
            role: dbItem.role || 'その他',
            productId: dbItem.productId,
            productName: dbItem.product?.name || null,
            productImageUrl: dbItem.product?.imageUrl || null,
            manufacturer: dbItem.product?.manufacturer || null,
            isMandatory: false,
          });
        }

        setCourseItems(loadedItems);
      }
    }
  }, [initialData]);

  // ... (以下、既存のハンドラーはほぼ同じ) ...

  const handleOpenModal = (itemKey: string, initialRole: string) => {
    setEditingItemKey(itemKey);
    setModalInitialRole(initialRole); 
    setIsModalOpen(true);
  };
  
  const handleProductSelected = useCallback((
    productId: number, 
    productName: string, 
    productImageUrl: string,
    selectedRole: string,
    manufacturer: string 
  ) => {
    const selectedProduct = { productId, productName, productImageUrl, manufacturer };

    if (editingItemKey === 'NEW_ITEM' || editingItemKey === null) {
        const newKey = `optional-${Date.now()}`;
        const newItem: CourseItem = { 
            key: newKey, 
            role: selectedRole, 
            ...selectedProduct,
            isMandatory: false 
        };
        setCourseItems(prev => [...prev, newItem]);
    } else {
        setCourseItems(prevItems => prevItems.map(item => 
            item.key === editingItemKey 
                ? { ...item, ...selectedProduct, role: selectedRole } 
                : item
        ));
    }
    
    setEditingItemKey(null);
    setIsModalOpen(false); 
  }, [editingItemKey]);

  const handleRemoveItem = useCallback((itemKey: string) => {
    const itemToRemove = courseItems.find(item => item.key === itemKey);
    if (!itemToRemove) return;

    if (itemToRemove.isMandatory) {
      setCourseItems(prevItems => prevItems.map(item => 
        item.key === itemKey 
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

  const handleAddOptionalItem = () => {
      handleOpenModal('NEW_ITEM', 'その他'); 
  };
  
  const handleMoveItem = useCallback((index: number, direction: 'up' | 'down') => {
    const newItems = [...courseItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      setCourseItems(newItems);
    }
  }, [courseItems]);

  // --------------------------------------------------
  // 送信処理 (新規/更新 分岐)
  // --------------------------------------------------
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (status !== 'authenticated') {
      setError('ログインが必要です。');
      return;
    }
    
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
      // 編集モードなら PUT, 新規なら POST
      const url = isEditMode ? `/api/courses/${courseId}` : '/api/courses';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      if (response.ok) {
        alert(isEditMode ? 'フルコースを更新しました！' : 'フルコースの投稿が完了しました！');
        // 編集完了後は詳細画面へ、新規作成後はトップへ
        router.push(isEditMode ? `/course/${courseId}` : '/');
        router.refresh(); // データ更新を反映
      } else {
        const data = await response.json();
        setError(data.message || '処理に失敗しました。');
      }
    } catch (err) {
      console.error(err);
      setError('ネットワークエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }

  }, [status, title, description, courseItems, router, isEditMode, courseId]);

  // 削除処理 (編集モードのみ)
  const handleDelete = async () => {
    if (!isEditMode || !confirm('本当にこのコースを削除しますか？\nこの操作は取り消せません。')) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('削除しました。');

        // ユーザーIDがあればプロフィールへ、なければトップページへ遷移
        // (session.user.id は auth.ts で設定した文字列型のIDが入っています)
        const userId = (session?.user as any)?.id;
        if (userId) {
            router.push(`/profile/${userId}`);
        } else {
            router.push('/');
        }
        
        router.refresh();
      } else {
        alert('削除に失敗しました。');
      }
    } catch (error) {
      console.error(error);
      alert('エラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };


  if (status === 'loading') { return <div className="p-8 text-center">ロード中...</div>; }
  if (status === 'unauthenticated') { return <div className="p-8 text-center text-red-500">投稿するにはログインしてください。</div>; }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
            {isEditMode ? 'フルコース編集' : 'フルコース投稿'}
        </h1>
        {isEditMode && (
            <button 
                type="button" 
                onClick={handleDelete}
                className="text-sm text-red-600 hover:text-red-800 underline"
            >
                このコースを削除する
            </button>
        )}
      </div>

      {error && (
        <div className="p-3 mb-4 text-red-700 bg-red-100 border border-red-200 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ... (既存のフォーム内容は同じ) ... */}
        
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
        
        <CourseItemList
          items={courseItems}
          onOpenModal={handleOpenModal}
          onRemoveItem={handleRemoveItem}
          onMoveItem={handleMoveItem}
          onRoleChange={handleRoleChange} 
          roleOptions={roleOptions} 
        />
        
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

        <div className="flex gap-4">
            <button
                type="button"
                onClick={() => router.back()}
                className="w-1/3 py-3 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-md transition duration-150"
            >
                キャンセル
            </button>
            <button
                type="submit"
                disabled={isLoading}
                className={`w-2/3 py-3 text-white font-bold rounded-md transition duration-150 
                    ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                {isLoading ? '送信中...' : (isEditMode ? '更新する' : '投稿する')}
            </button>
        </div>
      </form>

      <ProductSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProductSelect={handleProductSelected}
        initialRole={modalInitialRole} 
      />
    </div>
  );
};

// CourseItemList コンポーネントは変更なし（そのまま使用）
// ...
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

            {/* 役割プルダウン */}
            <div className="w-28 font-medium text-gray-800 truncate">
                <select
                    value={item.role}
                    onChange={(e) => onRoleChange(item.key, e.target.value)}
                    disabled={item.isMandatory} 
                    className={`w-full px-1 py-1 border rounded-md text-xs 
                        ${item.isMandatory ? 'border-red-300 bg-gray-100 cursor-not-allowed' : 'border-gray-300 bg-white'}`}
                >
                    {roleOptions.map(role => (
                        <option key={role} value={role}>{role}</option>
                    ))}
                </select>
                {item.isMandatory && <span className="text-red-500 ml-1 text-xs">*</span>}
            </div>
            
            {/* 商品名と画像 */}
            <div className="flex-grow flex items-center space-x-3">
              {item.productId ? (
                <>
                  {item.productImageUrl && (
                    <img 
                        src={item.productImageUrl} 
                        alt={item.productName || ''} 
                        className="w-8 h-8 rounded-full object-cover border border-gray-300"
                    />
                  )}
                  <div>
                    <span className="font-semibold text-gray-800">{item.productName}</span>
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
              <button
                type="button"
                onClick={() => onMoveItem(index, 'up')}
                disabled={index === 0}
                className={`text-gray-500 hover:text-blue-600 transition disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMoveItem(index, 'down')}
                disabled={index === items.length - 1}
                className={`text-gray-500 hover:text-blue-600 transition disabled:opacity-30 disabled:cursor-not-allowed`}
              >
                ↓
              </button>

              <button
                type="button"
                onClick={() => onOpenModal(item.key, item.role)} 
                className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600 transition"
              >
                {item.productId ? '変更' : '選択'}
              </button>
              
              {(item.productId || !item.isMandatory) && (
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.key)}
                  className="text-red-500 hover:text-red-700 p-1"
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