// app/api/products/route.ts (修正後)

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export const dynamic = 'force-dynamic';

// 1ページあたりのデフォルトの製品数
const DEFAULT_LIMIT = 20; 

/**
 * GET /api/products
 * 製品の検索とリスト取得（ページネーション対応、メーカー絞り込み対応）
 * * クエリパラメータ:
 * - search: 検索キーワード (optional)
 * - manufacturer: メーカー名による絞り込み (optional) // 💡 メーカー検索を追加
 * - page: 取得するページ番号 (default: 1)
 * - limit: 1ページあたりの件数 (default: 20)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // クエリパラメータの取得と型変換
    const search = searchParams.get('search') || undefined;
    // 💡 manufacturer パラメータを取得
    const manufacturerFilter = searchParams.get('manufacturer') || undefined; 
    
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || DEFAULT_LIMIT.toString(), 10);
    
    const skip = (page - 1) * limit;

    // WHERE句の構築
    let whereCondition: any = {};
    
    // 検索キーワードによるOR条件
    if (search) {
      whereCondition.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive', // 💡復活
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive', // 💡復活
          },
        },
      ];
    }
    
    // 💡 メーカー絞り込み条件を追加
    if (manufacturerFilter) {
        whereCondition.manufacturer = manufacturerFilter;
    }

    // ----------------------------------------------------
    // データベース検索
    // ----------------------------------------------------
    
    // 1. 製品リストの取得
    const products = await prisma.product.findMany({
      where: whereCondition,
      select: {
        id: true,
        name: true,
        description: true,
        priceReference: true,
        priceUnitQty: true,
        imageUrl: true, 
        manufacturer: true,
        amazonUrl: true,
        amazonPrice: true,
        rakutenUrl: true,
        rakutenPrice: true,
        yahooUrl: true,
        yahooPrice: true,
      },
      take: limit,
      skip: skip,
      orderBy: { 
        name: 'asc' // 名前順でソート
      },
    });

    // 2. 全件数のカウント
    const totalCount = await prisma.product.count({
      where: whereCondition,
    });
    
    // 3. レスポンスの返却
    return NextResponse.json({
      products: products,
      total: totalCount,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit),
    });

  } catch (error) {
    console.error("製品検索中にエラーが発生しました:", error);
    return NextResponse.json(
      { message: "製品の取得中にサーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}