// src/components/Navbar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation'; 
import { FaUserCircle, FaSignOutAlt, FaPlusCircle } from 'react-icons/fa';

export const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const currentPath = usePathname(); 

  // ログアウト処理
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const isLoading = status === 'loading';

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* 1. ロゴ/タイトル */}
          <Link href="/" className="flex-shrink-0 text-xl font-bold text-gray-900 hover:text-blue-600 transition">
            MyFullCourseApp
          </Link>

          {/* 2. 右側の認証ステータスとボタン */}
          <div className="flex items-center space-x-4">
            
            {/* 💡 ログインしている場合のみ「投稿」ボタンを表示 */}
            {session && (
              <Link 
                href="/create" 
                className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 transition"
              >
                <FaPlusCircle className="mr-1" />
                投稿
              </Link>
            )}

            {isLoading ? (
              // ロード中は何も表示しない
              <div className="h-5 w-20 bg-gray-200 animate-pulse rounded"></div>
            ) : session ? (
              // --- ログイン済みの場合 ---
              <div className="flex items-center space-x-3">
                
                {/* ユーザー名とアイコン */}
                <div className="flex items-center text-sm font-medium text-gray-700">
                  <FaUserCircle className="w-6 h-6 mr-1 text-blue-500" />
                  {session.user?.name || session.user?.email}
                </div>

                {/* ログアウトボタン */}
                <button
                  onClick={handleSignOut}
                  className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                  title="ログアウト"
                >
                  <FaSignOutAlt className="w-5 h-5" />
                </button>
              </div>
            ) : (
              // --- 未ログインの場合 ---
              <div className="flex items-center space-x-3">
                {/* ログインボタン: 現在のパスを callbackUrl として付与 */}
                <Link 
                  href={`/login?callbackUrl=${encodeURIComponent(currentPath)}`}
                  className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                >
                  ログイン
                </Link>
                <Link 
                  href="/register" 
                  className="px-3 py-1 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition"
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