// src/components/RankingProductList.tsx
'use client';

import React, { useState } from 'react';
import { FaCrown } from "react-icons/fa";
import { ProductDetailModal, Product } from '@/components/ProductDetailModal';

// ランキング用に count プロパティを追加した型定義
interface RankingProduct extends Product {
    count: number;
}

interface Props {
    products: RankingProduct[];
}

// 順位バッジ (ローカルコンポーネント)
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1) return <FaCrown className="text-yellow-400 text-2xl" />;
  if (rank === 2) return <FaCrown className="text-gray-400 text-2xl" />;
  if (rank === 3) return <FaCrown className="text-orange-400 text-2xl" />;
  return <span className="text-xl font-bold text-gray-500 w-6 text-center">{rank}</span>;
};

export const RankingProductList: React.FC<Props> = ({ products }) => {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    if (products.length === 0) {
        return <p className="text-center text-gray-500 py-10">集計データがありません。</p>;
    }

    return (
        <>
             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {products.map((product, index) => (
                  <div 
                    key={product.id} 
                    // 💡 クリック可能にするためのスタイルとイベントを追加
                    className="flex items-center p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="w-12 flex-shrink-0 flex justify-center">
                       <RankBadge rank={index + 1} />
                    </div>
                    
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 mx-4">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                        )}
                    </div>

                    <div className="flex-grow min-w-0 mr-4">
                        <h3 className="text-lg font-bold text-gray-800 truncate">
                            {product.name}
                        </h3>
                        <p className="text-sm text-indigo-600 font-medium truncate">
                            {product.manufacturer}
                        </p>
                    </div>

                    <div className="flex-shrink-0 text-right">
                        <div className="text-2xl font-bold text-gray-900">
                            {product.count}
                        </div>
                        <div className="text-xs text-gray-500">採用回数</div>
                    </div>
                  </div>
                ))}
             </div>

             {/* 商品詳細モーダル */}
             <ProductDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
            />
        </>
    );
};