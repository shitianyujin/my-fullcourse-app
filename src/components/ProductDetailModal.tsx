// src/components/ProductDetailModal.tsx
'use client';

import React, { useEffect } from 'react';
import { FaTimes, FaExternalLinkAlt, FaAmazon, FaBuilding, FaBarcode } from 'react-icons/fa';

// PrismaのProductモデルに基づいた型定義
export interface Product {
  id: number;
  name: string;
  manufacturer: string;
  description: string | null;
  imageUrl: string | null;
  officialUrl: string | null;
  priceReference: string | null;
  priceUnitQty: string | null;
  janCode: string | null;
  amazonAsin: string | null;
}

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  product 
}) => {
  // モーダルが開いているときは背景スクロールを抑制
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col relative"
        onClick={(e) => e.stopPropagation()} // モーダル内部クリックで閉じないようにする
      >
        {/* 閉じるボタン */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition z-10"
        >
          <FaTimes size={20} />
        </button>

        <div className="p-6 md:p-8">
          {/* ヘッダーエリア: メーカーと商品名 */}
          <div className="mb-6 pr-8">
            <div className="flex items-center text-indigo-600 font-bold text-sm mb-1">
              <FaBuilding className="mr-2" />
              {product.manufacturer}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
              {product.name}
            </h2>
          </div>

          {/* メインコンテンツ: 画像と詳細 */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* 左側: 画像 */}
            <div className="w-full md:w-1/2 flex-shrink-0">
              <div className="aspect-square bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">No Image</div>
                )}
              </div>
            </div>

            {/* 右側: 情報 */}
            <div className="w-full md:w-1/2 flex flex-col">
              {/* 参考価格 */}
              {(product.priceReference || product.priceUnitQty) && (
                <div className="mb-4 bg-gray-50 p-3 rounded-lg inline-block border border-gray-100">
                    <span className="text-xs text-gray-500 block">参考価格</span>
                    <div className="font-bold text-gray-800 text-lg">
                        {product.priceReference ? `¥${parseInt(product.priceReference).toLocaleString()}` : '--'}
                        {product.priceUnitQty && <span className="text-sm font-normal text-gray-500 ml-2">/ {product.priceUnitQty}</span>}
                    </div>
                </div>
              )}

              {/* 商品説明 */}
              <div className="mb-6 flex-grow">
                <h3 className="text-sm font-bold text-gray-700 mb-2">商品詳細</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {product.description || '商品説明がありません。'}
                </p>
              </div>
              
              {/* JANコード (控えめに表示) */}
              {product.janCode && (
                 <div className="flex items-center text-xs text-gray-400 mb-6">
                    <FaBarcode className="mr-1" />
                    <span>JAN: {product.janCode}</span>
                 </div>
              )}

              {/* アクションボタン */}
              <div className="flex flex-col gap-3 mt-auto">
                {/* 公式サイトリンク */}
                {product.officialUrl && (
                  <a 
                    href={product.officialUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition shadow-sm hover:shadow"
                  >
                    公式サイトを見る
                    <FaExternalLinkAlt className="ml-2 text-xs" />
                  </a>
                )}

                {/* Amazonリンク (ASINがある場合、または名前で検索させる) */}
                <a 
                    href={product.amazonAsin 
                        ? `https://www.amazon.co.jp/dp/${product.amazonAsin}` 
                        : `https://www.amazon.co.jp/s?k=${encodeURIComponent(product.manufacturer + ' ' + product.name)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-3 px-4 bg-[#FF9900] text-white font-bold rounded-lg hover:bg-[#e68a00] transition shadow-md hover:shadow-lg"
                >
                    <FaAmazon className="mr-2" size={20} />
                    Amazonで見る
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};