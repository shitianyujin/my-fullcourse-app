// src/components/ProductSelectionModal.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface Product {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    manufacturer: string;
}

interface ProductSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProductSelect: (productId: number, productName: string, productImageUrl: string, selectedRole: string, manufacturer: string) => void;
    initialRole: string;
}

export const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
    isOpen,
    onClose,
    onProductSelect,
    initialRole
}) => {
    if (!isOpen) return null;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // メーカー関連の状態
    const [allManufacturers, setAllManufacturers] = useState<string[]>([]);
    const [manufacturerFilter, setManufacturerFilter] = useState<string>('');

    // 1. 初回ロード時: メーカー一覧を取得する
    useEffect(() => {
        const fetchManufacturers = async () => {
            try {
                // メーカー一覧を取得するためのAPIエンドポイント
                // (製品APIが全件取得に対応しているか、専用エンドポイントが必要ですが、
                //  ここでは既存の products API を使ってユニークなメーカーを抽出する簡易実装とします)
                const response = await fetch('/api/products?limit=1000'); // 多めに取得
                if (response.ok) {
                    const data = await response.json();
                    const allProds: Product[] = data.products || [];
                    
                    // メーカーリストの抽出 (重複排除とソート)
                    const manufacturers = Array.from(new Set(
                        allProds
                            .map(p => p.manufacturer)
                            .filter(m => m) // null/empty除外
                    )).sort();
                    
                    setAllManufacturers(manufacturers);
                }
            } catch (e) {
                console.error("メーカー一覧取得エラー", e);
            }
        };

        if (isOpen) {
            fetchManufacturers();
            // モーダルを開いた直後に全件（または検索条件なし）で表示したい場合はここでも fetchProducts を呼ぶ
            fetchProducts('', ''); 
        }
    }, [isOpen]); // isOpenが変わったときだけ実行

    // 2. 製品検索ロジック
    const fetchProducts = useCallback(async (keyword: string, manufacturer: string) => {
        setLoading(true);
        
        // クエリパラメータの構築
        const params = new URLSearchParams();
        if (keyword) params.append('search', keyword);
        if (manufacturer) params.append('manufacturer', manufacturer); // API側で対応が必要
        params.append('limit', '50'); // 表示件数制限

        try {
            const response = await fetch(`/api/products?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                let fetchedProducts: Product[] = data.products || [];
                
                // API側でメーカー絞り込みが実装されていない場合のフォールバック (クライアントサイドフィルタリング)
                if (manufacturer) {
                    fetchedProducts = fetchedProducts.filter(p => p.manufacturer === manufacturer);
                }

                setProducts(fetchedProducts);
            } else {
                setProducts([]);
            }
        } catch (e) {
            console.error(e);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // 検索語またはフィルター変更時の副作用
    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => {
            fetchProducts(search, manufacturerFilter);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, manufacturerFilter, isOpen, fetchProducts]);

    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
    };

    const handleAddItemToCourse = () => {
        if (!selectedProduct) return;

        onProductSelect(
            selectedProduct.id,
            selectedProduct.name,
            selectedProduct.imageUrl,
            initialRole,
            selectedProduct.manufacturer || ''
        );

        // リセットして閉じる
        setSelectedProduct(null);
        setSearch('');
        setProducts([]);
        setManufacturerFilter('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 p-6 flex flex-col max-h-[90vh]">
                
                {/* ヘッダー */}
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">商品を選択</h2>
                        <p className="text-sm text-gray-500 mt-1">コースに追加する商品を選んでください</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* フィルターエリア */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    {/* 検索バー */}
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="商品名で検索..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                        <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                    </div>

                    {/* メーカー選択プルダウン */}
                    <div className="sm:w-48 flex-shrink-0">
                        <select
                            value={manufacturerFilter}
                            onChange={(e) => setManufacturerFilter(e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white text-sm"
                        >
                            <option value="">全てのメーカー</option>
                            {allManufacturers.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 製品リスト */}
                <div className="flex-grow overflow-y-auto border border-gray-200 rounded-lg mb-4 bg-gray-50 min-h-[300px]">
                    {loading ? (
                        <div className="flex justify-center items-center h-full text-gray-500">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                            検索中...
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-full text-gray-500">
                            <p>条件に一致する商品は見つかりませんでした。</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    onClick={() => handleSelectProduct(product)}
                                    className={`flex items-center p-3 cursor-pointer transition-colors ${
                                        selectedProduct?.id === product.id 
                                            ? 'bg-blue-50 border-l-4 border-blue-500' 
                                            : 'hover:bg-white hover:shadow-sm border-l-4 border-transparent'
                                    }`}
                                >
                                    <div className="flex-shrink-0 h-12 w-12 bg-white rounded-lg border border-gray-200 overflow-hidden flex items-center justify-center">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="h-full w-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-xs text-gray-400">No img</span>
                                        )}
                                    </div>
                                    <div className="ml-3 flex-grow min-w-0">
                                        <p className="font-bold text-gray-800 text-sm truncate">{product.name}</p>
                                        <p className="text-xs text-indigo-600 font-medium">
                                            {product.manufacturer || 'メーカー不明'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* フッター (選択情報とボタン) */}
                <div className="pt-2 border-t">
                    {selectedProduct ? (
                         <div className="flex items-center justify-between mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                            <div>
                                <span className="text-xs text-blue-600 font-bold block mb-1">選択中の商品</span>
                                <p className="text-sm font-bold text-gray-800">{selectedProduct.name}</p>
                            </div>
                        </div>
                    ) : (
                         <p className="text-sm text-gray-500 mb-4 text-center">リストから商品を選択してください</p>
                    )}
                   
                    <button
                        onClick={handleAddItemToCourse}
                        disabled={!selectedProduct}
                        className={`w-full py-3 font-bold text-white rounded-lg transition shadow-sm ${
                            selectedProduct
                                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
                                : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        決定
                    </button>
                </div>
            </div>
        </div>
    );
};