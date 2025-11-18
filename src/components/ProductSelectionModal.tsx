// src/components/ProductSelectionModal.tsx (役割選択プルダウン削除)
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

// 💡 必須: メーカー情報を追加
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
    // 💡 役割情報を含めて親に返すように型を変更 (変更なし)
    onProductSelect: (productId: number, productName: string, productImageUrl: string, selectedRole: string, manufacturer: string) => void;
    initialRole: string; // 💡 役割の初期値を受け取る (変更なし)
}

/**
 * 製品選択モーダルコンポーネント
 */
export const ProductSelectionModal: React.FC<ProductSelectionModalProps> = ({
    isOpen,
    onClose,
    onProductSelect,
    initialRole // 💡 受け取り
}) => {
    if (!isOpen) return null;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // 💡 メーカー関連の状態
    const [availableManufacturers, setAvailableManufacturers] = useState<string[]>([]);
    const [manufacturerFilter, setManufacturerFilter] = useState<string>('');

    // 💡 検索とメーカーリスト抽出ロジック (fetchProducts の内容は変更なし)
    const fetchProducts = useCallback(async (keyword: string, manufacturer: string) => {
        setLoading(true);
        const manufacturerQuery = manufacturer ? `&manufacturer=${encodeURIComponent(manufacturer)}` : '';
        try {
            // 🚨 APIから製品を取得
            const response = await fetch(`/api/products?search=${encodeURIComponent(keyword)}${manufacturerQuery}&limit=100`);
            if (response.ok) {
                const data: { products: Product[] } = await response.json();
                const fetchedProducts = data.products || [];

                // 🚨 フィルター処理 (APIレスポンスのmanufacturerフィールドに依存)
                const filteredProducts = manufacturer
                    ? fetchedProducts.filter(p => (p.manufacturer || '') === manufacturer)
                    : fetchedProducts;

                setProducts(filteredProducts);

                // 💡 メーカーリストの抽出 (Distinct処理): null/undefinedをフィルタリング
                const manufacturers = Array.from(new Set(fetchedProducts.map(p => p.manufacturer))).filter(m => m).sort();
                setAvailableManufacturers(manufacturers);
            } else {
                setProducts([]);
                setAvailableManufacturers([]);
                console.error("製品検索失敗");
            }
        } catch (e) {
            console.error(e);
            setProducts([]);
            setAvailableManufacturers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        // 検索語が2文字以上またはフィルターが変更されたら検索
        const timer = setTimeout(() => fetchProducts(search, manufacturerFilter), 300);
        return () => clearTimeout(timer);
    }, [search, manufacturerFilter, fetchProducts, isOpen]);


    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
    };

    const handleAddItemToCourse = () => {
        if (!selectedProduct) return;

        // 💡 役割のステートの代わりに、親から受け取った initialRole をそのまま渡す
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

    // モーダルのUI
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    {/* タイトルから「役割設定」を削除 */}
                    <h2 className="text-xl font-semibold text-gray-800">製品の選択</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* 💡 検索バーとメーカー絞り込みドロップダウン (変更なし) */}
                <div className="flex space-x-4 mb-4">
                    {/* ... 検索インプット ... */}
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="製品名で検索..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    </div>

                    {/* ... メーカー選択プルダウン ... */}
                    <div className="w-40">
                        <select
                            value={manufacturerFilter}
                            onChange={(e) => setManufacturerFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                            <option value="">全てのメーカー</option>
                            {availableManufacturers.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 製品リスト (変更なし) */}
                <div className="h-64 overflow-y-auto border border-gray-200 rounded-md p-3 mb-4">
                    {/* ... 製品のリスト表示ロジック ... */}
                    {loading ? (
                        <p className="text-center text-gray-500">検索中...</p>
                    ) : products.length === 0 ? (
                        <p className="text-center text-gray-500">製品が見つかりません。</p>
                    ) : (
                        products.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => handleSelectProduct(product)}
                                className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                                    selectedProduct?.id === product.id ? 'bg-blue-100 border-blue-500 border-2' : 'hover:bg-gray-50 border border-transparent'
                                }`}
                            >
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-300"
                                />
                                <div>
                                    <p className="font-medium text-gray-800">{product.name}</p>
                                    <p className="text-sm text-gray-500 truncate">{(product.manufacturer || 'メーカー不明')} | {product.description}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* 選択された製品と役割設定 (役割設定プルダウンを削除) */}
                {selectedProduct && (
                    <div className="p-4 border border-green-300 bg-green-50 rounded-lg mb-4">
                        <h3 className="font-semibold">選択中の製品: {selectedProduct.name} ({(selectedProduct.manufacturer || 'メーカー不明')})</h3>
                        {/* 役割選択プルダウンのUIを削除しました */}
                    </div>
                )}

                {/* 追加ボタン (変更なし) */}
                <button
                    onClick={handleAddItemToCourse}
                    disabled={!selectedProduct}
                    className={`w-full py-2 font-bold text-white rounded-md transition duration-150 ${
                        selectedProduct
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                    コースにアイテムを追加
                </button>
            </div>
        </div>
    );
};