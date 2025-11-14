import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/products
 * 食品カタログの全リストを返すAPIエンドポイント。
 */
export async function GET() {
  try {
    // DBからすべての食品 (Product) を取得
    const products = await prisma.product.findMany({
      // ユーザーに見せるために必要なフィールドのみ選択
      select: {
        id: true,
        name: true,
        description: true,
        manufacturer: true,
        priceReference: true,
      },
      // 名前でソート
      orderBy: {
        name: 'asc',
      }
    });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}