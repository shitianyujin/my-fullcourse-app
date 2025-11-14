"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

// APIから取得する食品データの型定義
interface Product {
  id: number;
  name: string;
  description: string | null;
  manufacturer: string; 
  priceReference: string | null;
}

export default function Step1ProductSelection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  
  // APIから食品リストを取得
  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // 選択/非選択の切り替えハンドラ
  const handleSelectProduct = (productId: number) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>食品カタログをロード中...</h1>
      </div>
    );
  }

  // 次のステップに進むためのURL
  const nextStepHref = selectedProductIds.length > 0 
    ? `/create/step2?products=${selectedProductIds.join(',')}` 
    : '#';

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🍴 フルコース作成 - STEP 1: 食品選択</h2>
      <p style={{ color: '#6c757d' }}>フルコースに使用する食品をカタログから選択してください。（複数選択可）</p>

      <div style={{ margin: '20px 0', border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
        {products.map(product => {
          const isSelected = selectedProductIds.includes(product.id);
          return (
            <div 
              key={product.id}
              onClick={() => handleSelectProduct(product.id)}
              style={{
                padding: '10px 15px',
                margin: '8px 0',
                border: isSelected ? '2px solid #007bff' : '1px solid #e9ecef',
                borderRadius: '4px',
                backgroundColor: isSelected ? '#e6f7ff' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <strong>{product.name}</strong> ({product.manufacturer}) - {product.priceReference || '価格情報なし'}
              <p style={{ fontSize: '0.9em', color: '#6c757d', margin: '5px 0 0' }}>{product.description}</p>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'right', marginTop: '20px' }}>
        <Link href={nextStepHref} passHref>
          <button 
            disabled={selectedProductIds.length === 0}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedProductIds.length === 0 ? '#adb5bd' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: selectedProductIds.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            STEP 2 へ進む ({selectedProductIds.length} 個選択)
          </button>
        </Link>
      </div>
    </div>
  );
}