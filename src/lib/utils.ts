// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 商品情報からAmazonのURLを生成する
 * 環境変数 NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG があれば付与する
 * 
 * 生成できない場合（JANもASINもない場合）は null を返す
 */
// ↓↓↓ 修正箇所: 戻り値の型を string | null に変更
export function getAmazonUrl(janCode: string | null | undefined, asin: string | null | undefined): string | null {
  const tag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG;
  const tagQuery = tag ? `tag=${tag}` : "";

  // 1. ASINがある場合は商品ページへ直リンク
  if (asin) {
    // 既存のクエリパラメータがない前提で ? を使用
    // もし既存パラメータがある可能性があるなら & ですが、dpリンクは通常ないので ? でOK
    return `https://www.amazon.co.jp/dp/${asin}?${tagQuery}`;
  }

  // 2. JANコードがある場合は検索結果へ
  if (janCode) {
    // 検索URLは ?k=... なので、追加のパラメータは & でつなぐ
    const separator = tagQuery ? '&' : '';
    return `https://www.amazon.co.jp/s?k=${janCode}${separator}${tagQuery}`;
  }

  // 3. どちらもない場合は null を返す（リンク非表示用）
  return null;
}

/**
 * 平均評価スコアを整形する
 * nullの場合は '-' を、それ以外は小数点第1位で表示
 */
export function formatAverageRating(score: number | null): string {
    if (score === null || score === 0) {
        return '-';
    }
    // 小数点第1位に丸めて文字列として返す
    return score.toFixed(1);
}