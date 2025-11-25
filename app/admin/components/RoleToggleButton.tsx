// app/admin/components/RoleToggleButton.tsx
'use client';

import { useState } from 'react';
import { FaUserShield, FaUser } from 'react-icons/fa';
import { toggleUserRole } from '../actions';

interface Props {
  userId: number;
  isAdmin: boolean;
  isSelf: boolean; // 自分自身かどうか
}

export default function RoleToggleButton({ userId, isAdmin, isSelf }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async () => {
    // 自分自身は変更不可
    if (isSelf) return;

    // 警告メッセージの出し分け
    const message = isAdmin
      ? "このユーザーの管理者権限を剥奪しますか？\n管理画面へのアクセスができなくなります。"
      : "このユーザーを管理者にしますか？\n管理画面へのフルアクセス権限が付与されます。";

    if (!confirm(message)) return;

    setIsUpdating(true);
    try {
      const result = await toggleUserRole(userId);
      if (!result.success) {
        alert(result.error || '変更に失敗しました');
      }
    } catch (error) {
      alert('エラーが発生しました');
    } finally {
      setIsUpdating(false);
    }
  };

  // スタイル定義
  const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition disabled:opacity-50";
  const cursorClass = isSelf ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:opacity-80";
  
  const adminClasses = `bg-purple-100 text-purple-800 ${cursorClass}`;
  const userClasses = `bg-green-100 text-green-800 ${cursorClass}`;

  return (
    <button
      onClick={handleToggle}
      disabled={isUpdating || isSelf}
      className={`${baseClasses} ${isAdmin ? adminClasses : userClasses}`}
      title={isSelf ? "自分自身の権限は変更できません" : "クリックして権限を変更"}
    >
      {isAdmin ? (
        <>
          <FaUserShield className="mr-1" />
          管理者
        </>
      ) : (
        <>
          <FaUser className="mr-1" />
          一般
        </>
      )}
    </button>
  );
}