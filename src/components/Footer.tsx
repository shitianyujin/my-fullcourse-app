// src/components/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export const Footer: React.FC = () => {
  // 現在の年を取得
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
          
          {/* 左側: ブランド情報 */}
          <div className="text-center md:text-left">
            <h2 className="text-lg font-bold text-gray-900"><Logo variant="header" /></h2>
            <p className="text-sm text-gray-500 mt-1">
              冷凍食品でつくる、最強の『俺のフルコース』。
            </p>
            <p className="text-xs text-gray-400 mt-4">
              &copy; {currentYear} Oreful. All rights reserved.
            </p>
          </div>

          {/* 右側: リンク集 */}
          <div className="flex flex-wrap justify-center md:justify-end gap-8 text-sm">
            {/* サービス */}
            <div className="flex flex-col space-y-2 text-center md:text-left">
              <h3 className="font-semibold text-gray-900">サービス</h3>
              <Link href="/ranking" className="text-gray-600 hover:text-blue-600 transition">
                ランキング
              </Link>
              <Link href="/search" className="text-gray-600 hover:text-blue-600 transition">
                コースを探す
              </Link>
            </div>

            {/* サポート */}
            <div className="flex flex-col space-y-2 text-center md:text-left">
              <h3 className="font-semibold text-gray-900">サポート</h3>
              <Link href="/about" className="text-gray-600 hover:text-blue-600 transition">
                おれふるについて
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition">
                お問い合わせ
              </Link>
              <Link href="/request-product" className="text-gray-600 hover:text-blue-600 transition">
                商品追加依頼
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};