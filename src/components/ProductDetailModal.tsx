// src/components/ProductDetailModal.tsx
'use client';

import React, { useEffect } from 'react';
import { FaTimes, FaExternalLinkAlt, FaAmazon, FaShoppingBag, FaStore } from 'react-icons/fa';
import { SiRakuten } from "react-icons/si";
import { getAmazonUrl } from '@/lib/utils';

// PrismaのProductモデルに基づいた型定義
export interface Product {
  id: number;
  name: string;
  manufacturer: string;
  description: string | null;
  imageUrl: string | null;
  officialUrl: string | null;
  priceReference: number | string | null;
  priceUnitQty: string | null;
  janCode: string | null;
  amazonAsin: string | null; // 💡 ASINを追加
  amazonUrl: string | null;
  amazonPrice: number | null;
  rakutenUrl: string | null;
  rakutenPrice: number | null;
  yahooUrl: string | null;
  yahooPrice: number | null;
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

  // --------------------------------------------------
  // URL生成ロジック
  // --------------------------------------------------
  // DBにAmazonURLがあればそれを、なければJAN/ASINから自動生成
  const finalAmazonUrl = product.amazonUrl || getAmazonUrl(product.janCode, product.amazonAsin);

  // --------------------------------------------------
  // 最安値の計算ロジック
  // --------------------------------------------------
  const prices = [
    product.amazonPrice,
    product.rakutenPrice,
    product.yahooPrice
  ].filter((p): p is number => typeof p === 'number' && p > 0);

  // API等で取得した各社の価格があればそこから最安値を、なければ priceReference を使用
  const minPrice = prices.length > 0 
    ? Math.min(...prices) 
    : (product.priceReference ? Number(product.priceReference) : null);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition z-10"
        >
          <FaTimes size={20} />
        </button>

        <div className="p-6 md:p-8">
          {/* ヘッダー */}
          <div className="mb-6 pr-8">
            <div className="flex items-center text-indigo-600 font-bold text-sm mb-1">
              <FaStore className="mr-2" />
              {product.manufacturer}
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
              {product.name}
            </h2>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* 左側: 画像 */}
            <div className="w-full md:w-1/2 flex-shrink-0">
              <div className="aspect-square bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden shadow-inner relative">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">No Image</div>
                )}
                
                {/* JANコード */}
                {product.janCode && (
                    <div className="absolute bottom-2 right-2 bg-white/80 px-2 py-1 text-[10px] text-gray-500 rounded border border-gray-200">
                        JAN: {product.janCode}
                    </div>
                )}
              </div>
            </div>

            {/* 右側: 情報とリンク */}
            <div className="w-full md:w-1/2 flex flex-col">
              
              {/* 最安値表示 */}
              <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Reference Price</span>
                  <div className="flex items-baseline mt-1">
                    {minPrice ? (
                        <>
                            <span className="text-3xl font-extrabold text-gray-900">¥{minPrice.toLocaleString()}</span>
                            <span className="ml-1 text-sm text-gray-500">~ (最安値目安)</span>
                        </>
                    ) : (
                        <span className="text-xl font-bold text-gray-400">価格情報なし</span>
                    )}
                  </div>
                  {product.priceUnitQty && (
                      <p className="text-xs text-gray-500 mt-1">規格: {product.priceUnitQty}</p>
                  )}
              </div>

              {/* 商品説明 */}
              <div className="mb-6 flex-grow">
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {product.description || '商品説明がありません。'}
                </p>
              </div>

              {/* ショップリンク一覧 */}
              <div className="flex flex-col gap-2 mt-auto">
                
                {/* 1. Amazon (生成されたURLがあれば表示) */}
                {finalAmazonUrl && (
                    <a 
                        href={finalAmazonUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex justify-between items-center w-full py-2 px-3 bg-[#FF9900] text-white font-bold rounded-md hover:bg-[#e68a00] transition shadow-sm hover:shadow group"
                    >
                        <span className="flex items-center"><FaAmazon className="mr-2 text-xl" /> Amazon</span>
                        {product.amazonPrice ? (
                            <span className="text-sm bg-white/20 px-2 py-0.5 rounded group-hover:bg-white/30 transition">
                                ¥{product.amazonPrice.toLocaleString()}
                            </span>
                        ) : (
                            <span className="text-xs font-normal bg-white/10 px-2 py-0.5 rounded">探す</span>
                        )}
                    </a>
                )}

                {/* 2. 楽天 */}
                {product.rakutenUrl && (
                    <a 
                        href={product.rakutenUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex justify-between items-center w-full py-2 px-3 bg-[#BF0000] text-white font-bold rounded-md hover:bg-[#a30000] transition shadow-sm hover:shadow group"
                    >
                        <span className="flex items-center"><SiRakuten className="mr-2 text-xl" /> 楽天市場</span>
                        {product.rakutenPrice && (
                            <span className="text-sm bg-white/20 px-2 py-0.5 rounded group-hover:bg-white/30 transition">
                                ¥{product.rakutenPrice.toLocaleString()}
                            </span>
                        )}
                    </a>
                )}

                {/* 3. Yahoo!ショッピング */}
                {product.yahooUrl && (
                    <a 
                        href={product.yahooUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                         className="flex justify-between items-center w-full py-2 px-3 bg-[#FF0033] text-white font-bold rounded-md hover:bg-[#d1002a] transition shadow-sm hover:shadow group"
                        style={{ backgroundColor: '#e60039' }} 
                    >
                        <span className="flex items-center"><FaShoppingBag className="mr-2 text-lg" /> Yahoo!</span>
                        {product.yahooPrice && (
                            <span className="text-sm bg-white/20 px-2 py-0.5 rounded group-hover:bg-white/30 transition">
                                ¥{product.yahooPrice.toLocaleString()}
                            </span>
                        )}
                    </a>
                )}

                {/* 公式サイト */}
                {product.officialUrl && (
                  <a 
                    href={product.officialUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex justify-center items-center w-full py-2 px-3 bg-white border border-gray-300 text-gray-600 font-medium rounded-md hover:bg-gray-50 transition text-xs mt-1"
                  >
                    メーカー公式サイト <FaExternalLinkAlt className="ml-2 text-xs" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};