// app/admin/components/DeleteButton.tsx
'use client';

import { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { deleteUser, deleteComment } from '../actions';

interface Props {
  id: number;
  // 💡 targetを必須(required)に変更。意図しない削除を防ぎます。
  target: 'user' | 'comment';
}

export default function DeleteButton({ id, target }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const message = target === 'user'
      ? '本当にこのユーザーを削除しますか？\n投稿したコースやコメントも全て削除されます。'
      : '本当にこのコメントを削除しますか？';

    if (!confirm(message)) {
      return;
    }

    setIsDeleting(true);
    try {
      let result;
      // 明示的な分岐
      if (target === 'user') {
        result = await deleteUser(id);
      } else if (target === 'comment') {
        result = await deleteComment(id);
      }

      if (result && !result.success) {
        alert(result.error || '削除に失敗しました');
      }
    } catch (error) {
      alert('エラーが発生しました');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-2 rounded-full transition disabled:opacity-50"
      title="削除"
    >
      <FaTrash size={14} />
    </button>
  );
}