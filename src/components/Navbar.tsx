// src/components/Navbar.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation'; 
import { FaUserCircle, FaSignOutAlt, FaPlusCircle, FaUser, FaChevronDown } from 'react-icons/fa';

export const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const currentPath = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLoading = status === 'loading';

  // ユーザーIDを取得
  useEffect(() => {
    const fetchUserId = async () => {
      if (session?.user?.email) {
        try {
          const res = await fetch('/api/user/profile');
          if (res.ok) {
            const data = await res.json();
            setCurrentUserId(data.user.id);
          }
        } catch (error) {
          console.error('Failed to fetch user ID:', error);
        }
      }
    };
    fetchUserId();
  }, [session]);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // ログアウト処理
  const handleSignOut = async () => {
    setIsDropdownOpen(false);
    await signOut({ callbackUrl: '/' });
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* 1. ロゴ/タイトル */}
          <Link href="/" className="flex-shrink-0 text-xl font-bold text-gray-900 hover:text-indigo-600 transition">
            MyFullCourseApp
          </Link>

          {/* 2. 右側の認証ステータスとボタン */}
          <div className="flex items-center space-x-4">
            
            {/* 💡 ログインしている場合のみ「投稿」ボタンを表示 */}
            {session && (
              <Link 
                href="/create" 
                className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
              >
                <FaPlusCircle className="mr-1" />
                投稿
              </Link>
            )}

            {isLoading ? (
              // ロード中
              <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : session ? (
              // --- ログイン済みの場合 ---
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover border-2 border-indigo-200"
                    />
                  ) : (
                    <FaUserCircle className="w-8 h-8 text-indigo-500" />
                  )}
                  <span className="hidden md:block">{session.user?.name || session.user?.email}</span>
                  <FaChevronDown className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* ドロップダウンメニュー */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {currentUserId && (
                      <Link
                        href={`/profile/${currentUserId}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <FaUser className="mr-2 text-indigo-500" />
                        プロフィール
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <FaSignOutAlt className="mr-2" />
                      ログアウト
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // --- 未ログインの場合 ---
              <div className="flex items-center space-x-3">
                <Link 
                  href={`/login?callbackUrl=${encodeURIComponent(currentPath)}`}
                  className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition"
                >
                  ログイン
                </Link>
                <Link 
                  href={`/login?view=magiclink&callbackUrl=${encodeURIComponent(currentPath)}`}
                  className="px-3 py-1 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition"
                >
                  新規登録
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};